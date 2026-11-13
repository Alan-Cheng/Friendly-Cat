import type { Driver } from 'driver.js';
import { matchFamilyStock, familyStockQuantity, sevenStockQuantity } from '../store-map/store-inventory';
import { BrowserVerificationState, ProxyTokenService } from '../../services/proxy-token.service';
import { StoreMapComponent } from '../store-map/store-map.component';
import { Subscription, timeout } from 'rxjs';
import { MapStore } from '../store-map/store-map.component';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormControl } from '@angular/forms';

import { GeolocationService } from 'src/app/services/geolocation.service';
import { SevenElevenRequestService } from './services/seven-eleven-request.service';
import { FamilyMartRequestService } from './services/family-mart-request.service';
import { LoadingService } from '../../services/loading.service'
import { AuthService } from 'src/app/services/auth.service';

import { MessageDialogComponent } from 'src/app/components/message-dialog/message-dialog.component';
import { FoodCategory, LocationData, StoreStockItem, Store, Location, FoodDetail711 } from '../model/seven-eleven.model'
import { fStore, StoreModel, FoodDetailFamilyMart } from '../model/family-mart.model';
import { StoreDataService } from 'src/app/services/stores-data.service';

import { environment } from 'src/environments/environment';

import { switchMap, from, of, catchError, Observable, tap, forkJoin, Subject, debounceTime, distinctUntilChanged } from 'rxjs';

import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialog } from '@angular/material/dialog';

import { getDistance } from 'geolib';

import { AngularFirestore } from '@angular/fire/compat/firestore';
import { pinyin } from 'pinyin-pro';

@Component({
  selector: 'app-new-search',
  templateUrl: './new-search.component.html',
  styleUrls: ['./new-search.component.scss'],
})
export class NewSearchComponent implements OnInit, OnDestroy {
  private tour?: Driver;
  private tourTimer?: ReturnType<typeof setTimeout>;
  private componentDestroyed = false;

  async startTour(force = false): Promise<void> {
    try { if (!force && localStorage.getItem('friendly-cat-tour-v1')) return; } catch {}
    const { driver } = await import('driver.js');
    if (this.componentDestroyed) return;
    this.tour?.destroy(); this.closeSearchWindow(); this.productWindow.nativeElement.close();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.tour = driver({
      animate: !reducedMotion, showProgress: true, progressText: '{{current}} / {{total}}',
      nextBtnText: '下一步', prevBtnText: '上一步', doneBtnText: '開始探索',
      overlayColor: '#263b31', overlayOpacity: .45, stagePadding: 10, stageRadius: 12,
      popoverClass: 'cat-tour-popover', disableActiveInteraction: true,
      onPopoverRender: popover => popover.closeButton.setAttribute('aria-label', '略過導引'),
      onDestroyed: () => { try { localStorage.setItem('friendly-cat-tour-v1', 'seen'); } catch {} },
      steps: [
        { popover: { title: '歡迎來到友善黑貓 3D 版', description: '拖曳探索街道、滾動滑鼠縮放。授權定位後，黑貓會站在你目前的位置。' } },
        { element: () => document.querySelector('.cat-shop-marker') || document.querySelector('.map-canvas')!, popover: { title: '點一家小店，看看商品', description: '點擊小店，直接開啟該門市的商品視窗。全家標記上的件數是即期庫存，— 表示尚未取得。' } },
        { element: '.store-directory', popover: { title: '從清單找到商店', description: '展開街區店家清單，滑過店名，對應的小店會亮起並放大。用鍵盤聚焦也有相同效果。', side: 'top' } },
        { element: '.search-world', popover: { title: '找店家，從搜尋開始', description: '輸入店名或地址，選取結果即可移動到該門市並查看商品。', side: 'bottom' } },
        { element: 'app-sider .toolbar', popover: { title: '', description: '在這裡登入、查看收藏與搜尋食物；想再看一次導引，也能從這裡重新開啟。', side: 'right' } }
      ]
    });
    this.tour.drive();
  }

  @ViewChild('mapSearchInput', { static: true }) mapSearchInput!: ElementRef<HTMLInputElement>;
  searchExpanded = false;
  searchSubmitted = false;
  @HostListener('document:pointerdown', ['$event'])
  dismissMapSearch(event: PointerEvent): void {
    if (!(event.target instanceof Element) || event.target.closest('.map-search-panel, .locate')) return;
    this.closeSearchWindow();
  }
  @ViewChild('productWindow', { static: true }) productWindow!: ElementRef<HTMLDialogElement>;
  @ViewChild(StoreMapComponent) worldMap?: StoreMapComponent;
  hasEnteredWorld = false;
  worldReady = false;
  verificationState: BrowserVerificationState = 'checking';
  verificationRetrying = false;
  private verificationSubscription?: Subscription;

  get bootProgress(): number {
    return 15 + (this.worldReady ? 40 : 0) + (this.verificationState === 'verified' ? 45 : 0);
  }

  onWorldReady(): void { this.worldReady = true; this.tryEnterWorld(); }
  private tryEnterWorld(): void {
    if (this.hasEnteredWorld || !this.worldReady || this.verificationState !== 'verified') return;
    this.hasEnteredWorld = true;
    document.body.classList.add('cat-world-entered');
    this.tourTimer = setTimeout(() => this.startTour(), 1100);
    setTimeout(() => { this.worldMap?.reportViewport(); this.worldMap?.locate(); }, 300);
  }
  retryVerification(): void {
    if (this.verificationRetrying) return;
    this.verificationRetrying = true;
    void this.proxyTokenService.ensure().catch(() => {}).finally(() => this.verificationRetrying = false);
  }
  openSearchWindow(): void { this.searchExpanded = true; this.mapSearchInput.nativeElement.focus(); }
  closeSearchWindow(): void { this.searchExpanded = false; }
  refreshProducts(): void {
    if (this.mapQueryPending) return;
    if (this.mapSelectedStore) this.onMapStoreQuery(this.mapSelectedStore);
    else this.onUseCurrentLocation();
  }

