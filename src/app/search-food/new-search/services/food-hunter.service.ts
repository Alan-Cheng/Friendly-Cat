import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from 'src/environments/environment';
import { RequestService } from 'src/app/services/request.service';
import { StoreStockItem, CategoryStockItem, FoodCategory } from '../../model/seven-eleven.model';
import { StoreModel, ProductCategoryModel, SubCategoryModel, ProductModel } from '../../model/family-mart.model';

export interface FoodHunterProduct {
  category: string;
  name: string;
  original_price: number | null;
  discount_price: number | null;
  quantity: number;
  image_url: string | null;
}

export interface FoodHunterStore {
  id: string;
  source: string;
  store_no: string;
  name: string;
  address: string;
  lat: number;
  lon: number;
  is_open: number;
  distance_m: number;
  updated_at: string;
  products: FoodHunterProduct[];
  total_qty: number;
}

export interface FoodHunterNearbyResponse {
  count: number;
  lat: number;
  lon: number;
  radius_km: number;
  stores: FoodHunterStore[];
}

// 分類名稱 → 圖示路徑映射
const CATEGORY_ICON_MAP: Record<string, string> = {
  '飯糰手卷': 'assets/category-icons/riceball.svg',
  '飯類主食': 'assets/category-icons/rice.svg',
  '麵類主食': 'assets/category-icons/noodle.svg',
  '三明治沙拉': 'assets/category-icons/sandwich.svg',
  '湯品小吃': 'assets/category-icons/soup.svg',
  '蔬果': 'assets/category-icons/vegetable.svg',
  '麵包甜點': 'assets/category-icons/bread.svg',
  '蛋糕吐司': 'assets/category-icons/cake.svg',
};

@Injectable({
  providedIn: 'root'
})
export class FoodHunterService {

  private baseUrl = environment.foodHunterUrl;

  constructor(private requestService: RequestService) {}

  getNearbyStores(lat: number, lon: number, radius: number = 2): Observable<FoodHunterNearbyResponse> {
    const url = `${this.baseUrl}/api/v1/nearby?lat=${lat}&lon=${lon}&radius=${radius}`;
    return this.requestService.get(url);
  }

  getStoreDetail(storeId: string): Observable<FoodHunterStore> {
    const url = `${this.baseUrl}/api/v1/store/${storeId}`;
    return this.requestService.get(url);
  }

  /**
   * 一次取得附近所有門市（7-11 + 全家），各自轉換為對應格式
   */
  getNearbyAllStores(lat: number, lon: number, radius: number = 2): Observable<{ sevenEleven: StoreStockItem[], familyMart: StoreModel[] }> {
    return this.getNearbyStores(lat, lon, radius).pipe(
      map(response => {
        const sevenStores = response.stores.filter(s => s.source === '7eleven');
        const familyStores = response.stores.filter(s => s.source === 'family');
        return {
          sevenEleven: sevenStores.map(store => this.transformToStoreStockItem(store)),
          familyMart: familyStores.map(store => this.transformToStoreModel(store))
        };
      })
    );
  }

  /**
   * 從 Food Hunter 回應中篩選 7-11 門市，並轉換為現有的 StoreStockItem 格式
   */
  getNearby711Stores(lat: number, lon: number, radius: number = 2): Observable<StoreStockItem[]> {
    return this.getNearbyStores(lat, lon, radius).pipe(
      map(response => {
        const sevenStores = response.stores.filter(s => s.source === '7eleven');
        return sevenStores.map(store => this.transformToStoreStockItem(store));
      })
    );
  }

  /**
   * 取得分類圖示路徑
   */
  getCategoryIcon(categoryName: string): string {
    return CATEGORY_ICON_MAP[categoryName] || 'assets/此商品暫無圖片.png';
  }

