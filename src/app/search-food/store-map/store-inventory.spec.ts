import { createFamilyStockMatcher, familyStockQuantity, matchFamilyStock, sevenStockQuantity } from './store-inventory';

describe('FamilyMart map inventory', () => {
  const store = { storeCode: 'new-123', name: '全家台北１０１店', latitude: 25.033, longitude: 121.565 };
  it('matches a directory entry when the API uses an old store ID and normalized name', () => {
    const stock = { oldPKey: 'old-456', name: '台北101', latitude: 25.033, longitude: 121.565, info: [] };
    expect(matchFamilyStock(store, [{ name: '全家其他店' }, stock])).toBe(stock);
  });
  it('rejects a same-name store in another area', () => {
    expect(matchFamilyStock(store, [{ name: '台北101', latitude: 24, longitude: 120 }])).toBeUndefined();
  });
  it('prefers a matching ID and does not confuse neighboring stores', () => {
    const stock = { oldPKey: 'new-123', name: '台北101', info: [] };
    expect(matchFamilyStock(store, [{ oldPKey: 'other', name: '其他店' }, stock])).toBe(stock);
  });
  it('keeps indexed lookup consistent for duplicate IDs, normalized names and distant stores', () => {
    const stocks = [
      { oldPKey: 'new-123', name: '別店', latitude: 24, longitude: 120 },
      { storeCode: 'new-123', name: '台北101', latitude: 25.033, longitude: 121.565 },
      { name: '台北101', latitude: 24, longitude: 120 },
      { name: '台北101', latitude: 25.0331, longitude: 121.5651 },
      { name: '沒有座標' }
    ];
    const match = createFamilyStockMatcher(stocks);
    for (const candidate of [store, { ...store, storeCode: 'unknown' }, { ...store, name: '全家沒有座標店', storeCode: '' }, { ...store, latitude: 22, storeCode: '' }]) {
      expect(match(candidate)).toBe(matchFamilyStock(candidate, stocks));
    }
  });
  it('sums numeric category totals once rather than double-counting children', () => {
    expect(familyStockQuantity({ info: [{ qty: '5', categories: [{ qty: 5, products: [{ qty: 5 }] }] }, { qty: 2 }] })).toBe(7);
  });
  it('falls back to child totals if category totals are missing, preserving zero', () => {
    expect(familyStockQuantity({ info: [{ categories: [{ products: [{ qty: '3' }, { qty: 2 }] }] }, { qty: 0, categories: [{ qty: 9 }] }] })).toBe(5);
  });
});

describe('7-ELEVEN store inventory total', () => {
  it('uses store RemainingQty without summing category or item totals', () => {
    const stock = { RemainingQty: '12', CategoryStockItems: [{ RemainingQty: 99, ItemList: [{ RemainingQty: 2 }] }] };
    expect(sevenStockQuantity(stock)).toBe(12);
  });
  it('keeps zero distinct from unavailable or invalid counts', () => {
    expect(sevenStockQuantity({ RemainingQty: 0 })).toBe(0);
    expect(sevenStockQuantity({})).toBeUndefined();
    expect(sevenStockQuantity({ RemainingQty: 'bad' })).toBeUndefined();
    expect(sevenStockQuantity({ RemainingQty: -1 })).toBeUndefined();
  });
});
