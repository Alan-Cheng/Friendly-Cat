import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';
import { GeolocationService } from '../../services/geolocation.service';
import { StoreDataService } from '../../services/stores-data.service';
import { SevenElevenRequestService } from '../../search-food/new-search/services/seven-eleven-request.service';
import { FamilyMartRequestService } from '../../search-food/new-search/services/family-mart-request.service';
import { SiderComponent } from './sider.component';

describe('independent menu and store panels', () => {
  let fixture: ComponentFixture<SiderComponent>;
  let component: SiderComponent;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule], declarations: [SiderComponent], schemas: [NO_ERRORS_SCHEMA],
      providers: [StoreDataService, ...[AuthService, MatDialog, GeolocationService, SevenElevenRequestService, FamilyMartRequestService].map(provide => ({ provide, useValue: {} }))]
    }).compileComponents();
    fixture = TestBed.createComponent(SiderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  afterEach(() => {
    component.sidebarWindow.nativeElement.close();
    component.detailsWindow.nativeElement.close();
  });

  it('opens the menu without focusing its heading', () => {
    component.showMenu();
    expect(document.activeElement?.id).not.toBe('sidebar-title');
    expect(fixture.nativeElement.querySelector('#sidebar-title').hasAttribute('autofocus')).toBeFalse();
  });

  it('matches product images within each brand and falls back when missing or broken', () => {
    fixture.componentRef.setInput('foodDetails711', [{ name: '飯糰', image: 'seven-rice.jpg' }]);
    fixture.componentRef.setInput('foodDetailsFamilyMart', [{ title: '飯糰', picture_url: 'family-rice.jpg' }]);
    component.foodSearchResults = [
      { foodName: '飯糰', storeType: '7-11', storeName: '信義門市' },
      { foodName: '飯糰', storeType: '全家', storeName: '台北店' },
      { foodName: '完全沒有對應資料', storeType: '全家', storeName: '台北店' }
    ];
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('.result-item') as NodeListOf<HTMLButtonElement>;
    expect(rows[0].querySelector<HTMLImageElement>('.result-product-image')!.getAttribute('src')).toBe('seven-rice.jpg');
    expect(rows[1].querySelector<HTMLImageElement>('.result-product-image')!.getAttribute('src')).toBe('family-rice.jpg');
    expect(rows[2].querySelector<HTMLImageElement>('.result-product-image')!.getAttribute('src')).toBe(component.missingProductImage);
    expect(rows[0].querySelector<HTMLImageElement>('.result-brand-logo')!.alt).toBe('7-ELEVEN');
    expect(rows[1].querySelector<HTMLImageElement>('.result-brand-logo')!.alt).toBe('全家');
    rows[0].querySelector('img')!.dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(rows[0].querySelector('img')!.getAttribute('src')).toBe(component.missingProductImage);
    fixture.componentRef.setInput('foodDetailsFamilyMart', [{ title: '飯糰', picture_url: 'updated-rice.jpg' }]);
    fixture.detectChanges();
    expect(rows[1].querySelector('img')!.getAttribute('src')).toBe('updated-rice.jpg');
  });

  it('switches separate modal panels and ignores delayed close events from the previous panel', () => {
    component.showMenu();
    component.openStoreDetails();
    component.onPanelClosed(component.sidebarWindow.nativeElement);
    expect(component.sidebarWindow.nativeElement.open).toBeFalse();
    expect(component.detailsWindow.nativeElement.matches(':modal')).toBeTrue();
    expect(component.detailMode).toBeTrue();
    component.showMenu();
    component.onPanelClosed(component.detailsWindow.nativeElement);
    expect(component.detailsWindow.nativeElement.open).toBeFalse();
    expect(component.sidebarWindow.nativeElement.matches(':modal')).toBeTrue();
    expect(component.sidebarOpen).toBeTrue();
    expect(component.detailMode).toBeFalse();
  });

  it('dismisses outside clicks but keeps clicks inside the menu open', () => {
    component.showMenu();
    const close = spyOn(component, 'closeSidebar').and.resolveTo();
    const panel = component.sidebarWindow.nativeElement;
    spyOn(panel, 'getBoundingClientRect').and.returnValue({ left: 0, right: 300, top: 0, bottom: 700 } as DOMRect);
    const event = (x: number) => ({ currentTarget: panel, clientX: x, clientY: 100 } as unknown as PointerEvent);
    component.onPanelPointerDown(event(100));
    component.onPanelClick(event(100));
    expect(close).not.toHaveBeenCalled();
    component.onPanelPointerDown(event(350));
    component.onPanelClick(event(350));
    expect(close).toHaveBeenCalledTimes(1);
  });

  it('dismisses left swipes for the menu and down swipes for details without hijacking scrolled content', () => {
    spyOn(window, 'matchMedia').and.returnValue({ matches: true } as MediaQueryList);
    const close = spyOn(component, 'closeSidebar').and.resolveTo();
    const panel = component.detailsWindow.nativeElement;
    const body = document.createElement('div');
    panel.appendChild(body);
    const gesture = (details: boolean, dx: number, dy: number) => {
      component.onPanelTouchStart({ target: body, currentTarget: panel, touches: [{ clientX: 150, clientY: 150, identifier: 1 }] } as unknown as TouchEvent, details);
      component.onPanelTouchEnd({ touches: [], changedTouches: [{ clientX: 150 + dx, clientY: 150 + dy, identifier: 1 }] } as unknown as TouchEvent, details);
    };
    gesture(false, -100, 10);
    gesture(true, 10, 100);
    expect(close).toHaveBeenCalledTimes(2);
    gesture(true, 10, -100);
    gesture(false, 10, 100);
    Object.defineProperty(body, 'scrollTop', { value: 50 });
    gesture(true, 10, 100);
    expect(close).toHaveBeenCalledTimes(2);
  });
});
