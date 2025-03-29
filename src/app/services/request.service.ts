import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RequestService {

  constructor(private http: HttpClient) {}

  get(url: string, params: any = {}): Observable<any> {
    let httpParams = new HttpParams();

    // 處理 query parameters
    for (const key in params) {
      if (params.hasOwnProperty(key)) {
        httpParams = httpParams.set(key, params[key]);
      }
    }

    // 發送 GET 請求
    return this.http.get(url, { params: httpParams });
  }

  post(url: string, params?: any, body?: any, headers?: any): Observable<any> {
    let httpParams = new HttpParams();

    // 直接將 params 加入 httpParams，不做物件檢查
    if (params) {
      for (const key in params) {
        if (params.hasOwnProperty(key)) {
          httpParams = httpParams.set(key, params[key]);
        }
      }
    }

    // 發送 POST 請求
    return this.http.post(url, body || {}, { params: httpParams, headers });
  }
}
