import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, ParamMap } from '@angular/router';
import { BehaviorSubject, of, Subject, throwError } from 'rxjs';
import { LegacySearchComponent } from './legacy-search.component';
import { ProxyTokenService } from '../../services/proxy-token.service';
import { LoadingService } from '../../services/loading.service';
import { StoreDataService } from '../../services/stores-data.service';

const stores = [
  { serial: '259002', name: '福龍', lat: 24.89634, lng: 121.22668 },
  { serial: '182580', name: '銅鑼圈', lat: 24.833048, lng: 121.206874 },
  { serial: '284271', name: '易仕', lat: 24.888011, lng: 121.212316 },
  { serial: '293828', name: '廣城', lat: 24.954566, lng: 121.207695 },
];

describe('classic store deep links', () => {
  let params: BehaviorSubject<ParamMap>;
  let component: LegacySearchComponent;
  let resolveReady: () => void;
  let ready: Promise<void>;
  let ensure: jasmine.Spy;
  let seven: { getStores: jasmine.Spy; getItemsByStoreNo: jasmine.Spy; getFoodCategory: jasmine.Spy };
  let geolocation: jasmine.Spy;
  let data: StoreDataService;
  let family: { getStores: jasmine.Spy; getNearByStoreList: jasmine.Spy };
  beforeEach(() => {
    params = new BehaviorSubject(convertToParamMap({ brand: 'seven', store: '259002', map: 'false' }));
    ready = new Promise(resolve => resolveReady = resolve);
    ensure = jasmine.createSpy('ensure').and.returnValue(ready);
    seven = {
      getStores: jasmine.createSpy('directory').and.returnValue(of(stores)),
      getFoodCategory: jasmine.createSpy('categories').and.returnValue(of({ element: [{ Name: '飯糰', Children: [] }] })),
      getItemsByStoreNo: jasmine.createSpy('detail').and.callFake(code => of({ isSuccess: true, element: {
        StoreStockItem: { StoreNo: code, RemainingQty: 3, CategoryStockItems: [] }
      } })),
    };
    geolocation = jasmine.createSpy('geolocation');
    data = new StoreDataService();
    family = {
      getStores: jasmine.createSpy('familyDirectory').and.returnValue(of([{ pkeynew: '018882', serid: '50398',
        Name: '全家田中金斗店', py_wgs84: '23.86168', px_wgs84: '120.57995' }])),
      getNearByStoreList: jasmine.createSpy('familyStock').and.returnValue(of({ code: 1, data: [
        { oldPKey: '50398', name: '田中金斗', latitude: 23.86168, longitude: 120.57995, info: [{ qty: 4 }] },
        { oldPKey: 'other', name: '別間店', latitude: 23.8618, longitude: 120.5799, info: [{ qty: 99 }] },
      ] })),
    };
    TestBed.configureTestingModule({ providers: [
      { provide: ActivatedRoute, useValue: { queryParamMap: params } },
      { provide: ProxyTokenService, useValue: { ensure } },
    ] });
    component = TestBed.runInInjectionContext(() => new LegacySearchComponent({} as any,
      { getCurrentPosition: geolocation } as any, seven as any, family as any, {} as any,
      new LoadingService(), {} as any, {} as any, data));
    spyOn(component, 'init').and.callFake(() => component.getSevenElevenAllStore());
    component.ngOnInit();
  });

  it('waits for full verification, then loads the exact store without requesting location', async () => {
    expect(seven.getItemsByStoreNo).not.toHaveBeenCalled();
    resolveReady(); await ready;
    expect(seven.getItemsByStoreNo).toHaveBeenCalledOnceWith('259002', { Latitude: 24.89634, Longitude: 121.22668 });
    expect(component.totalStoresShowList[0].StoreNo).toBe('259002');
    expect(component.totalStoresShowList[0].StoreName).toBe('福龍');
    expect(component.isLocationSearchMode).toBeFalse();
    expect(data.getIsUserLocationSearch()).toBeFalse();
    expect(seven.getStores).toHaveBeenCalledTimes(1);
    expect(geolocation).not.toHaveBeenCalled();
  });

  it('supports all four store codes', async () => {
    resolveReady(); await ready;
    for (const store of stores) {
      params.next(convertToParamMap({ brand: 'seven', store: store.serial, map: 'false' }));
      await Promise.resolve();
      expect(component.totalStoresShowList[0].StoreNo).toBe(store.serial);
    }
  });

  it('cancels a pending link when a different store is selected', async () => {
    params.next(convertToParamMap({ brand: 'seven', store: '182580', map: 'false' }));
    resolveReady(); await ready;
    expect(seven.getItemsByStoreNo).toHaveBeenCalledTimes(1);
    expect(component.totalStoresShowList[0].StoreNo).toBe('182580');
  });

  it('discards an old in-flight stock response when the target changes', async () => {
    const old = new Subject<any>();
    seven.getItemsByStoreNo.and.returnValue(old);
    resolveReady(); await ready;
    seven.getItemsByStoreNo.and.returnValue(of({ isSuccess: true, element: { StoreStockItem: { StoreNo: '182580', RemainingQty: 2 } } }));
    params.next(convertToParamMap({ brand: 'seven', store: '182580', map: 'false' })); await Promise.resolve();
    old.next({ isSuccess: true, element: { StoreStockItem: { StoreNo: '259002', RemainingQty: 99 } } });
    expect(component.totalStoresShowList[0].StoreNo).toBe('182580');
  });

  it('shows zero stock without displaying nearby stores', async () => {
    seven.getItemsByStoreNo.and.returnValue(of({ isSuccess: true, element: { StoreStockItem: { StoreNo: '259002', RemainingQty: 0 } } }));
    resolveReady(); await ready;
    expect(component.totalStoresShowList).toEqual([]);
    expect(component.linkedStoreStatus).toContain('福龍門市目前沒有');
    expect(geolocation).not.toHaveBeenCalled();
  });

  it('ignores invalid optional parameters and shows only not-found for unknown stores', async () => {
    params.next(convertToParamMap({ brand: 'seven', store: '259002', map: 'invalid' }));
    resolveReady(); await ready;
    expect(component.totalStoresShowList[0].StoreNo).toBe('259002');
    for (const store of ['999999', 'unknown', '', ['259002', '182580']]) {
      params.next(convertToParamMap({ brand: 'seven', store, map: 'false' })); await Promise.resolve();
      expect(component.linkedStoreStatus).toContain('找不到指定門市');
      expect(component.linkedStoreStatus).not.toContain('格式');
    }
    expect(seven.getItemsByStoreNo).toHaveBeenCalledTimes(1);
  });

  it('does not treat upstream errors or a different returned store as empty stock', async () => {
    seven.getItemsByStoreNo.and.returnValue(throwError(() => new Error('offline')));
    resolveReady(); await ready;
    expect(component.linkedStoreStatus).toContain('暫時無法載入');
    seven.getItemsByStoreNo.and.returnValue(of({ isSuccess: true, element: { StoreStockItem: { StoreNo: '182580', RemainingQty: 5 } } }));
    params.next(convertToParamMap({ brand: 'seven', store: '259002', map: 'false' })); await Promise.resolve();
    expect(component.linkedStoreStatus).toContain('暫時無法載入');
    expect(component.totalStoresShowList).toEqual([]);
  });

  it('stops route-driven requests when the injection scope is destroyed', async () => {
    resolveReady(); await ready;
    TestBed.resetTestingModule();
    params.next(convertToParamMap({ brand: 'seven', store: '182580', map: 'false' })); await Promise.resolve();
    expect(seven.getItemsByStoreNo).toHaveBeenCalledTimes(1);
  });

  it('requires an explicit supported brand before querying either inventory API', async () => {
    for (const brand of [undefined, 'unknown', ['seven', 'family']]) {
      params.next(convertToParamMap(brand === undefined ? { store: '259002' } : { store: '259002', brand }));
      expect(component.linkedStoreStatus).toContain('找不到指定門市');
    }
    resolveReady(); await ready;
    expect(seven.getItemsByStoreNo).not.toHaveBeenCalled();
    expect(family.getNearByStoreList).not.toHaveBeenCalled();
  });

  it('opens FamilyMart by pkeynew and selects its stock even if oldPKey differs', async () => {
    params.next(convertToParamMap({ brand: 'family', store: '018882', map: 'false' }));
    resolveReady(); await ready;
    expect(family.getNearByStoreList).toHaveBeenCalledOnceWith({ Latitude: 23.86168, Longitude: 120.57995 });
    expect(component.totalStoresShowList.length).toBe(1);
    expect(component.totalStoresShowList[0].label).toBe('全家');
    expect(component.totalStoresShowList[0].oldPKey).toBe('50398');
    expect(component.searchTerm).toBe('');
    expect(geolocation).not.toHaveBeenCalled();
    expect(seven.getItemsByStoreNo).not.toHaveBeenCalled();
  });

  it('does not accept a FamilyMart service ID as pkeynew', async () => {
    params.next(convertToParamMap({ brand: 'family', store: '50398', map: 'false' }));
    resolveReady(); await ready;
    expect(component.linkedStoreStatus).toContain('找不到指定門市');
    expect(family.getNearByStoreList).not.toHaveBeenCalled();
  });

  it('shows empty FamilyMart stock instead of nearby store inventory', async () => {
    family.getNearByStoreList.and.returnValue(of({ code: 1, data: [{ oldPKey: 'other', name: '別間店', info: [{ qty: 99 }] }] }));
    params.next(convertToParamMap({ brand: 'family', store: '018882', map: 'false' }));
    resolveReady(); await ready;
    expect(component.totalStoresShowList).toEqual([]);
    expect(component.linkedStoreStatus).toContain('全家田中金斗店目前沒有');
  });
});
