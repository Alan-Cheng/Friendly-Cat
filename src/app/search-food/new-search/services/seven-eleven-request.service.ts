import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { RequestService } from 'src/app/services/request.service'
import { LocationData } from '../../model/seven-eleven.model';

@Injectable({
  providedIn: 'root'
})
export class SevenElevenRequestService {

  constructor(
    private requestService: RequestService
  ) { }

  baseUrl = environment.sevenElevenUrl.base;

  // 711 AccessToken：使用硬編的 GET URL（含 mid_v）
  // 注意：這裡的 mid_v 必須和你實際要用的值一致。
  private readonly accessTokenUrl =
    'https://lovefood.openpoint.com.tw/iMap/api/Auth/FrontendAuth/AccessToken?mid_v=W0_DiF4DlgU5OeQoRswrRcaaNHMWOL7K3ra3381ocZUv-rZOWy2ZuIctH6X-7pjiccl0C5h51bVSb-Vc7VdFc8eiLEWettduAYML-s4z4Tx0vcl7gJla5iV0H3-8dZfAScnAjUK64qr9LIO_hBZ_Sam6D0LAnYK9Lb0DZuU6zny78mxnpW__-6Ifuiw';

  /**
   * 使用硬編 URL 取回 AccessToken 的 element 裡 JWT。
   */
  getAccessToken(): Observable<any> {
    return this.requestService.post(this.accessTokenUrl);
  }

  getStoreByAddress(keyword: string): Observable<any> {
    const url = this.baseUrl + environment.sevenElevenUrl.endpoint.getStoreByAddress;
    const params = {
      'token': sessionStorage.getItem('711Token'),
      'keyword': keyword
    };
    return this.requestService.post(url, params);
  }

  getNearByStoreList(location: LocationData): Observable<any> {
    const url = this.baseUrl + environment.sevenElevenUrl.endpoint.getNearbyStoreList;
    const params = {
      'token': sessionStorage.getItem('711Token')
    };
    return this.requestService.post(url, params, location)
  }

  getFoodCategory(): Observable<any> {
    const url = this.baseUrl + environment.sevenElevenUrl.endpoint.getList;
    const params = {
      'token': sessionStorage.getItem('711Token')
    };
    return this.requestService.post(url, params)
  }

  getItemsByStoreNo(storeNo: string): Observable<any> {
    const url = this.baseUrl + environment.sevenElevenUrl.endpoint.getStoreDetail;
    const params = {
      'token': sessionStorage.getItem('711Token'),
    };
    const body = {
      storeNo: storeNo,
      CurrentLocation: {
        Latitude: 25.0375197,
        Longitude: 121.5636704
      }
    };
    return this.requestService.post(url, params, body)
  }

  getFoodDetails(): Observable<any> {
    // URL用github的取代，不拿資料夾內的靜態資源
    const url = 'https://alan-cheng.github.io/Friendly-Cat/assets/seven_eleven_products.json'
    return this.requestService.get(url)
  }

  getStores(): Observable<any> {
    const url = 'https://alan-cheng.github.io/Friendly-Cat/assets/seven_eleven_stores.json'
    return this.requestService.get(url)
  }
}