  openProductWindow(): void {
    this.closeSearchWindow();
    if (!this.productWindow.nativeElement.open) this.productWindow.nativeElement.showModal();
  }
  ngOnDestroy(): void { this.componentDestroyed = true; this.tour?.destroy(); clearTimeout(this.tourTimer); this.mapStockSubscription?.unsubscribe(); this.mapArea$.complete(); this.mapInventorySubscription?.unsubscribe(); this.verificationSubscription?.unsubscribe(); document.body.classList.remove('cat-world-entered'); }

  user: any = null;
  mapSelectedStore?: MapStore;
  familyMapStock: StoreModel[] = [];
  sevenMapStock: StoreStockItem[] = [];
  private stockRevision = 0;
  private sevenStockVersions = new Map<string, number>();
  private familyStockVersions = new Map<string, number>();

  private mergeSevenMapStock(stocks: StoreStockItem[], revision: number): void {
    const merged = new Map(this.sevenMapStock.map(stock => [String(stock.StoreNo), stock]));
    for (const stock of stocks) {
      const key = String(stock.StoreNo);
      if (revision < (this.sevenStockVersions.get(key) ?? -1)) continue;
      this.sevenStockVersions.set(key, revision); merged.set(key, stock);
    }
    this.sevenMapStock = [...merged.values()];
  }

  private mergeFamilyMapStock(stocks: StoreModel[], revision: number): void {
    const keyOf = (stock: StoreModel) => String(stock.oldPKey || stock.name);
    const merged = new Map(this.familyMapStock.map(stock => [keyOf(stock), stock]));
    for (const stock of stocks) {
      const key = keyOf(stock);
      if (revision < (this.familyStockVersions.get(key) ?? -1)) continue;
      this.familyStockVersions.set(key, revision); merged.set(key, stock);
    }
    this.familyMapStock = [...merged.values()];
  }
  private mapArea$ = new Subject<{ latitude: number; longitude: number }>();
  private mapStockSubscription?: Subscription;

  onMapAreaChanged(center: { latitude: number; longitude: number }): void {
    if (this.hasEnteredWorld) this.mapArea$.next(center);
  }
  private mapInventorySubscription?: Subscription;
  mapQueryPending = false;
  inventoryStatus = '';

  isLocationSearchMode: boolean = true; // 是否使用定位搜尋

  searchForm: FormGroup; // 表單
  searchTerm: string = '';
  searchSelectedStore: any = null;
  selectedStoreName='';

  foodDetails711: FoodDetail711[] = [];
  foodDetailsFamilyMart: FoodDetailFamilyMart[] = [];

  storeFilter: string = 'all';

  dropDown711List: Store[] = [];
  dropDownFamilyMartList: fStore[] = [];
  all711Stores: any[] = []; // 儲存所有 7-11 商店資料（包含拼音）
  unifiedDropDownList: any[] = [];

  // 拼音轉換快取：避免重複轉換相同的文字
  private pinyinCache = new Map<string, string>();


  sevenElevenIconUrl = environment.sevenElevenUrl.icon;
  familyMartIconUrl = environment.familyMartUrl.icon;

  zipcodes: any[] = []; // 原始 API 資料
  cities: string[] = []; // 縣市清單
  filteredDistricts: any[] = []; // 篩選後的行政區列表
  zipcodeList: string[] = [];

  selectedCity: string | null = null; // 選擇的縣市
  selectedDistrict: string | null = null; // 選擇的行政區
  selectedZipcode: string | null = null; // 對應的郵遞區號

  latitude!: number;
  longitude!: number;

  foodCategories: FoodCategory[] = [];

  nearby711Stores: StoreStockItem[] = []; // 儲存用現在位置找到的711
  nearbyFamilyMartStores: StoreModel[] = []; // 儲存用現在位置找到的全家
  totalStoresShowList: any[] = []; //為了方便顯示所以統一
  filteredStoresList: any[] = [];  // 用來儲存篩選後的商店列表

  selectedStore?: any;
  selectedCategory?: any;

  favoriteStores: any[] = [];

  searchInput$ = new Subject<string>();

  constructor(
    private http: HttpClient,
    public proxyTokenService: ProxyTokenService,
    private geolocationService: GeolocationService,
    private sevenElevenService: SevenElevenRequestService,
    private familyMartService: FamilyMartRequestService,
    private authService: AuthService,
    public loadingService: LoadingService,
    public dialog: MatDialog,
    private firestore: AngularFirestore,
    private storeDataService: StoreDataService
  ) {
    this.searchForm = new FormGroup({
      selectedStoreName: new FormControl(''), // 控制選中的商店
    });
  }

