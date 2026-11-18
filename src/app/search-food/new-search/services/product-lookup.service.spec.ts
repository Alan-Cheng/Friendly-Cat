import Fuse from 'fuse.js';
import { ProductLookupService } from './product-lookup.service';

describe('ProductLookupService', () => {
  it('shares one index and caches both matches and misses for a downloaded array', () => {
    const service = new ProductLookupService();
    const search = spyOn(Fuse.prototype, 'search').and.callThrough();
    const index = spyOn(Fuse.prototype, 'setCollection').and.callThrough();
    const product = { title: '鮪魚飯糰' };
    const products = [product];
    for (let i = 0; i < 20; i++) {
      expect(service.find(products, 'title', '鮪魚飯糰')).toBe(product);
      expect(service.find(products, 'title', '完全不同的甜點')).toBeUndefined();
    }
    expect(index).toHaveBeenCalledTimes(1);
    expect(search).toHaveBeenCalledTimes(1);
  });

  it('uses direct lookup for exact names and preserves fuzzy matching for variants', () => {
    const service = new ProductLookupService();
    const search = spyOn(Fuse.prototype, 'search').and.callThrough();
    const index = spyOn(Fuse.prototype, 'setCollection').and.callThrough();
    const product = { title: '鮪魚飯糰' };
    const products = [product];
    expect(service.find(products, 'title', '鮪魚飯糰')).toBe(product);
    expect(index).not.toHaveBeenCalled();
    expect(search).not.toHaveBeenCalled();
    for (let i = 0; i < 20; i++) expect(service.find(products, 'title', '鮪魚飯團')).toBe(product);
    expect(index).toHaveBeenCalledTimes(1);
    expect(search).toHaveBeenCalledTimes(1);
  });

  it('refreshes matches and prior misses when a new JSON array arrives', () => {
    const service = new ProductLookupService();
    const oldProducts = [{ title: '鮪魚飯糰', Description: 'old' }];
    const newProducts = [{ title: '鮪魚飯糰', Description: 'new' }, { title: '草莓蛋糕', Description: 'added' }];
    expect(service.find(oldProducts, 'title', '鮪魚飯糰')?.Description).toBe('old');
    expect(service.find(oldProducts, 'title', '草莓蛋糕')).toBeUndefined();
    expect(service.find(newProducts, 'title', '鮪魚飯糰')?.Description).toBe('new');
    expect(service.find(newProducts, 'title', '草莓蛋糕')?.Description).toBe('added');
  });

  it('keeps 711 name searches separate from FamilyMart title searches', () => {
    const service = new ProductLookupService();
    const products = [{ name: '飯糰', title: '麵包' }, { name: '麵包', title: '飯糰' }];
    expect(service.find(products, 'name', '飯糰')).toBe(products[0]);
    expect(service.find(products, 'title', '飯糰')).toBe(products[1]);
  });
});
