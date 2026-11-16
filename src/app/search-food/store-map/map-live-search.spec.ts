import { fakeAsync, tick } from '@angular/core/testing';
import { NewSearchComponent } from '../new-search/new-search.component';

describe('live store search', () => {
  let component: NewSearchComponent;
  let loading: { isVerifying: boolean; show: jasmine.Spy; hide: jasmine.Spy };
  beforeEach(() => {
    loading = { isVerifying: false, show: jasmine.createSpy('show'), hide: jasmine.createSpy('hide') };
    component = new NewSearchComponent({} as any, {} as any, {} as any, {} as any, {} as any, {} as any, loading as any, {} as any, {} as any, {} as any);
    component.dropDownFamilyMartList = [{ Name: '全家台北店', addr: '台北市信義路', px_wgs84: '121.5654', py_wgs84: '25.033' }] as any;
    component.all711Stores = [{ name: '7-ELEVEN 台北門市', addr: '台北市松仁路', lng: 121.566, lat: 25.033 }];
  });
  afterEach(() => component.ngOnDestroy());
  function input(value: string, composing = false) {
    component.onInput({ target: { value }, isComposing: composing } as unknown as InputEvent);
  }
  it('searches after two committed characters without Enter and without a loading overlay', fakeAsync(() => {
    input('台'); tick(200);
    expect(component.unifiedDropDownList).toEqual([]);
    input('台北'); tick(179);
    expect(component.unifiedDropDownList).toEqual([]);
    tick(1);
    expect(component.unifiedDropDownList.length).toBe(2);
    expect(component.unifiedDropDownList.map(store => store.name)).toEqual(['台北門市', '台北店']);
    expect(component.unifiedDropDownList.map(store => store.label)).toEqual(['7-11', '全家']);
    expect(loading.show).not.toHaveBeenCalled();
  }));
  it('debounces fast typing and immediately clears stale results when deleting below two characters', fakeAsync(() => {
    const search = spyOn(component, 'handleSearch').and.callThrough();
    input('台北'); tick(100); input('台北店'); tick(180);
    expect(search).toHaveBeenCalledOnceWith('台北店');
    expect(component.unifiedDropDownList.length).toBe(1);
    input('台');
    expect(component.unifiedDropDownList).toEqual([]);
    tick(200);
    expect(search).toHaveBeenCalledTimes(1);
  }));
  it('waits for compositionend even if intermediate input lacks isComposing', fakeAsync(() => {
    component.onSearchCompositionStart(); input('台北'); tick(300);
    expect(component.unifiedDropDownList).toEqual([]);
    expect(component.searchTerm).toBe('');
    component.onSearchCompositionEnd({ target: { value: '台北' } } as unknown as CompositionEvent);
    // iOS/desktop browsers can send a final input after compositionend.
    input('台北'); tick(180);
    expect(component.unifiedDropDownList.length).toBe(2);
  }));
  it('leaves IME confirmation and Escape untouched, including Safari keyCode 229', fakeAsync(() => {
    const search = spyOn(component, 'performSearch');
    const composing = new KeyboardEvent('keydown', { key: 'Enter', isComposing: true, cancelable: true });
    component.onKeyDown(composing);
    const safari = new KeyboardEvent('keydown', { key: 'Enter', keyCode: 229, cancelable: true });
    component.onKeyDown(safari);
    component.onSearchCompositionStart();
    component.searchExpanded = true;
    const escape = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true });
    component.onSearchPanelKeyDown(escape);
    expect(search).not.toHaveBeenCalled();
    expect(composing.defaultPrevented).toBeFalse();
    expect(safari.defaultPrevented).toBeFalse();
    expect(escape.defaultPrevented).toBeFalse();
    expect(component.searchExpanded).toBeTrue();
  }));
  it('does not reopen a dismissed search or execute a timer after destruction', fakeAsync(() => {
    const search = spyOn(component, 'handleSearch');
    input('台北'); component.closeSearchWindow(); tick(200);
    expect(component.searchExpanded).toBeFalse();
    expect(search).not.toHaveBeenCalled();
    input('台北'); component.ngOnDestroy(); tick(200);
    expect(search).not.toHaveBeenCalled();
  }));
  it('moves the map to a search result without selecting a shop or requesting its inventory', () => {
    const focusCoordinates = jasmine.createSpy('focusCoordinates');
    const showStoreAt = jasmine.createSpy('showStoreAt');
    component.worldMap = { focusCoordinates, showStoreAt } as any;
    const query = spyOn(component, 'onMapStoreQuery');
    component.searchExpanded = true;
    component.onSearchStoreSelect({ latitude: '25.033', longitude: '121.5654', label: '全家' });
    expect(focusCoordinates).toHaveBeenCalledOnceWith(121.5654, 25.033);
    expect(showStoreAt).not.toHaveBeenCalled();
    expect(query).not.toHaveBeenCalled();
    expect(component.searchExpanded).toBeFalse();
  });
  it('resolves a FamilyMart favorite by coordinates and keeps the complete store identity', () => {
    const store = { id: 'fm-01', storeCode: '01', name: '全家台北店', brand: '全家', address: '信義路', phone: '', latitude: 25.033, longitude: 121.5654 };
    const focusCoordinates = jasmine.createSpy('focusCoordinates');
    component.worldMap = { stores: [store], focusCoordinates } as any;
    const query = spyOn(component, 'onMapStoreQuery');
    component.onFavoriteStoreSearch({ label: '全家', storeName: '全家舊店名', storeFLatitude: '25.033', storeFLongitude: '121.5654' });
    expect(query).toHaveBeenCalledOnceWith(store as any);
    expect(focusCoordinates).toHaveBeenCalledOnceWith(store.longitude, store.latitude);
  });
  it('clears previous store results when a saved favorite no longer exists', () => {
    component.worldMap = { stores: [] } as any;
    component.totalStoresShowList = [{ storeName: '上次的門市' }];
    const open = spyOn(component, 'openProductWindow');
    component.onFavoriteStoreSearch({ label: '7-11', storeName: '7-11舊門市', store711Name: '舊' });
    expect(component.mapSelectedStore).toBeUndefined();
    expect(component.totalStoresShowList).toEqual([]);
    expect(component.inventoryStatus).toContain('7-11舊門市');
    expect(open).toHaveBeenCalledTimes(1);
  });
  it('ranks name matches before addresses, preserves distinct brands, and caps broad results', () => {
    component.all711Stores = Array.from({ length: 100 }, (_, i) => ({ name: '門市' + i, addr: '台北市', lat: 25, lng: 121 }));
    component.handleSearch('台北');
    expect(component.unifiedDropDownList.length).toBe(50);
    expect(component.unifiedDropDownList[0].name).toBe('台北店');
  });
});
