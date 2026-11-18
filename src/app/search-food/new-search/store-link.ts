import { inject } from '@angular/core';
import { CanActivateFn, ParamMap, Router } from '@angular/router';
import type { MapStore } from '../store-map/store-map.component';

export interface StoreLink { code: string; brand?: 'seven' | 'family'; }

export function parseStoreLink(params: ParamMap): StoreLink | undefined {
  if (!params.has('store')) return undefined;
  const codes = params.getAll('store');
  const brands = params.getAll('brand');
  const brand = brands.length === 1 && (brands[0] === 'seven' || brands[0] === 'family') ? brands[0] : undefined;
  // Ignore ambiguous values instead of guessing a store or showing parameter errors.
  return { code: codes.length === 1 ? codes[0] : '', brand };
}

export function resolveLinkedStore(link: StoreLink, directory: any[]): MapStore | undefined {
  if (!link.brand || !link.code) return undefined;
  const family = link.brand === 'family';
  const entry = directory.find(store => {
    const code = family ? store.pkeynew : store.serial || store.storeNo || store.id;
    return code != null && String(code) === link.code;
  });
  if (!entry) return undefined;
  return {
    id: (family ? 'fm-' : '711-') + link.code, storeCode: link.code,
    brand: family ? '全家' : '7-11',
    name: family ? entry.Name : `7-ELEVEN ${String(entry.name || '').replace(/門市$/, '')}門市`,
    address: entry.addr || '', phone: (family ? entry.Tel : entry.phone || entry.tel) || '',
    latitude: Number(family ? entry.py_wgs84 : entry.lat),
    longitude: Number(family ? entry.px_wgs84 : entry.lng),
  };
}

// Resolve the view before constructing the page, keeping all query parameters.
export const storeViewGuard: CanActivateFn = route => {
  const values = route.queryParamMap.getAll('map');
  if (values.length !== 1) return true;
  const classic = route.routeConfig?.path === 'classic';
  if (values[0] === 'false' && !classic) {
    return inject(Router).createUrlTree(['/classic'], { queryParams: route.queryParams, fragment: route.fragment ?? undefined });
  }
  if (values[0] === 'true' && classic) {
    return inject(Router).createUrlTree(['/'], { queryParams: route.queryParams, fragment: route.fragment ?? undefined });
  }
  return true;
};