  ngOnInit(): void {
    this.mapStockSubscription = this.mapArea$.pipe(
      debounceTime(450),
      distinctUntilChanged((a, b) => Math.abs(a.latitude - b.latitude) < .0008 && Math.abs(a.longitude - b.longitude) < .0008),
      switchMap(center => {
        this.storeDataService.setInventoryState('loading');
        const revision = ++this.stockRevision;
        const location = { Latitude: center.latitude, Longitude: center.longitude };
        return forkJoin({
          family: this.familyMartService.getNearByStoreList(location).pipe(timeout(20000), catchError(() => of(null))),
          seven: this.sevenElevenService.ensureWorkerReady().pipe(
            switchMap(() => this.sevenElevenService.getNearByStoreList({ CurrentLocation: location, SearchLocation: location })),
            timeout(20000), catchError(() => of(null))
          )
        }).pipe(tap(response => {
          if (response.family?.code === 1 && Array.isArray(response.family.data)) this.mergeFamilyMapStock(response.family.data, revision);
          const stocks = response.seven?.element?.StoreStockItemList;
          if (Array.isArray(stocks)) this.mergeSevenMapStock(stocks, revision);
          // The map already fetched nearby inventory after location; share that snapshot
          // with food search rather than requiring a separate manual store lookup.
          if (Array.isArray(stocks) || (response.family?.code === 1 && Array.isArray(response.family.data))) {
            const searchable = [
              ...(Array.isArray(stocks) ? stocks.filter((stock: StoreStockItem) => (sevenStockQuantity(stock) ?? 0) > 0).map((stock: StoreStockItem) => ({ ...stock, label: '7-11', storeName: `7-11${stock.StoreName}門市`, distance: stock.Distance })) : []),
              ...(response.family?.code === 1 && Array.isArray(response.family.data) ? response.family.data.filter((stock: StoreModel) => familyStockQuantity(stock) > 0).map((stock: StoreModel) => ({ ...stock, label: '全家', storeName: stock.name })) : [])
            ];
            this.storeDataService.setStores(searchable);
            this.storeDataService.setIsUserLocationSearch(true);
          } else {
            this.storeDataService.setStores([]);
            this.storeDataService.setInventoryState('error');
          }
        }));
      })
    ).subscribe();
    this.verificationSubscription = this.proxyTokenService.verificationState$.subscribe(state => {
      this.verificationState = state;
      this.tryEnterWorld();
    });
    // 移除自動搜尋，改為手動觸發（Enter 或按鈕）
    // this.searchInput$ 不再自動訂閱
    this.init();
  }

  onMapLocationChanged(position: { latitude: number; longitude: number }): void {
    this.latitude = position.latitude;
    this.longitude = position.longitude;
  }

  onMapStoreQuery(store: MapStore): void {
    this.mapInventorySubscription?.unsubscribe();
    const revision = ++this.stockRevision;
    this.mapSelectedStore = store;
    this.isLocationSearchMode = false;
    this.totalStoresShowList = [];
    this.mapQueryPending = false;
    this.openProductWindow();
    if (this.loadingService.isVerifying) {
      this.inventoryStatus = '請先完成瀏覽器驗證，再重新查詢這間店的商品。';
      return;
    }
    const code = store.storeCode || this.worldMap?.stores.find(s => s.brand === store.brand && s.latitude === store.latitude && s.longitude === store.longitude)?.storeCode;
    this.mapQueryPending = true;
    this.inventoryStatus = '正在查詢 ' + store.name + ' 的即期商品…';
    const location = { Latitude: store.latitude, Longitude: store.longitude };
    const request$ = store.brand === '7-11'
      ? this.sevenElevenService.ensureWorkerReady().pipe(
          switchMap(() => {
            if (!code) throw new Error('Missing store code');
            return forkJoin({
              detail: this.sevenElevenService.getItemsByStoreNo(code, location),
              categories: this.sevenElevenService.getFoodCategory().pipe(catchError(() => of(null)))
            }).pipe(tap(result => { if (result.categories?.element) this.foodCategories = result.categories.element; }), switchMap(result => of(result.detail)));
          })
        )
      : this.familyMartService.getNearByStoreList(location);
    this.mapInventorySubscription = request$.pipe(timeout(25000)).subscribe({
      next: response => {
        if (store.brand === '7-11') {
          const stock = response?.element?.StoreStockItem;
          if (!response?.isSuccess || !stock || (stock.StoreNo && String(stock.StoreNo) !== code)) {
            this.finishMapInventoryError(); return;
          }
          const remaining = sevenStockQuantity(stock);
          const detailStock = { ...stock, StoreNo: String(stock.StoreNo || code) };
          this.mergeSevenMapStock([detailStock], revision);
          if (remaining === undefined) { this.finishMapInventoryError(); return; }
          this.totalStoresShowList = remaining > 0 ? [{ ...detailStock, StoreName: stock.StoreName || store.name.replace(/^7-ELEVEN\s*/, '').replace(/門市$/, ''), RemainingQty: remaining, stockItemsLoaded: true, CategoryStockItems: stock.CategoryStockItems || [], storeName: store.name, label: '7-11', distance: 0, remainingQty: remaining }] : [];
        } else {
          if (response?.code !== 1 || !Array.isArray(response.data)) { this.finishMapInventoryError(); return; }
          this.mergeFamilyMapStock(response.data, revision);
          const stock = matchFamilyStock({ ...store, storeCode: code }, response.data);
          this.totalStoresShowList = stock && familyStockQuantity(stock) > 0 ? [{ ...stock, name: stock.name || store.name, storeName: stock.name || store.name, label: '全家', distance: 0 }] : [];
        }
        this.mapQueryPending = false;
        const others = this.storeDataService.getStores().filter(s => s.label !== store.brand || (
          store.brand === '7-11' ? String(s.StoreNo) !== String(code) : matchFamilyStock({ ...store, storeCode: code }, [s]) !== s
        ));
        this.storeDataService.setStores([...others, ...this.totalStoresShowList]);
        this.inventoryStatus = this.totalStoresShowList.length ? '已更新此門市商品，實際庫存以店內為準。' : '這間店目前沒有可顯示的即期商品。';
      },
      error: () => this.finishMapInventoryError()
    });
  }

