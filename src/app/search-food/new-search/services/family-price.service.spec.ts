import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ProxyTokenService } from 'src/app/services/proxy-token.service';
import { FamilyPriceService, familySearchKeywords } from './family-price.service';

describe('FamilyMart batch prices', () => {
  let service: FamilyPriceService;
  let http: HttpTestingController;
  let ensure: jasmine.Spy;
  beforeEach(() => {
    ensure = jasmine.createSpy('ensure').and.resolveTo();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: ProxyTokenService, useValue: { ensure } }],
    });
    service = TestBed.inject(FamilyPriceService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('covers each remaining group with its longest shared substring', () => {
    expect(familySearchKeywords(['鮪魚飯糰', '鮭魚飯糰', '草莓麵包', '奶油麵包', '豆漿', '鮪魚飯糰']))
      .toEqual(['魚飯糰', '麵包', '豆漿']);
    expect(familySearchKeywords(['鮭魚飯糰', '鮪魚飯糰', '牛肉飯糰'])).toEqual(['飯糰']);
    expect(familySearchKeywords([])).toEqual([]);
  });

  it('queries a group once, includes cookies, matches names, hides unknowns, and reuses cache', async () => {
    const names = ['鮪魚飯糰', '鮭魚飯糰', '牛肉飯糰'];
    const result = firstValueFrom(service.pricesFor(names));
    const simultaneous = firstValueFrom(service.pricesFor(names));
    await Promise.resolve();
    const req = http.expectOne(r => r.url === environment.familyMartUrl.priceSearch);
    expect(req.request.params.get('keyword')).toBe('飯糰');
    expect(req.request.params.get('all_channels')).toBe('false');
    expect(req.request.withCredentials).toBeTrue();
    req.flush([
      { name: '鮪魚 飯糰', price: 35, channel: 'STORE' },
      { name: '鮭魚飯糰', price: null, channel: 'STORE' },
      { name: '牛肉飯糰', price: 50, channel: 'ONLINE' },
      { name: '鮪魚飯糰大份', price: 90, channel: 'STORE' },
    ]);
    expect(await result).toEqual({ 鮪魚飯糰: { original: 35, discounted: 25 } });
    expect(await simultaneous).toEqual(await result);
    expect(await firstValueFrom(service.pricesFor(names))).toEqual(await result);
    http.expectNone(environment.familyMartUrl.priceSearch);
  });

  it('keeps successful groups when another fails and retries failed queries later', async () => {
    const result = firstValueFrom(service.pricesFor(['鮭魚飯糰', '鮪魚飯糰', '豆漿']));
    await Promise.resolve();
    http.expectOne(r => r.params.get('keyword') === '魚飯糰').flush([
      { name: '鮭魚飯糰', price: '40', channel: 'STORE' },
    ]);
    http.expectOne(r => r.params.get('keyword') === '豆漿').flush('unavailable', { status: 502, statusText: 'Bad Gateway' });
    expect(await result).toEqual({ 鮭魚飯糰: { original: 40, discounted: 28 } });
    const retry = firstValueFrom(service.pricesFor(['豆漿']));
    await Promise.resolve();
    http.expectOne(r => r.params.get('keyword') === '豆漿').flush([]);
    expect(await retry).toEqual({});
  });

  it('hides conflicting prices and does not request anything after verification fails', async () => {
    const result = firstValueFrom(service.pricesFor(['飯糰']));
    await Promise.resolve();
    http.expectOne(r => r.params.get('keyword') === '飯糰').flush([
      { name: '飯糰', price: 30, channel: 'STORE' },
      { name: '飯糰', price: 40, channel: 'STORE' },
    ]);
    expect(await result).toEqual({});
    ensure.and.rejectWith(new Error('verification failed'));
    expect(await firstValueFrom(service.pricesFor(['麵包']))).toEqual({});
    http.expectNone(r => r.url === environment.familyMartUrl.priceSearch);
  });
});
