import { SimpleChange, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { StoreMapComponent, MapStore } from './store-map.component';

describe('StoreMapComponent data and location', () => {
  let component: StoreMapComponent;
  let originalPermission: PropertyDescriptor | undefined;
  const family = { pkeynew: '01', Name: '全家測試店', addr: '台北市信義區', Tel: '02-12345678', px_wgs84: '121.5654', py_wgs84: '25.033' };
  beforeEach(() => {
    originalPermission = Object.getOwnPropertyDescriptor(DeviceOrientationEvent, 'requestPermission');
    component = new StoreMapComponent({} as HttpClient, new NgZone({ enableLongStackTrace: false }));
  });
  afterEach(() => {
    component.ngOnDestroy();
    if (originalPermission) Object.defineProperty(DeviceOrientationEvent, 'requestPermission', originalPermission);
    else Reflect.deleteProperty(DeviceOrientationEvent, 'requestPermission');
  });
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

  it('shows zero for stores with no inventory after a response and clears cached counts while loading', () => {
    component.familyStores = [family];
    component.sevenStores = [{ serial: '02', name: '信義', lat: 25.033, lng: 121.566 }];
    component.familyStock = [{ oldPKey: '01', info: [{ qty: 7 }] }];
    component.inventory = { 'fm-01': 'loading', '711-02': 'loading' };
    update();
    expect(component.stores.map(store => store.quantity)).toEqual([undefined, undefined]);
    component.inventory = { 'fm-01': 0, '711-02': 0 };
    component.ngOnChanges({ inventory: new SimpleChange({}, component.inventory, false) });
    expect(component.stores.map(store => store.quantity)).toEqual([0, 0]);
    component.inventory = { 'fm-01': 5, '711-02': 12 };
    component.ngOnChanges({ inventory: new SimpleChange({}, component.inventory, false) });
    expect(component.stores.map(store => store.quantity)).toEqual([5, 12]);
  });

  it('opens products immediately when a map shop is selected', () => {
    component.familyStores = [family]; update();
    const emit = spyOn(component.queryStore, 'emit');
    component.select(component.stores[0]);
    expect(emit).toHaveBeenCalledWith(component.stores[0]);
    expect(component.stores[0].storeCode).toBe('01');
    expect(component.selected).toBeUndefined();
  });

  it('updates inventory without normalizing the directory again and restores snapshot stock after an override is removed', () => {
    component.familyStores = [family];
    component.familyStock = [{ oldPKey: '01', info: [{ qty: 7 }] }];
    update();
    const normalize = spyOn(component as any, 'normalizeStores').and.callThrough();
    component.inventory = { 'fm-01': 3 };
    component.ngOnChanges({ inventory: new SimpleChange({}, component.inventory, false) });
    expect(component.visibleStores[0].quantity).toBe(3);
    component.inventory = {};
    component.ngOnChanges({ inventory: new SimpleChange({}, {}, false) });
    expect(component.visibleStores[0].quantity).toBe(7);
    expect(normalize).not.toHaveBeenCalled();
  });

  it('suspends store details and nearby queries at country scale and restores them after zooming in', () => {
    component.familyStores = [family]; update();
    let zoom = 7;
    const internal = component as any;
    const removeMarker = jasmine.createSpy('remove');
    const setStores = jasmine.createSpy('setStores');
    internal.map = {
      getZoom: () => zoom,
      getCenter: () => ({ lat: 25.033, lng: 121.5654 }),
      getBounds: () => ({ contains: () => true }), remove: () => {}
    };
    internal.cat = { setStores };
    internal.markerById.set('fm-01', { remove: removeMarker });
    component.ready = true;
    const emit = spyOn(component.areaChanged, 'emit');
    internal.renderStores();
    component.reportViewport();
    expect(component.overviewMode).toBeTrue();
    expect(component.visibleStores).toEqual([]);
    expect(internal.markerById.size).toBe(0);
    expect(removeMarker).toHaveBeenCalledTimes(1);
    expect(setStores).toHaveBeenCalledWith([]);
    expect(emit).not.toHaveBeenCalled();
    zoom = 12;
    internal.renderStores(); component.reportViewport();
    expect(component.overviewMode).toBeFalse();
    expect(component.visibleStores.length).toBe(1);
    expect(emit).toHaveBeenCalledOnceWith({ latitude: 25.033, longitude: 121.5654 });
  });

  it('flies to the current location at the default zoom and honors reduced motion', () => {
    const internal = component as any;
    const flyTo = jasmine.createSpy('flyTo');
    internal.map = { flyTo, getZoom: () => 14, remove: () => {} };
    internal.watchId = 1;
    component.latitude = 25.033;
    component.longitude = 121.5654;
    internal.reducedMotion = false;
    component.locate();
    expect(flyTo).toHaveBeenCalledOnceWith({ center: [121.5654, 25.033], zoom: 17, curve: 1.42, duration: 1600 });
    internal.reducedMotion = true;
    component.locate();
    expect(flyTo.calls.mostRecent().args[0].duration).toBe(0);
  });

  it('pulls back before returning to zoom 17 even when already at the current location', () => {
    const internal = component as any;
    let zoom = 17;
    let onEnd!: () => void;
    const flyTo = jasmine.createSpy('flyTo');
    const easeTo = jasmine.createSpy('easeTo');
    const off = jasmine.createSpy('off');
    internal.map = { getZoom: () => zoom, stop: () => {}, on: (_type: string, callback: () => void) => { onEnd = callback; }, off, easeTo, flyTo, remove: () => {} };
    internal.watchId = 1; internal.reducedMotion = false;
    component.latitude = 25.033; component.longitude = 121.5654;
    component.locate();
    expect(easeTo).toHaveBeenCalledOnceWith({ zoom: 15.5, duration: 450 });
    expect(flyTo).not.toHaveBeenCalled();
    zoom = 15.5; onEnd();
    expect(flyTo).toHaveBeenCalledOnceWith({ center: [121.5654, 25.033], zoom: 17, curve: 1.42, duration: 1150 });
    expect(off).toHaveBeenCalledWith('moveend', onEnd);
    expect(internal.locationFlight).toBeUndefined();
  });

  it('does not resume the location flight after the pullback is interrupted', () => {
    const internal = component as any;
    let onEnd!: () => void;
    const flyTo = jasmine.createSpy('flyTo');
    internal.map = { getZoom: () => 17, stop: () => {}, on: (_type: string, callback: () => void) => { onEnd = callback; }, off: () => {}, easeTo: () => {}, flyTo, remove: () => {} };
    internal.watchId = 1; internal.reducedMotion = false;
    component.latitude = 25.033; component.longitude = 121.5654;
    component.locate();
    onEnd();
    expect(flyTo).not.toHaveBeenCalled();
    expect(internal.locationFlight).toBeUndefined();
  });

  it('emits selected shop coordinates for inventory lookup without requesting GPS', () => {
    component.familyStores = [family]; update(); component.selected = component.stores[0];
    const emit = spyOn(component.queryStore, 'emit'); component.requestProducts();
    expect(emit).toHaveBeenCalledWith(component.selected as MapStore);
    component.querying = true; component.requestProducts(); expect(emit).toHaveBeenCalledTimes(1);
    component.querying = false; component.inventoryBlocked = true; component.requestProducts(); expect(emit).toHaveBeenCalledTimes(1);
  });
  it('uses absolute compass headings in both perspectives and ignores relative alpha', async () => {
    await component.enableOrientation();
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
    await component.enableOrientation();
    const setHeading = jasmine.createSpy('setHeading');
    (component as any).cat = { setHeading };
    const remove = spyOn(window, 'removeEventListener').and.callThrough();
    (component as any).onOrientation({ webkitCompassHeading: 359, webkitCompassAccuracy: 10, alpha: 180, absolute: false });
    expect(setHeading).toHaveBeenCalledWith((359 + (window.screen.orientation?.angle ?? 0)) % 360);
    component.ngOnDestroy();
    expect(remove).toHaveBeenCalledWith('deviceorientation', (component as any).onOrientation);
    expect(remove).toHaveBeenCalledWith('deviceorientationabsolute', (component as any).onOrientation);
  });

  it('automatically follows when explicit permission is unnecessary, and can disable and re-enable', async () => {
    Object.defineProperty(DeviceOrientationEvent, 'requestPermission', { configurable: true, value: undefined });
    const setHeading = jasmine.createSpy('setHeading');
    (component as any).cat = { setHeading };
    expect(component.directionFollowing).toBeFalse();
    (component as any).startDefaultDirectionFollowing();
    expect(component.directionFollowing).toBeTrue();
    await component.toggleDirectionFollowing();
    expect(component.directionFollowing).toBeFalse();
    expect(setHeading).toHaveBeenCalledWith(undefined);
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

  it('ignores compass jitter and accepts a short turn across north', async () => {
    await component.enableOrientation();
    const setHeading = jasmine.createSpy('setHeading');
    (component as any).cat = { setHeading };
    (component as any).updateHeading(359);
    (component as any).updateHeading(359.6);
    (component as any).updateHeading(.4);
    expect(setHeading.calls.allArgs()).toEqual([[359]]);
    (component as any).updateHeading(1);
    expect(setHeading.calls.allArgs()).toEqual([[359], [1]]);
  });

  it('keeps the absolute sensor source instead of alternating between competing events', async () => {
    await component.enableOrientation();
    const setHeading = jasmine.createSpy('setHeading');
    (component as any).cat = { setHeading };
    (component as any).onOrientation({ type: 'deviceorientationabsolute', absolute: true, alpha: 270 });
    setHeading.calls.reset();
    (component as any).onOrientation({ type: 'deviceorientation', absolute: true, alpha: 180 });
    expect(setHeading).not.toHaveBeenCalled();
  });

  it('does not let GPS or late sensor events rotate the cat after following is disabled', async () => {
    const setHeading = jasmine.createSpy('setHeading');
    (component as any).cat = { setHeading };
    let onPosition!: PositionCallback;
    spyOn(navigator.geolocation, 'watchPosition').and.callFake(callback => { onPosition = callback; return 1; });
    spyOn(component as any, 'updateCat').and.returnValue(Promise.resolve());
    await component.enableOrientation();
    await component.toggleDirectionFollowing();
    setHeading.calls.reset();
    component.locate();
    onPosition({ coords: { latitude: 25.033, longitude: 121.5654, heading: 90, accuracy: 10 } } as GeolocationPosition);
    (component as any).onOrientation({ absolute: true, alpha: 180 });
    expect(setHeading).not.toHaveBeenCalled();
  });

  it('keeps the iPhone switch off until its own tap grants sensor permission', async () => {
    let resolvePermission!: (value: string) => void;
    const requestPermission = jasmine.createSpy('requestPermission').and.returnValue(new Promise<string>(resolve => { resolvePermission = resolve; }));
    Object.defineProperty(DeviceOrientationEvent, 'requestPermission', { configurable: true, value: requestPermission });
    (component as any).startDefaultDirectionFollowing();
    expect(component.directionFollowing).toBeFalse();
    window.dispatchEvent(new Event('pointerup'));
    expect(requestPermission).not.toHaveBeenCalled();
    const enabling = component.toggleDirectionFollowing();
    expect(component.directionFollowing).toBeFalse();
    expect(component.directionRequesting).toBeTrue();
    expect(requestPermission).toHaveBeenCalledOnceWith(true);
    resolvePermission('granted');
    await enabling;
    expect(component.directionFollowing).toBeTrue();
    expect(component.directionRequesting).toBeFalse();
  });

  it('stays off when iPhone permission is denied and allows another attempt', async () => {
    const requestPermission = jasmine.createSpy('requestPermission').and.returnValues(Promise.resolve('denied'), Promise.resolve('granted'));
    Object.defineProperty(DeviceOrientationEvent, 'requestPermission', { configurable: true, value: requestPermission });
    await component.toggleDirectionFollowing();
    expect(component.directionFollowing).toBeFalse();
    expect(component.directionRequesting).toBeFalse();
    expect(component.headingStatus).toContain('維持關閉');
    await component.toggleDirectionFollowing();
    expect(component.directionFollowing).toBeTrue();
    expect(component.headingStatus).toBe('');
  });

  it('stays off after a permission error or destruction while permission is pending', async () => {
    const requestPermission = jasmine.createSpy('requestPermission').and.callFake(() => Promise.reject(new Error('NotAllowedError')));
    Object.defineProperty(DeviceOrientationEvent, 'requestPermission', { configurable: true, value: requestPermission });
    await component.toggleDirectionFollowing();
    expect(component.directionFollowing).toBeFalse();
    expect(component.directionRequesting).toBeFalse();
    let resolvePermission!: (value: string) => void;
    requestPermission.and.returnValue(new Promise<string>(resolve => { resolvePermission = resolve; }));
    const enabling = component.toggleDirectionFollowing();
    component.ngOnDestroy();
    resolvePermission('granted');
    await enabling;
    expect(component.directionFollowing).toBeFalse();
  });

});
