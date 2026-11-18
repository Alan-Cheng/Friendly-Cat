import { Injectable } from '@angular/core';
import Fuse from 'fuse.js';

interface ProductLookup {
  fuse?: Fuse<object>;
  exact: Map<string, object>;
  matches: Map<string, object | null>;
}

@Injectable({ providedIn: 'root' })
export class ProductLookupService {
  // Components/stores sharing the same JSON array share the index and matches.
  // A newly downloaded array gets a fresh entry; old arrays can be collected.
  private readonly collections = new WeakMap<object[], Map<string, ProductLookup>>();

  find<T extends object>(products: T[], key: 'name' | 'title', name: string): T | undefined {
    let indexes = this.collections.get(products);
    if (!indexes) {
      indexes = new Map();
      this.collections.set(products, indexes);
    }
    let lookup = indexes.get(key);
    if (!lookup) {
      lookup = {
        exact: new Map(),
        matches: new Map(),
      };
      for (const product of products) {
        const value = (product as Record<string, unknown>)[key];
        if (typeof value === 'string' && !lookup.exact.has(value)) lookup.exact.set(value, product);
      }
      indexes.set(key, lookup);
    }
    const exact = lookup.exact.get(name);
    if (exact) return exact as T;
    if (!lookup.matches.has(name)) {
      lookup.fuse ??= new Fuse<object>(products, { includeScore: true, threshold: 0.3, keys: [key] });
      // Cache misses too, so unavailable metadata does not trigger repeated scans.
      if (lookup.matches.size >= 1000) lookup.matches.delete(lookup.matches.keys().next().value!);
      lookup.matches.set(name, lookup.fuse.search(name)[0]?.item ?? null);
    }
    return (lookup.matches.get(name) ?? undefined) as T | undefined;
  }
}
