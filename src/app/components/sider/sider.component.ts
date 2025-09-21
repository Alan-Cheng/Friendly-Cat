import { Component, Input, Output, EventEmitter } from '@angular/core';
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
export class SiderComponent {
  @Input() user: any;
  @Input() favoriteStores: any[] = [];

  @Output() userUpdated = new EventEmitter<any>();
  @Output() favoriteStoresUpdated = new EventEmitter<any>();
  @Output() searchStore = new EventEmitter<string>();
  @Output() foodSearchResult = new EventEmitter<any>();

  sevenElevenIconUrl = environment.sevenElevenUrl.icon;
  familyMartIconUrl = environment.familyMartUrl.icon;
  
  // 側邊欄狀態
  sidebarOpen = false;
  
  // 食物搜尋相關
  foodSearchTerm = '';
  foodSearchResults: any[] = [];
  isSearching = false;
  latitude!: number;
  longitude!: number;
  
  // 商店資料狀態
  hasStoreData = false;

  constructor(
    private authService: AuthService,
    public dialog: MatDialog,
    private sevenElevenService: SevenElevenRequestService,
    private familyMartService: FamilyMartRequestService,
    private geolocationService: GeolocationService,
    private storeDataService: StoreDataService
  ) { 
    // 監聽商店資料狀態
    this.storeDataService.stores$.subscribe(stores => {
      this.hasStoreData = stores && stores.length > 0;
    });
  }

  // 切換側邊欄
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  // 關閉側邊欄
  closeSidebar() {
    this.sidebarOpen = false;
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
          imgPath: "assets/S__222224406.jpg"
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
    if (this.foodSearchTerm && this.foodSearchTerm.length >= 0) {
      this.isSearching = true;
      this.searchFoodInStores(this.foodSearchTerm);
    }
  }

  // 獲取搜尋框提示文字
  getSearchPlaceholder(): string {
    return this.hasStoreData ? '輸入食物名稱...' : '請先搜尋商店';
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
    console.log('搜尋食物 - 商店資料:', stores);
    console.log('搜尋關鍵字:', searchTerm);
    
    if (!stores || stores.length === 0) {
      this.foodSearchResults = [];
      this.isSearching = false;
      return;
    }

    // 搜尋每個商店的商品
    stores.forEach((store: any, storeIndex: number) => {
      console.log(`商店 ${storeIndex}:`, store.label, store);
      
        if (store.label === '7-11' && store.CategoryStockItems) {
          console.log('7-11 商店商品分類:', store.CategoryStockItems);
          // 搜尋 7-11 商品
          store.CategoryStockItems.forEach((category: any, catIndex: number) => {
            console.log(`分類 ${catIndex}:`, category);
            if (category.ItemList) {
              category.ItemList.forEach((item: any, itemIndex: number) => {
                if (item.ItemName) {
                  const matchScore = this.calculateMatchScore(item.ItemName, searchTerm);
                  console.log(`商品 ${itemIndex}: ${item.ItemName}, 匹配分數: ${matchScore}`);
                  if (searchTerm.length === 0 || matchScore > 0) {
                    results.push({
                      foodName: item.ItemName,
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
        } else if (store.label === '全家' && store.info) {
          console.log('全家商店商品分類:', store.info);
          // 搜尋全家商品
          store.info.forEach((category: any, catIndex: number) => {
            console.log(`全家分類 ${catIndex}:`, category);
            if (category.categories) {
              category.categories.forEach((subCategory: any, subCatIndex: number) => {
                console.log(`全家子分類 ${subCatIndex}:`, subCategory);
                if (subCategory.products) {
                  subCategory.products.forEach((product: any, productIndex: number) => {
                    if (product.name) {
                      const matchScore = this.calculateMatchScore(product.name, searchTerm);
                      console.log(`全家商品 ${productIndex}: ${product.name}, 匹配分數: ${matchScore}`);
                      if (searchTerm.length === 0 || matchScore > 0) {
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
    });

    // 按精確度排序，然後按距離排序
    results.sort((a, b) => {
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore; // 精確度高的在前
      }
      return a.distance - b.distance; // 精確度相同時按距離排序
    });

    console.log('搜尋結果:', results);
    this.foodSearchResults = results;
    this.isSearching = false;
  }

  // 執行食物搜尋
  performFoodSearch(searchTerm: string) {
    return from(this.sevenElevenService.getAccessToken())
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
