export const environment = {
  production: true,
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
      mid_v: 'W0_DiF4DlgU5OeQoRswrRcaaNHMWOL7K3ra3381ocZUv-rdOWS6ZuIUtHqv-7pjiccl0C5h51bVSb-Vc7VdFc8eiLEWettduAYML-s4z4Tx0vcl7gJla5iV0H3-8dZfAScnAjUK64qr9LIO_hBZ_Sam6D0LAnYK9Lb0DZm8JatIb-ogpZxJeWboeOWQ'
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
