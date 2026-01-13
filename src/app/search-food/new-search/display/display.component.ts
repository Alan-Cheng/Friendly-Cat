import { Component, Input, OnChanges, SimpleChanges, OnInit, ElementRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { Item, CategoryStockItem, FoodDetail711  } from '../../model/seven-eleven.model';  // 根據你的實際路徑導入模型
import { ProductModel, FoodDetailFamilyMart } from '../../model/family-mart.model'

import { ImageDialogComponent } from '../image-dialog/image-dialog.component';

import { SevenElevenRequestService } from '../services/seven-eleven-request.service';

import Fuse from 'fuse.js';

@Component({
  selector: 'app-display',
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.scss']
})
export class DisplayComponent implements OnChanges, OnInit {
  @Input() store!: any;  // 接收父組件傳遞的 store
  @Input() category!: any;  // 接收父組件傳遞的 category
  @Input() foodDetails!: any[];

  subCategories: any[] = [];
  subCategoriesName: string = '';
  itemsBySubCategory: { [key: string]: Item[] } = {};  // 儲存每個子分類的商品列表
  isLoading: boolean = false;

  constructor(
    private sevenElevenRequestService: SevenElevenRequestService,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    // 若組件輸入有變化時，重新載入子商品列表
    if (changes['category'] || changes['store']) {
      this.loadSubCategories();  // 重新加載子分類資料
    }
  }

  loadSubCategories() {
    if (this.store && this.category) {
      if (this.store.StoreName) {
        this.subCategories = this.category.Children;  // 更新子分類列表
        this.subCategoriesName = this.category.Name;
        this.loadItemsBySubCategory();  // 載入子分類下的所有商品資料
      }
      else if (this.store.name) {
        this.subCategories = this.category.categories
        // 全家直接把商品丟進itemsBySubCategory
        var items: Item[] = [];
        this.subCategories.forEach((cat) => {
          items.push(
            ...cat.products.map((product: ProductModel) => ({
              ItemName: product.name,       // 映射到 ItemName
              RemainingQty: product.qty,    // 映射到 RemainingQty
            }))
          );
          this.itemsBySubCategory[cat.name] = items || [];
          items = [];
        });
      }
    }
  }

  loadItemsBySubCategory() {
    if (this.store) {
      this.isLoading = true;
      this.sevenElevenRequestService.getItemsByStoreNo(this.store.StoreNo).subscribe(response => {
        if (response.isSuccess && response.element.StoreStockItem) {
          let categoryStockItems: CategoryStockItem[] = response.element.StoreStockItem.CategoryStockItems;

          // 7-11耍白痴，麵包跟甜點的分類裡面都有蛋糕，會造成子分類顯示錯誤
          // 懶得修正資料結構，直接愚蠢的修改食物子分類名稱來區分唄
          if (this.subCategoriesName == "甜點") {
            let sweetCakeId = "";
            this.subCategories = this.subCategories.map((subCategory) => {
              if (subCategory.Name === "蛋糕") {
                sweetCakeId = subCategory.ID;
                return { ...subCategory, Name: "冷藏蛋糕" };
              }
              return subCategory;
            });
            categoryStockItems = categoryStockItems.map((categoryStockItem) => {
              if (categoryStockItem.Name === "蛋糕" && categoryStockItem.NodeID.toString() == sweetCakeId) {
                return { ...categoryStockItem, Name: "冷藏蛋糕" };
              }
              return categoryStockItem;
            })
          }
          if (this.subCategoriesName == "麵包蛋糕") {
            let sweetCakeId = "";
            this.subCategories = this.subCategories.map((subCategory) => {
              if (subCategory.Name === "蛋糕") {
                sweetCakeId = subCategory.ID;
                return { ...subCategory, Name: "麵包蛋糕" };
              }
              return subCategory;
            });
            categoryStockItems = categoryStockItems.map((categoryStockItem) => {
              if (categoryStockItem.Name === "蛋糕" && categoryStockItem.NodeID.toString() == sweetCakeId) {
                return { ...categoryStockItem, Name: "麵包蛋糕" };
              }
              return categoryStockItem;
            })
          }

          this.subCategories.forEach(subCategory => {

            const items: Item[] = [];

            // 遍歷 CategoryStockItems，根據子分類名稱過濾並提取 ItemList
            categoryStockItems.forEach(category => {
              if (category.Name === subCategory.Name) {
                items.push(...category.ItemList);
              }
            });

            // 把結果保存到 itemsBySubCategory
            this.itemsBySubCategory[subCategory.Name] = items || [];
          });
        }
        this.isLoading = false;
      }, error => {
        console.error('Error loading items:', error);
        this.isLoading = false;
      });
    }
  }

  // getSubCategoryQty(subCategoryName: string): number {
  //   let qty = 0;
  //   const items = this.itemsBySubCategory[subCategoryName];
  //   if (items) {
  //     items.forEach(item => {
  //       qty += item.RemainingQty;
  //     });
  //   }
  //   return qty;
  // }

  getDiscountedPrice(originalPrice: string): string {
    // 解析原價
    const price = parseFloat(originalPrice.replace('NT$', '').trim());
    const currentTime = new Date();
    const currentHour = currentTime.getHours();

    let discountedPrice = price;

    // 設定折扣邏輯
    if (currentHour >= 19 && currentHour < 20) {
      discountedPrice *= 0.8; // 19:00~19:59 八折
    } else if ((currentHour >= 10 && currentHour < 18) || (currentHour >= 20 || currentHour < 3)) {
      discountedPrice *= 0.65; // 10:00~17:59 以及 20:00~03:00 六五折
    }
    else {
      // 待查清其餘時段是幾折==，目前假設八折
      discountedPrice *= 0.8;
    }
    return discountedPrice.toString();
  }

  getFoodDetail711(item: Item): FoodDetail711 {
    // 設置 Fuse.js 配置選項
    const options = {
      includeScore: true, // 需要包含匹配度分數
      threshold: 0.3, // 設置模糊搜尋的閾值，0.3 表示較為寬鬆的匹配
      keys: ['name'] // 搜尋的欄位是 'name'
    };

    // 初始化 Fuse 進行模糊搜尋
    const fuse = new Fuse(this.foodDetails, options);

    // 查找最匹配的項目
    const result = fuse.search(item.ItemName);

    // 如果找到匹配項，則返回最相似的那個
    const foodDetail = result.length > 0 ? result[0].item : {
      category: '',
      content: '',
      image: 'assets/此商品暫無圖片.png', // 默認圖片
      kcal: '',
      name: '',
      new: 'False',
      price: '',
      special_sale: 'False'
    };

    // 計算折扣後的價格
    const discountedPrice = this.getDiscountedPrice(foodDetail.price);

    // 將計算結果新增到 foodDetail 物件中
    foodDetail['discountedPrice'] = discountedPrice;
    foodDetail['originalPrice'] = foodDetail.price; // 原價

    return foodDetail;
  }

  getFoodDetailFamilyMart(item: Item): FoodDetailFamilyMart {
    // 設置 Fuse.js 配置選項
    const options = {
      includeScore: true,
      threshold: 0.3,
      keys: ['title']
    };

    // 初始化 Fuse 進行模糊搜尋
    const fuse = new Fuse(this.foodDetails, options);

    // 查找最匹配的項目
    const result = fuse.search(item.ItemName);

    // 如果找到匹配項，則返回最相似的那個
    const foodDetail = result.length > 0 ? result[0].item :
    {
      "category": "",
      "title": "",
      "picture_url": "assets/此商品暫無圖片.png",
      "Protein (g)": '',
      "Carb (g)": '',
      "Calories (kcal)": '',
      "Fat (g)": '',
      "Description": ""
    };
    return foodDetail;
  }

  openImageDialog(imageUrl: string): void {
    this.dialog.open(ImageDialogComponent, {
      data: { image: imageUrl },
      panelClass: 'custom-dialog' // 可用於自定義樣式
    });
  }
}
