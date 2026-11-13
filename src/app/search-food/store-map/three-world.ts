import { createBlackCatModel } from './black-cat-model';
import type { CustomLayerInterface } from 'maplibre-gl';

/** Procedural black cat and convenience stores rendered over real geographic coordinates. */
export async function createTownLayer(longitude: number, latitude: number) {
  const THREE = await import('three');
  const { MercatorCoordinate } = await import('maplibre-gl');
  const scene = new THREE.Scene();
  const camera = new THREE.Camera();
  const origin = MercatorCoordinate.fromLngLat([longitude, latitude], 0);
  const meter = origin.meterInMercatorCoordinateUnits();
  const cat = createBlackCatModel();
  const catHead = cat.getObjectByName('head')!;
  cat.visible = false;
  let heading: number | undefined;
  let displayedHeading: number | undefined;
  let lastFrameTime: number | undefined;
  // A ground-plane sector shares the cat's geographic frame, so rotating the map
  // cannot change the direction it indicates. Its radius stays constant on screen.
  const fanCanvas = document.createElement('canvas');
  fanCanvas.width = fanCanvas.height = 128;
  const fanContext = fanCanvas.getContext('2d')!;
  const fade = fanContext.createRadialGradient(64, 64, 0, 64, 64, 64);
  fade.addColorStop(0, 'rgba(66, 133, 244, .65)');
  fade.addColorStop(.45, 'rgba(66, 133, 244, .4)');
  fade.addColorStop(1, 'rgba(66, 133, 244, 0)');
  fanContext.fillStyle = fade;
  fanContext.fillRect(0, 0, 128, 128);
  const fanTexture = new THREE.CanvasTexture(fanCanvas);
  fanTexture.colorSpace = THREE.SRGBColorSpace;
  const directionFan = new THREE.Group();
  const sector = new THREE.Mesh(
    new THREE.CircleGeometry(1, 48, Math.PI / 3, Math.PI / 3),
    new THREE.MeshBasicMaterial({ map: fanTexture, transparent: true, depthWrite: false, side: THREE.DoubleSide })
  );
  // Circle +Y becomes north (-Z) on the map's ground plane.
  sector.rotation.x = -Math.PI / 2;
  sector.renderOrder = -1;
  directionFan.add(sector);
  directionFan.visible = false;
  scene.add(directionFan);
  let catLatitude = latitude;
  const shops = new THREE.Group();
  scene.add(shops);
  const shopMaterials: InstanceType<typeof THREE.Material>[] = [];
  const cream = new THREE.MeshStandardMaterial({ color: '#fff3db', roughness: .85 });
  const glass = new THREE.MeshStandardMaterial({ color: '#7fabb0', roughness: .3 });
  const frame = new THREE.MeshStandardMaterial({ color: '#f6f5e7', roughness: .7 });
  const familyGreen = new THREE.MeshStandardMaterial({ color: '#358561', roughness: .8 });
  const familyBlue = new THREE.MeshStandardMaterial({ color: '#6fbedb', roughness: .8 });
  const sevenOrange = new THREE.MeshStandardMaterial({ color: '#df7137', roughness: .8 });
  shopMaterials.push(cream, glass, frame, familyGreen, familyBlue, sevenOrange);
  let highlightedId: string | undefined;
  let projectionListener: ((points: { id: string; x: number; y: number; scale: number }[]) => void) | undefined;
  const highlightedMaterials = new Map<InstanceType<typeof THREE.Material>, InstanceType<typeof THREE.MeshStandardMaterial>>();
  const glowGeometry = new THREE.RingGeometry(6, 7, 32);
  const glowMaterial = new THREE.MeshBasicMaterial({ color: '#efbd52', transparent: true, opacity: .65, side: THREE.DoubleSide, depthWrite: false });
  shopMaterials.push(glowMaterial);
  const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
  function box(parent: InstanceType<typeof THREE.Group>, mat: InstanceType<typeof THREE.Material>, x: number, y: number, z: number, w: number, h: number, d: number) {
    const mesh = new THREE.Mesh(boxGeometry, mat); mesh.userData['baseMaterial'] = mat; mesh.position.set(x,y,z); mesh.scale.set(w,h,d); parent.add(mesh);
  }
  function localPoint(lng: number, lat: number) { const point = MercatorCoordinate.fromLngLat([lng,lat], 0); return new THREE.Vector3((point.x-origin.x)/meter, 0, (point.y-origin.y)/meter); }
  scene.add(cat);
  scene.add(new THREE.HemisphereLight('#fff9e7', '#899580', 2.8));
  const light = new THREE.DirectionalLight('#ffffff', 2.5); light.position.set(-20, 40, 20); scene.add(light);
  let renderer: InstanceType<typeof THREE.WebGLRenderer>;
  let mapInstance: import('maplibre-gl').Map;

  const layer: CustomLayerInterface = {
    id: 'friendly-town-world', type: 'custom', renderingMode: '3d',
    onAdd(map, gl) {
      mapInstance = map;
      renderer = new THREE.WebGLRenderer({ canvas: map.getCanvas(), context: gl as WebGLRenderingContext, antialias: true });
      renderer.autoClear = false;
    },
    render(gl, args) {
      const scale = meter;
      cat.scale.setScalar(13);
      // Lift the face toward the overhead camera, returning to its normal pose in 3D.
      catHead.rotation.x = -Math.PI / 4 * Math.max(0, Math.min(1, 1 - mapInstance.getPitch() / 55));
      const now = performance.now();
      const elapsed = lastFrameTime === undefined ? 0 : Math.min(64, now - lastFrameTime);
      lastFrameTime = now;
      if (heading === undefined) displayedHeading = undefined;
      else if (displayedHeading === undefined) displayedHeading = heading;
      else {
        const delta = ((heading - displayedHeading + 540) % 360) - 180;
        displayedHeading = (displayedHeading + delta * (1 - Math.exp(-elapsed / 140)) + 360) % 360;
        if (Math.abs(delta) > .1) mapInstance.triggerRepaint();
        else displayedHeading = heading;
      }
      directionFan.visible = cat.visible && heading !== undefined && mapInstance.getPitch() <= .5;
      if (directionFan.visible) {
        directionFan.position.copy(cat.position);
        directionFan.position.y = .04;
        directionFan.rotation.y = -displayedHeading! * Math.PI / 180;
        const metersPerPixel = 40075016.686 * Math.cos(catLatitude * Math.PI / 180)
          / (512 * Math.pow(2, mapInstance.getZoom()));
        directionFan.scale.setScalar(48 * metersPerPixel);
      }
      for (const shop of shops.children) {
        const active = shop.userData['storeId'] === highlightedId;
        shop.scale.setScalar(active ? 3.25 : 2.5);
        shop.traverse(object => {
          if (!(object instanceof THREE.Mesh)) return;
          if (object.userData['glow']) { object.visible = active; return; }
          const base = object.userData['baseMaterial'];
          if (!base) return;
          if (active && !highlightedMaterials.has(base)) {
            const bright = base.clone(); bright.emissive.set('#ffd887'); bright.emissiveIntensity = .45;
            highlightedMaterials.set(base, bright); shopMaterials.push(bright);
          }
          object.material = active ? highlightedMaterials.get(base) : base;
        });
      }
      const model = new THREE.Matrix4().makeTranslation(origin.x, origin.y, origin.z)
        .scale(new THREE.Vector3(scale, -scale, scale))
        .multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2));
      camera.projectionMatrix = new THREE.Matrix4().fromArray(args.defaultProjectionData.mainMatrix).multiply(model);
      // The model faces +Z (south); compass headings turn clockwise from north.
      // Both map perspectives share this world-space direction.
      cat.rotation.y = displayedHeading === undefined ? -mapInstance.getBearing() * Math.PI / 180
        : (180 - displayedHeading) * Math.PI / 180;
      // World pieces stay visible over the schematic base buildings, with normal depth between their own surfaces.
      renderer.resetState(); renderer.clearDepth(); renderer.render(scene, camera);
      if (projectionListener) {
        const width = mapInstance.getCanvas().clientWidth, height = mapInstance.getCanvas().clientHeight;
        // Enlarge screen-space labels as the map zooms out so stock counts stay readable.
        const labelScale = Math.max(1.2, Math.min(1.8, 1.2 + (17 - mapInstance.getZoom()) * .2));
        projectionListener(shops.children.map(shop => {
          const point = new THREE.Vector3(shop.position.x, 7.55 * shop.scale.x, shop.position.z).applyMatrix4(camera.projectionMatrix);
          return { id: shop.userData['storeId'], x: (point.x + 1) * width / 2, y: (1 - point.y) * height / 2, scale: labelScale * (shop.userData['storeId'] === highlightedId ? 1.3 : 1) };
        }));
      }
    },
    onRemove() {
      const geometries = new Set<InstanceType<typeof THREE.BufferGeometry>>();
      const materials = new Set<InstanceType<typeof THREE.Material>>(shopMaterials);
      const textures = new Set<InstanceType<typeof THREE.Texture>>();
      scene.traverse(object => {
        if (object instanceof THREE.Mesh) {
          geometries.add(object.geometry);
          for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
            materials.add(material);
            if (material instanceof THREE.MeshStandardMaterial && material.map) textures.add(material.map);
          }
        }
      });
      geometries.add(glowGeometry);
      geometries.forEach(geometry => geometry.dispose());
      materials.forEach(material => material.dispose());
      textures.add(fanTexture);
      textures.forEach(texture => texture.dispose());
      renderer?.dispose();
    }
  };
  return {
    layer,
    setHeading(value?: number) { heading = value; mapInstance?.triggerRepaint(); },
    setHighlight(id?: string) { highlightedId = id; mapInstance?.triggerRepaint(); },
    setProjectionListener(listener: typeof projectionListener) { projectionListener = listener; mapInstance?.triggerRepaint(); },
    setPosition(lng: number, lat: number) { catLatitude = lat; cat.position.copy(localPoint(lng,lat)); cat.visible = true; mapInstance?.triggerRepaint(); },
    setStores(stores: { id: string; latitude: number; longitude: number; brand: string }[]) {
      shops.clear();
      for (const store of stores) {
        const shop = new THREE.Group(); shop.userData['storeId'] = store.id; shop.position.copy(localPoint(store.longitude, store.latitude));
        const green = store.brand === '全家';
        box(shop, cream, 0, 3.3, 0, 10, 6.6, 7);
        box(shop, glass, -2.5, 2.9, 3.56, 3, 4.5, .12);
        box(shop, glass, 2.1, 2.9, 3.56, 3.8, 4.5, .12);
        box(shop, frame, 0, 2.9, 3.7, .35, 4.7, .3);
        box(shop, frame, 2.1, 2.9, 3.7, .18, 4.7, .3);
        box(shop, green ? familyGreen : sevenOrange, 0, 6.3, .2, 10.6, 1.6, 8);
        box(shop, green ? familyBlue : familyGreen, 0, 7.3, .2, 10.8, .5, 8.2);
        box(shop, frame, 0, .3, .6, 11.5, .6, 8.6);
        const glow = new THREE.Mesh(glowGeometry, glowMaterial); glow.rotation.x = -Math.PI / 2; glow.position.y = .08; glow.userData['glow'] = true; glow.visible = false; shop.add(glow);
        shops.add(shop);
      }
      mapInstance?.triggerRepaint();
    }
  };
}
