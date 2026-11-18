import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { LegacySearchModule } from '../legacy-search.module';
import { LegacySearchComponent } from './legacy-search.component';
import { ProxyTokenService } from '../../services/proxy-token.service';
import { LoadingService } from '../../services/loading.service';
import { GeolocationService } from '../../services/geolocation.service';
import { AuthService } from '../../services/auth.service';
import { SevenElevenRequestService } from './services/seven-eleven-request.service';
import { FamilyMartRequestService } from './services/family-mart-request.service';

describe('classic cat bubble messages', () => {
  beforeEach(async () => {
    spyOn(LegacySearchComponent.prototype, 'ngOnInit').and.stub();
    await TestBed.configureTestingModule({
      imports: [LegacySearchModule, RouterTestingModule, NoopAnimationsModule],
      providers: [
        ...[HttpClient, MatDialog, AngularFirestore, ProxyTokenService, GeolocationService,
          AuthService, SevenElevenRequestService, FamilyMartRequestService].map(provide => ({ provide, useValue: {} })),
        LoadingService,
      ],
    }).compileComponents();
  });

  it('shows store loading and errors inside the bubble without a duplicate message below', () => {
    const fixture = TestBed.createComponent(LegacySearchComponent);
    for (const text of ['正在查詢店號 259002 的即期商品…', '找不到店號 999999 的門市', '福龍門市目前沒有可顯示的即期商品。']) {
      fixture.componentInstance.linkedStoreStatus = text;
      fixture.detectChanges();
      const bubble = fixture.nativeElement.querySelector('.search-panel h5');
      expect(bubble.textContent).toContain(text);
      expect(bubble.querySelector('[role="status"]')).not.toBeNull();
      expect(fixture.nativeElement.textContent.split(text).length - 1).toBe(1);
    }
  });

  it('keeps browser verification visible and restores the usual greeting when no link message remains', () => {
    const fixture = TestBed.createComponent(LegacySearchComponent);
    const loading = TestBed.inject(LoadingService);
    fixture.componentInstance.linkedStoreStatus = '正在查詢門市…';
    loading.showVerification('驗證您的瀏覽器中');
    fixture.detectChanges();
    const bubble = fixture.nativeElement.querySelector('.search-panel h5');
    expect(bubble.textContent).toContain('驗證您的瀏覽器中');
    expect(bubble.textContent).not.toContain('正在查詢門市…');
    loading.hideVerification();
    fixture.detectChanges();
    expect(bubble.textContent).toContain('正在查詢門市…');
    fixture.componentInstance.linkedStoreStatus = '';
    fixture.detectChanges();
    expect(bubble.textContent).toContain('看看附近有啥好吃的吧！');
  });
});
