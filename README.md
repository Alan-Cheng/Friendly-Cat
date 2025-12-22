# 友善黑貓 FriendlyCat App

### 功能

* 2025/12：店家搜尋新增「同音搜尋」，例如： 辛巴裡 -> 可以搜尋到 鑫巴黎 便利商店

* 2025/03：新增聊天機器人功能，可使用對話搜尋食物

* 查詢所在位置附近便利商店的即期商品

* 以店家名稱、地址查詢特定店家即期商品

* 全家便利商店(FamilyMart)顯示：
    1. 商品圖片
    2. 商品資訊
* 7-11(Seven-Eleven)顯示：
    1. 商品圖片
    2. 商品價格
    3. 商品資訊
* 會員功能 - 收藏喜愛的商店

## DEMO
#### 連結： [友善黑貓](https://friendlycat.alan-cheng.com/)
>
>
>
>### 1. 搜尋功能
>
> * 關鍵字彈出可選店家，點擊店家顯示該店家搜尋結果
>
> * 點選「使用目前位置」則以目前為中心搜尋附近店家，並顯示距離
>
>![友善黑貓搜尋頁](https://github.com/Alan-Cheng/Friendly-Cat/blob/main/demo/search.png?raw=true "搜尋頁面")
>
>
>### 2. 商品列表
>
> - 點選食物分類，顯示該分類下各商品詳細資訊
>
>![友善黑貓商品頁](https://github.com/Alan-Cheng/Friendly-Cat/blob/main/demo/store_product.png?raw=true "商品頁面")
>
>
>### 3. 會員功能
>
> - 加入會員後可由導覽列登入，商店右方愛心可將該店加入收藏
>
>![友善黑貓會員功能](https://github.com/Alan-Cheng/Friendly-Cat/blob/main/demo/member.png?raw=true "會員功能")
>
>
>### 4. 聊天機器人功能
>
> - 可使用聊天機器人，自動搜尋想找的食物資訊
>
>![友善黑貓聊天機器人功能](https://github.com/Alan-Cheng/Friendly-Cat/blob/main/demo/chatbot.png?raw=true "聊天機器人功能")



## 技術工具



>| 技術  | 版本 |
>| ------------- |:-------------:|
>| Angular       | ^14.2.0      |
>| Node.js       | 18.20.4      |
>| TypeScript    | ~4.7.2       |
>| Tailwindcss   | ^2.2.19      |
>| Python        | 3.12.4       |
>| Firebase Authentication      | --           |
>| Firebase Storage        | --       |
>| Cloudflare Worker        | --       |
>| Chatbot(OpenRouter-DeepSeek V3)      | --       |

---

> ## 執行開發伺服器
>>
>使用指令`ng serve` 啟動於`http://localhost:4200/`，偵測到更新時會自動刷新畫面。

> ## Local Build 指令
>
>- 輸出靜態資源於/docs，加上專案名稱前綴為GitHub-Pages存取路徑：
>
>`ng build --configuration=production --base-href /Friendly-Cat/ --output-path=docs --aot`
>
>- 輸出於專案根目錄之/dict/<專案名稱>：
>
>`ng build --configuration=production --aot`
>

> ## iOS APP Build指令
>
>
> - 輸出靜態資源於專案根目錄之/dist：
>
>`ng build --configuration=production --output-path=dist --aot`
>
> - 將更新後的打包檔案同步至iOS專案資料夾：
>
>`npx cap sync ios`
>
> - 開啟Xcode：
>
>`npx cap open ios`
>

> ## 部署
>
> - **GitHub Pages**: 自動部署到 `https://alan-cheng.github.io/Friendly-Cat/`
> - **Cloudflare Pages**: 自動部署到 `https://friendlycat.alan-cheng.com/`
