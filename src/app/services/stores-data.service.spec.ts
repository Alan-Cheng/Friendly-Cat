import { TestBed } from '@angular/core/testing';

import { StoreDataService } from './stores-data.service';

describe('StoreDataService', () => {
  let service: StoreDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StoreDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('distinguishes an empty loaded area from an area that is still loading', () => {
    const states: string[] = [];
    service.inventoryState$.subscribe(state => states.push(state));
    service.setInventoryState('loading'); service.setStores([]);
    expect(states).toEqual(['idle', 'loading', 'ready']);
    expect(service.getStores()).toEqual([]);
  });

  it('publishes automatically fetched stores to subscribers for food search', () => {
    let available: any[] = [];
    service.stores$.subscribe(stores => available = stores);
    const store = { label: '全家', name: '附近門市', info: [{ qty: 2 }] };
    service.setStores([store]);
    expect(available).toEqual([store]);
  });

});
