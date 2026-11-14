import { fakeAsync, tick } from '@angular/core/testing';
import { NgZone } from '@angular/core';
import { NEVER, of, Subject } from 'rxjs';
import { NewSearchComponent } from '../new-search/new-search.component';
import { StoreDataService } from '../../services/stores-data.service';
import { MapStore, StoreMapComponent } from './store-map.component';
import { MapAreaCache } from './map-area-cache';

const center = { latitude: 25.033, longitude: 121.5654 };
const store: MapStore = { ...center, id: 'fm-01', storeCode: '01', name: '全家測試店', brand: '全家', address: '', phone: '', quantity: 7 };

describe('map background inventory', () => {
  let component: NewSearchComponent;
  let data: StoreDataService;
  let family: jasmine.Spy;
  let requests: Subject<any>[];
  beforeEach(() => {
    requests = [];
    data = new StoreDataService();
    data.setStores([{ name: 'existing' }]);
    family = jasmine.createSpy('nearby').and.callFake(() => {
      const response = new Subject<any>(); requests.push(response); return response;
    });
    component = new NewSearchComponent({} as any, { verificationState$: NEVER } as any, {} as any,
      { ensureWorkerReady: () => of(undefined), getNearByStoreList: () => of({ element: { StoreStockItemList: [] } }) } as any,
      { getNearByStoreList: family } as any, {} as any, {} as any, {} as any, {} as any, data);
    spyOn(component, 'init');
    component.worldMap = { visibleStores: [store] } as StoreMapComponent;
    component.hasEnteredWorld = true;
    component.mapInventory = { [store.id]: 7 };
    component.ngOnInit();
  });
  afterEach(() => component.ngOnDestroy());
  function pan(latitude = center.latitude) {
    component.onMapAreaChanged({ ...center, latitude }); tick(451);
  }
  function complete(index: number, qty = 9) {
    requests[index].next({ code: 1, data: [{ oldPKey: '01', name: '測試', info: [{ qty }] }] });
    requests[index].complete();
  }
  it('keeps counts and food search available during background refresh', fakeAsync(() => {
    pan();
    expect(component.mapInventory[store.id]).toBe(7);
    expect(data.getStores()).toEqual([{ name: 'existing' }]);
    complete(0);
    expect(component.mapInventory[store.id]).toBe(9);
  }));
  it('does not restart an in-flight request for a small drag', fakeAsync(() => {
    pan(); pan(center.latitude + .0005);
    expect(family).toHaveBeenCalledTimes(1);
    complete(0);
  }));
  it('reuses a fresh region but refreshes it after one minute', fakeAsync(() => {
    pan(); complete(0);
    pan(center.latitude + .001);
    expect(family).toHaveBeenCalledTimes(1);
    tick(60000); pan();
    expect(family).toHaveBeenCalledTimes(2);
    complete(1);
  }));
  it('queries new visible stores even within the cached region', fakeAsync(() => {
    pan(); complete(0);
    component.worldMap!.visibleStores = [store, { ...store, id: 'fm-02', storeCode: '02' }];
    pan();
    expect(family).toHaveBeenCalledTimes(2);
    complete(1);
  }));
  it('refreshes a new region and reuses the previous one when returning', fakeAsync(() => {
    pan(); complete(0);
    pan(center.latitude + .01); complete(1);
    pan();
    expect(family).toHaveBeenCalledTimes(2);
  }));
  it('preserves known counts on failure and allows a retry', fakeAsync(() => {
    pan(); requests[0].error(new Error('unavailable'));
    expect(component.mapInventory[store.id]).toBe(7);
    pan(); expect(family).toHaveBeenCalledTimes(2); complete(1);
  }));
  it('does not let an older background response overwrite newer store results', fakeAsync(() => {
    pan();
    (component as any).updateMapInventory([store], 100, () => 3);
    complete(0, 9);
    expect(component.mapInventory[store.id]).toBe(3);
  }));
});

describe('map area cache', () => {
  it('does not reuse data for unseen stores, far locations, or expired data', () => {
    const cache = new MapAreaCache();
    cache.remember(center, [store], [], 1000);
    expect(cache.find({ ...center, latitude: center.latitude + .0005 }, [store], 2000)).toEqual([]);
    expect(cache.find(center, [{ ...store, id: 'new' }], 2000)).toBeUndefined();
    expect(cache.find({ ...center, latitude: center.latitude + .01 }, [store], 2000)).toBeUndefined();
    expect(cache.find(center, [store], 61000)).toBeUndefined();
  });
});

describe('map marker reconciliation', () => {
  it('keeps marker identity, focus, and current click data while reconciling visible stores', () => {
    const component = new StoreMapComponent({} as any, new NgZone({ enableLongStackTrace: false }));
    const internal = component as any;
    let bounds = { contains: ([lng]: number[]) => lng < 122 };
    const removed = jasmine.createSpy('remove');
    class FakeMarker {
      private position = { lng: 0, lat: 0 };
      constructor(readonly options: { element: HTMLElement; subpixelPositioning?: boolean }) {}
      setLngLat([lng, lat]: number[]) { this.position = { lng, lat }; return this; }
      getLngLat() { return this.position; }
      getElement() { return this.options.element; }
      addTo() { document.body.append(this.options.element); return this; }
      remove() { removed(); this.options.element.remove(); }
    }
    internal.lib = { Marker: FakeMarker };
    internal.map = { getCenter: () => ({ lng: center.longitude, lat: center.latitude }), getBounds: () => bounds, remove: () => {} };
    component.ready = true;
    component.stores = [store];
    internal.renderStores();
    const marker = internal.markerById.get(store.id);
    expect(marker.options.subpixelPositioning).toBeTrue();
    const button = marker.getElement(); button.focus();
    component.stores = [{ ...store, quantity: 3 }];
    internal.renderStores();
    expect(internal.markerById.get(store.id)).toBe(marker);
    expect(document.activeElement).toBe(button);
    expect(button.querySelector('.shop-stock-count').textContent).toBe('3');
    const click = spyOn(component.queryStore, 'emit'); button.click();
    expect(click.calls.mostRecent().args[0]?.quantity).toBe(3);
    component.stores.push({ ...store, id: 'new', longitude: 121.566 });
    internal.renderStores();
    expect(internal.markerById.size).toBe(2);
    expect(removed).not.toHaveBeenCalled();
    bounds = { contains: ([lng]: number[]) => lng > 121.5655 };
    internal.renderStores();
    expect(internal.markerById.has(store.id)).toBeFalse();
    expect(internal.markerById.has('new')).toBeTrue();
    expect(removed).toHaveBeenCalledTimes(1);
    component.ngOnDestroy();
  });
});
