import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MatDialog } from '@angular/material/dialog';
import { EmptyInfoPipe } from 'src/app/pipes/empty-info.pipe';
import { RoundPipe } from 'src/app/pipes/round.pipe';
import { DisplayComponent } from './display.component';
import { LegacyDisplayComponent } from './legacy-display.component';
import { SevenElevenRequestService } from '../services/seven-eleven-request.service';

for (const componentType of [DisplayComponent, LegacyDisplayComponent]) {
  describe(`${componentType.name} FamilyMart JSON prices`, () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [CommonModule, HttpClientTestingModule],
        declarations: [componentType, EmptyInfoPipe, RoundPipe],
        schemas: [NO_ERRORS_SCHEMA],
        providers: [
          { provide: SevenElevenRequestService, useValue: {} },
          { provide: MatDialog, useValue: {} },
        ],
      }).compileComponents();
    });
    afterEach(() => {
      TestBed.inject(HttpTestingController).expectNone(() => true, 'JSON prices must never call the proxy');
      TestBed.inject(HttpTestingController).verify();
    });

    function create(details: any[] = []) {
      const fixture = TestBed.createComponent<DisplayComponent | LegacyDisplayComponent>(componentType);
      fixture.componentRef.setInput('foodDetails', details);
      fixture.componentRef.setInput('store', { name: '全家測試店' });
      fixture.componentRef.setInput('category', { name: '飯糰', categories: [{ name: '飯糰', products: [
        { code: '0632002', name: '二配鮪魚飯糰', qty: 2 }, { name: '未知飯糰', qty: 1 }, { name: '售完飯糰', qty: 0 },
      ] }] });
      fixture.detectChanges();
      return fixture;
    }

    it('renders JSON prices via the selling ID without calling the proxy', () => {
      const fixture = create([{ id: '0612008', title: '鮪魚飯糰', price_product_id: '0632002', price: 30 }]);
      expect(fixture.nativeElement.querySelector('del, .line-through').textContent).toContain('30');
      expect(fixture.nativeElement.textContent).toContain('21 元');
      expect(fixture.nativeElement.textContent).toContain('7 折');
      expect(fixture.nativeElement.textContent).toContain('未知飯糰');
      if (componentType === DisplayComponent) expect(fixture.nativeElement.textContent).not.toContain('售完飯糰');
      expect(fixture.nativeElement.querySelector('[role="progressbar"]')).toBeNull();
      fixture.destroy();
    });

    it('shows products without prices and refreshes prices when JSON arrives or changes', () => {
      const fixture = create();
      expect(fixture.nativeElement.textContent).toContain('二配鮪魚飯糰');
      expect(fixture.nativeElement.querySelector('del, .line-through')).toBeNull();
      fixture.componentRef.setInput('foodDetails', [{ title: '鮪魚飯糰', picture_url: 'assets/family-mart.svg', price: 40 }]);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('28 元');
      fixture.componentRef.setInput('foodDetails', [{ title: '鮪魚飯糰', price: null }]);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('del, .line-through')).toBeNull();
      fixture.destroy();
    });

    it('clears prices when switching category', () => {
      const fixture = create([{ title: '鮪魚飯糰', price: 40 }, { title: '奶油麵包', price: 30 }]);
      fixture.componentRef.setInput('category', { name: '麵包', categories: [{ name: '麵包', products: [{ name: '奶油麵包', qty: 1 }] }] });
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).not.toContain('二配鮪魚飯糰');
      expect(fixture.nativeElement.textContent).toContain('21 元');
      fixture.destroy();
    });

    it('keeps the 711 time-based discount calculation', () => {
      jasmine.clock().install();
      try {
        const fixture = TestBed.createComponent<DisplayComponent | LegacyDisplayComponent>(componentType);
        const component = fixture.componentInstance;
        component.store = { StoreName: '7-ELEVEN 測試店' };
        component.category = { Name: '飯糰' };
        component.subCategories = [{ Name: '飯糰' }];
        component.itemsBySubCategory = { 飯糰: [{ ItemName: '鮪魚飯糰', RemainingQty: 1 }] };
        component.foodDetails = [{ name: '鮪魚飯糰', price: '100', image: 'assets/seven-eleven.svg', content: '', kcal: '', new: 'False', special_sale: 'False' }];
        for (const [hour, price, label] of [[10, 65, '6.5 折'], [18, 80, '8 折'], [19, 80, '8 折'], [20, 65, '6.5 折']] as const) {
          jasmine.clock().mockDate(new Date(2026, 10, 18, hour));
          fixture.detectChanges();
          expect(fixture.nativeElement.textContent).toContain(`${price} 元`);
          expect(fixture.nativeElement.textContent).toContain(label);
        }
        expect(component.foodDetails[0].discountedPrice).toBeUndefined();
        fixture.destroy();
      } finally { jasmine.clock().uninstall(); }
    });
  });
}