  private finishMapInventoryError(): void {
    this.mapQueryPending = false;
    this.inventoryStatus = '這間店的商品暫時無法載入，請稍後重試。';
  }

  getCityName(): Observable<any[]> {
    const apiUrl = 'https://demeter.5fpro.com/tw/zipcodes.json'; // API URL
    return this.http.get<any[]>(apiUrl).pipe(
      tap((data) => {
        this.zipcodes = data;
        this.cities = [...new Set(data.map((item) => item.city_name))];
        this.zipcodeList = [...new Set(data.map((item) => item.zipcode))];
      })
    );
  }

  // 當縣市選擇改變時
  onCityChange(city: string): void {
    // 根據選擇的縣市篩選行政區
    this.filteredDistricts = this.zipcodes.filter((item) => item.city_name === city);
    this.selectedDistrict = null; // 清空選中的行政區
    this.selectedZipcode = null; // 清空郵遞區號
  }

  // 當行政區選擇改變時
  onDistrictChange(zipcode: string): void {
    // 更新選擇的郵遞區號
    this.selectedZipcode = zipcode;
  }

  handleError(error: GeolocationPositionError): string {
    switch (error.code) {
      case 1:
        return '使用者拒絕位置存取';
      case 2:
        return '無法取得位置資訊';
      case 3:
        return '位置請求逾時';
      default:
        return '未知錯誤';
    }
  }

  init() {
    // 訂閱 getUser 方法來獲取用戶資料
    this.authService.getUser().subscribe(user => {
      if (user && user.emailVerified) {
        this.user = user;  // 設定用戶資料
        this.loadFavoriteStores();
      }
    });

    // // 使用 from 將 Promise 轉換為 Observable
    // this.getCityName();

    this.loadingService.show("載入商店資訊中，請稍後喵");  // 显示加载动画

    // 取得711跟全家的商品詳細資訊
    this.sevenElevenService.getFoodDetails().subscribe((data) => {
      this.foodDetails711 = data;
    });

    this.familyMartService.getFoodDetails().subscribe((data) => {
      this.foodDetailsFamilyMart = data;
    });

    //取得所有全家商店名稱資訊
    this.getFamilyMartAllStore();
    //取得所有 7-11 商店名稱資訊
    this.getSevenElevenAllStore();

    of(true).pipe(
      switchMap(() => {
        return this.sevenElevenService.ensureWorkerReady();
      }),
      switchMap((token: any) => {
        if (token && token.element) {
          sessionStorage.setItem('711Token', token.element);
          // 如果 token 儲存成功，發送 getFoodCategory 請求
          return this.sevenElevenService.getFoodCategory();
        } else {
          // 如果 token 沒有成功返回，返回空陣列
          return of([]);
        }
      }),
      catchError((error) => {
        // 錯誤處理邏輯
        console.error('Error:', error);
        return of([]); // 在出錯時返回空陣列，防止應用崩潰
      })
    ).subscribe(
      (res) => {
        if (res && res.element) {
          this.foodCategories = res.element;
          this.loadingService.hide();
        } else {
          console.error('Failed to fetch food categories');
          this.loadingService.hide();
        }
      }
    );
  }

  getFamilyMartAllStore() {
    this.familyMartService.getStores().subscribe((data) => {
      if(data.length > 0) {
        this.dropDownFamilyMartList = data;
      }
    })
  }

  getSevenElevenAllStore() {
    this.sevenElevenService.getStores().subscribe((data) => {
      if(data && data.length > 0) {
        this.all711Stores = data;
      }
    })
  }

  getFoodSubCategoryImage(nodeID: number): string | null {
    // 查找匹配的子分類
    for (let category of this.foodCategories) {
      const subCategory = category.Children.find(child => child.ID === nodeID);
      if (subCategory) {
        // 找到對應的子分類並返回其對應的分類圖片 URL
        return category.ImageUrl;
      }
    }
    // 如果沒有找到對應的子分類，返回 null
    return null;
  }

  getSubCategoryTotalQty(store: any, category: any): number {
    let totalQty = 0;

    // 遍歷商店中的所有商品，檢查是否屬於當前分類及子分類
    for (const stockItem of store.CategoryStockItems) {
      // 遍歷每個分類的子項目，檢查是否屬於這個 category
      for (const child of category.Children) {
        if (stockItem.NodeID === child.ID) {
          totalQty += stockItem.RemainingQty;
        }
      }
    }

    return totalQty;
  }

  // 當用戶點擊某個分類時，切換選中的分類與店鋪
  toggleSubCategoryDetails(store: any, category: any): void {
    if (store.selectedCategory === category) {
      store.selectedCategory = undefined;
    } else {
      store.selectedCategory = category;
    }
  }

  trackByStore(index: number, store: any): string {
    return store.storeName || store.StoreName || index.toString();
  }

  trackByCategory(index: number, category: any): string {
    // 7-11 使用 ID，全家使用 name
    return category.ID || category.name || index.toString();
  }

