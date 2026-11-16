import Fuse from 'fuse.js';
import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, OnChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MessageDialogComponent } from '../message-dialog/message-dialog.component';
import { AuthService } from 'src/app/services/auth.service';
import { LoginPageComponent } from 'src/app/components/login-page/login-page.component';
import { environment } from 'src/environments/environment';
import { SevenElevenRequestService } from '../../search-food/new-search/services/seven-eleven-request.service';
import { FamilyMartRequestService } from '../../search-food/new-search/services/family-mart-request.service';
import { GeolocationService } from 'src/app/services/geolocation.service';
import { StoreDataService } from 'src/app/services/stores-data.service';
import { switchMap, from, of, catchError, forkJoin } from 'rxjs';
import { getDistance } from 'geolib';

@Component({
  selector: 'app-sider',
  templateUrl: './sider.component.html',
  styleUrls: ['./sider.component.scss'],
})
export class SiderComponent implements OnChanges {
  @ViewChild('sidebarWindow', { static: true }) sidebarWindow!: ElementRef<HTMLDialogElement>;
  @ViewChild('detailsWindow', { static: true }) detailsWindow!: ElementRef<HTMLDialogElement>;
  @Output() tutorialRequested = new EventEmitter<void>();
  @Input() worldMode = false;
  @Input() user: any;
  @Input() favoriteStores: any[] = [];

  @Output() userUpdated = new EventEmitter<any>();
  @Output() favoriteStoresUpdated = new EventEmitter<any>();
  @Output() searchStore = new EventEmitter<string>();
  @Output() foodSearchResult = new EventEmitter<any>();

  @Input() foodDetails711: any[] = [];
  @Input() foodDetailsFamilyMart: any[] = [];
  readonly missingProductImage = 'assets/此商品暫無圖片.png';
  private sevenFoodIndex = new Fuse<any>([], { keys: ['name'], threshold: 0.3 });
  private familyFoodIndex = new Fuse<any>([], { keys: ['title'], threshold: 0.3 });
  private productImages = new Map<string, string>();

  ngOnChanges(): void {
    this.sevenFoodIndex.setCollection(this.foodDetails711 || []);
    this.familyFoodIndex.setCollection(this.foodDetailsFamilyMart || []);
    this.productImages.clear();
  }

  getFoodImage(result: { storeType: string; foodName: string }): string {
    const key = `${result.storeType}:${result.foodName}`;
    const cached = this.productImages.get(key);
    if (cached) return cached;
    const isSeven = result.storeType === '7-11';
    const index = isSeven ? this.sevenFoodIndex : this.familyFoodIndex;
    const detail = index.search(result.foodName, { limit: 1 })[0]?.item;
    const image = (isSeven ? detail?.image : detail?.picture_url) || this.missingProductImage;
    this.productImages.set(key, image);
    return image;
  }

  sevenElevenIconUrl = environment.sevenElevenUrl.icon;
  familyMartIconUrl = environment.familyMartUrl.icon;
  
  // 側邊欄狀態
  sidebarOpen = false;
  sidebarClosing = false;
  tourMode = false;
  detailMode = false;

  openForTour(): void {
    const drawer = this.sidebarWindow.nativeElement;
    if (drawer.open) return;
    this.detailMode = false;
    this.tourMode = true;
    this.sidebarOpen = true;
    drawer.classList.add('tour-sidebar');
    // The tour owns focus and its overlay. A modal drawer would make the
    // tour controls outside it inert and cover them with the native top layer.
    drawer.show();
  }

  closeForTour(): void {
    if (!this.tourMode) return;
    this.sidebarWindow.nativeElement.close();
    this.sidebarWindow.nativeElement.classList.remove('tour-sidebar');
    this.tourMode = false;
    this.sidebarOpen = false;
  }
  
  // 食物搜尋相關
  foodSearchTerm = '';
  foodSearchResults: any[] = [];
  isSearching = false;
  hasSearched = false; // 追蹤是否已執行過搜尋
  latitude!: number;
  longitude!: number;
  
  // 商店資料狀態
  hasStoreData = false;
  inventoryState: 'idle' | 'loading' | 'ready' | 'error' = 'idle';

