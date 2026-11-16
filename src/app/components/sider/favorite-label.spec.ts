import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';
import { GeolocationService } from '../../services/geolocation.service';
import { StoreDataService } from '../../services/stores-data.service';
import { SevenElevenRequestService } from '../../search-food/new-search/services/seven-eleven-request.service';
import { FamilyMartRequestService } from '../../search-food/new-search/services/family-mart-request.service';
import { SiderComponent } from './sider.component';

describe('favorite store labels', () => {
  it('renders brand logos and plain store names while preserving saved favorite data', async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule], declarations: [SiderComponent], schemas: [NO_ERRORS_SCHEMA],
      providers: [StoreDataService, ...[AuthService, MatDialog, GeolocationService, SevenElevenRequestService, FamilyMartRequestService].map(provide => ({ provide, useValue: {} }))]
    }).compileComponents();
    const fixture = TestBed.createComponent(SiderComponent);
    const component = fixture.componentInstance;
    component.user = { displayName: '測試使用者' };
    component.favoriteStores = [
      { storeName: '全家台北店', label: '全家' },
      { storeName: '7-11信義門市', label: '7-11' },
      { storeName: '7-ELEVEN松仁門市' },
      { storeName: '台北門市', store711Name: '台北' }
    ];
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('.store-item') as NodeListOf<HTMLButtonElement>;
    expect(Array.from(rows, row => row.textContent!.trim())).toEqual(['台北店', '信義門市', '松仁門市', '台北門市']);
    expect(rows[0].querySelector('img')!.src).toContain('family-mart.svg');
    expect(rows[1].querySelector('img')!.src).toContain('seven-eleven.svg');
    expect(rows[2].querySelector('img')!.alt).toBe('7-ELEVEN');
    expect(rows[3].querySelector('img')!.alt).toBe('7-ELEVEN');
    expect(component.favoriteStores[0].storeName).toBe('全家台北店');
  });
});
