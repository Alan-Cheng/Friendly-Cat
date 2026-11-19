import { FamilyPriceService } from './family-price.service';

describe('FamilyMart JSON prices', () => {
  const service = new FamilyPriceService();
  const item = (name: string, id?: string) => ({ ItemName: name, RemainingQty: 1, familyProductId: id });

  it('uses the source ID or fallback selling ID even when names differ', () => {
    const products = [{ id: '0558422', title: '鹽蔥燒肉飯糰', price: 35, price_product_id: '0834464', price_product_name: '二配鹽蔥燒肉飯糰' }];
    expect(service.pricesFor([item('庫存名稱不同', '0558422')], products))
      .toEqual({ 庫存名稱不同: { original: 35, discounted: 25 } });
    expect(service.pricesFor([item('另一個名稱', '0834464')], products))
      .toEqual({ 另一個名稱: { original: 35, discounted: 25 } });
  });

  it('matches normalized titles and selling names without fuzzy matching', () => {
    expect(service.pricesFor([item('二配鮪魚 飯糰'), item('鮭魚飯糰'), item('大份鮪魚飯糰')], [
      { title: '鮪魚飯糰', price: '30' }, { title: '舊名稱', price_product_name: '一配鮭魚飯糰', price: 49 },
    ])).toEqual({ '二配鮪魚 飯糰': { original: 30, discounted: 21 }, 鮭魚飯糰: { original: 49, discounted: 34 } });
  });

  it('hides missing, invalid and conflicting prices without borrowing a similar price', () => {
    expect(service.pricesFor([item('豆漿'), item('飯糰'), item('麵包'), item('蛋糕'), item('咖啡')], [
      { title: '豆漿', price: null }, { title: '飯糰', price: '' }, { title: '麵包', price: -1 },
      { title: '蛋糕', price: 'NaN' }, { title: '咖啡', price: 30 }, { title: '咖啡', price: 40 },
    ])).toEqual({});
    expect(service.pricesFor([item('豆漿')], [{ title: '豆漿' }])).toEqual({});
  });
});