  constructor(
    private authService: AuthService,
    public dialog: MatDialog,
    private sevenElevenService: SevenElevenRequestService,
    private familyMartService: FamilyMartRequestService,
    private geolocationService: GeolocationService,
    private storeDataService: StoreDataService
  ) { 
    this.storeDataService.inventoryState$.subscribe(state => this.inventoryState = state);
    // 監聽商店資料狀態
    this.storeDataService.stores$.subscribe(stores => {
      this.hasStoreData = stores && stores.length > 0;
    });
  }

  openStoreDetails(): void {
    this.sidebarWindow.nativeElement.close();
    this.detailMode = true;
    this.sidebarOpen = true;
    const drawer = this.detailsWindow.nativeElement;
    if (!drawer.open) drawer.showModal();
  }

  showMenu(): void {
    this.detailsWindow.nativeElement.close();
    this.detailMode = false;
    this.sidebarOpen = true;
    const drawer = this.sidebarWindow.nativeElement;
    if (!drawer.open) drawer.showModal();
  }

  onPanelClosed(panel: HTMLDialogElement): void {
    // A close event can arrive after the other panel has already opened.
    if (panel.open) return;
    this.detailMode = this.detailsWindow.nativeElement.open;
    this.sidebarOpen = this.detailMode || this.sidebarWindow.nativeElement.open;
  }

  private outsidePointer = false;
  private touchStart?: { x: number; y: number; id: number };

  private isOutside(event: MouseEvent): boolean {
    const rect = (event.currentTarget as HTMLDialogElement).getBoundingClientRect();
    return event.clientX < rect.left || event.clientX > rect.right
      || event.clientY < rect.top || event.clientY > rect.bottom;
  }

  onPanelPointerDown(event: PointerEvent): void { this.outsidePointer = this.isOutside(event); }
  // Coordinate fallback also covers browsers without dialog.closedBy (Safari).
  onPanelClick(event: MouseEvent): void {
    if (this.outsidePointer && this.isOutside(event)) void this.closeSidebar();
    this.outsidePointer = false;
  }

  cancelPanelTouch(): void { this.touchStart = undefined; }

  onPanelTouchStart(event: TouchEvent, details: boolean): void {
    this.touchStart = undefined;
    if (event.touches.length !== 1 || !window.matchMedia('(max-width: 600px)').matches) return;
    const target = event.target as HTMLElement;
    if (target === event.currentTarget || target.closest('input, textarea, select')) return;
    // A downward swipe dismisses only when the touched scroll area is at its top.
    if (details) {
      for (let node: HTMLElement | null = target; node && node !== event.currentTarget; node = node.parentElement) {
        if (node.scrollTop > 0) return;
      }
    }
    const touch = event.touches[0];
    this.touchStart = { x: touch.clientX, y: touch.clientY, id: touch.identifier };
  }

  onPanelTouchEnd(event: TouchEvent, details: boolean): void {
    const start = this.touchStart;
    this.touchStart = undefined;
    if (!start || event.touches.length) return;
    const touch = Array.from(event.changedTouches).find(item => item.identifier === start.id);
    if (!touch) return;
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (details ? dy > 72 && dy > Math.abs(dx) * 1.5 : dx < -72 && -dx > Math.abs(dy) * 1.5) {
      void this.closeSidebar();
    }
  }

  toggleSidebar(): void {
    if (this.sidebarOpen) void this.closeSidebar();
    else this.showMenu();
  }

  // 關閉側邊欄
  async closeSidebar(): Promise<void> {
    const drawer = this.detailMode ? this.detailsWindow.nativeElement : this.sidebarWindow.nativeElement;
    if (!drawer.open || this.sidebarClosing) return;
    this.sidebarClosing = true;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const currentTransform = getComputedStyle(drawer).transform;
    const exitTransform = this.detailMode && window.matchMedia('(max-width: 600px)').matches ? 'translateY(100%)' : 'translateX(-100%)';
    drawer.getAnimations().forEach(animation => animation.cancel());
    const animation = drawer.animate(
      reducedMotion ? [{ opacity: 1 }, { opacity: 0 }]
        : [{ transform: currentTransform }, { transform: exitTransform }],
      { duration: reducedMotion ? 100 : 200, easing: 'cubic-bezier(.4, 0, 1, 1)', fill: 'forwards' }
    );
    try { await animation.finished; } catch { /* Finish closing if the animation is interrupted. */ }
    finally {
      drawer.close();
      animation.cancel();
      this.sidebarOpen = false;
      this.sidebarClosing = false;
    }
  }

