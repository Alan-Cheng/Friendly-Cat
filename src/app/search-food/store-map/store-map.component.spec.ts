import { SimpleChange, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { StoreMapComponent, MapStore } from './store-map.component';

describe('StoreMapComponent data and location', () => {
  let component: StoreMapComponent;
  const family = { pkeynew: '01', Name: '全家測試店', addr: '台北市信義區', Tel: '02-12345678', px_wgs84: '121.5654', py_wgs84: '25.033' };
  beforeEach(() => { component = new StoreMapComponent({} as HttpClient, new NgZone({ enableLongStackTrace: false })); });
  afterEach(() => component.ngOnDestroy());
  function update() { component.ngOnChanges({ familyStores: new SimpleChange([], component.familyStores, true), sevenStores: new SimpleChange([], component.sevenStores, true) }); }

  it('normalizes each brand using its actual directory schema', () => {
    component.familyStores = [family];
    component.sevenStores = [{ serial: '02', name: '信義', addr: '信義路', phone: '(02)12345678', lat: 25.033, lng: 121.566 }];
    update();
    expect(component.stores.length).toBe(2);
    expect(component.stores[0].longitude).toBe(121.5654);
    expect(component.stores[1].id).toBe('711-02');
    expect(component.stores[1].phone).toBe('(02)12345678');
  });

  it('excludes invalid coordinates rather than placing shops at a fake location', () => {
    component.familyStores = [family, { ...family, px_wgs84: 'bad' }, { ...family, py_wgs84: '91' }, { ...family, px_wgs84: '0' }];
    update(); expect(component.stores.length).toBe(1);
    expect(component.hasLocation()).toBeFalse();
  });

  it('keeps an accessible directory available before WebGL loads and filters by brand', () => {
    component.familyStores = [family];
    component.sevenStores = [{ serial: '02', name: '信義', lat: 25.033, lng: 121.566 }];
    update(); component.setFilter('全家');
    expect(component.visibleStores.length).toBe(1);
    expect(component.visibleStores[0].brand).toBe('全家');
    component.setFilter('7-11'); expect(component.visibleStores[0].brand).toBe('7-11');
  });

  it('does not invent user distance before location permission is granted', () => {
    component.familyStores = [family]; update();
    expect(component.distance(component.stores[0])).toContain('開啟定位');
    component.latitude = 25.033; component.longitude = 121.5654;
    expect(component.distance(component.stores[0])).toBe('距離約 0 公尺');
  });

  it('attaches FamilyMart stock to the matching 3D marker without confusing unknown with zero', () => {
    component.familyStores = [family, { ...family, pkeynew: 'other', Name: '全家其他店' }];
    component.familyStock = [{ oldPKey: 'old-id', name: '測試', info: [{ qty: '4' }, { qty: 3 }] }];
    update();
    expect(component.stores[0].quantity).toBe(7);
    expect(component.stores[1].quantity).toBeUndefined();
    component.familyStock = [{ oldPKey: 'old-id', name: '測試', info: [] }]; update();
    expect(component.stores[0].quantity).toBe(0);
  });

  it('maps SevenEleven counts by StoreNo and reads the store RemainingQty', () => {
    component.sevenStores = [{ serial: '02', name: '信義', lat: 25.033, lng: 121.566 }];
    component.sevenStock = [{ StoreNo: 'other', RemainingQty: 100 }, { StoreNo: '02', RemainingQty: 12, CategoryStockItems: [{ RemainingQty: 99 }] }];
    update(); expect(component.stores[0].quantity).toBe(12);
    component.sevenStock = [{ StoreNo: '02', RemainingQty: 0 }]; update();
    expect(component.stores[0].quantity).toBe(0);
  });

  it('opens products immediately when a map shop is selected', () => {
    component.familyStores = [family]; update();
    const emit = spyOn(component.queryStore, 'emit');
    component.select(component.stores[0]);
    expect(emit).toHaveBeenCalledWith(component.stores[0]);
    expect(component.stores[0].storeCode).toBe('01');
    expect(component.selected).toBeUndefined();
  });

  it('emits selected shop coordinates for inventory lookup without requesting GPS', () => {
    component.familyStores = [family]; update(); component.selected = component.stores[0];
    const emit = spyOn(component.queryStore, 'emit'); component.requestProducts();
    expect(emit).toHaveBeenCalledWith(component.selected as MapStore);
    component.querying = true; component.requestProducts(); expect(emit).toHaveBeenCalledTimes(1);
    component.querying = false; component.inventoryBlocked = true; component.requestProducts(); expect(emit).toHaveBeenCalledTimes(1);
  });
  it('uses absolute compass headings in both perspectives and ignores relative alpha', () => {
    const setHeading = jasmine.createSpy('setHeading');
    (component as any).cat = { setHeading };
    const angle = window.screen.orientation?.angle ?? 0;
    const emit = (alpha: number, absolute: boolean) => (component as any).onOrientation({ alpha, absolute });
    emit(270, false);
    expect(setHeading).not.toHaveBeenCalled();
    emit(270, true);
    expect(setHeading).toHaveBeenCalledWith((90 + angle) % 360);
    component.is3D = false;
    emit(0, true);
    expect(setHeading).toHaveBeenCalledWith(angle % 360);
    emit(NaN, true);
    expect(setHeading).toHaveBeenCalledTimes(2);
  });

  it('prefers Safari compass data and removes sensor listeners on destroy', async () => {
    const setHeading = jasmine.createSpy('setHeading');
    (component as any).cat = { setHeading };
    const remove = spyOn(window, 'removeEventListener').and.callThrough();
    (component as any).onOrientation({ webkitCompassHeading: 359, webkitCompassAccuracy: 10, alpha: 180, absolute: false });
    expect(setHeading).toHaveBeenCalledWith((359 + (window.screen.orientation?.angle ?? 0)) % 360);
    component.ngOnDestroy();
    expect(remove).toHaveBeenCalledWith('deviceorientation', (component as any).onOrientation);
    expect(remove).toHaveBeenCalledWith('deviceorientationabsolute', (component as any).onOrientation);
  });

  it('enables direction following from its own control and stops on the next click', async () => {
    const setHeading = jasmine.createSpy('setHeading');
    (component as any).cat = { setHeading };
    expect(component.directionFollowing).toBeFalse();
    await component.toggleDirectionFollowing();
    expect(component.directionFollowing).toBeTrue();
    const event = new DeviceOrientationEvent('deviceorientationabsolute', { alpha: 270, absolute: true });
    window.dispatchEvent(event);
    expect(setHeading).toHaveBeenCalledWith((90 + (window.screen.orientation?.angle ?? 0)) % 360);
    await component.toggleDirectionFollowing();
    expect(component.directionFollowing).toBeFalse();
    expect(setHeading).toHaveBeenCalledWith(undefined);
    setHeading.calls.reset();
    window.dispatchEvent(event);
    expect(setHeading).not.toHaveBeenCalled();
  });

});
