import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { RequestService } from 'src/app/services/request.service'
import { LocationData } from '../../model/seven-eleven.model';

import { Location } from '../../model/seven-eleven.model';

@Injectable({
  providedIn: 'root'
})
export class SevenElevenRequestService {

  constructor(
    private requestService: RequestService
  ) { }

  baseUrl = environment.sevenElevenUrl.base;

  getAccessToken(): Observable<any> {
    const url = this.baseUrl + environment.sevenElevenUrl.endpoint.accessToken;
    const params = environment.sevenElevenUrl.params;

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
    const url = 'assets/seven_eleven_products.json'
    return this.requestService.get(url)
  }
}
