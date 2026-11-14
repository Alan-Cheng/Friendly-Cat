import type { MapStore } from './store-map.component';

export interface MapCenter { latitude: number; longitude: number; }

export function withinMapArea(a: MapCenter, b: MapCenter): boolean {
  const rad = Math.PI / 180;
  const h = Math.sin((b.latitude - a.latitude) * rad / 2) ** 2
    + Math.cos(a.latitude * rad) * Math.cos(b.latitude * rad)
    * Math.sin((b.longitude - a.longitude) * rad / 2) ** 2;
  return 6371000 * 2 * Math.asin(Math.sqrt(Math.min(1, h))) <= 250;
}

/** Small session cache; a region is reusable only for stores it actually queried. */
export class MapAreaCache {
  private entries: { center: MapCenter; storeIds: Set<string>; updatedAt: number; searchable: any[] }[] = [];

  find(center: MapCenter, stores: MapStore[], now = Date.now()): any[] | undefined {
    this.entries = this.entries.filter(entry => now - entry.updatedAt < 60000);
    return this.entries.find(entry => withinMapArea(entry.center, center)
      && stores.every(store => entry.storeIds.has(store.id)))?.searchable;
  }

  remember(center: MapCenter, stores: MapStore[], searchable: any[], now = Date.now()): void {
    this.entries.unshift({ center, storeIds: new Set(stores.map(store => store.id)), updatedAt: now, searchable });
    this.entries = this.entries.filter(entry => now - entry.updatedAt < 60000).slice(0, 16);
  }
}
