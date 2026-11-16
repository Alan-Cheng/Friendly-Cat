import { Component, Input, Output, EventEmitter, OnChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Subscription, forkJoin, of, catchError } from 'rxjs';
import Fuse from 'fuse.js';
import { StoreDataService } from '../../services/stores-data.service';
import { SevenElevenRequestService } from '../../search-food/new-search/services/seven-eleven-request.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-food-search',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './food-search.component.html',
  styleUrls: ['./food-search.component.scss']
})
export class FoodSearchComponent implements OnChanges, OnDestroy {
  @Output() foodSelected = new EventEmitter<any>();
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

  readonly sevenElevenIconUrl = environment.sevenElevenUrl.icon;
  readonly familyMartIconUrl = environment.familyMartUrl.icon;
  foodSearchTerm = '';
  foodSearchResults: any[] = [];
  isSearching = false;
  hasSearched = false;
  hasStoreData = false;
  inventoryState: 'idle' | 'loading' | 'ready' | 'error' = 'idle';
  private composing = false;
  private submittedTerm = '';
  private searchTimer?: ReturnType<typeof setTimeout>;
  private subscriptions = new Subscription();
  private searchSubscription?: Subscription;

  constructor(private storeDataService: StoreDataService, private sevenElevenService: SevenElevenRequestService) {
    this.subscriptions.add(this.storeDataService.inventoryState$.subscribe(state => this.inventoryState = state));
    this.subscriptions.add(this.storeDataService.stores$.subscribe(stores => {
      this.hasStoreData = stores.length > 0;
      if (this.composing) return;
      if (this.hasSearched) this.searchInExistingStores(this.submittedTerm);
      else this.scheduleSearch();
    }));
  }

  ngOnDestroy(): void {
    clearTimeout(this.searchTimer);
    this.subscriptions.unsubscribe();
    this.searchSubscription?.unsubscribe();
  }

  onCompositionStart(): void {
    this.composing = true;
    this.resetSearch();
  }

  onCompositionEnd(event?: CompositionEvent): void {
    this.composing = false;
    // Read the committed value before Angular flushes its buffered ngModel update.
    if (event) this.foodSearchTerm = (event.target as HTMLInputElement).value;
    this.scheduleSearch();
  }
  onSearchKeyDown(event: KeyboardEvent): void {
    if (event.key !== 'Enter' || event.isComposing || this.composing || event.keyCode === 229) return;
    event.preventDefault();
    this.onSearchClick();
  }
  openFoodResult(result: any): void { this.foodSelected.emit(result); }
  onSearchClick(): void {
    clearTimeout(this.searchTimer);
    if (this.composing || this.inventoryState === 'loading' || !this.hasStoreData) return;
    const query = this.foodSearchTerm.trim();
    if (Array.from(query).length < 2) {
      this.resetSearch();
      return;
    }
    this.isSearching = true;
    this.hasSearched = true;
    this.submittedTerm = query;
    this.searchFoodInStores(query);
  }

  onSearchInputChange(event?: Event): void {
    this.resetSearch();
    if (this.composing || (event as InputEvent | undefined)?.isComposing) return;
    if (event) this.foodSearchTerm = (event.target as HTMLInputElement).value;
    this.scheduleSearch();
  }

  private scheduleSearch(): void {
    clearTimeout(this.searchTimer);
    if (this.composing || Array.from(this.foodSearchTerm.trim()).length < 2) return;
    this.searchTimer = setTimeout(() => this.onSearchClick(), 180);
  }

  private resetSearch(): void {
    clearTimeout(this.searchTimer);
    this.searchSubscription?.unsubscribe();
    this.isSearching = false;
    this.hasSearched = false;
    this.foodSearchResults = [];
  }

  // 獲取搜尋框提示文字
  getSearchPlaceholder(): string {
    if (this.inventoryState === 'loading') return '附近門市商品載入中…';
    if (this.inventoryState === 'error') return '附近商品暫時無法載入';
    return this.hasStoreData ? '輸入至少兩個字…' : '目前沒有可搜尋的商品';
  }

  // 搜尋食物在商店中的庫存
  searchFoodInStores(searchTerm: string) {
    // 直接搜尋已載入的商店資料
    this.searchInExistingStores(searchTerm);
  }

  // 在已載入的商店資料中搜尋
  searchInExistingStores(searchTerm: string) {
    this.searchSubscription?.unsubscribe();
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
                    if (product.name && Number(product.qty) > 0) {
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
      (Array.isArray(store.CategoryStockItems)
        ? of({ isSuccess: true, element: { StoreStockItem: store } })
        : this.sevenElevenService.getItemsByStoreNo(store.StoreNo)).pipe(
        catchError(error => {
          console.error(`取得 7-11 商店 ${store.StoreName} 商品失敗:`, error);
          return of(null);
        })
      )
    );

    this.searchSubscription = forkJoin(apiCalls).subscribe(storeProductsList => {
      storeProductsList.forEach((storeProducts, index) => {
        if (storeProducts && storeProducts.isSuccess && storeProducts.element.StoreStockItem) {
          const store = sevenElevenStores[index];
          const categoryStockItems = storeProducts.element.StoreStockItem.CategoryStockItems;
          
          categoryStockItems.forEach((category: any) => {
            if (category.ItemList && category.ItemList.length > 0) {
              category.ItemList.forEach((item: any) => {
                if (item.ItemName && Number(item.RemainingQty) > 0) {
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
