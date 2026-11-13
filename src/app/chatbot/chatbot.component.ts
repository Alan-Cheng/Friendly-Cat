import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ViewChild, ElementRef, OnInit } from '@angular/core';
import { forkJoin, of, map, Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { SearchFoodModule } from '../search-food/search-food.module';
import { StoreDataService } from '../services/stores-data.service';
import { SevenElevenRequestService } from '../search-food/new-search/services/seven-eleven-request.service';
import { LlmRequestService } from './services/llm-request.service';
import { Store, StoreResponse } from './model/llm-res.model';

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    SearchFoodModule
  ],
})
export class ChatbotComponent {
  @ViewChild('chatBody') chatBody!: ElementRef; // Reference to the chat body

  isLogin: boolean = false;
  storesInfo: any[] = [];
  isUserLocationSearch: boolean = true;
  isOpen = false;
  userInput = '';
  userName = '';
  messages: { text: string; sender: string; isLoading?: boolean }[] = [];

  // 為了讓 7-11 商品搜尋更精準而建立的Map
  sevenElevenFoodCategoryMap = new Map<string, number[]>([
    ["便當粥品", [137, 139, 140, 142, 143, 185, 187, 192]],
    ["麵食", [144, 146, 149, 151, 153, 155]],
    ["生鮮蔬果", [157, 158]],
    ["沙拉", [160, 159, 189]],
    ["配菜湯品", [161, 162]],
    ["飯糰手卷", [163, 164, 165, 166, 167]],
    ["麵包蛋糕", [168, 169, 170, 171]],
    ["三明治堡類", [172, 178, 174, 175, 176, 177, 190, 191]],
    ["甜點", [179, 180, 181, 182, 183]]
  ]);

  constructor(
    private authService: AuthService,
    private storeDataService: StoreDataService,
    private sevenElevenRequestService: SevenElevenRequestService,
    private llmRequestService: LlmRequestService
  ) { }

  ngOnInit() {
    this.authService.isLoggedIn().subscribe((res) => {
      this.isLogin = res;
    });
    this.authService.getUser().subscribe((user) => {
      if (!user) {
        this.isLogin = false;
        this.putMessage(`嗨～！ 想找什麼類型的食物呢？`, "bot");
        return;
      }
        this.userName = user.displayName;
        this.putMessage(`歡迎回來～${this.userName}！ 想找什麼類型的食物呢？`, "bot")
    });
    this.storeDataService.isLocationSearch$.subscribe(isLocationSearch => {
      this.isUserLocationSearch = isLocationSearch;
    });
  }

  toggleChat(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.isOpen = !this.isOpen;
  }

