import { createFamilyStockMatcher, familyStockQuantity, sevenStockQuantity } from './store-inventory';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, NgZone, OnChanges, SimpleChanges, OnDestroy, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import type { Map, Marker, GeoJSONSource } from 'maplibre-gl';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { STORE_DETAIL_MIN_ZOOM } from './map-detail';

export interface MapStore {
  id: string;
  storeCode?: string;
  quantity?: number;
  name: string;
  address: string;
  phone: string;
  brand: '全家' | '7-11';
  latitude: number;
  longitude: number;
}

@Component({
  selector: 'app-store-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './store-map.component.html',
  styleUrls: ['./store-map.component.scss']
})
export class StoreMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLDivElement>;
  @ViewChild('locationButton', { static: true }) locationButton!: ElementRef<HTMLButtonElement>;
  @ViewChild('cardTitle') cardTitle?: ElementRef<HTMLElement>;
  @Input() familyStores: any[] = [];
  @Input() familyStock: any[] = [];
  @Input() sevenStores: any[] = [];
  @Input() sevenStock: any[] = [];
  @Input() inventory: Record<string, number | 'loading' | 'error'> = {};
  @Input() querying = false;
  @Input() inventoryBlocked = false;
  @Input() latitude?: number;
  @Input() longitude?: number;
  @Output() worldReady = new EventEmitter<void>();
  @Output() openSearch = new EventEmitter<void>();
  @Output() queryStore = new EventEmitter<MapStore>();
  @Output() areaChanged = new EventEmitter<{ latitude: number; longitude: number }>();
  @Output() locationChanged = new EventEmitter<{ latitude: number; longitude: number }>();
  stores: MapStore[] = [];
  visibleStores: MapStore[] = [];
  selected?: MapStore;
  filter = 'all';
  ready = false;
  failed = false;
  locating = false;
  is3D = false;
  overviewMode = false;
  readonly familyMartIconUrl = environment.familyMartUrl.icon;
  readonly sevenElevenIconUrl = environment.sevenElevenUrl.icon;
  status = '目前瀏覽台北地圖，開啟定位讓黑貓找到你。';
  dataError = '';
  private map?: Map;
  private lib?: typeof import('maplibre-gl');
  private markerById = new globalThis.Map<string, Marker>();
  private markerLabels = new WeakMap<HTMLElement, HTMLElement>();
  private stockStores: MapStore[] = [];
  highlightedId?: string;
  private cat?: Awaited<ReturnType<typeof import('./three-world').createTownLayer>>;
  private observer?: ResizeObserver;
  private localFamily: any[] = [];
  private subscription?: Subscription;
  private watchId?: number;
  private heading?: number;
  private compassHeading?: number;
  private orientationListening = false;
  private compassSource?: 'webkit' | 'absolute';
  private orientationRequesting = false;
  headingStatus = '';
  get directionFollowing(): boolean { return this.orientationListening; }
  get directionRequesting(): boolean { return this.orientationRequesting; }

  async toggleDirectionFollowing(): Promise<void> {
    if (this.orientationRequesting) return;
    if (!this.orientationListening) {
      await this.enableOrientation();
      return;
    }
    this.stopOrientation();
    this.compassSource = undefined;
    this.compassHeading = undefined;
    this.heading = undefined;
    this.cat?.setHeading(undefined);
    this.headingStatus = '';
  }

  private stopOrientation(): void {
    window.removeEventListener('deviceorientation', this.onOrientation);
    window.removeEventListener('deviceorientationabsolute', this.onOrientation);
    window.screen.orientation?.removeEventListener('change', this.onScreenOrientation);
    this.orientationListening = false;
  }

  private readonly onOrientation = (event: DeviceOrientationEvent): void => {
    if (!this.orientationListening) return;
    const compass = event as DeviceOrientationEvent & { webkitCompassHeading?: number; webkitCompassAccuracy?: number };
    let heading: number | undefined;
    if (typeof compass.webkitCompassHeading === 'number' && Number.isFinite(compass.webkitCompassHeading)
      && (compass.webkitCompassAccuracy === undefined || compass.webkitCompassAccuracy >= 0)) {
      heading = compass.webkitCompassHeading;
      this.compassSource = 'webkit';
    } else if (event.absolute && event.alpha !== null && Number.isFinite(event.alpha)) {
      if (this.compassSource === 'webkit' || (this.compassSource === 'absolute' && event.type !== 'deviceorientationabsolute')) return;
      if (event.type === 'deviceorientationabsolute') this.compassSource = 'absolute';
      heading = 360 - event.alpha;
    }
    if (heading === undefined) return;
    this.compassHeading = heading;
    this.updateHeading(heading + (window.screen.orientation?.angle ?? 0));
  };
  private readonly onScreenOrientation = (): void => {
    if (this.compassHeading !== undefined) this.updateHeading(this.compassHeading + (window.screen.orientation?.angle ?? 0));
  };

  private updateHeading(heading: number): void {
    if (!this.orientationListening) return;
    const next = ((heading % 360) + 360) % 360;
    if (this.heading !== undefined && Math.abs(((next - this.heading + 540) % 360) - 180) < 2) return;
    this.heading = next;
    this.cat?.setHeading(this.heading);
  }

  private startDefaultDirectionFollowing(): void {
    if (!window.isSecureContext || typeof DeviceOrientationEvent === 'undefined') return;
    // iOS needs a deliberate tap on the switch before requesting sensor access.
    const orientation = DeviceOrientationEvent as typeof DeviceOrientationEvent & { requestPermission?: unknown };
    if (typeof orientation.requestPermission !== 'function') void this.enableOrientation();
  }

  async enableOrientation(): Promise<boolean> {
    if (this.orientationListening) return true;
    if (this.orientationRequesting) return false;
    if (!window.isSecureContext || typeof DeviceOrientationEvent === 'undefined') {
      this.headingStatus = '此瀏覽器無法開啟方向跟隨，請使用支援方向感測的瀏覽器與 HTTPS 連線。';
      return false;
    }
    const orientation = DeviceOrientationEvent as typeof DeviceOrientationEvent & {
      requestPermission?: (absolute?: boolean) => Promise<string>;
    };
    this.orientationRequesting = true;
    try {
      if (orientation.requestPermission && await orientation.requestPermission(true) !== 'granted') {
        this.headingStatus = '方向權限未開啟，方向跟隨維持關閉。可點擊開關重新嘗試授權。';
        return false;
      }
      if (this.destroyed) return false;
      this.zone.runOutsideAngular(() => {
        window.addEventListener('deviceorientation', this.onOrientation);
        window.addEventListener('deviceorientationabsolute', this.onOrientation);
        window.screen.orientation?.addEventListener('change', this.onScreenOrientation);
      });
      this.orientationListening = true;
      this.headingStatus = '';
      return true;
    } catch {
      this.headingStatus = '方向跟隨無法啟用，請確認瀏覽器的動作與方向權限後再試。';
      return false;
    } finally {
      this.orientationRequesting = false;
    }
  }
  private destroyed = false;
  private catLoading = false;
  private loadTimer?: ReturnType<typeof setTimeout>;
  private returnFocus?: HTMLElement;
  private locationFlight?: { map: Map; onEnd: () => void };
  private readonly reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  constructor(private http: HttpClient, private zone: NgZone) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['familyStores'] || changes['sevenStores'] || changes['familyStock'] || changes['sevenStock']) this.normalizeStores();
    else if (changes['inventory']) this.updateInventory();
    if ((changes['latitude'] || changes['longitude']) && this.hasLocation()) {
      void this.updateCat();
      if (changes['latitude']?.previousValue === undefined) this.centerCat();
    }
  }

  async ngAfterViewInit(): Promise<void> {
    this.startDefaultDirectionFollowing();
    // A local directory keeps the map usable when the inventory proxy is unavailable.
    this.subscription = this.http.get<any[]>('assets/family_mart_stores.json').subscribe({
      next: data => { this.localFamily = data; this.normalizeStores(); },
      error: () => { this.dataError = '商家資料暫時無法載入，請稍後重新整理。'; }
    });
    await this.initialize();
  }

  private async initialize(): Promise<void> {
    this.ready = false;
    this.is3D = false;
    try {
      const lib = await import('maplibre-gl');
      if (this.destroyed) return;
      this.lib = lib;
      this.zone.runOutsideAngular(() => {
        this.map = new lib.Map({
          container: this.canvas.nativeElement,
          style: 'https://tiles.openfreemap.org/styles/positron',
          center: this.hasLocation() ? [this.longitude!, this.latitude!] : [121.5654, 25.0330],
          zoom: 16, pitch: 0, bearing: 0, maxPitch: 65, maxZoom: 19,
          attributionControl: { compact: true },
          canvasContextAttributes: { antialias: true }
        });
        const navigation = new lib.NavigationControl({ showCompass: false });
        this.map.addControl(navigation, 'top-right');
        const controls = this.canvas.nativeElement.querySelector('.maplibregl-ctrl-group');
        if (controls) {
          // A native button avoids the built-in compass touch/drag synthetic clicks.
          const compass = document.createElement('button');
          compass.type = 'button';
          compass.className = 'maplibregl-ctrl-compass';
          compass.setAttribute('aria-label', '切換朝北俯視與原本視角');
          compass.title = '切換朝北俯視與原本視角';
          const arrow = document.createElement('span');
          arrow.className = 'maplibregl-ctrl-icon';
          arrow.setAttribute('aria-hidden', 'true');
          compass.append(arrow);
          controls.append(compass);
          controls.append(this.locationButton.nativeElement);
          compass.addEventListener('click', () => this.zone.run(() => this.toggleCompass()));
          const rotateArrow = () => { arrow.style.transform = `rotate(${-this.map!.getBearing()}deg)`; };
          this.map.on('rotate', rotateArrow);
          rotateArrow();
        }
        this.map.addControl(new lib.ScaleControl({ unit: 'metric' }), 'bottom-left');
        this.map.getCanvas().setAttribute('aria-label', '附近商家地圖，可用方向鍵移動，使用加減鍵縮放');
        this.map.on('load', () => this.zone.run(() => this.onLoad()));
        this.map.on('zoom', () => {
          if ((this.map!.getZoom() < STORE_DETAIL_MIN_ZOOM) !== this.overviewMode) {
            this.zone.run(() => this.renderStores());
          }
        });
        this.map.on('moveend', () => this.zone.run(() => { this.angleTarget = undefined; this.renderStores(); this.reportViewport(); }));
        this.map.on('error', () => this.zone.run(() => {
          if (!this.ready) { this.failed = true; this.worldReady.emit(); }
          this.status = '部分地圖資料無法載入。請檢查網路，或使用下方商家清單。';
        }));
        this.observer = new ResizeObserver(() => this.map?.resize());
        this.observer.observe(this.canvas.nativeElement);
      });
      this.loadTimer = setTimeout(() => {
        if (!this.ready) { this.failed = true; this.status = '地圖連線逾時，仍可使用商家清單。'; this.renderStores(); this.worldReady.emit(); }
      }, 20000);
    } catch {
      this.failed = true;
      this.status = '此裝置無法開啟 3D 地圖，請使用商家清單。';
      this.worldReady.emit();
      this.renderStores();
    }
  }

  private onLoad(): void {
    if (!this.map || this.destroyed) return;
    clearTimeout(this.loadTimer);
    this.ready = true;
    this.failed = false;
    // Short, pastel extrusions give real building footprints a board-game scale.
    if (this.map.getLayer('building')) this.map.setLayoutProperty('building', 'visibility', 'none');
    this.map.addLayer({
      id: 'cat-town-buildings', type: 'fill-extrusion', source: 'openmaptiles', 'source-layer': 'building', minzoom: 14,
      layout: { visibility: this.is3D ? 'visible' : 'none' },
      paint: {
        'fill-extrusion-color': ['match', ['%', ['to-number', ['get', 'render_height'], 8], 4], 0, '#c8d6be', 1, '#e5d2b5', 2, '#c9d8df', '#ddd5c3'],
        'fill-extrusion-height': ['min', 38, ['max', 6, ['to-number', ['get', 'render_height'], 8]]],
        'fill-extrusion-base': 0, 'fill-extrusion-opacity': 0.92
      }
    }, this.map.getStyle().layers.find(l => l.type === 'symbol')?.id);
    this.map.addSource('cat-accuracy', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
    this.map.addLayer({ id: 'cat-accuracy', type: 'circle', source: 'cat-accuracy', paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 12, 5, 19, 38],
      'circle-color': '#dc9d43', 'circle-opacity': 0.13, 'circle-stroke-color': '#b67d2e', 'circle-stroke-width': 1
    }});
    this.renderStores();
    void this.ensureWorld().finally(() => this.worldReady.emit());
    if (this.hasLocation()) { void this.updateCat(); this.centerCat(); }
  }

  private normalizeStores(): void {
    const matchStock = createFamilyStockMatcher(this.familyStock);
    const family = (this.familyStores.length ? this.familyStores : this.localFamily).map(s => ({
      id: 'fm-' + s.pkeynew, storeCode: String(s.pkeynew), name: s.Name, address: s.addr || '', phone: s.Tel || '', brand: '全家' as const,
      latitude: Number(s.py_wgs84), longitude: Number(s.px_wgs84)
    }));
    const enrichedFamily = family.map(store => {
      const stock = matchStock(store);
      return { ...store, quantity: stock ? familyStockQuantity(stock) : undefined };
    });
    const seven = this.sevenStores.map(s => ({
      storeCode: String(s.serial || s.storeNo || s.id || ''), id: '711-' + (s.serial || s.storeNo || s.id || `${s.name}-${s.lat}-${s.lng}`), name: `7-ELEVEN ${s.name}門市`,
      address: s.addr || '', phone: s.phone || s.tel || '', brand: '7-11' as const, latitude: Number(s.lat), longitude: Number(s.lng)
    }));
    const sevenById = new globalThis.Map(this.sevenStock.map(stock => [String(stock.StoreNo), stock]));
    const enrichedSeven = seven.map(store => ({ ...store, quantity: sevenStockQuantity(sevenById.get(store.storeCode)) }));
    this.stockStores = [...enrichedFamily, ...enrichedSeven].filter(s => Number.isFinite(s.latitude) && Number.isFinite(s.longitude) && Math.abs(s.latitude) <= 90 && Math.abs(s.longitude) <= 180 && s.latitude !== 0 && s.longitude !== 0);
    this.updateInventory();
  }

  private updateInventory(): void {
    this.stores = this.stockStores.map(store => {
      const state = this.inventory[store.id];
      return { ...store, quantity: typeof state === 'number' ? state : state ? undefined : store.quantity };
    });
    this.renderStores();
  }

  reportViewport(): void {
    if (!this.map || !this.ready || this.inventoryBlocked || this.overviewMode || this.locationFlight) return;
    const center = this.map.getCenter();
    this.areaChanged.emit({ latitude: center.lat, longitude: center.lng });
  }

  setFilter(value: string): void { this.filter = value; this.renderStores(); }

  private renderStores(): void {
    this.overviewMode = !!(this.ready && !this.failed && this.map && this.map.getZoom() < STORE_DETAIL_MIN_ZOOM);
    if (this.overviewMode) {
      this.visibleStores = [];
      this.cat?.setStores([]);
      this.markerById.forEach(marker => marker.remove());
      this.markerById.clear();
      return;
    }
    const center = this.map?.getCenter() || { lng: 121.5654, lat: 25.0330 };
    const bounds = this.ready && !this.failed ? this.map?.getBounds() : undefined;
    this.visibleStores = this.stores.filter(s => (this.filter === 'all' || s.brand === this.filter) && (!bounds || bounds.contains([s.longitude, s.latitude])))
      .map(store => ({ store, distance: this.distanceFrom(store, center.lat, center.lng) }))
      .sort((a, b) => a.distance - b.distance).slice(0, 60).map(entry => entry.store);
    this.cat?.setStores(this.visibleStores);
    if (!this.ready || !this.lib || !this.map) return;
    const visibleIds = new Set(this.visibleStores.map(store => store.id));
    this.markerById.forEach((marker, id) => {
      if (!visibleIds.has(id)) { marker.remove(); this.markerById.delete(id); }
    });
    for (const store of this.visibleStores) {
      const existing = this.markerById.get(store.id);
      if (existing) {
        this.updateMarker(existing.getElement(), store);
        const position = existing.getLngLat();
        if (position.lng !== store.longitude || position.lat !== store.latitude) existing.setLngLat([store.longitude, store.latitude]);
        continue;
      }
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'cat-shop-marker ' + (store.brand === '全家' ? 'family' : 'seven');
      const label = document.createElement('span'); label.className = 'shop-label';
      const roof = document.createElement('span'); roof.className = 'shop-roof';
      const storeName = document.createElement('span');
      storeName.className = 'shop-store-name';
      const divider = document.createElement('span'); divider.className = 'shop-brand-divider'; divider.setAttribute('aria-hidden', 'true');
      const logo = document.createElement('img');
      logo.className = 'shop-brand-icon';
      logo.src = store.brand === '全家' ? environment.familyMartUrl.icon : environment.sevenElevenUrl.icon;
      logo.alt = '';
      logo.width = logo.height = 22;
      logo.draggable = false;
      logo.addEventListener('error', () => logo.remove(), { once: true });
      roof.append(logo, divider, storeName);
      label.append(roof);
      {
        const badge = document.createElement('span'); badge.className = 'shop-stock-count';
        label.append(badge);
      }
      button.append(label);
      this.markerLabels.set(button, label);
      this.updateMarker(button, store);
      button.addEventListener('click', () => this.zone.run(() => this.select(this.stores.find(current => current.id === store.id) || store, button)));
      const marker = new this.lib.Marker({ element: button, anchor: 'top', subpixelPositioning: true }).setLngLat([store.longitude, store.latitude]).addTo(this.map);
      this.markerById.set(store.id, marker);
    }
  }

  private updateMarker(button: HTMLElement, store: MapStore): void {
    const loading = store.quantity === undefined && this.inventory[store.id] !== 'error';
    button.setAttribute('aria-busy', String(loading));
    button.setAttribute('aria-label', `查看${store.name}商品${loading ? '，庫存載入中' : store.quantity !== undefined ? `，剩餘 ${store.quantity} 件` : ''}`);
    button.setAttribute('aria-pressed', String(this.selected?.id === store.id));
    button.classList.toggle('highlighted', this.highlightedId === store.id);
    button.title = store.name;
    const name = button.querySelector<HTMLElement>('.shop-store-name')!;
    const text = store.name.replace(store.brand === '全家' ? /^(?:全家便利商店|全家|FamilyMart)\s*/i : /^(?:7-ELEVEN|7-11|711)\s*/i, '').trim() || store.name;
    if (name.textContent !== text) name.textContent = text;
    const badge = button.querySelector<HTMLElement>('.shop-stock-count')!;
    badge.classList.toggle('is-unknown', store.quantity === undefined);
    badge.classList.toggle('is-empty', store.quantity === 0);
    badge.classList.toggle('is-loading', loading);
    const count = loading ? '' : store.quantity === undefined ? '—' : String(store.quantity);
    if (badge.textContent !== count) badge.textContent = count;
    badge.title = loading ? '庫存載入中' : store.quantity === undefined ? '庫存暫時無法載入' : '即期商品剩餘數量';
  }

  highlightStore(id?: string): void {
    this.highlightedId = id;
    this.cat?.setHighlight(id);
    this.markerById.forEach((marker, key) => marker.getElement().classList.toggle('highlighted', key === id));
  }

  select(store: MapStore, trigger?: HTMLElement): void {
    this.selected = undefined;
    this.queryStore.emit(store);
  }

  closeCard(): void { this.selected = undefined; if (this.returnFocus?.isConnected) this.returnFocus.focus(); }
  requestProducts(): void { if (this.selected && !this.querying && !this.inventoryBlocked) this.queryStore.emit(this.selected); }
  navigationUrl(store: MapStore): string { return `https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`; }

  hasLocation(): boolean { return Number.isFinite(this.latitude) && Number.isFinite(this.longitude); }
  distance(store: MapStore): string {
    if (!this.hasLocation()) return '開啟定位查看距離';
    const m = this.distanceFrom(store, this.latitude!, this.longitude!);
    return m < 1000 ? `距離約 ${Math.round(m)} 公尺` : `距離約 ${(m / 1000).toFixed(1)} 公里`;
  }
  private distanceFrom(s: MapStore, lat: number, lng: number): number {
    const rad = Math.PI / 180;
    const a = Math.sin((s.latitude - lat) * rad / 2) ** 2 + Math.cos(lat * rad) * Math.cos(s.latitude * rad) * Math.sin((s.longitude - lng) * rad / 2) ** 2;
    return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  locate(): void {
    if (this.hasLocation()) { this.centerCat(); if (this.watchId !== undefined) return; }
    if (!navigator.geolocation) { this.status = '瀏覽器不支援定位，仍可拖曳地圖找店家。'; return; }
    if (this.locating) return;
    this.locating = true;
    this.status = '正在尋找你的位置…';
    this.watchId = navigator.geolocation.watchPosition(position => this.zone.run(() => {
      if (this.destroyed) return;
      const first = !this.hasLocation();
      this.latitude = position.coords.latitude; this.longitude = position.coords.longitude;
      if (this.directionFollowing && this.compassHeading === undefined && position.coords.heading !== null && Number.isFinite(position.coords.heading)) {
        this.updateHeading(position.coords.heading);
      }
      this.locating = false;
      this.status = `黑貓已找到你，定位誤差約 ${Math.round(position.coords.accuracy)} 公尺。`;
      this.locationChanged.emit({ latitude: this.latitude, longitude: this.longitude });
      this.updateCat();
      if (first) this.centerCat();
    }), error => this.zone.run(() => {
      this.locating = false;
      this.status = error.code === 1 ? '尚未取得定位權限，仍可拖曳地圖或從清單查看店家。'
        : this.hasLocation() ? '目前顯示上次定位，正在等待新的位置資訊。' : '暫時無法取得位置，正在重試；仍可瀏覽店家。';
      // Timeouts are transient; keep watching so GPS can recover without a reload.
      if (error.code === 1) {
        if (this.watchId !== undefined) navigator.geolocation.clearWatch(this.watchId);
        this.watchId = undefined;
      }
    }), { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 });
  }

  private async updateCat(): Promise<void> {
    if (!this.map || !this.ready || !this.hasLocation()) return;
    const source = this.map.getSource('cat-accuracy') as GeoJSONSource;
    source?.setData({ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [this.longitude!, this.latitude!] } });
    if (this.cat) { this.cat.setPosition(this.longitude!, this.latitude!); return; }
    await this.ensureWorld();
  }

  private async ensureWorld(): Promise<void> {
    if (!this.map || !this.ready || this.cat) return;
    if (this.catLoading) return;
    this.catLoading = true;
    const targetMap = this.map;
    try {
      const { createTownLayer } = await import('./three-world');
      const center = targetMap.getCenter();
      const cat = await createTownLayer(center.lng, center.lat);
      if (this.destroyed || this.map !== targetMap) return;
      if (this.hasLocation()) cat.setPosition(this.longitude!, this.latitude!);
      if (this.heading !== undefined) cat.setHeading(this.heading);
      cat.setStores(this.visibleStores);
      this.cat = cat;
      targetMap.addLayer(cat.layer);
      cat.setHighlight(this.highlightedId);
      cat.setProjectionListener(points => {
        for (const point of points) {
          const marker = this.markerById.get(point.id);
          if (!marker) continue;
          const ground = targetMap.project(marker.getLngLat());
          const x = point.x - ground.x, y = point.y - ground.y;
          const offset = marker.getOffset();
          if (Math.abs(offset.x - x) > .01 || Math.abs(offset.y - y) > .01) marker.setOffset([x, y]);
          // Only the label receives pointer events. A changing marker body size
          // adds layout work without changing the label's top anchor or hit area.
          const label = this.markerLabels.get(marker.getElement());
          const transform = `translateX(-50%) scale(${point.scale})`;
          if (label && label.style.transform !== transform) label.style.transform = transform;
        }
      });
      targetMap.triggerRepaint();
    } catch {
      this.status = '位置已取得，但黑貓模型暫時無法載入。可使用地圖上的定位圓點。';
    } finally {
      this.catLoading = false;
    }
  }

  showStoreAt(latitude: number, longitude: number, brand: string): void {
    this.focusCoordinates(longitude, latitude);
    const store = this.stores.find(s => s.brand === brand && Math.abs(s.latitude - latitude) < .00001 && Math.abs(s.longitude - longitude) < .00001);
    if (store) this.select(store);
  }

  focusCoordinates(longitude: number, latitude: number): void {
    this.map?.easeTo({ center: [longitude, latitude], zoom: 17, duration: this.reducedMotion ? 0 : 700 });
  }

  private centerCat(): void {
    if (!this.hasLocation() || !this.map) return;
    this.cancelLocationFlight();
    const map = this.map;
    const center: [number, number] = [this.longitude!, this.latitude!];
    if (this.reducedMotion || map.getZoom() < 15) {
      map.flyTo({ center, zoom: 17, curve: 1.42, duration: this.reducedMotion ? 0 : 1600 });
      return;
    }
    // flyTo alone has no zoom arc when the start and target nearly coincide.
    // Give nearby recentering a visible pullback before the final approach.
    map.stop();
    const pullbackZoom = Math.min(map.getZoom(), 17) - 1.5;
    const onEnd = () => {
      this.cancelLocationFlight();
      // moveend also fires when the user interrupts the pullback. Only finish
      // a completed pullback, so cancelling does not pull them back again.
      if (this.destroyed || this.map !== map || Math.abs(map.getZoom() - pullbackZoom) > .001) return;
      map.flyTo({ center, zoom: 17, curve: 1.42, duration: 1150 });
    };
    this.locationFlight = { map, onEnd };
    map.on('moveend', onEnd);
    map.easeTo({ zoom: pullbackZoom, duration: 450 });
  }

  private cancelLocationFlight(): void {
    if (!this.locationFlight) return;
    this.locationFlight.map.off('moveend', this.locationFlight.onEnd);
    this.locationFlight = undefined;
  }
  private compassView?: { pitch: number; bearing: number };
  private angleTarget?: { pitch: number; bearing: number };

  toggleCompass(): void {
    if (!this.map) return;
    const angle = this.map.isMoving() && this.angleTarget
      ? this.angleTarget
      : { pitch: this.map.getPitch(), bearing: this.map.getBearing() };
    this.map.stop();
    if (this.compassView) {
      const previous = this.compassView;
      this.compassView = undefined;
      this.setViewAngle(previous.pitch, previous.bearing);
    } else if (Math.abs(angle.pitch) < .5 && Math.abs(angle.bearing) < .5) {
      this.setViewAngle(55, -25);
    } else {
      this.compassView = angle;
      this.setViewAngle(0, 0);
    }
  }

  private setViewAngle(pitch: number, bearing: number): void {
    this.is3D = pitch > .5;
    this.map?.easeTo({ pitch, bearing, duration: this.reducedMotion ? 0 : 500 });
    this.angleTarget = { pitch, bearing };
    if (this.map?.getLayer('cat-town-buildings')) this.map.setLayoutProperty('cat-town-buildings', 'visibility', this.is3D ? 'visible' : 'none');
  }

  togglePerspective(): void {
    this.compassView = undefined;
    this.setViewAngle(this.is3D ? 0 : 55, this.is3D ? 0 : -25);
  }
  retry(): void { this.cancelLocationFlight(); this.angleTarget = undefined; this.compassView = undefined; this.failed = false; this.canvas.nativeElement.parentElement?.append(this.locationButton.nativeElement); this.markerById.forEach(marker => marker.remove()); this.markerById.clear(); this.map?.remove(); this.map = undefined; this.cat = undefined; this.observer?.disconnect(); clearTimeout(this.loadTimer); void this.initialize(); }
  ngOnDestroy(): void {
    this.cancelLocationFlight();
    this.destroyed = true; clearTimeout(this.loadTimer); this.subscription?.unsubscribe(); this.observer?.disconnect();
    if (this.watchId !== undefined) navigator.geolocation.clearWatch(this.watchId);
    this.stopOrientation();
    this.markerById.forEach(marker => marker.remove()); this.markerById.clear(); this.map?.remove();
  }
}
