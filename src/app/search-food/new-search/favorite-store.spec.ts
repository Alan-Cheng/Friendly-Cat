import { matchesFavorite } from './favorite-store';
import { NewSearchComponent } from './new-search.component';
import { LegacySearchComponent } from './legacy-search.component';

const legacy = { storeName: '7-11福龍門市', store711Name: '福龍', label: '7-11' };
const mapStore = { storeName: '7-ELEVEN 福龍門市', StoreName: '福龍', label: '7-11', storeCode: '259002' };

describe('backward compatible favorites', () => {
  it('recognizes old 711 favorites from map details and the reverse direction', () => {
    expect(matchesFavorite(legacy, mapStore)).toBeTrue();
    expect(matchesFavorite(mapStore, legacy)).toBeTrue();
    expect(matchesFavorite({ storeName: '711 福龍門市' }, mapStore)).toBeTrue();
    expect(matchesFavorite(legacy, { ...mapStore, StoreName: '其他', storeName: '7-ELEVEN 其他門市' })).toBeFalse();
  });

  it('keeps brands and distinct store codes separate, even for identical names', () => {
    expect(matchesFavorite({ ...legacy, storeCode: '111' }, mapStore)).toBeFalse();
    expect(matchesFavorite({ ...legacy, storeCode: '259002' }, { ...mapStore, storeName: '新店名', StoreName: '新店名' })).toBeTrue();
    expect(matchesFavorite({ ...mapStore, label: '全家' }, mapStore)).toBeFalse();
    expect(matchesFavorite({ storeName: '全家福龍店' }, { storeName: '全家福龍店' })).toBeTrue();
  });

  it('retains saved state after opening an old favorite from the sidebar', () => {
    const component = Object.create(NewSearchComponent.prototype) as NewSearchComponent;
    component.favoriteStores = [legacy];
    const directoryStore = { id: '711-259002', storeCode: '259002', brand: '7-11', name: '7-ELEVEN 福龍門市', latitude: 24.89, longitude: 121.22 };
    component.worldMap = { stores: [directoryStore], focusCoordinates: jasmine.createSpy('focus') } as any;
    spyOn(component, 'onMapStoreQuery').and.callFake(store => { component.mapSelectedStore = store; });
    component.onFavoriteStoreSearch(legacy);
    expect(component.onMapStoreQuery).toHaveBeenCalledOnceWith(directoryStore as any);
    expect(component.selectedStoreFavorite.storeCode).toBe('259002');
    expect(component.isFavorite(component.selectedStoreFavorite)).toBeTrue();
  });

  for (const componentClass of [NewSearchComponent, LegacySearchComponent]) {
    describe(componentClass.name, () => {
      let component: any;
      let doc: jasmine.Spy;
      let remove: jasmine.Spy;
      let save: jasmine.Spy;
      beforeEach(() => {
        // Exercise the shared public actions without starting map/auth subscriptions.
        component = Object.create(componentClass.prototype);
        remove = jasmine.createSpy('delete').and.resolveTo();
        save = jasmine.createSpy('set').and.resolveTo();
        doc = jasmine.createSpy('doc').and.returnValue({ delete: remove, set: save });
        component.firestore = { collection: () => ({ doc: () => ({ collection: () => ({ doc }) }) }) };
        component.user = { uid: 'test', emailVerified: true };
        component.dialog = { open: jasmine.createSpy('open') };
        component.favoriteStores = [legacy];
      });

      it('shows saved state and deletes the original legacy document', async () => {
        expect(component.isFavorite(mapStore)).toBeTrue();
        await component.toggleFavorite(mapStore);
        expect(doc).toHaveBeenCalledOnceWith('7-11福龍門市');
        expect(remove).toHaveBeenCalledTimes(1);
        expect(save).not.toHaveBeenCalled();
      });

      it('persists brand and code for new favorites', async () => {
        component.favoriteStores = [];
        await component.toggleFavorite(mapStore);
        expect(save).toHaveBeenCalledOnceWith(jasmine.objectContaining({ label: '7-11', storeCode: '259002', storeName: mapStore.storeName }));
      });
    });
  }
});