  handleEnter(event: Event) {
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.isComposing) {
      event.preventDefault();
      return;
    }
    this.sendMessage();
  }

  sendMessage() {
    if (this.userInput.trim()) {
      // 手動篩掉711空店（711 API 會回傳所有店家資料)，只保留有商品的前 10 筆資料
      this.storesInfo = this.storeDataService.getStores()
        .filter(store => !(store.label === '7-11' && store.remainingQty === 0))
        .slice(0, 10);


      const input = this.userInput;
      this.userInput = ''; // 清空輸入
      // 加入使用者訊息
      this.putMessage(input, 'user');

      if (this.messages.length > 0 && this.messages[this.messages.length - 1].isLoading) {
        this.putMessage('正在搜尋中，搜尋完畢後請重新查詢...', 'bot', false);
        return;
      }

      if (this.storesInfo.length === 0) {
        this.putMessage('請先點擊「使用目前位置」搜尋按鈕，才能幫你看附近商店唷！', 'bot');
        return;
      } else {
        this.putMessage('正在搜尋附近的便利商店...', 'bot', true);

        // 確保 7-11 資料取得後再送到 LLM
        this.requestSevenInfoAndCombineFm().subscribe(updatedStores => {
          this.storesInfo = updatedStores; // 更新 storesInfo

          this.llmRequestService.getLLMRes(input, this.storesInfo).subscribe({
            next: (res) => {
              this.messages = this.messages.filter(msg => !msg.isLoading);
              try {
                let content = res.choices[0].message.content.trim();
                content = content.replace(/```(json)?/g, '');
                const resObj: StoreResponse = JSON.parse(content);
                
                if (!resObj.stores) {
                  throw new Error('Invalid store response format');
                }

                if (resObj.error) {
                  this.putMessage(resObj.error, "bot");
                  return;
                }

                if (resObj.stores.length === 0) {
                  this.putMessage("找不到你想要的東西QQ", "bot");
                  return;
                }

                let messageText = "🐈‍⬛：這些商店有你想要的！\n\n";
                resObj.stores.forEach((store: Store) => {
                  messageText += `🏪 ${store.storeName}  \n`;
                  if (this.isUserLocationSearch) {
                    messageText += `（📍 距離您 ${store.distance.toFixed(0)} 公尺）\n`;
                  }
                  else {
                    messageText += `（📍 距離您搜尋的商店 ${store.distance.toFixed(0)} 公尺）\n`;
                  }
                  if (store.items.length > 0) {
                    messageText += `${store.items.map((item, index) => `${index + 1}. ${item}`).join("\n")}\n\n`;
                  } else {
                    messageText += `⚠️ 這間店沒有找到相關商品\n\n`;
                  }
                });

                this.putMessage(messageText, 'bot');
              } catch (e) {
                console.error('JSON parse error:', e);
                this.putMessage('處理商店資訊時發生錯誤，請稍後再試', "bot");
              }
            },
            error: (err) => {
              console.error('API request error:', err);
              this.putMessage('無法取得商店資訊，請稍後再試', "bot");
            }
          });
        });
      }
    }
  }


  putMessage(message: string, sender: string, isLoading?: boolean) {
    if (sender === 'bot') {
      setTimeout(() => {
        this.messages.push({ text: message, sender: sender, isLoading: isLoading });
      }, 500);
    }
    else{
      this.messages.push({ text: message, sender: sender });
    }
  }

  // Auto-scroll to bottom after view updates
  ngAfterViewChecked() {
    if (this.isOpen && this.chatBody) {
      this.scrollToBottom();
    }
  }

  private scrollToBottom(): void {
    const element = this.chatBody.nativeElement;
    element.scrollTop = element.scrollHeight;
  }

  private requestSevenInfoAndCombineFm(): Observable<any[]> {
    const requests = this.storesInfo.map(storeInfo => {
      return storeInfo.StoreNo
        ? this.sevenElevenRequestService.getItemsByStoreNo(storeInfo.StoreNo).pipe(
            map(res => ({
              "storeName": storeInfo.storeName,
              "distance": storeInfo.distance,
              "foodInfo": res.element.StoreStockItem.CategoryStockItems.map((item: any) => ({
                "category": this.getCategoryNameByNodeID(item.NodeID),
                "RemainingQty": item.RemainingQty,
                "ItemList": item.ItemList
              }))
            }))
          )
        : of({
            "storeName": storeInfo.storeName,
            "distance": storeInfo.distance,
            "foodInfo": storeInfo.info
          });
    });
  
    return forkJoin(requests).pipe(
      map(results => results.filter(result => result.foodInfo.length > 0))
    );
  }

  private getCategoryNameByNodeID(nodeID: number): string {
    for (const [category, ids] of this.sevenElevenFoodCategoryMap.entries()) {
      if (ids.includes(nodeID)) {
        return category;
      }
    }
    return "未知分類";
  }

  isStoreMessage(text: string): boolean {
    return text.includes('🏪') && text.includes('距離');
  }

  formatStoreMessage(text: string): string {
    const lines = text.split('\n');
    let formatted = '';
    let isFirstStore = true;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('🏪')) {
        if (!isFirstStore) {
          formatted += '<br>'; // 在每間店資訊前加空行
        }
        else {
          formatted += '<br>';
        }
        const storeName = lines[i].substring(1).trim();
        let storeNameEncoded = '';
        try {
          storeNameEncoded = encodeURIComponent(storeName);
        } catch (e) {
          storeNameEncoded = encodeURIComponent(storeName.replace(/[^\w\u4e00-\u9fa5]/g, ''));
        }
        formatted += `${lines[i]} <a href="https://www.google.com/maps/search/${storeNameEncoded}" target="_blank" style="display: inline-block; margin-left: 5px;"><img src="assets/GoogleMap_icon.png" alt="Google 地圖" class="w-3 h-3 inline-block" style="width: 16px; height: 16px; vertical-align: middle;"></a><br>`;
        isFirstStore = false;
      } else if (lines[i].trim() !== '') {
        formatted += `${lines[i]}<br>`;
      }
    }
    
    return formatted;
  }
}
