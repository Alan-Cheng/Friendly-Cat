import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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

@Component({
  selector: 'app-new-search',
  templateUrl: './new-search.component.html',
  styleUrls: ['./new-search.component.scss'],
})
export class NewSearchComponent implements OnInit {
  user: any = null;

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
  unifiedDropDownList: any[] = [];


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
    this.searchInput$
    .pipe(
      debounceTime(300), // 等待使用者停止輸入 300ms
      distinctUntilChanged() // 避免重複的相同輸入
    )
    .subscribe((input) => {
      this.handleSearch(input);
    });
    this.init();
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

    of(true).pipe(
      switchMap(() => {
        return this.sevenElevenService.getAccessToken();
      }),
      switchMap((token: any) => {
        if (token && token.element) {
          sessionStorage.setItem('711Token', token.element);
          console.log('Stored 711Token');
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
    this.selectedCategory = category;
    this.selectedStore = store;
  }

  onInput(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    this.searchInput$.next(input); // 將輸入值推到 Subject
  }

  // 這寫的真他媽醜到爆
  handleSearch(input: string): void {
    if (input.length >= 2) {
      this.loadingService.show("正在為您搜尋店家");

      this.unifiedDropDownList = [];

      // 要先取得所在位置用於後續下拉選單搜尋排序
      if (!this.latitude && !this.longitude) {
        from(this.geolocationService.getCurrentPosition())
          .pipe(
            switchMap((position) => {
              const lat = position.coords.latitude;
              const lng = position.coords.longitude;

              this.latitude = lat;
              this.longitude = lng;

              console.log('已取得位置');

              return of([]);
            }),
            switchMap(() => {
              return this.sevenElevenService.getAccessToken();
            }),
            switchMap((token) => {
              if (token && token.element) {
                sessionStorage.setItem('711Token', token.element);
                return  this.sevenElevenService.getStoreByAddress(input);
              }
              else{
                return [];
              }
            })
          ).subscribe((data) => {
            if(data && data.isSuccess){
              this.dropDown711List = data.element;

              // 刪掉全家兩個字以免使用者誤搜，篩選 unifiedDropDownList，篩選條件是 Name 和 addr 都包含 input
              const filteredDropDownFamilyMartList = this.dropDownFamilyMartList
              .map(item => ({
                ...item,
                Name: item.Name.replace('全家', '')  // 去除 "全家" 字串
              }))
              .filter(item =>
                item.Name.includes(input) || item.addr.includes(input)
              );

              // 刪掉711兩個字以免使用者誤搜，篩選 unifiedDropDownList，篩選條件是 Name 和 addr 都包含 input
              const filteredDropDown711List = this.dropDown711List
              .map(item => ({
                ...item,
                Name: item.StoreName.replace('711', '')  // 去除 "全家" 字串
              }))
              .filter(item =>
                item.Name.includes(input) || item.Address.includes(input)
              );

              // 統一兩個列表的名稱欄位
              const normalizedFamilyMartList = filteredDropDownFamilyMartList.map(item => ({
                name: item.Name,  // 統一名稱欄位
                addr: item.addr,
                label: '全家',
                longitude: item.px_wgs84,
                latitude: item.py_wgs84
              }));

              const normalized711List = filteredDropDown711List.map(item => ({
                name: item.StoreName,  // 統一名稱欄位
                addr: item.Address,
                label: '7-11',
                longitude: item.Longitude,
                latitude: item.Latitude
              }));

              normalized711List.forEach(item => {
                if (!this.unifiedDropDownList.some(existingItem => existingItem.name === item.name && existingItem.addr === item.addr)) {
                  this.unifiedDropDownList.push(item);  // 只有當 unifedDropDownList 中沒有該元素時才添加
                }
              });

              normalizedFamilyMartList.forEach(item => {
                if (!this.unifiedDropDownList.some(existingItem => existingItem.name === item.name && existingItem.addr === item.addr)) {
                  this.unifiedDropDownList.push(item);  // 只有當 unifedDropDownList 中沒有該元素時才添加
                }
              });

              // 按照經緯度算出距離排序unifiedDropDownList
              const nameGroup = this.unifiedDropDownList
                .filter(item => item.name.includes(input)) // 篩選 name 包含 input 的元素
                .sort((a, b) => {
                  const distanceA = getDistance(
                    { latitude: this.latitude, longitude: this.longitude },
                    { latitude: a.latitude, longitude: a.longitude }
                  );
                  const distanceB = getDistance(
                    { latitude: this.latitude, longitude: this.longitude },
                    { latitude: b.latitude, longitude: b.longitude }
                  );
                  return distanceA - distanceB; // 按距離升序排序
                });

              const addrGroup = this.unifiedDropDownList
                .filter(item => item.addr.includes(input) && !nameGroup.includes(item)) // 篩選 addr 包含 input 的元素，排除已在 nameGroup 的元素
                .sort((a, b) => {
                  const distanceA = getDistance(
                    { latitude: this.latitude, longitude: this.longitude },
                    { latitude: a.latitude, longitude: a.longitude }
                  );
                  const distanceB = getDistance(
                    { latitude: this.latitude, longitude: this.longitude },
                    { latitude: b.latitude, longitude: b.longitude }
                  );
                  return distanceA - distanceB; // 按距離升序排序
                });

              this.unifiedDropDownList = [...nameGroup, ...addrGroup];

              if (this.unifiedDropDownList.length === 0) {
                this.loadingService.show("好像找不到店家耶～請重新搜尋");
                setTimeout(() => {
                  this.loadingService.hide();
                }, 2000);
              }
              else{
                this.loadingService.hide();
              }
            }
          },
          (error) => {
            console.error('API 請求錯誤:', error);
            this.loadingService.hide();
          }
        );
      }
      else {
        of(true).pipe(
          switchMap(() => {
            return this.sevenElevenService.getAccessToken();
          }),
          switchMap((token) => {
            if (token && token.element) {
              sessionStorage.setItem('711Token', token.element);
              return this.sevenElevenService.getStoreByAddress(input)
            }
            else {
              return of([])
            }
          })
        ).subscribe((data) => {
          if (data && data.isSuccess) {
            this.dropDown711List = data.element;

            // 刪掉全家兩個字以免使用者誤搜，篩選 unifiedDropDownList，篩選條件是 Name 和 addr 都包含 input
            const filteredDropDownFamilyMartList = this.dropDownFamilyMartList
              .map(item => ({
                ...item,
                Name: item.Name.replace('全家', '')  // 去除 "全家" 字串
              }))
              .filter(item =>
                item.Name.includes(input) || item.addr.includes(input)
              );

            // 刪掉711兩個字以免使用者誤搜，篩選 unifiedDropDownList，篩選條件是 Name 和 addr 都包含 input
            const filteredDropDown711List = this.dropDown711List
            .map(item => ({
              ...item,
              Name: item.StoreName.replace('711', '')  // 去除 "全家" 字串
            }))
            .filter(item =>
              item.Name.includes(input) || item.Address.includes(input)
            );

            // 統一兩個列表的名稱欄位
            const normalizedFamilyMartList = filteredDropDownFamilyMartList.map(item => ({
              name: item.Name,  // 統一名稱欄位
              addr: item.addr,
              label: '全家',
              longitude: item.px_wgs84,
              latitude: item.py_wgs84
            }));

            const normalized711List = filteredDropDown711List.map(item => ({
              name: item.StoreName,  // 統一名稱欄位
              addr: item.Address,
              label: '7-11',
              longitude: item.Longitude,
              latitude: item.Latitude
            }));

            normalized711List.forEach(item => {
              if (!this.unifiedDropDownList.some(existingItem => existingItem.name === item.name && existingItem.addr === item.addr)) {
                this.unifiedDropDownList.push(item);  // 只有當 unifedDropDownList 中沒有該元素時才添加
              }
            });

            normalizedFamilyMartList.forEach(item => {
              if (!this.unifiedDropDownList.some(existingItem => existingItem.name === item.name && existingItem.addr === item.addr)) {
                this.unifiedDropDownList.push(item);  // 只有當 unifedDropDownList 中沒有該元素時才添加
              }
            });

            const nameGroup = this.unifiedDropDownList
              .filter(item => item.name.includes(input)) // 篩選 name 包含 input 的元素
              .sort((a, b) => {
                const distanceA = getDistance(
                  { latitude: this.latitude, longitude: this.longitude },
                  { latitude: a.latitude, longitude: a.longitude }
                );
                const distanceB = getDistance(
                  { latitude: this.latitude, longitude: this.longitude },
                  { latitude: b.latitude, longitude: b.longitude }
                );
                return distanceA - distanceB; // 按距離升序排序
              });

            const addrGroup = this.unifiedDropDownList
              .filter(item => item.addr.includes(input) && !nameGroup.includes(item)) // 篩選 addr 包含 input 的元素，排除已在 nameGroup 的元素
              .sort((a, b) => {
                const distanceA = getDistance(
                  { latitude: this.latitude, longitude: this.longitude },
                  { latitude: a.latitude, longitude: a.longitude }
                );
                const distanceB = getDistance(
                  { latitude: this.latitude, longitude: this.longitude },
                  { latitude: b.latitude, longitude: b.longitude }
                );
                return distanceA - distanceB; // 按距離升序排序
              });

            this.unifiedDropDownList = [...nameGroup, ...addrGroup];

            if (this.unifiedDropDownList.length === 0) {
              this.loadingService.show("好像找不到店家耶～請重新搜尋");
              setTimeout(() => {
                this.loadingService.hide();
              }, 2000);
            }
            else {
              this.loadingService.hide();
            }
          }
        },
        (error) => {
          console.error('API 請求錯誤:', error);
          this.loadingService.hide();
        });
      }
    } else {
      this.unifiedDropDownList = [];
    }
  }

  onOptionSelect(event: MatAutocompleteSelectedEvent | null, lat?: number, lng?: number): void {
    // 變更搜尋模式
    this.isLocationSearchMode = false;

    // 清除商店列表
    this.totalStoresShowList = [];

    // 從選中的選項中獲取值
    this.searchSelectedStore = event?.option.value.name;

    this.searchTerm =  event?.option.value.label + event?.option.value.name.replace('店', '') + '門市'

    const label = event?.option.value.label;
    const storeName = event?.option.value.name;
    const storeLongitude = lng !== undefined ? lng : Number(event?.option.value.longitude);
    const storeLatitude = lat !== undefined ? lat : Number(event?.option.value.latitude);
    // console.log('Store Type:', label);
    // console.log('Store Name:', storeName);
    // console.log('Store Longitude:', storeLongitude);
    // console.log('Store Latitude:', storeLatitude);
    // console.log('Selected Option:', event.option.value);

    this.loadingService.show("正在搜尋店家喵")
    from(this.geolocationService.getCurrentPosition())
      .pipe(
        switchMap((position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          this.latitude = lat;
          this.longitude = lng;

          console.log('已取得位置');

          return of([]);
        }),
        switchMap((res) => {
          if(res) {
            return this.sevenElevenService.getAccessToken();
          }
          else{
            return [];
          }
        }),
        switchMap((token: any) => {
          if (token && token.element) {
            sessionStorage.setItem('711Token', token.element);
            console.log('Stored 711Token');
            // 如果 token 儲存成功，發送 getFoodCategory 請求
            return this.sevenElevenService.getFoodCategory();
          } else {
            // 如果 token 沒有成功返回，返回空陣列
            return of([]);
          }
        })
      ).subscribe(
        (res) => {
          if (res) {
            this.searchCombineAndTransformStores(storeLatitude, storeLongitude);
            this.loadingService.hide();
          } else {
            console.error('Failed to fetch food categories');
            this.loadingService.hide();
          }
        }
      );
  }

  onSubmit(): void {
    console.log('輸入的搜尋關鍵字:', this.searchSelectedStore);
  }

  onUseCurrentLocation(): void {
    // 變更搜尋模式
    this.isLocationSearchMode = true;

    // 清除商店列表
    this.totalStoresShowList = [];

    // 清除輸入的搜尋條件
    this.unifiedDropDownList = [];
    this.searchTerm = '';

    this.loadingService.show("搜尋店家中喵")
    from(this.geolocationService.getCurrentPosition())
      .pipe(
        switchMap((position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          this.latitude = lat;
          this.longitude = lng;

          console.log('已取得位置');

          return of([]);
        }),
        switchMap((res) => {
          if(res) {
            return this.sevenElevenService.getAccessToken();
          }
          else{
            return [];
          }
        }),
        switchMap((token: any) => {
          if (token && token.element) {
            sessionStorage.setItem('711Token', token.element);
            console.log('Stored 711Token');
            // 如果 token 儲存成功，發送 getFoodCategory 請求
            return this.sevenElevenService.getFoodCategory();
          } else {
            // 如果 token 沒有成功返回，返回空陣列
            return of([]);
          }
        })
      ).subscribe(
        (res) => {
          if (res) {
            this.searchCombineAndTransformStores();
            this.loadingService.hide();
          } else {
            console.error('Failed to fetch food categories');
            this.loadingService.hide();
          }
        }
      );
  }

  combineStoreList(storeLatitude?: number, storeLongitude?: number): void {
    // 清空統一列表，避免重複累加
    this.totalStoresShowList = [];

    // 處理7-11商店
    this.nearby711Stores.forEach((store) => {
      const transformedStore = {
        ...store,
        storeName: `7-11${store.StoreName}門市`,
        label: '7-11',
        distance: store.Distance, // 統一使用 `distance` 字段
        remainingQty: store.RemainingQty,
        showDistance: true
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
      console.log('使用者搜尋店家附近的商店:', this.totalStoresShowList);
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
      console.log('使用者附近的商店:', this.totalStoresShowList);
    }
  }

  searchCombineAndTransformStores(storeLatitude?: number, storeLongitude?: number): void {
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



    // 結合兩個 API 請求
    forkJoin({
      sevenEleven: this.sevenElevenService.getNearByStoreList(locationData711),
      familyMart: this.familyMartService.getNearByStoreList(locationFamilyMart)
    }).subscribe(
      ({ sevenEleven, familyMart }) => {
        // 處理 7-11 資料
        if (sevenEleven && sevenEleven.element && sevenEleven.element.StoreStockItemList) {
          this.nearby711Stores = sevenEleven.element.StoreStockItemList.sort(
            (a: StoreStockItem, b: StoreStockItem) => a.Distance - b.Distance
          );
        }

        // 處理全家資料
        if (familyMart && familyMart.code === 1) {
          this.nearbyFamilyMartStores = familyMart.data.sort(
            (a: StoreModel, b: StoreModel) => a.distance - b.distance
          );
        }

        // 等兩者完成後合併資料
        if (storeLatitude && storeLongitude) {
          this.combineStoreList(storeLatitude, storeLongitude);
          this.storeDataService.setStores(this.totalStoresShowList);
          this.storeDataService.setIsUserLocationSearch(false);
        }
        else{
          this.combineStoreList();
          this.storeDataService.setStores(this.totalStoresShowList);
          this.storeDataService.setIsUserLocationSearch(true);
        }
      },
      (error) => {
        console.error('Error fetching store data:', error);
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
        console.log('favoriteStores', this.favoriteStores)
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
            imgPath: "assets/S__222224406.jpg"
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
            imgPath: "assets/S__222224406.jpg"
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
      console.log('用戶尚未登入或信箱未驗證');
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
    console.log("搜尋收藏店家", store);
    this.loadingService.show("幫你找看看唷");
    // 用最白癡的方法，把店家的經緯度找出來，直接用onOptionSelect()搞一波
    var lat = 0;
    var lng = 0;
    if (store.label === "全家") {
      lat = store.storeFLatitude;
      lng = store.storeFLongitude;
      this.onOptionSelect(null, lat, lng);
      this.searchTerm = '';
    }
    else {
      from(this.geolocationService.getCurrentPosition())
        .pipe(
          switchMap((position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            this.latitude = lat;
            this.longitude = lng;

            return of([]);
          }),
          switchMap((res) => {
            if(res) {
              return this.sevenElevenService.getAccessToken();
            }
            else{
              return [];
            }
          }),
          switchMap((token: any) => {
            if (token && token.element) {
              sessionStorage.setItem('711Token', token.element);
              return this.sevenElevenService.getStoreByAddress(store.store711Name);
            } else {
              // 如果 token 沒有成功返回，返回空陣列
              return of([]);
            }
          })
        ).subscribe(
          (res) => {
            if (res) {
              lat = res.element[0].Latitude;
              lng = res.element[0].Longitude;
              console.log(lat, lng);
              this.onOptionSelect(null, lat, lng);
              this.searchTerm = '';
            } else {
              console.error('Failed to fetch food categories');
              this.loadingService.hide();
            }
          }
        );
    }
  }

  // 處理食物搜尋結果
  onFoodSearchResult(result: any) {
    console.log("食物搜尋結果", result);
    this.loadingService.show("正在跳轉到商店...");
    
    // 根據商店類型處理跳轉
    if (result.storeType === '7-11') {
      // 7-11 商店跳轉
      this.onOptionSelect(null, result.store.Latitude, result.store.Longitude);
    } else if (result.storeType === '全家') {
      // 全家商店跳轉
      this.onOptionSelect(null, result.store.latitude, result.store.longitude);
    }
    
    this.searchTerm = '';
    this.loadingService.hide();
  }
}
