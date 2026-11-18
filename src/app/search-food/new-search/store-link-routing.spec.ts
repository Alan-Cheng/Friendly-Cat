import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { convertToParamMap, provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { parseStoreLink, resolveLinkedStore, storeViewGuard } from './store-link';

@Component({ selector: 'app-test-map-page', standalone: true, template: '地圖頁面' })
class MapPage {}
@Component({ selector: 'app-test-classic-page', standalone: true, template: '舊版頁面' })
class ClassicPage {}

describe('store link view routing', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([
    { path: 'classic', component: ClassicPage, canActivate: [storeViewGuard], runGuardsAndResolvers: 'paramsOrQueryParamsChange' },
    { path: '**', component: MapPage, canActivate: [storeViewGuard], runGuardsAndResolvers: 'paramsOrQueryParamsChange' },
  ])] }));

  it('opens classic for map=false and preserves store, brand, and fragment', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/?store=259002&brand=seven&map=false#products', ClassicPage);
    const url = TestBed.inject(Router).parseUrl(TestBed.inject(Router).url);
    expect(url.queryParams).toEqual({ store: '259002', brand: 'seven', map: 'false' });
    expect(url.fragment).toBe('products');
  });

  it('opens the map for map=true even when the link starts with /classic', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/classic?store=182580&map=true', MapPage);
    expect(TestBed.inject(Router).url).toBe('/?store=182580&map=true');
  });

  it('switches views on query-only changes without losing the target store', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/?store=284271&map=true', MapPage);
    await harness.navigateByUrl('/?store=284271&map=false', ClassicPage);
    await harness.navigateByUrl('/classic?store=284271&map=true', MapPage);
    expect(TestBed.inject(Router).url).toBe('/?store=284271&map=true');
  });

  it('keeps existing defaults when map is omitted', async () => {
    const harness = await RouterTestingHarness.create();
    expect(await harness.navigateByUrl('/?store=293828', MapPage)).toBeInstanceOf(MapPage);
    expect(await harness.navigateByUrl('/classic?store=293828', ClassicPage)).toBeInstanceOf(ClassicPage);
  });

  it('silently ignores unsupported or duplicate map values and keeps the current view', async () => {
    const harness = await RouterTestingHarness.create();
    for (const query of ['map=0', 'map=FALSE', 'map=', 'map=true&map=false']) {
      await harness.navigateByUrl('/?store=259002&' + query, MapPage);
      expect(harness.routeNativeElement?.textContent).toContain('地圖頁面');
      await harness.navigateByUrl('/classic?store=259002&' + query, ClassicPage);
      expect(harness.routeNativeElement?.textContent).toContain('舊版頁面');
    }
  });

  it('requires a single explicit supported brand and preserves store strings', () => {
    expect(parseStoreLink(convertToParamMap({ store: '018882', brand: 'family', map: 'false' }))).toEqual({ code: '018882', brand: 'family' });
    expect(parseStoreLink(convertToParamMap({ store: '259002', brand: 'seven' }))).toEqual({ code: '259002', brand: 'seven' });
    for (const brand of [undefined, 'unknown', ['seven', 'family']]) {
      const params = brand === undefined ? { store: '259002' } : { store: '259002', brand };
      expect(parseStoreLink(convertToParamMap(params))?.brand).toBeUndefined();
    }
    expect(parseStoreLink(convertToParamMap({ store: ['259002', '182580'], brand: 'seven' }))?.code).toBe('');
    expect(parseStoreLink(convertToParamMap({ brand: 'family', map: 'false' }))).toBeUndefined();
  });

  it('resolves only the selected brand and FamilyMart pkeynew, never its service ID', () => {
    const directory = [{ serial: '018882', name: '711店', lat: 25, lng: 121 },
      { pkeynew: '018882', serid: '50398', Name: '全家田中金斗店', py_wgs84: '23.86', px_wgs84: '120.57' }];
    expect(resolveLinkedStore({ code: '018882', brand: 'seven' }, directory)?.brand).toBe('7-11');
    expect(resolveLinkedStore({ code: '018882', brand: 'family' }, directory)?.name).toBe('全家田中金斗店');
    expect(resolveLinkedStore({ code: '50398', brand: 'family' }, directory)).toBeUndefined();
    expect(resolveLinkedStore({ code: '18882', brand: 'family' }, directory)).toBeUndefined();
    expect(resolveLinkedStore({ code: '018882' }, directory)).toBeUndefined();
  });
});
