import { Injectable } from '@angular/core';
import { RequestService } from 'src/app/services/request.service';
import { Observable, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LlmRequestService {

  url = "https://openrouter.ai/api/v1/chat/completions";
  model = "deepseek/deepseek-chat-v3-0324:free";
  
  constructor(
    private requestService: RequestService
  ) { }

  getLLMRes(foodDesc: string, storesInfo: any[]): Observable<any> {
    const body = JSON.stringify({
      model: this.model,
      messages: [
        {
          role: "system",
          content: `你是一個助手，專門根據商店資訊，篩選出符合指定食物類型的商品。
      這邊提供Json格式的商店資訊給你：
      ${this.jsonListToString(storesInfo)}

      1. 你的回應必須是**純 JSON 格式**，不包含任何解釋或額外文字。

      2. 當匹配 foodDesc 與商店中的 foodInfo 時，請檢查 foodInfo 中的商品名稱是否包含 foodDesc 的關鍵字（不區分大小寫）。如果 foodDesc 是多個詞，則只需部分匹配即可。

      3. 如果 foodDesc 中提到特定商店類型，請只檢查該類型的商店：
      - 全家便利商店：識別詞包括「全家」「FamilyMart」「Fmaily」「全家便利商店」。
      - 7-11便利商店：識別詞包括「7-11」「711」「統一超商」「七十一」。
      如果 foodDesc 未指定商店類型，則檢查所有商店的 foodInfo。

     4. 如果 foodDesc 不涉及商店內商品（例如天氣、時間、地址等無關查詢），請回傳：
      \`\`\`json
      { "stores": [], "error": "我只能幫忙搜尋商店內的食品資訊啦😳" }
      \`\`\`

      5. 如果沒有符合條件的商品，請回傳：
      \`\`\`json
      { "stores": [] }
      \`\`\`
      `
        },
        {
          role: "user",
          content: `${foodDesc}。
      
      請只回傳 JSON 格式，不要有其他解釋，格式如下：
      \`\`\`json
      {
        "stores": [
        {
          "storeName": "商店名稱",
          "distance": "距離",
          "items": [
          "符合條件的商品1",
          "符合條件的商品2"
          ]
        }
        ]
      }
      \`\`\`
      `
        }
      ],
      max_tokens: 6000,
    });

    return this.requestService.get("https://square-water-d5e4.jhcheng-alan.workers.dev/").pipe(
      switchMap(res => {
        const headers = new Headers({
          "Authorization": res.token,
          "Content-Type": "application/json",
        });

        return this.requestService.post(this.url, null, body, headers);
      })
    );
  }

  private jsonListToString(json: any[]): string {
    return json.map(item => JSON.stringify(item)).join(', ');
  }
}