  onSidebarCancel(event: Event): void { event.preventDefault(); void this.closeSidebar(); }
  async openTutorial(): Promise<void> { await this.closeSidebar(); this.tutorialRequested.emit(); }
  async openAccount(): Promise<void> { await this.closeSidebar(); this.loginOrlogout(); }
  async openFoodResult(result: any): Promise<void> { await this.closeSidebar(); this.onFoodResultClick(result); }
  isSevenElevenFavorite(store: any): boolean {
    if (store.label) return store.label === '7-11';
    return !!store.store711Name || /^(?:7-ELEVEN|7-11|711)/i.test(store.storeName || '');
  }

  favoriteStoreName(store: any): string {
    return (store.storeName || '').replace(/^(?:全家(?:便利商店)?|FamilyMart|7-ELEVEN|7-11|711)\s*/i, '').trim();
  }

  async openFavoriteStore(store: any): Promise<void> {
    if (!this.worldMode) await this.closeSidebar();
    this.onSearchStore(store);
  }
  async openVersion(event: MouseEvent): Promise<void> {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const href = (event.currentTarget as HTMLAnchorElement).href;
    await this.closeSidebar();
    window.location.assign(href);
  }

  loginOrlogout() {
    if (this.user) {
      this.authService.logout();
      this.user = null;
      this.favoriteStores = []; // 清空這裡的東西
      this.userUpdated.emit(null);
      this.favoriteStoresUpdated.emit([]);
      const dialogRef = this.dialog.open(MessageDialogComponent, {
        width: '300px', // 設定對話框的寬度
        data: {
          title: "登出成功",
          message: `已順利登出`,
          imgPath: "assets/S__222224406.png"
        }
      });
      dialogRef.afterClosed().subscribe((result) => {
        this.favoriteStores = []; // 清空這裡的東西
      });
    } else {
      const dialogRef = this.dialog.open(LoginPageComponent, {
        width: '500px', // 設定對話框的寬度
        data: {},
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.authService.getUser().subscribe((user) => {
            if (user && user.emailVerified) {
              this.user = user;
              this.userUpdated.emit(user); // 通知父組件用戶已登錄
            }
          });
        }
      });
    }
  }

  onSearchStore(store: any) {
    this.searchStore.emit(store);
  }

  // 點擊搜尋按鈕
  onSearchClick() {
    if (this.inventoryState === 'loading' || !this.hasStoreData) return;
    if (this.foodSearchTerm && this.foodSearchTerm.trim().length > 0) {
      this.isSearching = true;
      this.hasSearched = true; // 標記已執行搜尋
      this.searchFoodInStores(this.foodSearchTerm);
    }
  }

  // 搜尋框輸入變化
  onSearchInputChange() {
    // 如果搜尋框被清空，重置搜尋狀態
    if (!this.foodSearchTerm || this.foodSearchTerm.trim().length === 0) {
      this.hasSearched = false;
      this.foodSearchResults = [];
    }
  }

  // 獲取搜尋框提示文字
  getSearchPlaceholder(): string {
    if (this.inventoryState === 'loading') return '附近門市商品載入中…';
    if (this.inventoryState === 'error') return '附近商品暫時無法載入';
    return this.hasStoreData ? '輸入食物名稱…' : '目前沒有可搜尋的商品';
  }

  // 搜尋食物在商店中的庫存
  searchFoodInStores(searchTerm: string) {
    // 直接搜尋已載入的商店資料
    this.searchInExistingStores(searchTerm);
  }

  // 在已載入的商店資料中搜尋
  searchInExistingStores(searchTerm: string) {
    this.isSearching = true;
    const results: any[] = [];

    // 從 StoreDataService 獲取已載入的商店資料
    const stores = this.storeDataService.getStores();
    
    if (!stores || stores.length === 0) {
      this.foodSearchResults = [];
      this.isSearching = false;
      return;
    }

    // 搜尋全家商品（直接搜尋）
    stores.forEach((store: any, storeIndex: number) => {
        if (store.label === '全家' && store.info) {
          // 搜尋全家商品
          store.info.forEach((category: any, catIndex: number) => {
            if (category.categories) {
              category.categories.forEach((subCategory: any, subCatIndex: number) => {
                if (subCategory.products) {
                  subCategory.products.forEach((product: any, productIndex: number) => {
                    if (product.name) {
                      const matchScore = this.calculateMatchScore(product.name, searchTerm);
                      if (searchTerm.length === 0 || matchScore > 0) {
                        results.push({
                          foodName: product.name,
                          storeName: store.name,
                          storeType: '全家',
                          store: {
                            ...store,
                            latitude: store.latitude,
                            longitude: store.longitude
                          },
                          distance: store.distance,
                          remainingQty: product.qty,
                          matchScore: matchScore
                        });
                      }
                    }
                  });
                }
              });
            }
          });
        }
    });

    // 搜尋 7-11 商品（需要額外 API 呼叫）
    const sevenElevenStores = stores.filter(store => store.label === '7-11');
    if (sevenElevenStores.length > 0) {
      this.searchSevenElevenProducts(sevenElevenStores, searchTerm, results);
    } else {
      this.finalizeSearchResults(results);
    }
  }

  // 搜尋 7-11 商品（透過額外 API）
  searchSevenElevenProducts(sevenElevenStores: any[], searchTerm: string, results: any[]) {
    const apiCalls = sevenElevenStores.map(store => 
      this.sevenElevenService.getItemsByStoreNo(store.StoreNo).pipe(
        catchError(error => {
          console.error(`取得 7-11 商店 ${store.StoreName} 商品失敗:`, error);
          return of(null);
        })
      )
    );

    forkJoin(apiCalls).subscribe(storeProductsList => {
      storeProductsList.forEach((storeProducts, index) => {
        if (storeProducts && storeProducts.isSuccess && storeProducts.element.StoreStockItem) {
          const store = sevenElevenStores[index];
          const categoryStockItems = storeProducts.element.StoreStockItem.CategoryStockItems;
          
          categoryStockItems.forEach((category: any) => {
            if (category.ItemList && category.ItemList.length > 0) {
              category.ItemList.forEach((item: any) => {
                if (item.ItemName) {
                  const matchScore = this.calculateMatchScore(item.ItemName, searchTerm);
                  if (searchTerm.length === 0 || matchScore > 0) {
                    results.push({
                      foodName: item.ItemName,
                      storeName: `7-11${store.StoreName}門市`,
                      storeType: '7-11',
                      store: {
                        ...store,
                        Latitude: store.Latitude,
                        Longitude: store.Longitude
                      },
                      distance: store.Distance,
                      remainingQty: item.RemainingQty,
                      matchScore: matchScore
                    });
                  }
                }
              });
            }
          });
        }
      });
      
      this.finalizeSearchResults(results);
    });
  }

  // 完成搜尋結果處理
  finalizeSearchResults(results: any[]) {
    // 按精確度排序，然後按距離排序
    results.sort((a, b) => {
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore; // 精確度高的在前
      }
      return a.distance - b.distance; // 精確度相同時按距離排序
    });

    this.foodSearchResults = results;
    this.isSearching = false;
  }

  // 執行食物搜尋
  performFoodSearch(searchTerm: string) {
    return from(this.sevenElevenService.ensureWorkerReady())
      .pipe(
        switchMap((token: any) => {
          if (token && token.element) {
            sessionStorage.setItem('711Token', token.element);
            return this.searchFoodInBothStores(searchTerm);
          } else {
            return of([]);
          }
        }),
        catchError((error) => {
          console.error('搜尋食物時發生錯誤:', error);
          this.isSearching = false;
          return of([]);
        })
      );
  }

  // 在兩家商店中搜尋食物
  searchFoodInBothStores(searchTerm: string) {
    const locationData711 = {
      CurrentLocation: {
        Latitude: this.latitude,
        Longitude: this.longitude
      },
      SearchLocation: {
        Latitude: this.latitude,
        Longitude: this.longitude
      }
    };

    const locationFamilyMart = {
      Latitude: this.latitude,
      Longitude: this.longitude
    };

    return forkJoin({
      sevenEleven: this.sevenElevenService.getNearByStoreList(locationData711),
      familyMart: this.familyMartService.getNearByStoreList(locationFamilyMart),
      sevenElevenFoods: this.sevenElevenService.getFoodDetails(),
      familyMartFoods: this.familyMartService.getFoodDetails()
    }).pipe(
      switchMap(({ sevenEleven, familyMart, sevenElevenFoods, familyMartFoods }) => {
        const results: any[] = [];

        // 搜尋 7-11 食物
        if (sevenEleven && sevenEleven.element && sevenEleven.element.StoreStockItemList) {
          sevenEleven.element.StoreStockItemList.forEach((store: any) => {
            if (store.CategoryStockItems) {
              store.CategoryStockItems.forEach((category: any) => {
                if (category.StockItems) {
                  category.StockItems.forEach((item: any) => {
                    if (item.ProductName) {
                      const matchScore = this.calculateMatchScore(item.ProductName, searchTerm);
                      if (matchScore > 0) {
                        results.push({
                          foodName: item.ProductName,
                          storeName: `7-11${store.StoreName}門市`,
                          storeType: '7-11',
                          store: store,
                          distance: store.Distance,
                          remainingQty: item.RemainingQty,
                          matchScore: matchScore
                        });
                      }
                    }
                  });
                }
              });
            }
          });
        }

        // 搜尋全家食物
        if (familyMart && familyMart.code === 1 && familyMart.data) {
          familyMart.data.forEach((store: any) => {
            if (store.info) {
              store.info.forEach((category: any) => {
                if (category.products) {
                  category.products.forEach((product: any) => {
                    if (product.name) {
                      const matchScore = this.calculateMatchScore(product.name, searchTerm);
                      if (matchScore > 0) {
                        results.push({
                          foodName: product.name,
                          storeName: store.name,
                          storeType: '全家',
                          store: store,
                          distance: store.distance,
                          remainingQty: product.qty,
                          matchScore: matchScore
                        });
                      }
                    }
                  });
                }
              });
            }
          });
        }

        // 按精確度排序，然後按距離排序
        results.sort((a, b) => {
          if (b.matchScore !== a.matchScore) {
            return b.matchScore - a.matchScore; // 精確度高的在前
          }
          return a.distance - b.distance; // 精確度相同時按距離排序
        });
        
        this.foodSearchResults = results;
        this.isSearching = false;
        
        return of(results);
      })
    );
  }

  // 點擊食物搜尋結果
  onFoodResultClick(result: any) {
    // 發送事件到父組件，讓它跳轉到對應的商店
    this.foodSearchResult.emit({
      store: result.store,
      storeType: result.storeType,
      foodName: result.foodName
    });
  }

  // 計算模糊搜尋匹配分數
  calculateMatchScore(text: string, searchTerm: string): number {
    // 如果搜尋詞為空，返回預設分數
    if (searchTerm.length === 0) {
      return 50; // 給所有商品一個中等分數
    }
    
    const textLower = text.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    
    // 完全匹配 - 最高分
    if (textLower === searchLower) {
      return 100;
    }
    
    // 開頭匹配 - 高分
    if (textLower.startsWith(searchLower)) {
      return 90;
    }
    
    // 包含匹配 - 中等分數
    if (textLower.includes(searchLower)) {
      return 70;
    }
    
    // 模糊匹配 - 使用簡化的編輯距離算法
    const fuzzyScore = this.calculateFuzzyScore(textLower, searchLower);
    if (fuzzyScore > 0.6) {
      return Math.round(fuzzyScore * 50); // 轉換為 0-50 分
    }
    
    // 部分詞匹配
    const words = textLower.split(/[\s\-_]+/);
    const searchWords = searchLower.split(/[\s\-_]+/);
    
    let wordMatchScore = 0;
    for (const searchWord of searchWords) {
      for (const word of words) {
        if (word.includes(searchWord) || searchWord.includes(word)) {
          wordMatchScore += 30;
          break;
        }
      }
    }
    
    return wordMatchScore;
  }

  // 計算模糊匹配分數 (0-1)
  calculateFuzzyScore(text: string, searchTerm: string): number {
    if (searchTerm.length === 0) return 0;
    if (text.length === 0) return 0;
    
    const textLength = text.length;
    const searchLength = searchTerm.length;
    
    // 如果搜尋詞太長，降低分數
    if (searchLength > textLength) {
      return 0;
    }
    
    let matches = 0;
    let searchIndex = 0;
    
    // 計算連續匹配的字符數
    for (let i = 0; i < textLength && searchIndex < searchLength; i++) {
      if (text[i] === searchTerm[searchIndex]) {
        matches++;
        searchIndex++;
      }
    }
    
    // 計算匹配率
    const matchRate = matches / searchLength;
    
    // 如果所有字符都匹配，給予額外分數
    if (searchIndex === searchLength) {
      return matchRate + 0.2;
    }
    
    return matchRate;
  }
}
