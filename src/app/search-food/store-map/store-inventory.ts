/** Directory IDs and stock API IDs can differ for FamilyMart. */
export function familyStoreName(name: string): string {
  return name.normalize('NFKC').replace(/^全家(?:便利商店)?/, '').replace(/(?:門市|店)$/, '').replace(/\s/g, '');
}

export function matchFamilyStock(store: { storeCode?: string; name: string; latitude: number; longitude: number }, stocks: any[]): any | undefined {
  const exact = stocks.find(s => store.storeCode && [s.oldPKey, s.pkeynew, s.storeCode].some(id => id != null && String(id) === store.storeCode));
  if (exact) return exact;
  return stocks.filter(s => familyStoreName(s.name || '') === familyStoreName(store.name))
    .sort((a, b) => coordinateDistance(a, store) - coordinateDistance(b, store))
    .find(s => coordinateDistance(s, store) < .003 || !validCoordinates(s));
}

function validCoordinates(s: any): boolean { return Number.isFinite(Number(s.latitude)) && Number.isFinite(Number(s.longitude)) && Number(s.latitude) !== 0 && Number(s.longitude) !== 0; }
function coordinateDistance(s: any, store: { latitude: number; longitude: number }): number {
  return validCoordinates(s) ? Math.hypot(Number(s.latitude) - store.latitude, Number(s.longitude) - store.longitude) : Infinity;
}

/** Sum one level only: category totals already include their children. */
export function familyStockQuantity(stock: any): number {
  const quantity = (value: any): number => Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : 0;
  return (stock.info || []).reduce((sum: number, category: any) => sum + (
    category.qty != null ? quantity(category.qty) : (category.categories || []).reduce((subTotal: number, sub: any) => subTotal + (
      sub.qty != null ? quantity(sub.qty) : (sub.products || []).reduce((total: number, item: any) => total + quantity(item.qty), 0)
    ), 0)
  ), 0);
}

/** 7-ELEVEN's store total is authoritative; category/item counts are not added to it. */
export function sevenStockQuantity(stock: { RemainingQty?: unknown } | undefined): number | undefined {
  const value = stock?.RemainingQty;
  if (value == null || value === '') return undefined;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : undefined;
}
