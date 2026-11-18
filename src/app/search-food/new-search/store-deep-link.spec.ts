import { fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, ParamMap } from '@angular/router';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { NewSearchComponent } from './new-search.component';
import { BrowserVerificationState } from '../../services/proxy-token.service';
import { StoreDataService } from '../../services/stores-data.service';
import { LoadingService } from '../../services/loading.service';

const stores = [
  { serial: '259002', name: '福龍', lat: 24.89634, lng: 121.22668, addr: '福龍路', phone: '034607651' },
  { serial: '182580', name: '銅鑼圈', lat: 24.833048, lng: 121.206874 },
  { serial: '284271', name: '易仕', lat: 24.888011, lng: 121.212316 },
  { serial: '293828', name: '廣城', lat: 24.954566, lng: 121.207695 },
];
const familyStore = { pkeynew: '018882', serid: '50398', Name: '全家田中金斗店', Tel: '048748349',
  addr: '彰化縣田中鎮斗中路', py_wgs84: '23.86168', px_wgs84: '120.57995' };

describe('711 store deep links', () => {
  let component: NewSearchComponent;
  let params: BehaviorSubject<ParamMap>;
  let verification: BehaviorSubject<BrowserVerificationState>;
  let directory: Subject<any[]>;
  let familyDirectory: Subject<any[]>;
  let family: { getStores: jasmine.Spy; getNearByStoreList: jasmine.Spy };
  let loading: LoadingService;
  let query: jasmine.Spy;
  let open: jasmine.Spy;
  let map: { focusCoordinates: jasmine.Spy; reportViewport: jasmine.Spy; locate: jasmine.Spy };
  let seven: { getStores: jasmine.Spy; ensureWorkerReady: jasmine.Spy; getItemsByStoreNo: jasmine.Spy; getFoodCategory: jasmine.Spy };
  beforeEach(() => {
    params = new BehaviorSubject(convertToParamMap({ brand: 'seven', store: '259002' }));
    verification = new BehaviorSubject<BrowserVerificationState>('checking');
    directory = new Subject();
    familyDirectory = new Subject();
    family = {
      getStores: jasmine.createSpy('familyDirectory').and.returnValue(familyDirectory),
      getNearByStoreList: jasmine.createSpy('familyStock').and.returnValue(of({ code: 1, data: [{
        oldPKey: '50398', name: '田中金斗', latitude: 23.86168, longitude: 120.57995, info: [{ qty: 3 }]
      }] })),
    };
    loading = new LoadingService();
    seven = {
      getStores: jasmine.createSpy('getStores').and.returnValue(directory),
      ensureWorkerReady: jasmine.createSpy('ensure').and.returnValue(of({ element: 'worker-managed' })),
      getItemsByStoreNo: jasmine.createSpy('detail').and.callFake(code => of({ isSuccess: true, element: {
        StoreStockItem: { StoreNo: code, StoreName: '福龍', RemainingQty: 3, CategoryStockItems: [] }
      } })),
      getFoodCategory: jasmine.createSpy('categories').and.returnValue(of({ element: [] })),
    };
    component = new NewSearchComponent({} as any, { verificationState$: verification } as any,
      {} as any, seven as any, family as any, {} as any, loading,
      {} as any, {} as any, new StoreDataService(), { queryParamMap: params } as unknown as ActivatedRoute);
    map = { focusCoordinates: jasmine.createSpy('focus'), reportViewport: jasmine.createSpy('viewport'), locate: jasmine.createSpy('locate') };
    component.worldMap = map as any;
    spyOn(component, 'init').and.callFake(() => { component.getSevenElevenAllStore(); component.getFamilyMartAllStore(); });
    spyOn(component, 'startTour').and.resolveTo();
    query = spyOn(component, 'onMapStoreQuery');
    open = spyOn(component, 'openProductWindow');
    component.ngOnInit();
  });
  afterEach(() => component.ngOnDestroy());

  it('waits for verification, map, and directory regardless of completion order', () => {
    directory.next(stores); directory.complete();
    component.onWorldReady();
    expect(query).not.toHaveBeenCalled();
    verification.next('verified');
    expect(query).toHaveBeenCalledOnceWith(jasmine.objectContaining({ storeCode: '259002', name: '7-ELEVEN 福龍門市', address: '福龍路', brand: '7-11' }));
    expect(map.focusCoordinates).toHaveBeenCalledOnceWith(121.22668, 24.89634);
    verification.next('verified'); component.onWorldReady();
    expect(query).toHaveBeenCalledTimes(1);
  });

  it('waits for a late directory and skips automatic GPS and tour', fakeAsync(() => {
    verification.next('verified'); component.onWorldReady();
    expect(query).not.toHaveBeenCalled();
    directory.next(stores); directory.complete();
    tick(1500);
    expect(query).toHaveBeenCalledTimes(1);
    expect(map.locate).not.toHaveBeenCalled();
    expect(component.startTour).not.toHaveBeenCalled();
  }));

  it('supports all four stores and bare store parameters on in-app navigation', () => {
    directory.next(stores); directory.complete(); verification.next('verified'); component.onWorldReady();
    for (const store of stores) {
      params.next(convertToParamMap({ brand: 'seven', store: store.serial }));
      expect(query.calls.mostRecent().args[0].storeCode).toBe(store.serial);
      expect(map.focusCoordinates.calls.mostRecent().args).toEqual([store.lng, store.lat]);
    }
  });

  it('reuses the authenticated inventory path for the exact store number', () => {
    query.and.callThrough();
    directory.next(stores); directory.complete(); verification.next('verified'); component.onWorldReady();
    expect(seven.ensureWorkerReady).toHaveBeenCalledTimes(1);
    expect(seven.getItemsByStoreNo).toHaveBeenCalledOnceWith('259002', { Latitude: 24.89634, Longitude: 121.22668 });
    expect(component.mapSelectedStore?.storeCode).toBe('259002');
    expect(component.totalStoresShowList[0].StoreNo).toBe('259002');
    expect(component.selectedStoreQuantity).toBe(3);
    expect(open).toHaveBeenCalledTimes(1);
  });

  it('waits for the verification overlay to finish after the verified event before querying', () => {
    query.and.callThrough();
    loading.showVerification('驗證中');
    directory.next(stores); directory.complete(); component.onWorldReady();
    verification.next('verified');
    expect(query).not.toHaveBeenCalled();
    expect(seven.getItemsByStoreNo).not.toHaveBeenCalled();
    loading.hideVerification();
    expect(query).toHaveBeenCalledTimes(1);
    expect(seven.getItemsByStoreNo).toHaveBeenCalledOnceWith('259002', { Latitude: 24.89634, Longitude: 121.22668 });
    expect(component.inventoryStatus).not.toContain('請先完成瀏覽器驗證');
    loading.hideVerification(); verification.next('verified');
    expect(query).toHaveBeenCalledTimes(1);
  });

  it('shows only a not-found message for missing, malformed, or ambiguous store codes', () => {
    directory.next([...stores, { name: '缺少店號的資料', lat: 25, lng: 121 }]); directory.complete();
    params.next(convertToParamMap({ brand: 'seven', store: 'unknown' }));
    verification.next('verified'); component.onWorldReady();
    for (const code of ['', '12345', 'unknown', '999999', ['259002', '182580']]) {
      params.next(convertToParamMap({ brand: 'seven', store: code }));
      expect(component.inventoryStatus).toContain('找不到指定門市');
      expect(component.inventoryStatus).not.toContain('格式');
    }
    expect(query).not.toHaveBeenCalled();
    expect(seven.getItemsByStoreNo).not.toHaveBeenCalled();
    expect(map.focusCoordinates).not.toHaveBeenCalled();
  });

  it('ignores unsupported map values while still finding a known store', () => {
    directory.next(stores); directory.complete(); verification.next('verified'); component.onWorldReady();
    for (const extras of [{ map: 'invalid' }, { map: ['true', 'false'] }]) {
      const previous = query.calls.count();
      params.next(convertToParamMap({ brand: 'seven', store: '259002', ...extras }));
      expect(query.calls.count()).toBe(previous + 1);
      expect(query.calls.mostRecent().args[0].storeCode).toBe('259002');
    }
  });

  it('shows directory failure without querying a different or nearby store', () => {
    verification.next('verified'); component.onWorldReady(); directory.error(new Error('offline'));
    expect(component.inventoryStatus).toContain('門市目錄暫時無法載入');
    expect(open).toHaveBeenCalled();
    expect(query).not.toHaveBeenCalled();
  });

  it('does not guess a brand when it is missing, unsupported, or repeated', () => {
    verification.next('verified'); component.onWorldReady();
    for (const brand of [undefined, 'unknown', ['seven', 'family']]) {
      params.next(convertToParamMap(brand === undefined ? { store: '259002' } : { store: '259002', brand }));
      expect(component.inventoryStatus).toContain('找不到指定門市');
    }
    expect(query).not.toHaveBeenCalled();
    expect(seven.getItemsByStoreNo).not.toHaveBeenCalled();
    expect(family.getNearByStoreList).not.toHaveBeenCalled();
  });

  it('resolves a FamilyMart pkeynew with its leading zero without waiting for the 711 directory', () => {
    params.next(convertToParamMap({ brand: 'family', store: '018882' }));
    familyDirectory.next([familyStore]); familyDirectory.complete();
    verification.next('verified'); component.onWorldReady();
    expect(query).toHaveBeenCalledOnceWith(jasmine.objectContaining({ storeCode: '018882', id: 'fm-018882', brand: '全家', name: '全家田中金斗店' }));
    expect(map.focusCoordinates).toHaveBeenCalledOnceWith(120.57995, 23.86168);
  });

  it('queries FamilyMart by its directory coordinates and matches a different stock ID', () => {
    query.and.callThrough();
    params.next(convertToParamMap({ brand: 'family', store: '018882' }));
    familyDirectory.next([familyStore]); familyDirectory.complete();
    verification.next('verified'); component.onWorldReady();
    expect(family.getNearByStoreList).toHaveBeenCalledOnceWith({ Latitude: 23.86168, Longitude: 120.57995 });
    expect(component.totalStoresShowList[0].oldPKey).toBe('50398');
    expect(component.selectedStoreQuantity).toBe(3);
    expect(seven.getItemsByStoreNo).not.toHaveBeenCalled();
  });

  it('rejects unusable coordinates and clears an earlier selected store', () => {
    component.mapSelectedStore = { id: 'old', name: 'old', brand: '7-11', latitude: 25, longitude: 121, address: '', phone: '' };
    directory.next([{ ...stores[0], lat: 0 }]); directory.complete(); verification.next('verified'); component.onWorldReady();
    expect(component.inventoryStatus).toContain('地圖資料暫時無法使用');
    expect(component.mapSelectedStore).toBeUndefined();
    expect(query).not.toHaveBeenCalled();
  });

  it('preserves normal map entry when no store parameter is provided', fakeAsync(() => {
    params.next(convertToParamMap({}));
    verification.next('verified'); component.onWorldReady(); tick(1200);
    expect(map.locate).toHaveBeenCalledTimes(1);
    expect(component.startTour).toHaveBeenCalledTimes(1);
    expect(query).not.toHaveBeenCalled();
  }));

  it('stops reacting to route changes after destruction', () => {
    directory.next(stores); directory.complete(); verification.next('verified'); component.onWorldReady();
    component.ngOnDestroy();
    params.next(convertToParamMap({ brand: 'seven', store: '182580' }));
    expect(query).toHaveBeenCalledTimes(1);
  });
});