  /**
   * 將 Food Hunter 門市資料轉換為 StoreStockItem 格式（7-11）
   */
  private transformToStoreStockItem(store: FoodHunterStore): StoreStockItem {
    // 依分類分群商品
    const categoryMap = new Map<string, FoodHunterProduct[]>();
    for (const product of store.products) {
      const cat = product.category || '其他';
      if (!categoryMap.has(cat)) {
        categoryMap.set(cat, []);
      }
      categoryMap.get(cat)!.push(product);
    }

    // 轉換為 CategoryStockItems
    let nodeIdCounter = 90001;
    const categoryStockItems: CategoryStockItem[] = [];
    for (const [categoryName, products] of categoryMap) {
      const nodeId = nodeIdCounter++;
      categoryStockItems.push({
        NodeID: nodeId,
        Name: categoryName,
        RemainingQty: products.reduce((sum, p) => sum + p.quantity, 0),
        ItemList: products.map(p => ({
          ItemName: p.name,
          RemainingQty: p.quantity
        }))
      });
    }

    return {
      StoreNo: store.store_no,
      StoreName: store.name,
      Distance: store.distance_m,
      IsOperateTime: store.is_open === 1,
      RemainingQty: store.total_qty,
      CategoryStockItems: categoryStockItems,
    } as StoreStockItem;
  }

  /**
   * 將 Food Hunter 門市資料轉換為 StoreModel 格式（全家）
   */
  private transformToStoreModel(store: FoodHunterStore): StoreModel {
    // 依分類分群商品
    const categoryMap = new Map<string, FoodHunterProduct[]>();
    for (const product of store.products) {
      const cat = product.category || '其他';
      if (!categoryMap.has(cat)) {
        categoryMap.set(cat, []);
      }
      categoryMap.get(cat)!.push(product);
    }

    // 轉換為 ProductCategoryModel[]
    const info: ProductCategoryModel[] = [];
    for (const [categoryName, products] of categoryMap) {
      const totalQty = products.reduce((sum, p) => sum + p.quantity, 0);
      info.push({
        code: categoryName,
        name: categoryName,
        iconURL: this.getCategoryIcon(categoryName),
        qty: totalQty,
        categories: [{
          code: categoryName,
          name: categoryName,
          qty: totalQty,
          products: products.map(p => ({
            code: p.name,
            name: p.name,
            qty: p.quantity
          }))
        }]
      });
    }

    return {
      oldPKey: store.store_no,
      name: store.name,
      tel: null,
      post: null,
      city: null,
      areaCode: null,
      periodType: 0,
      longitude: store.lon,
      latitude: store.lat,
      distance: store.distance_m,
      address: store.address,
      updateDate: store.updated_at,
      info: info
    };
  }

  /**
   * 從 7-11 門市的商品資料動態建立 FoodCategory 列表
   * 用來取代原本從 7-11 API 取得的 foodCategories
   */
  buildFoodCategories(stores: StoreStockItem[]): FoodCategory[] {
    // 收集所有門市中出現的分類名稱及其總數量
    const categoryMap = new Map<string, number>();
    for (const store of stores) {
      for (const cat of store.CategoryStockItems) {
        categoryMap.set(cat.Name, (categoryMap.get(cat.Name) || 0) + cat.RemainingQty);
      }
    }

    // 建立 FoodCategory（每個分類只有一個子分類 = 自己）
    let idCounter = 90001;
    const categories: FoodCategory[] = [];
    for (const [name] of categoryMap) {
      const childId = idCounter++;
      categories.push({
        ID: idCounter++,
        Name: name,
        ImageUrl: this.getCategoryIcon(name),
        IsEnabled: true,
        Children: [{
          ID: childId,
          Name: name,
          IsEnabled: true,
          PCSCCategeroyNo: []
        }],
        PCSCCategeroyNo: []
      });
    }

    return categories;
  }

  /**
   * 確保門市的 CategoryStockItems 的 NodeID 與 foodCategories 的 Children ID 一致
   */
  alignStoreCategories(stores: StoreStockItem[], foodCategories: FoodCategory[]): void {
    // 建立分類名稱 → 子分類 ID 的映射
    const nameToNodeId = new Map<string, number>();
    for (const cat of foodCategories) {
      if (cat.Children.length > 0) {
        nameToNodeId.set(cat.Name, cat.Children[0].ID);
      }
    }

    // 更新每個門市的 CategoryStockItems 的 NodeID
    for (const store of stores) {
      for (const catStock of store.CategoryStockItems) {
        const nodeId = nameToNodeId.get(catStock.Name);
        if (nodeId !== undefined) {
          catStock.NodeID = nodeId;
        }
      }
    }
  }
}
