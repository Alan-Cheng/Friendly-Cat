import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root' // 全局單例服務
})
export class StoreDataService {
  private inventoryStateSubject = new BehaviorSubject<'idle' | 'loading' | 'ready' | 'error'>('idle');
  readonly inventoryState$ = this.inventoryStateSubject.asObservable();
  setInventoryState(state: 'idle' | 'loading' | 'ready' | 'error'): void { this.inventoryStateSubject.next(state); }
  private storesSubject = new BehaviorSubject<any[]>([]); // 用 BehaviorSubject 儲存商店列表
  public stores$: Observable<any[]> = this.storesSubject.asObservable(); // 提供訂閱的 Observable

  private isLocationSearchSubject = new BehaviorSubject<boolean>(true); // 用於標記是否為位置搜尋
  public isLocationSearch$: Observable<boolean> = this.isLocationSearchSubject.asObservable(); // 提供訂閱的 Observable

  // 更新商店列表
  setStores(stores: any[]) {
    this.storesSubject.next(stores);
    this.setInventoryState('ready');
  }

  // 獲取當前商店列表（同步方式）
  getStores(): any[] {
    return this.storesSubject.getValue();
  }

  // 更新位置搜尋狀態
  setIsUserLocationSearch(isLocationSearch: boolean) {
    this.isLocationSearchSubject.next(isLocationSearch);
  }

  // 獲取當前位置搜尋狀態（同步方式）
  getIsUserLocationSearch(): boolean {
    return this.isLocationSearchSubject.getValue();
  }
}