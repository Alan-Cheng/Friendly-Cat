export interface Location {
  Latitude: number;  // 經度
  Longitude: number; // 緯度
}

export interface LocationData {
  CurrentLocation: Location;  // 當前位置
  SearchLocation: Location;   // 搜索位置
}

export interface Item {
  ItemName: string;        // 商品名稱
  RemainingQty: number;    // 剩餘數量
}

export interface CategoryStockItem {
  NodeID: number;               // 與FoodSubCategory的ID是對照
  Name: string;                 // 食物子分類名稱
  RemainingQty: number;         // 剩餘數量
  ItemList: Item[];             // 該分類下的商品列表
}

export interface StoreStockItem {
  StoreNo: string;              // 商店編號
  StoreName: string;            // 商店名稱
  Distance: number;             // 與輸入位址的距離
  IsOperateTime: boolean;       // 是否營業
  RemainingQty: number;         // 該店總剩餘數量
  CategoryStockItems: CategoryStockItem[]; // 商店所有的分類庫存資料
  updateDate?: string;          // 資料更新時間
}

export interface StoreStockResponse {
  element: {
      StoreStockItemList: StoreStockItem[];  // 包含所有商店的庫存資料
  };
  message: string;                      // 成功信息
  isSuccess: boolean;                   // 是否成功
  extend: any;                          // 其他擴展數據（可根據實際需求進行擴展）
}

export interface FoodCategory {
  ID: number;                    // 分類 ID
  Name: string;                  // 食物分類名稱
  ImageUrl: string;              // 圖片 URL
  IsEnabled: boolean;            // 是否啟用
  Children: FoodSubCategory[];   // 子分類列表
  PCSCCategeroyNo: string[];     // 相關商品分類編號
}

export interface FoodSubCategory {
  ID: number;                     // 子分類 ID
  Name: string;                   // 子分類名稱
  IsEnabled: boolean;             // 是否啟用
  PCSCCategeroyNo: string[];      // 子分類編號
}

export interface FoodDetail711 {
  name: string;
  category: string;
  content: string;
  image: string;
  kcal: string;
  new: string;
  price: string;
  special_sale: string;
  originalPrice?: string; // 新增原價屬性
  discountedPrice?: string; // 新增折扣後價格屬性
}

export interface Store {
  StoreNo: string; // 商店編號
  StoreName: string; // 商店名稱
  StoreShortName: string; // 商店簡稱
  IsEnabled: boolean; // 商店是否啟用
  Latitude: number; // 緯度
  Longitude: number; // 經度
  Address: string; // 地址
  IsXStore: boolean; // 是否是 X Store
  IsOperateTime: boolean; // 是否有營業時間
  HasStock: boolean; // 是否有庫存
  Distance: number | null; // 距離，可能為 null
}
