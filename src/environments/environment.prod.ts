export const environment = {
  production: true,
  turnstileSiteKey: '0x4AAAAAAEEefTsxRSmYSGna',
  familyMartUrl: {
    icon: 'assets/family-mart.ico',
    base: 'https://stamp.family.com.tw/api/maps',
    storeQuery: 'https://family.map.com.tw/famiport/api/dropdownlist/Select_StoreName',
    endpoint: {
      mapClassificationInfo: '/MapClassificationInfo',
      mapProductInfo: '/MapProductInfo'
    }
  },
  sevenElevenUrl: {
    icon: 'assets/seven-eleven.ico',
    base: 'https://proxy.friendlycat.alan-cheng.com/LoveFood/api/',
    endpoint: {
      getList: 'Master/FrontendItemCategory/GetList',
      getStoreByAddress: 'Master/FrontendStore/GetStoreByAddress',
      getNearbyStoreList: 'Search/FrontendStoreItemStock/GetNearbyStoreList',
      getStoreDetail: 'Search/FrontendStoreItemStock/GetStoreDetail'
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
