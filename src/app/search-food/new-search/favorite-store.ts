// Keep legacy Firestore document names intact while comparing store identities.
export function favoriteBrand(store: any): '7-11' | '全家' | undefined {
  if (store.label === '全家' || store.label === '7-11') return store.label;
  if (store.StoreName || store.store711Name || /^(?:7-ELEVEN|7-11|711)/i.test(store.storeName || '')) return '7-11';
  if (/^(?:全家|FamilyMart)/i.test(store.storeName || '') || store.latitude != null || store.storeFLatitude != null) return '全家';
  return undefined;
}

export function favoriteStoreCode(store: any): string | undefined {
  const code = store.storeCode ?? (favoriteBrand(store) === '7-11' ? store.StoreNo : undefined);
  return code == null || code === '' ? undefined : String(code);
}

export function matchesFavorite(saved: any, store: any): boolean {
  const savedBrand = favoriteBrand(saved);
  const brand = favoriteBrand(store);
  if (savedBrand && brand && savedBrand !== brand) return false;
  const savedCode = favoriteStoreCode(saved);
  const code = favoriteStoreCode(store);
  if (savedBrand && brand && savedCode && code) return savedCode === code;
  if (saved.storeName && saved.storeName === store.storeName) return true;
  if (savedBrand !== '7-11' || brand !== '7-11') return false;
  const normalize = (name: string) => (name || '').normalize('NFKC')
    .replace(/^(?:7-ELEVEN|7-11|711)\s*/i, '').replace(/門市$/, '').replace(/\s+/g, '');
  const name = normalize(saved.store711Name || saved.StoreName || saved.storeName);
  return !!name && name === normalize(store.StoreName || store.store711Name || store.storeName);
}
