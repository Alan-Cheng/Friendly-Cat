import { NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { NewSearchComponent } from '../new-search/new-search.component';
import { SiderComponent } from '../../components/sider/sider.component';
import { DisplayComponent } from '../new-search/display/display.component';
import { RoundPipe } from '../../pipes/round.pipe';
import { EmptyInfoPipe } from '../../pipes/empty-info.pipe';
import { ProxyTokenService } from '../../services/proxy-token.service';
import { GeolocationService } from '../../services/geolocation.service';
import { AuthService } from '../../services/auth.service';
import { LoadingService } from '../../services/loading.service';
import { StoreDataService } from '../../services/stores-data.service';
import { SevenElevenRequestService } from '../new-search/services/seven-eleven-request.service';
import { FamilyMartRequestService } from '../new-search/services/family-mart-request.service';

describe('store detail panel', () => {
  beforeEach(async () => {
    // Exercise the real templates without starting map, authentication or stock requests.
    spyOn(NewSearchComponent.prototype, 'ngOnInit').and.stub();
    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule],
      declarations: [NewSearchComponent, SiderComponent, DisplayComponent, RoundPipe, EmptyInfoPipe],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        ...[HttpClient, ProxyTokenService, GeolocationService, SevenElevenRequestService,
          FamilyMartRequestService, AuthService, MatDialog, AngularFirestore].map(provide => ({ provide, useValue: {} })),
        { provide: LoadingService, useValue: { verificationLoading$: of(false) } },
        StoreDataService
      ]
    }).compileComponents();
  });

  function createPanel() {
    const fixture = TestBed.createComponent(NewSearchComponent);
    const component = fixture.componentInstance;
    component.hasEnteredWorld = true;
    component.mapSelectedStore = { id: 'fm-01', name: '全家台北店', brand: '全家', address: '台北市信義路', phone: '', latitude: 25.033, longitude: 121.5654 };
    fixture.detectChanges();
    component.openProductWindow();
    return { fixture, component, panel: component.sidebar!.detailsWindow.nativeElement };
  }

  it('retains store information and navigation while inventory is loading, empty or unavailable', () => {
    const { fixture, component, panel } = createPanel();
    component.mapQueryPending = true;
    fixture.detectChanges();
    expect(panel.querySelector('#product-window-title')!.textContent).toContain('全家台北店');
    expect(panel.querySelector('.place-facts')!.textContent).toContain('台北市信義路');
    expect(panel.querySelector<HTMLAnchorElement>('.primary-action')!.href).toContain('destination=25.033,121.5654');
    expect(panel.querySelector('progress')).not.toBeNull();
    component.mapQueryPending = false;
    component.mapInventory = { 'fm-01': 0 };
    component.inventoryStatus = '這間店目前沒有可顯示的即期商品。';
    fixture.detectChanges();
    expect(panel.querySelector('.inventory-total')!.textContent).toContain('0 件');
    expect(panel.querySelector('progress')).toBeNull();
    component.inventoryStatus = '這間店的商品暫時無法載入，請稍後重試。';
    fixture.detectChanges();
    const refresh = spyOn(component, 'refreshProducts');
    panel.querySelector<HTMLButtonElement>('.inventory-retry')!.click();
    expect(refresh).toHaveBeenCalledTimes(1);
    const close = spyOn(component.sidebar!, 'closeSidebar').and.resolveTo();
    panel.querySelector<HTMLButtonElement>('.place-close')!.click();
    expect(close).toHaveBeenCalledTimes(1);
  });

  it('keeps the category filter and loaded products inside the selected store panel', () => {
    const { fixture, component, panel } = createPanel();
    const category = { name: '飯糰', qty: 3, iconURL: 'assets/family-mart.svg', categories: [{ name: '飯糰', products: [{ name: '鮭魚飯糰', qty: 3 }] }] };
    const stock = { name: '台北店', storeName: '全家台北店', label: '全家', info: [category], selectedCategory: category };
    component.totalStoresShowList = [stock];
    component.foodDetailsFamilyMart = [];
    component.mapInventory = { 'fm-01': 3 };
    fixture.detectChanges();
    expect(panel.querySelectorAll('.store-heading').length).toBe(0);
    expect(panel.querySelector('.category-option')!.getAttribute('aria-pressed')).toBe('true');
    expect(panel.querySelector('.product-copy h5')!.textContent).toBe('鮭魚飯糰');
    expect(panel.querySelector('.product-stock')!.textContent).toContain('3');
  });
  it('returns to the separate menu panel and reopens details for another favorite', () => {
    const { fixture, component, panel } = createPanel();
    const query = spyOn(component, 'onMapStoreQuery').and.callFake(store => {
      component.mapSelectedStore = store;
      component.openProductWindow();
    });
    const focusCoordinates = jasmine.createSpy('focusCoordinates');
    const first = component.mapSelectedStore!;
    const second = { ...first, id: '711-02', storeCode: '02', brand: '7-11' as const, name: '7-ELEVEN 信義門市', longitude: 121.566 };
    component.worldMap = { stores: [first, second], focusCoordinates } as any;
    component.favoriteStores = [{ storeName: '7-11信義門市', store711Name: '信義', label: '7-11' }];
    component.user = { displayName: '測試使用者' };
    panel.querySelector<HTMLButtonElement>('.place-back')!.click();
    fixture.detectChanges();
    expect(panel.open).toBeFalse();
    expect(component.sidebar!.sidebarWindow.nativeElement.open).toBeTrue();
    expect(component.sidebar!.detailMode).toBeFalse();
    component.sidebar!.sidebarWindow.nativeElement.querySelector<HTMLButtonElement>('.store-item')!.click();
    fixture.detectChanges();
    expect(query).toHaveBeenCalledOnceWith(second);
    expect(focusCoordinates).toHaveBeenCalledOnceWith(second.longitude, second.latitude);
    expect(panel.querySelector('#product-window-title')!.textContent).toContain('7-ELEVEN 信義門市');
    expect(component.sidebar!.detailMode).toBeTrue();
    expect(fixture.nativeElement.querySelectorAll('dialog').length).toBe(2);
  });

});
