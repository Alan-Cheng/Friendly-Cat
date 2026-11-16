import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { StoreMapComponent } from './store-map.component';
import { StoreDataService } from '../../services/stores-data.service';
import { SevenElevenRequestService } from '../new-search/services/seven-eleven-request.service';

describe('store directory tabs', () => {
  let fixture: ComponentFixture<StoreMapComponent>;
  beforeEach(async () => {
    spyOn(StoreMapComponent.prototype, 'ngAfterViewInit').and.resolveTo();
    await TestBed.configureTestingModule({
      imports: [StoreMapComponent],
      providers: [StoreDataService, { provide: HttpClient, useValue: {} }, { provide: SevenElevenRequestService, useValue: {} }]
    }).compileComponents();
    fixture = TestBed.createComponent(StoreMapComponent);
    fixture.detectChanges();
  });
  afterEach(() => fixture.componentInstance.directoryWindow.nativeElement.close());

  it('switches named panels and retains the food query and results across switches and reopening', () => {
    const root = fixture.nativeElement as HTMLElement;
    const tabs = root.querySelectorAll<HTMLButtonElement>('[role=tab]');
    const panels = root.querySelectorAll<HTMLElement>('[role=tabpanel]');
    const component = fixture.componentInstance;
    TestBed.inject(StoreDataService).setStores([
      { label: '全家', name: '台北店', info: [{ categories: [{ products: [{ name: '鮪魚飯糰', qty: 2 }] }] }] }
    ]);
    component.openDirectory();
    fixture.detectChanges();
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    expect(panels[1].getAttribute('hidden')).toBe('until-found');
    tabs[1].click(); fixture.detectChanges();
    const input = root.querySelector<HTMLInputElement>('#food-search-input')!;
    input.value = '飯糰'; input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();
    expect(root.querySelectorAll('.result-item').length).toBe(1);
    expect(tabs[1].getAttribute('aria-selected')).toBe('true');
    expect(panels[0].getAttribute('hidden')).toBe('until-found');
    tabs[0].click(); fixture.detectChanges();
    tabs[1].click(); fixture.detectChanges();
    expect(input.value).toBe('飯糰');
    component.directoryWindow.nativeElement.close();
    component.openDirectory(); fixture.detectChanges();
    expect(component.directoryTab).toBe('food');
    expect(input.value).toBe('飯糰');
    expect(root.querySelectorAll('.result-item').length).toBe(1);
    expect(tabs[1].hasAttribute('focusgroupstart')).toBeTrue();
    expect(tabs[0].hasAttribute('focusgroupstart')).toBeFalse();
  });

  it('syncs tab selection when find-in-page reveals a hidden panel', () => {
    const root = fixture.nativeElement as HTMLElement;
    root.querySelector('[aria-labelledby=directory-food-tab]')!.dispatchEvent(new Event('beforematch'));
    fixture.detectChanges();
    expect(root.querySelector('#directory-food-tab')!.getAttribute('aria-selected')).toBe('true');
    expect(root.querySelector('[aria-labelledby=directory-food-tab]')!.hasAttribute('hidden')).toBeFalse();
  });
});
