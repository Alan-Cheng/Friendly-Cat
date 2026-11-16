import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { FoodSearchComponent } from './food-search.component';
import { StoreDataService } from '../../services/stores-data.service';
import { SevenElevenRequestService } from '../../search-food/new-search/services/seven-eleven-request.service';

describe('food search', () => {
  let fixture: ComponentFixture<FoodSearchComponent>;
  let component: FoodSearchComponent;
  let stores: StoreDataService;
  let service: { getItemsByStoreNo: jasmine.Spy };
  beforeEach(async () => {
    service = { getItemsByStoreNo: jasmine.createSpy().and.returnValue(of(null)) };
    await TestBed.configureTestingModule({ imports: [FoodSearchComponent], providers: [StoreDataService,
      { provide: SevenElevenRequestService, useValue: service }]
    }).compileComponents();
    fixture = TestBed.createComponent(FoodSearchComponent);
    component = fixture.componentInstance;
    stores = TestBed.inject(StoreDataService);
    fixture.detectChanges();
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


  it('searches both brands from loaded stock and excludes sold-out products without refetching', () => {
    stores.setStores([
      { label: '全家', name: '台北店', info: [{ categories: [{ products: [{ name: '鮪魚飯糰', qty: 2 }, { name: '鮭魚飯糰', qty: 0 }] }] }] },
      { label: '7-11', StoreNo: '1', StoreName: '信義', CategoryStockItems: [{ ItemList: [{ ItemName: '鮭魚飯糰', RemainingQty: 3 }] }] }
    ]);
    component.foodSearchTerm = '飯糰';
    component.onSearchClick();
    expect(component.foodSearchResults.length).toBe(2);
    expect(service.getItemsByStoreNo).not.toHaveBeenCalled();
    const selected = spyOn(component.foodSelected, 'emit');
    component.openFoodResult(component.foodSearchResults[0]);
    expect(selected).toHaveBeenCalledWith(component.foodSearchResults[0]);
    stores.setStores([]);
    expect(component.foodSearchResults).toEqual([]);
  });

  it('does not submit during IME composition or leave results after clearing the query', () => {
    stores.setStores([{ label: '全家', name: '台北店', info: [] }]);
    component.foodSearchTerm = '飯糰';
    const search = spyOn(component, 'onSearchClick').and.callThrough();
    component.onCompositionStart();
    component.onSearchKeyDown(new KeyboardEvent('keydown', { key: 'Enter', isComposing: true }));
    component.onSearchKeyDown(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 229 }));
    expect(search).not.toHaveBeenCalled();
    component.onCompositionEnd();
    component.onSearchKeyDown(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(search).toHaveBeenCalledTimes(1);
    component.foodSearchTerm = '';
    component.onSearchInputChange();
    expect(component.hasSearched).toBeFalse();
    expect(component.foodSearchResults).toEqual([]);
  });
  it('searches after two characters, debounces typing, and clears immediately below the threshold', fakeAsync(() => {
    stores.setStores([{ label: '全家', name: '台北店', info: [{ categories: [{ products: [{ name: '鮪魚飯糰', qty: 2 }] }] }] }]);
    const search = spyOn(component, 'searchFoodInStores').and.callThrough();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    const type = (value: string) => { input.value = value; input.dispatchEvent(new Event('input')); };
    type('飯'); tick(200);
    expect(search).not.toHaveBeenCalled();
    type('飯糰'); tick(100); type('鮪魚飯糰'); tick(179);
    expect(search).not.toHaveBeenCalled();
    tick(1);
    expect(search).toHaveBeenCalledOnceWith('鮪魚飯糰');
    expect(component.foodSearchResults.length).toBe(1);
    type('飯');
    expect(component.foodSearchResults).toEqual([]);
    expect(component.hasSearched).toBeFalse();
    tick(200);
    expect(search).toHaveBeenCalledTimes(1);
    component.onSearchClick();
    expect(search).toHaveBeenCalledTimes(1);
    type('🍙'); tick(200);
    expect(search).toHaveBeenCalledTimes(1);
  }));

  it('waits for committed IME text and ignores Safari confirming Enter before the debounce expires', fakeAsync(() => {
    stores.setStores([{ label: '全家', name: '台北店', info: [] }]);
    const search = spyOn(component, 'searchFoodInStores');
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.dispatchEvent(new CompositionEvent('compositionstart'));
    input.value = '飯糰';
    input.dispatchEvent(new InputEvent('input', { isComposing: true }));
    tick(200);
    expect(search).not.toHaveBeenCalled();
    input.dispatchEvent(new CompositionEvent('compositionend'));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 229 }));
    input.dispatchEvent(new Event('input'));
    tick(179);
    expect(search).not.toHaveBeenCalled();
    tick(1);
    expect(search).toHaveBeenCalledOnceWith('飯糰');
  }));

  it('cancels an obsolete request while editing and removes scheduled work on destroy', fakeAsync(() => {
    const response = new Subject<any>();
    service.getItemsByStoreNo.and.returnValue(response);
    stores.setStores([{ label: '7-11', StoreNo: '1', StoreName: '信義' }]);
    component.foodSearchTerm = '飯糰';
    component.onSearchClick();
    expect(response.observed).toBeTrue();
    component.foodSearchTerm = '飯'; component.onSearchInputChange();
    expect(response.observed).toBeFalse();
    response.next({ isSuccess: true, element: { StoreStockItem: { CategoryStockItems: [{ ItemList: [{ ItemName: '飯糰', RemainingQty: 2 }] }] } } });
    expect(component.foodSearchResults).toEqual([]);
    const search = spyOn(component, 'searchFoodInStores');
    component.foodSearchTerm = '飯糰'; component.onSearchInputChange();
    fixture.destroy();
    tick(200);
    expect(search).not.toHaveBeenCalled();
  }));

});