  onInput(event: Event): void {
    // 只更新 searchTerm，不觸發搜尋
    const input = (event.target as HTMLInputElement).value;
    this.searchTerm = input;
    this.searchExpanded = true;
    this.searchSubmitted = false;
    // 清空下拉選單，等待使用者按下 Enter 或查詢按鈕
    this.unifiedDropDownList = [];
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.closeSearchWindow();
      return;
    }
    // 按下 Enter 鍵時觸發搜尋
    if (event.key === 'Enter') {
      event.preventDefault();
      if (event.isComposing || event.keyCode === 229) return;
      this.performSearch();
    }
  }

  // 將中文轉換為拼音（不帶聲調，空格分隔）
  // 使用快取避免重複轉換相同的文字
  convertToPinyin(text: string): string {
    if (!text) return '';
    
    // 檢查快取
    if (this.pinyinCache.has(text)) {
      return this.pinyinCache.get(text)!;
    }
    
    try {
      // pinyin-pro 預設返回字串，使用 toneType: 'none' 來移除聲調
      const result = pinyin(text, { toneType: 'none' }) as string;
      const pinyinResult = result.replace(/\s+/g, ' ').trim();
      
      // 存入快取
      this.pinyinCache.set(text, pinyinResult);
      
      return pinyinResult;
    } catch (error) {
      console.error('拼音轉換錯誤:', error);
      return text;
    }
  }

  // 檢查文字是否匹配（支援中文、拼音和模糊比對）
  matchesSearchTerm(text: string, pinyinText: string, searchTerm: string): boolean {
    if (!searchTerm) return true;
    
    const lowerSearchTerm = searchTerm.toLowerCase().trim();
    const lowerText = text.toLowerCase();
    const lowerPinyin = pinyinText.toLowerCase();
    
    // 1. 直接文字比對（包含）
    if (lowerText.includes(lowerSearchTerm)) {
      return true;
    }
    
    // 2. 拼音比對（包含）
    if (lowerPinyin.includes(lowerSearchTerm)) {
      return true;
    }
    
    // 3. 如果搜尋詞是中文，轉換為拼音後比對
    const searchTermPinyin = this.convertToPinyin(searchTerm).toLowerCase();
    if (searchTermPinyin && lowerPinyin.includes(searchTermPinyin)) {
      return true;
    }
    
    // 4. 移除空格後比對（處理拼音中的空格）
    const pinyinNoSpace = lowerPinyin.replace(/\s+/g, '');
    const searchNoSpace = lowerSearchTerm.replace(/\s+/g, '');
    if (pinyinNoSpace.includes(searchNoSpace)) {
      return true;
    }
    
    return false;
  }

  // 使用本地 JSON 資料和拼音比對進行搜尋
  handleSearch(input: string): void {
    if (input.length >= 0) {
      this.loadingService.show("正在為您搜尋店家");
      this.unifiedDropDownList = [];

      // Search remains available without GPS; existing coordinates are used only for sorting.
      const getLocationAndSearch = () => of(null);

      getLocationAndSearch().subscribe(() => {
        // 篩選全家商店（使用拼音比對）
        const filteredDropDownFamilyMartList = this.dropDownFamilyMartList
          .map(item => ({
            ...item,
            Name: item.Name.replace('全家', '')  // 去除 "全家" 字串
          }))
          .filter(item => {
            if (input.length === 0) return true;
            return this.matchesSearchTerm(item.Name, item.Name_pinyin || '', input) ||
                   this.matchesSearchTerm(item.addr, item.addr_pinyin || '', input);
          });

        // 篩選 7-11 商店（使用拼音比對）
        const filteredDropDown711List = this.all711Stores
          .map(item => ({
            ...item,
            name: item.name || '',
            addr: item.addr || ''
          }))
          .filter(item => {
            if (input.length === 0) return true;
            return this.matchesSearchTerm(item.name, item.name_pinyin || '', input) ||
                   this.matchesSearchTerm(item.addr, item.addr_pinyin || '', input);
          });

        // 統一兩個列表的名稱欄位
        const normalizedFamilyMartList = filteredDropDownFamilyMartList.map(item => ({
          name: item.Name,
          addr: item.addr,
          label: '全家',
          longitude: parseFloat(item.px_wgs84),
          latitude: parseFloat(item.py_wgs84)
        }));

        const normalized711List = filteredDropDown711List.map(item => ({
          name: item.name,
          addr: item.addr,
          label: '7-11',
          longitude: parseFloat(item.lng),
          latitude: parseFloat(item.lat)
        }));

        // 合併列表並去重（使用 Set 優化，從 O(n²) 降到 O(n)）
        const storeKeySet = new Set<string>();
        this.unifiedDropDownList = [];
        
        // 使用 Set 來追蹤已加入的商店（key = name + addr）
        const addToUnifiedList = (item: any) => {
          const key = `${item.name}|${item.addr}`;
          if (!storeKeySet.has(key)) {
            storeKeySet.add(key);
            this.unifiedDropDownList.push(item);
          }
        };
        
        // 先加入 7-11，再加入全家
        normalized711List.forEach(addToUnifiedList);
        normalizedFamilyMartList.forEach(addToUnifiedList);

        // 如果有位置資訊，按距離排序，並優先顯示名稱匹配的結果
        if (this.latitude && this.longitude && input.length > 0) {
          // 建立映射以便快速查找
          const familyMartMap = new Map(filteredDropDownFamilyMartList.map(fm => [`${fm.Name}|${fm.addr}`, fm]));
          const sevenElevenMap = new Map(filteredDropDown711List.map(se => [`${se.name}|${se.addr}`, se]));

          const nameGroup = this.unifiedDropDownList
            .filter(item => {
              const key = `${item.name}|${item.addr}`;
              const familyMartItem = familyMartMap.get(key);
              const sevenElevenItem = sevenElevenMap.get(key);
              
              if (familyMartItem) {
                return this.matchesSearchTerm(familyMartItem.Name, familyMartItem.Name_pinyin || '', input);
              }
              if (sevenElevenItem) {
                return this.matchesSearchTerm(sevenElevenItem.name, sevenElevenItem.name_pinyin || '', input);
              }
              return false;
            })
            .sort((a, b) => {
              const distanceA = getDistance(
                { latitude: this.latitude, longitude: this.longitude },
                { latitude: a.latitude, longitude: a.longitude }
              );
              const distanceB = getDistance(
                { latitude: this.latitude, longitude: this.longitude },
                { latitude: b.latitude, longitude: b.longitude }
              );
              return distanceA - distanceB;
            });

          const addrGroup = this.unifiedDropDownList
            .filter(item => !nameGroup.includes(item))
            .sort((a, b) => {
              const distanceA = getDistance(
                { latitude: this.latitude, longitude: this.longitude },
                { latitude: a.latitude, longitude: a.longitude }
              );
              const distanceB = getDistance(
                { latitude: this.latitude, longitude: this.longitude },
                { latitude: b.latitude, longitude: b.longitude }
              );
              return distanceA - distanceB;
            });

          this.unifiedDropDownList = [...nameGroup, ...addrGroup];
        } else if (this.latitude && this.longitude) {
          // 如果沒有搜尋詞，直接按距離排序
          this.unifiedDropDownList.sort((a, b) => {
            const distanceA = getDistance(
              { latitude: this.latitude, longitude: this.longitude },
              { latitude: a.latitude, longitude: a.longitude }
            );
            const distanceB = getDistance(
              { latitude: this.latitude, longitude: this.longitude },
              { latitude: b.latitude, longitude: b.longitude }
            );
            return distanceA - distanceB;
          });
        }

        if (this.unifiedDropDownList.length === 0) {
          this.loadingService.show("好像找不到店家耶～請重新搜尋");
          setTimeout(() => {
            this.loadingService.hide();
          }, 2000);
        } else {
          this.loadingService.hide();
        }
      }, (error) => {
        console.error('取得位置錯誤:', error);
        this.loadingService.hide();
      });
    } else {
      this.unifiedDropDownList = [];
    }
  }

  onSearchStoreSelect(store: any): void {
    this.closeSearchWindow();
    this.worldMap?.showStoreAt(Number(store.latitude), Number(store.longitude), store.label);
  }

  onOptionSelect(event: MatAutocompleteSelectedEvent | null, lat?: number, lng?: number): void {
    const value = event?.option.value;
    const latitude = lat ?? Number(value?.latitude);
    const longitude = lng ?? Number(value?.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;
    this.worldMap?.focusCoordinates(longitude, latitude);
    this.onMapStoreQuery({
      id: 'selected-store', name: value?.name || this.searchTerm || '已選商家',
      brand: value?.label === '7-11' ? '7-11' : '全家', address: value?.addr || '', phone: '', latitude, longitude
    });
  }

  onSubmit(): void {
    // 表單提交時觸發搜尋
    this.performSearch();
  }

  // 執行搜尋（統一入口）
  performSearch(): void {
    if (this.loadingService.isVerifying) {
      return;
    }

    if (this.searchTerm && this.searchTerm.trim().length > 0) {
      this.searchExpanded = true;
      this.searchSubmitted = true;
      this.handleSearch(this.searchTerm.trim());
    } else {
      // 如果搜尋詞為空，清空結果
      this.unifiedDropDownList = [];
    }
  }

  onUseCurrentLocation(): void {
    if (this.mapSelectedStore) this.mapQueryPending = false;
    this.mapInventorySubscription?.unsubscribe();
    this.mapSelectedStore = undefined;
    if (this.loadingService.isVerifying || this.mapQueryPending) return;
    this.openProductWindow();
    this.isLocationSearchMode = true;
    this.mapQueryPending = true;
    this.totalStoresShowList = [];
    this.unifiedDropDownList = [];
    this.searchTerm = '';
    this.inventoryStatus = '正在尋找你附近的即期商品…';
    this.loadingService.show('搜尋附近店家中');
    const position$: Observable<{ coords: { latitude: number; longitude: number } }> = Number.isFinite(this.latitude) && Number.isFinite(this.longitude)
      ? of({ coords: { latitude: this.latitude, longitude: this.longitude } })
      : from(this.geolocationService.getCurrentPosition());
    position$.pipe(
      switchMap(position => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        return this.sevenElevenService.ensureWorkerReady().pipe(
          switchMap(() => this.sevenElevenService.getFoodCategory()),
          catchError(() => of(null))
        );
      }),
      catchError(() => {
        this.mapQueryPending = false;
        this.inventoryStatus = '無法取得位置，請開啟定位權限，或改用店名搜尋。';
        this.loadingService.hide();
        return of(undefined);
      })
    ).subscribe(res => {
      if (res === undefined) return;
      if (res?.element) this.foodCategories = res.element;
      this.searchCombineAndTransformStores();
    });
  }

  combineStoreList(storeLatitude?: number, storeLongitude?: number, showEmptyMessage = true): void {
    // 清空統一列表，避免重複累加
    this.totalStoresShowList = [];

    // 處理7-11商店
    this.nearby711Stores
      .filter((store) => Number(store.RemainingQty) > 0)
      .forEach((store) => {
        const transformedStore = {
          ...store,
          storeName: `7-11${store.StoreName}門市`,
          label: '7-11',
          distance: store.Distance, // 統一使用 `distance` 字段
          remainingQty: store.RemainingQty,
          showDistance: true,
          CategoryStockItems: store.CategoryStockItems // 確保保留 CategoryStockItems
        };
        this.totalStoresShowList.push(transformedStore); // 推入統一列表
      });

    // 處理全家商店
    this.nearbyFamilyMartStores.forEach((store) => {
      const transformedStore = {
        ...store,
        storeName: store.name,
        label: '全家',
        distance: store.distance,
        showDistance: true
      };
      this.totalStoresShowList.push(transformedStore);  // 推入統一列表
    });

    if (storeLatitude && storeLongitude) {
      this.totalStoresShowList.sort((a, b) => a.distance - b.distance);
      // if(this.totalStoresShowList[0].distance > 1 || this.totalStoresShowList[0].remainingQty === 0){
      //   const dialogRef = this.dialog.open(MessageDialogComponent, {
      //     data: {
      //       message: '該門市無庫存，請重新搜尋。',
      //       imgPath: 'assets/NoResult.jpg',
      //     }
      //   });
      //   dialogRef.afterClosed().subscribe(result => {
      //     this.totalStoresShowList = [];
      //     this.searchTerm = '';
      //   });
      //   this.totalStoresShowList = [];
      //   return;
      // }
      // this.totalStoresShowList = [
      //   {
      //     ...this.totalStoresShowList[0],
      //     showDistance: false
      //   }
      // ];
    }
    else{
      // 根據距離排序
      this.totalStoresShowList.sort((a, b) => a.distance - b.distance);
    }

    const hasNearbyStore =
      this.nearby711Stores.length > 0 || this.nearbyFamilyMartStores.length > 0;

    if (this.totalStoresShowList.length === 0 && showEmptyMessage && !this.productWindow?.nativeElement.open) {
      this.dialog.open(MessageDialogComponent, {
        width: '360px',
        data: {
          title: '目前沒有商品',
          message: hasNearbyStore
            ? '目前的搜尋範圍內並無折扣商品，請稍後再試。'
            : '搜尋範圍內沒有商店，請稍後再試。',
          imgPath: 'assets/NoResult.jpg'
        }
      });
    }
  }

  searchCombineAndTransformStores(storeLatitude?: number, storeLongitude?: number): void {
    const revision = ++this.stockRevision;
    // 如果没有參數就用默認的定位值
    const finalLatitude = storeLatitude || this.latitude;
    const finalLongitude = storeLongitude || this.longitude;

    const locationData711: LocationData = {
      CurrentLocation: {
        Latitude: finalLatitude,
        Longitude: finalLongitude
      },
      SearchLocation: {
        Latitude: finalLatitude,
        Longitude: finalLongitude
      }
    };

    const locationFamilyMart: Location = {
      Latitude: finalLatitude,
      Longitude: finalLongitude
    };

    this.loadingService.show('正在取得附近門市資訊，請稍後');
    const unavailable: string[] = [];

    // 結合兩個 API 請求
    forkJoin({
      sevenEleven: this.sevenElevenService.getNearByStoreList(locationData711).pipe(timeout(20000), catchError(() => { unavailable.push('7-ELEVEN'); return of(null); })),
      familyMart: this.familyMartService.getNearByStoreList(locationFamilyMart).pipe(timeout(20000), catchError(() => { unavailable.push('全家'); return of(null); }))
    }).subscribe(
      ({ sevenEleven, familyMart }) => {
        // 每一次搜尋都以本次回應重建清單，不能沿用上一次的門市資料。
        this.nearby711Stores = [];
        this.nearbyFamilyMartStores = [];

        // 處理 7-11 資料
        if (sevenEleven && sevenEleven.element && sevenEleven.element.StoreStockItemList) {
          this.mergeSevenMapStock(sevenEleven.element.StoreStockItemList, revision);
          this.nearby711Stores = sevenEleven.element.StoreStockItemList.sort(
            (a: StoreStockItem, b: StoreStockItem) => a.Distance - b.Distance
          );
        }

        // 處理全家資料
        if (familyMart && familyMart.code === 1) {
          this.mergeFamilyMapStock(familyMart.data, revision);
          this.nearbyFamilyMartStores = familyMart.data.sort(
            (a: StoreModel, b: StoreModel) => a.distance - b.distance
          );
        }

        if (!sevenEleven?.element?.StoreStockItemList && !unavailable.includes('7-ELEVEN')) unavailable.push('7-ELEVEN');
        if (familyMart?.code !== 1 && !unavailable.includes('全家')) unavailable.push('全家');
        this.mapQueryPending = false;
        this.inventoryStatus = unavailable.length
          ? unavailable.join('、') + ' 商品服務暫時無法回應，以下僅顯示成功取得的資料。'
          : '已更新附近門市的即期商品，實際庫存以店內為準。';

        // 等兩者完成後合併資料
        if (storeLatitude && storeLongitude) {
          this.combineStoreList(storeLatitude, storeLongitude, unavailable.length === 0);
          this.storeDataService.setStores(this.totalStoresShowList);
          this.storeDataService.setIsUserLocationSearch(false);
        }
        else{
          this.combineStoreList(undefined, undefined, unavailable.length === 0);
          this.storeDataService.setStores(this.totalStoresShowList);
          this.storeDataService.setIsUserLocationSearch(true);
        }

        this.loadingService.hide();
      },
      (error) => {
        this.mapQueryPending = false;
        this.inventoryStatus = '商品服務暫時無法回應，請稍後再試。';
        console.error('Error fetching store data:', error);
        this.loadingService.hide();
      }
    );
  }

  getFStoreQty(store: StoreModel): number {
    var totalQty: number = 0;
    store.info.forEach((cat) => {
      totalQty += cat.qty;
    })
    return totalQty;
  }

  getFUrl(cat: any): string {
    return cat.iconURL;
  }

  getFCatName(cat: any): string {
    return cat.name;
  }

  getFSubCategoryQty(store: StoreModel, cat: any): number {
    return cat.qty;
  }

  fStoreName(storeName: string): string {
    return storeName ? storeName.replace('全家', '') : ''
  }

  loadFavoriteStores() {
    if (this.user.emailVerified) {
      const userRef = this.firestore.collection('users').doc(this.user.uid);
      userRef.collection('favorites').valueChanges().subscribe(favorites => {
        this.favoriteStores = favorites;
      });
    }
  }

  toggleFavorite(store: any) {
    if (this.user.emailVerified) {
      const userRef = this.firestore.collection('users').doc(this.user.uid);
      const favoriteRef = userRef.collection('favorites').doc(store.storeName);

      // 如果商店已經在喜愛清單內，刪除它
      if (this.isFavorite(store)) {
        const dialogRef = this.dialog.open(MessageDialogComponent, {
          data: {
            title: "取消收藏",
            message: `已將『${store.storeName}』從收藏中移除`,
            imgPath: "assets/S__222224406.png"
          }
        });
        dialogRef.afterClosed().subscribe(result => {
          favoriteRef.delete();
        });
      } else {
        const dialogRef = this.dialog.open(MessageDialogComponent, {
          data: {
            title: "新增收藏",
            message: `『${store.storeName}』已加入您的收藏店家`,
            imgPath: "assets/S__222224406.png"
          }
        });

        dialogRef.afterClosed().subscribe(result => {
          const favoriteData: any = {
            storeName: store.storeName
          };
          // 依照商店設定選擇性的資料
          if (store.StoreName) {
            favoriteData.store711Name = store.StoreName;
            favoriteData.label = '7-11';
          }
          if (store.longitude && store.latitude) {
            favoriteData.storeFLongitude = store.longitude;
            favoriteData.storeFLatitude = store.latitude;
            favoriteData.label = '全家';
          }

          favoriteRef.set(favoriteData);
        });
      }
    } else {
    }
  }

  isFavorite(store: any): boolean {
    return this.favoriteStores.some(favStore => favStore.storeName === store.storeName);
  }

  onUserUpdated(user: any) {
    this.user = user; // 更新用戶狀態
    if (user) {
      this.loadFavoriteStores(); // 加載收藏店家
    }
  }

  onFavoriteStoresUpdated(favoriteStores: any) {
    this.favoriteStores = favoriteStores; // 更新用戶狀態
  }

  onFavoriteStoreSearch(store: any) {
    this.mapInventorySubscription?.unsubscribe();
    this.mapSelectedStore = undefined;
    this.openProductWindow();
    this.loadingService.show("幫你找看看唷");
    // 從本地 JSON 資料找出店家的經緯度
    var lat = 0;
    var lng = 0;
    if (store.label === "全家") {
      lat = store.storeFLatitude;
      lng = store.storeFLongitude;
      this.onOptionSelect(null, lat, lng);
      this.searchTerm = '';
    }
    else {
      // 從本地 7-11 商店資料中尋找
      const foundStore = this.all711Stores.find(s => 
        s.name === store.store711Name || 
        (store.store711Name && s.name.includes(store.store711Name.replace('711', '').trim()))
      );
      
      if (foundStore) {
        lat = parseFloat(foundStore.lat);
        lng = parseFloat(foundStore.lng);
        this.onOptionSelect(null, lat, lng);
        this.searchTerm = '';
      } else {
        // 如果找不到，嘗試取得位置後再搜尋
        from(this.geolocationService.getCurrentPosition())
          .pipe(
            switchMap((position) => {
              this.latitude = position.coords.latitude;
              this.longitude = position.coords.longitude;
              return of(null);
            })
          ).subscribe(() => {
            // 使用拼音比對再次搜尋
            const searchTerm = store.store711Name?.replace('711', '').trim() || '';
            const matchedStore = this.all711Stores.find(s => 
              this.matchesSearchTerm(s.name, s.name_pinyin || '', searchTerm)
            );
            
            if (matchedStore) {
              lat = parseFloat(matchedStore.lat);
              lng = parseFloat(matchedStore.lng);
              this.onOptionSelect(null, lat, lng);
              this.searchTerm = '';
            } else {
              console.error('找不到 7-11 商店:', store.store711Name);
              this.loadingService.hide();
            }
          });
      }
    }
  }

  // 處理食物搜尋結果
  onFoodSearchResult(result: any) {
    this.mapInventorySubscription?.unsubscribe();
    this.mapSelectedStore = undefined;
    this.openProductWindow();
    this.loadingService.show("正在跳轉到商店...");
    
    // 設定搜尋詞
    this.searchTerm = result.storeName;
    
    // 變更搜尋模式
    this.isLocationSearchMode = false;
    
    // 清除商店列表
    this.totalStoresShowList = [];
    
    // 確保商店資料有正確的屬性，避免觸發「無折扣商品」訊息
    const storeData = {
      ...result.store,
      distance: 0, // 設為 0 表示這是目標商店
      remainingQty: result.remainingQty || 1 // 確保有庫存
    };
    
    // 直接設定商店資料
    this.totalStoresShowList = [storeData];
    
    // 更新 StoreDataService
    this.storeDataService.setStores(this.totalStoresShowList);
    this.storeDataService.setIsUserLocationSearch(false);
    
    this.loadingService.hide();
  }
}
