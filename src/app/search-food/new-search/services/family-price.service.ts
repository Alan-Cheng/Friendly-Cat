import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, defer, from, map, mergeMap, of, reduce, shareReplay, switchMap, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ProxyTokenService } from 'src/app/services/proxy-token.service';

interface SearchProduct {
  name: string;
  price: number | string | null;
  channel: string;
}
export interface FamilyPrice { original: number; discounted: number; }

// Keep price matching conservative: punctuation/spacing differences are safe,
// but similar flavours or sizes must not borrow one another's prices.
export function familyPriceName(name: string): string {
  return name.normalize('NFKC').toLowerCase().replace(/[\s\p{P}]/gu, '');
}

/** Greedy shared-substring cover: cover most remaining names, then prefer the
 * longest substring. Unrelated products fall back to their own full names. */
export function familySearchKeywords(names: string[]): string[] {
  const remaining = new Set(names.map(name => name.normalize('NFKC').trim()).filter(Boolean));
  const keywords: string[] = [];
  const candidates = new Map<string, Set<string>>();
  for (const name of remaining) {
    const chars = Array.from(name);
    for (let start = 0; start < chars.length; start++) {
      for (let end = start + 2; end <= chars.length; end++) {
        const keyword = chars.slice(start, end).join('');
        if (!/^[\p{L}\p{N}]+$/u.test(keyword)) continue;
        if (!candidates.has(keyword)) candidates.set(keyword, new Set());
        candidates.get(keyword)!.add(name);
      }
    }
  }
  while (remaining.size) {
    let best = remaining.values().next().value!;
    let covered = new Set([best]);
    for (const [keyword, names] of candidates) {
      const matches = new Set([...names].filter(name => remaining.has(name)));
      if (matches.size > covered.size || (matches.size === covered.size && keyword.length > best.length)) {
        best = keyword;
        covered = matches;
      }
    }
    keywords.push(best);
    for (const name of covered) remaining.delete(name);
  }
  return keywords;
}

@Injectable({ providedIn: 'root' })
export class FamilyPriceService {
  private readonly cache = new Map<string, { expires: number; result: Observable<SearchProduct[]> }>();
  constructor(private http: HttpClient, private proxyToken: ProxyTokenService) {}

  private search(keyword: string): Observable<SearchProduct[]> {
    const cached = this.cache.get(keyword);
    if (cached && cached.expires > Date.now()) return cached.result;
    for (const [key, value] of this.cache) {
      if (value.expires <= Date.now()) this.cache.delete(key);
    }
    // Bound memory across long sessions visiting many stores/categories.
    if (this.cache.size >= 100) this.cache.delete(this.cache.keys().next().value!);
    const entry = {
      expires: Infinity,
      result: defer(() => this.http.get<SearchProduct[]>(environment.familyMartUrl.priceSearch, {
        params: { keyword, all_channels: 'false' }, withCredentials: true,
      })).pipe(
        map(products => { if (!Array.isArray(products)) throw new Error('Invalid product response'); return products; }),
        tap(() => entry.expires = Date.now() + 5 * 60 * 1000),
        catchError(() => { this.cache.delete(keyword); return of([]); }),
        shareReplay({ bufferSize: 1, refCount: false })
      ),
    };
    this.cache.set(keyword, entry);
    return entry.result;
  }

  pricesFor(names: string[]): Observable<Record<string, FamilyPrice>> {
    const keywords = familySearchKeywords(names);
    if (!keywords.length) return of({});
    return defer(() => from(this.proxyToken.ensure())).pipe(
      switchMap(() => from(keywords).pipe(
        mergeMap(keyword => this.search(keyword), 2),
        reduce((all, products) => all.concat(products), [] as SearchProduct[])
      )),
      map(products => {
        const matches = new Map<string, Set<number>>();
        for (const product of products) {
          if (product?.channel !== 'STORE' || typeof product.name !== 'string') continue;
          if (product.price == null || String(product.price).trim() === '') continue;
          const price = Number(product.price);
          if (!Number.isFinite(price) || price <= 0) continue;
          const key = familyPriceName(product.name);
          if (!matches.has(key)) matches.set(key, new Set());
          matches.get(key)!.add(price);
        }
        const prices: Record<string, FamilyPrice> = {};
        for (const name of names) {
          const values = matches.get(familyPriceName(name));
          // Ambiguous results with different prices are deliberately left blank.
          if (values?.size === 1) {
            const original = [...values][0];
            prices[name] = { original, discounted: Math.round(original * 0.7) };
          }
        }
        return prices;
      }),
      catchError(() => of({}))
    );
  }
}
