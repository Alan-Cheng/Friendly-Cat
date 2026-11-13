import { matchFamilyStock, familyStockQuantity, sevenStockQuantity } from './store-inventory';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, NgZone, OnChanges, SimpleChanges, OnDestroy, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import type { Map, Marker, GeoJSONSource } from 'maplibre-gl';
import { Subscription } from 'rxjs';

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
  @ViewChild('cardTitle') cardTitle?: ElementRef<HTMLElement>;
  @Input() familyStores: any[] = [];
  @Input() familyStock: any[] = [];
  @Input() sevenStores: any[] = [];
  @Input() sevenStock: any[] = [];
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
  is3D = true;
  status = '目前瀏覽台北街區，開啟定位讓黑貓找到你。';
  dataError = '';
  private map?: Map;
  private lib?: typeof import('maplibre-gl');
  private markers: Marker[] = [];
  private markerById = new globalThis.Map<string, Marker>();
  highlightedId?: string;
  private cat?: Awaited<ReturnType<typeof import('./three-world').createTownLayer>>;
  private observer?: ResizeObserver;
  private localFamily: any[] = [];
  private subscription?: Subscription;
  private watchId?: number;
  private destroyed = false;
  private catLoading = false;
  private loadTimer?: ReturnType<typeof setTimeout>;
  private returnFocus?: HTMLElement;
  private readonly reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  constructor(private http: HttpClient, private zone: NgZone) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['familyStores'] || changes['sevenStores'] || changes['familyStock'] || changes['sevenStock']) this.normalizeStores();
    if ((changes['latitude'] || changes['longitude']) && this.hasLocation()) {
      void this.updateCat();
      if (changes['latitude']?.previousValue === undefined) this.centerCat();
    }
  }

  async ngAfterViewInit(): Promise<void> {
    // A local directory keeps the map usable when the inventory proxy is unavailable.
    this.subscription = this.http.get<any[]>('assets/family_mart_stores.json').subscribe({
      next: data => { this.localFamily = data; this.normalizeStores(); },
      error: () => { this.dataError = '商家資料暫時無法載入，請稍後重新整理。'; }
    });
    await this.initialize();
  }

  private async initialize(): Promise<void> {
    this.ready = false;
    try {
      const lib = await import('maplibre-gl');
      if (this.destroyed) return;
      this.lib = lib;
      this.zone.runOutsideAngular(() => {
        this.map = new lib.Map({
          container: this.canvas.nativeElement,
          style: 'https://tiles.openfreemap.org/styles/positron',
          center: this.hasLocation() ? [this.longitude!, this.latitude!] : [121.5654, 25.0330],
          zoom: 16, pitch: 55, bearing: -25, maxPitch: 65, maxZoom: 19,
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
          compass.addEventListener('click', () => this.zone.run(() => this.toggleCompass()));
          const rotateArrow = () => { arrow.style.transform = `rotate(${-this.map!.getBearing()}deg)`; };
          this.map.on('rotate', rotateArrow);
          rotateArrow();
        }
        this.map.addControl(new lib.ScaleControl({ unit: 'metric' }), 'bottom-left');
        this.map.getCanvas().setAttribute('aria-label', '附近商家地圖，可用方向鍵移動，使用加減鍵縮放');
        this.map.on('load', () => this.zone.run(() => this.onLoad()));
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
    const family = (this.familyStores.length ? this.familyStores : this.localFamily).map(s => ({
      id: 'fm-' + s.pkeynew, storeCode: String(s.pkeynew), name: s.Name, address: s.addr || '', phone: s.Tel || '', brand: '全家' as const,
      latitude: Number(s.py_wgs84), longitude: Number(s.px_wgs84)
    }));
    const enrichedFamily = family.map(store => {
      const stock = matchFamilyStock(store, this.familyStock);
      return { ...store, quantity: stock ? familyStockQuantity(stock) : undefined };
    });
    const seven = this.sevenStores.map(s => ({
      storeCode: String(s.serial || s.storeNo || s.id || ''), id: '711-' + (s.serial || s.storeNo || s.id || `${s.name}-${s.lat}-${s.lng}`), name: `7-ELEVEN ${s.name}門市`,
      address: s.addr || '', phone: s.phone || s.tel || '', brand: '7-11' as const, latitude: Number(s.lat), longitude: Number(s.lng)
    }));
    const sevenById = new globalThis.Map(this.sevenStock.map(stock => [String(stock.StoreNo), stock]));
    const enrichedSeven = seven.map(store => ({ ...store, quantity: sevenStockQuantity(sevenById.get(store.storeCode)) }));
    this.stores = [...enrichedFamily, ...enrichedSeven].filter(s => Number.isFinite(s.latitude) && Number.isFinite(s.longitude) && Math.abs(s.latitude) <= 90 && Math.abs(s.longitude) <= 180 && s.latitude !== 0 && s.longitude !== 0);
    this.renderStores();
  }

  reportViewport(): void {
    if (!this.map || !this.ready || this.inventoryBlocked) return;
    const center = this.map.getCenter();
    this.areaChanged.emit({ latitude: center.lat, longitude: center.lng });
  }

  setFilter(value: string): void { this.filter = value; this.renderStores(); }

  private renderStores(): void {
    this.markers.forEach(m => m.remove());
    this.markers = [];
    this.markerById.clear();
    const center = this.map?.getCenter() || { lng: 121.5654, lat: 25.0330 };
    const bounds = this.ready && !this.failed ? this.map?.getBounds() : undefined;
    this.visibleStores = this.stores.filter(s => (this.filter === 'all' || s.brand === this.filter) && (!bounds || bounds.contains([s.longitude, s.latitude])))
      .sort((a, b) => this.distanceFrom(a, center.lat, center.lng) - this.distanceFrom(b, center.lat, center.lng)).slice(0, 60);
    this.cat?.setStores(this.visibleStores);
    if (!this.ready || !this.lib || !this.map) return;
    for (const store of this.visibleStores) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'cat-shop-marker ' + (store.brand === '全家' ? 'family' : 'seven');
      button.setAttribute('aria-label', `查看${store.name}商品${store.quantity !== undefined ? `，剩餘 ${store.quantity} 件` : ''}`);
      button.setAttribute('aria-pressed', String(this.selected?.id === store.id));
      const label = document.createElement('span'); label.className = 'shop-label';
      const roof = document.createElement('span'); roof.className = 'shop-roof'; roof.textContent = store.brand === '全家' ? 'FamilyMart' : 'SevenEleven';
      label.append(roof);
      {
        const badge = document.createElement('span'); badge.className = 'shop-stock-count';
        badge.textContent = store.quantity === undefined ? '—' : `${store.quantity} 件`;
        badge.title = store.quantity === undefined ? '尚未取得庫存' : '即期商品剩餘數量';
        label.append(badge);
      }
      button.append(label);
      button.addEventListener('click', () => this.zone.run(() => this.select(store, button)));
      const marker = new this.lib.Marker({ element: button, anchor: 'top' }).setLngLat([store.longitude, store.latitude]).addTo(this.map);
      this.markers.push(marker); this.markerById.set(store.id, marker);
    }
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
      cat.setStores(this.visibleStores);
      this.cat = cat;
      targetMap.addLayer(cat.layer);
      cat.setHighlight(this.highlightedId);
      cat.setProjectionListener(points => {
        for (const point of points) {
          const marker = this.markerById.get(point.id);
          if (!marker) continue;
          const ground = targetMap.project(marker.getLngLat());
          marker.getElement().style.width = `${Math.max(24, 48 * point.scale)}px`;
          marker.getElement().style.height = `${Math.max(24, ground.y - point.y + 8 * point.scale)}px`;
          marker.setOffset([point.x - ground.x, point.y - ground.y]);
          const label = marker.getElement().querySelector<HTMLElement>('.shop-label');
          if (label) label.style.transform = `translateX(-50%) scale(${point.scale})`;
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
    if (this.hasLocation()) this.map?.easeTo({ center: [this.longitude!, this.latitude!], zoom: 17, duration: this.reducedMotion ? 0 : 800 });
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
  retry(): void { this.angleTarget = undefined; this.compassView = undefined; this.failed = false; this.map?.remove(); this.map = undefined; this.cat = undefined; this.observer?.disconnect(); clearTimeout(this.loadTimer); void this.initialize(); }
  ngOnDestroy(): void {
    this.destroyed = true; clearTimeout(this.loadTimer); this.subscription?.unsubscribe(); this.observer?.disconnect();
    if (this.watchId !== undefined) navigator.geolocation.clearWatch(this.watchId);
    this.markers.forEach(m => m.remove()); this.map?.remove();
  }
}
