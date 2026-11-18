import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { EmptyInfoPipe } from 'src/app/pipes/empty-info.pipe';
import { RoundPipe } from 'src/app/pipes/round.pipe';
import { DisplayComponent } from './display.component';
import { LegacyDisplayComponent } from './legacy-display.component';
import { FamilyPrice, FamilyPriceService } from '../services/family-price.service';
import { SevenElevenRequestService } from '../services/seven-eleven-request.service';

for (const componentType of [DisplayComponent, LegacyDisplayComponent]) {
  describe(`${componentType.name} FamilyMart prices`, () => {
    let prices: Subject<Record<string, FamilyPrice>>;
    let pricesFor: jasmine.Spy;
    beforeEach(async () => {
      prices = new Subject();
      pricesFor = jasmine.createSpy('pricesFor').and.returnValue(prices);
      await TestBed.configureTestingModule({
        imports: [CommonModule],
        declarations: [componentType, EmptyInfoPipe, RoundPipe],
        schemas: [NO_ERRORS_SCHEMA],
        providers: [
          { provide: SevenElevenRequestService, useValue: {} },
          { provide: FamilyPriceService, useValue: { pricesFor } },
          { provide: MatDialog, useValue: {} },
        ],
      }).compileComponents();
    });

    function create() {
      const fixture = TestBed.createComponent<DisplayComponent | LegacyDisplayComponent>(componentType);
      fixture.componentRef.setInput('foodDetails', []);
      fixture.componentRef.setInput('store', { name: '全家測試店' });
      fixture.componentRef.setInput('category', { name: '飯糰', categories: [{ name: '飯糰', products: [
        { name: '鮪魚飯糰', qty: 2 }, { name: '未知飯糰', qty: 1 }, { name: '售完飯糰', qty: 0 },
      ] }] });
      fixture.detectChanges();
      return fixture;
    }

    it('loads a category once and renders matched prices even without product metadata', () => {
      const fixture = create();
      expect(pricesFor).toHaveBeenCalledOnceWith(['鮪魚飯糰', '未知飯糰']);
      expect(fixture.nativeElement.querySelectorAll('del').length).toBe(0);
      expect(fixture.nativeElement.textContent).not.toContain('鮪魚飯糰');
      expect(fixture.nativeElement.textContent).not.toContain('未知飯糰');
      expect(fixture.nativeElement.querySelector('[role="progressbar"]')).not.toBeNull();
      prices.next({ 鮪魚飯糰: { original: 40, discounted: 28 } });
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelectorAll('del').length).toBe(1);
      expect(fixture.nativeElement.querySelector('del').textContent).toContain('40');
      expect(fixture.nativeElement.textContent).toContain('28 元');
      expect(fixture.nativeElement.textContent).toContain('未知飯糰');
      expect(fixture.nativeElement.textContent).toContain('7 折');
      fixture.detectChanges();
      expect(pricesFor).toHaveBeenCalledTimes(1);
      fixture.destroy();
      expect(prices.observed).toBeFalse();
    });

    it('shows products without prices when lookup fails or returns no matches', () => {
      const fixture = create();
      prices.error(new Error('lookup failed'));
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('鮪魚飯糰');
      expect(fixture.nativeElement.querySelector('del')).toBeNull();
      expect(fixture.nativeElement.querySelector('[role="progressbar"]')).toBeNull();
      fixture.destroy();
    });

    it('renders the 711 discount label from the same time-based price calculation', () => {
      jasmine.clock().install();
      try {
        const fixture = TestBed.createComponent<DisplayComponent | LegacyDisplayComponent>(componentType);
        const component = fixture.componentInstance;
        component.store = { StoreName: '7-ELEVEN 測試店' };
        component.category = { Name: '飯糰' };
        component.subCategories = [{ Name: '飯糰' }];
        component.itemsBySubCategory = { 飯糰: [{ ItemName: '鮪魚飯糰', RemainingQty: 1 } as any] };
        component.foodDetails = [{ name: '鮪魚飯糰', price: '100', image: 'assets/seven-eleven.svg', content: '', kcal: '', new: 'False', special_sale: 'False' }];
        for (const [hour, price, label] of [[10, 65, '6.5 折'], [18, 80, '8 折'], [19, 80, '8 折'], [20, 65, '6.5 折']] as const) {
          jasmine.clock().mockDate(new Date(2026, 10, 18, hour));
          fixture.detectChanges();
          expect(fixture.nativeElement.textContent).toContain(`${price} 元`);
          expect(fixture.nativeElement.textContent).toContain(label);
        }
        expect(component.foodDetails[0].discountedPrice).toBeUndefined();
        expect(pricesFor).not.toHaveBeenCalled();
        fixture.destroy();
      } finally { jasmine.clock().uninstall(); }
    });

    it('updates metadata from a new JSON array without repeating price lookup', () => {
      const fixture = create();
      prices.next({});
      fixture.detectChanges();
      fixture.componentRef.setInput('foodDetails', [{ title: '鮪魚飯糰', picture_url: 'assets/family-mart.svg', Description: '更新的商品說明' }]);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('更新的商品說明');
      fixture.componentRef.setInput('foodDetails', [{ title: '鮪魚飯糰', picture_url: 'assets/family-mart.svg', Description: '再次更新的說明' }]);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('再次更新的說明');
      expect(fixture.nativeElement.textContent).not.toContain('更新的商品說明');
      expect(pricesFor).toHaveBeenCalledTimes(1);
      fixture.destroy();
    });

    it('clears old prices and ignores late results when changing category', () => {
      const fixture = create();
      prices.next({ 鮪魚飯糰: { original: 40, discounted: 28 } });
      fixture.detectChanges();
      const next = new Subject<Record<string, FamilyPrice>>();
      pricesFor.and.returnValue(next);
      fixture.componentRef.setInput('category', { name: '麵包', categories: [{ name: '麵包', products: [{ name: '奶油麵包', qty: 1 }] }] });
      fixture.detectChanges();
      prices.next({ 鮪魚飯糰: { original: 99, discounted: 69 } });
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('del')).toBeNull();
      expect(fixture.nativeElement.textContent).not.toContain('鮪魚飯糰');
      expect(prices.observed).toBeFalse();
      next.next({ 奶油麵包: { original: 30, discounted: 21 } });
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('21 元');
      fixture.destroy();
    });
  });
}
