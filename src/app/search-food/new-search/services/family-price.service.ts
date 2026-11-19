import { Injectable } from '@angular/core';
import { FoodDetailFamilyMart } from '../../model/family-mart.model';
import { Item } from '../../model/seven-eleven.model';

export interface FamilyPrice { original: number; discounted: number; }

type PriceProduct = Pick<FoodDetailFamilyMart, 'title'> & Partial<Pick<FoodDetailFamilyMart,
  'id' | 'price' | 'price_product_id' | 'price_product_name'>>;

export function familyPriceName(name: string): string {
  return name.normalize('NFKC').trim().replace(/^(?:星[—－-]?)?[一二三四五六日]配/, '')
    .toLowerCase().replace(/[\s\p{P}]/gu, '');
}

@Injectable({ providedIn: 'root' })
export class FamilyPriceService {
  /** Prices come exclusively from the downloaded product JSON. Never use fuzzy
   * metadata matches for prices: similar flavours and sizes can cost differently. */
  pricesFor(items: Item[], products: PriceProduct[]): Record<string, FamilyPrice> {
    const byId = new Map<string, PriceProduct[]>();
    const byName = new Map<string, PriceProduct[]>();
    for (const product of products) {
      for (const id of new Set([product.id, product.price_product_id])) {
        if (!id) continue;
        const key = String(id).replace(/^product-/, '');
        if (!byId.has(key)) byId.set(key, []);
        byId.get(key)!.push(product);
      }
      for (const name of new Set([product.title, product.price_product_name])) {
        if (typeof name !== 'string' || !name.trim()) continue;
        const key = familyPriceName(name);
        if (!byName.has(key)) byName.set(key, []);
        byName.get(key)!.push(product);
      }
    }
    const prices: Record<string, FamilyPrice> = {};
    for (const item of items) {
      const id = item.familyProductId == null ? undefined : String(item.familyProductId).replace(/^product-/, '');
      const matches = (id ? byId.get(id) : undefined) ?? byName.get(familyPriceName(item.ItemName)) ?? [];
      const values = new Set<number>();
      for (const match of matches) {
        if ((typeof match.price !== 'number' && typeof match.price !== 'string') || String(match.price).trim() === '') continue;
        const price = Number(match.price);
        if (Number.isFinite(price) && price > 0) values.add(price);
      }
      if (values.size === 1) {
        const original = [...values][0];
        prices[item.ItemName] = { original, discounted: Math.round(original * 0.7) };
      }
    }
    return prices;
  }
}
