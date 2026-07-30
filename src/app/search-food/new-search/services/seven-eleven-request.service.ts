import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

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

  /**
   * Token acquisition is entirely Worker-owned. Existing callers use this
   * marker to continue their flow, but no browser request is made here.
   */
  ensureWorkerReady(): Observable<any> {
    return of({ element: 'worker-managed' });
  }

  getStoreByAddress(keyword: string): Observable<any> {
    const url = this.baseUrl + environment.sevenElevenUrl.endpoint.getStoreByAddress;
    const params = {
      'keyword': keyword
    };
    return this.requestService.post(url, params);
  }

  getNearByStoreList(location: LocationData): Observable<any> {
    const url = this.baseUrl + environment.sevenElevenUrl.endpoint.getNearbyStoreList;
    return this.requestService.post(url, undefined, location)
  }

  getFoodCategory(): Observable<any> {
    const url = this.baseUrl + environment.sevenElevenUrl.endpoint.getList;
    return this.requestService.post(url)
  }

  getItemsByStoreNo(storeNo: string): Observable<any> {
    const url = this.baseUrl + environment.sevenElevenUrl.endpoint.getStoreDetail;
    const body = {
      storeNo: storeNo,
      CurrentLocation: {
        Latitude: 25.0375197,
        Longitude: 121.5636704
      }
    };
    return this.requestService.post(url, undefined, body)
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
