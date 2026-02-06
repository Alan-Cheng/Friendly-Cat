// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  familyMartUrl: {
    icon: 'https://www.family.com.tw/ESG/images/icon/LOGO.ico',
    base: 'https://stamp.family.com.tw/api/maps',
    storeQuery: 'https://family.map.com.tw/famiport/api/dropdownlist/Select_StoreName',
    endpoint: {
      mapClassificationInfo: '/MapClassificationInfo',
      mapProductInfo: '/MapProductInfo'
    }
  },
  sevenElevenUrl: {
    icon: 'https://www.7-11.com.tw/favicon.ico',
    base: 'https://lovefood.openpoint.com.tw/LoveFood/api/',
    endpoint: {
      accessToken: 'Auth/FrontendAuth/AccessToken',
      getList: 'Master/FrontendItemCategory/GetList',
      getStoreByAddress: 'Master/FrontendStore/GetStoreByAddress',
      getNearbyStoreList: 'Search/FrontendStoreItemStock/GetNearbyStoreList',
      getStoreDetail: 'Search/FrontendStoreItemStock/GetStoreDetail'
    },
    params: {
      mid_v: 'W0_DiF4DlgU5OeQoRswrRcaaNHMWOL7K3ra3385ocZcv-bBOWySZvoUtH6j-7pjiccl0C5h30uRUNbJXsABCKMqiekSb7tdiBNdVq8Ro5jgk6sgvhZla5iV0H3-8dZfASc7AhEm85679LIK3hxN7Sam6D0LAnYK9Lb0DZhn7xeTeksB4IsBx4Msr_VI'
    }
  },
  firebaseConfig: {
    apiKey: "AIzaSyA3i_YLXpXuHNrmrHULrqnsIj5Z919aCfw",
    authDomain: "friendly-cat-for-you.firebaseapp.com",
    databaseURL: "https://friendly-cat-for-you-default-rtdb.firebaseio.com",
    projectId: "friendly-cat-for-you",
    storageBucket: "friendly-cat-for-you.firebasestorage.app",
    messagingSenderId: "614210455616",
    appId: "1:614210455616:web:cedabfd68dca95ae4337a5",
    measurementId: "G-3V3740GPG7"
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
