import * as THREE from 'three';
import { MercatorCoordinate } from 'maplibre-gl';
import { createTownLayer } from './three-world';

describe('town WebGL rendering', () => {
  it('batches 60 shops and preserves geometry on stock updates while reconciling moves and highlights', async () => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const gl = canvas.getContext('webgl2')!;
    expect(gl).withContext('WebGL2 is required for the map').toBeTruthy();
    const draw = spyOn(gl, 'drawElementsInstanced').and.callThrough();
    const repaint = jasmine.createSpy('triggerRepaint');
    const longitude = 121.5654, latitude = 25.033;
    let zoom = 16;
    const map = { getCanvas: () => canvas, getPitch: () => 0, getBearing: () => 0, getZoom: () => zoom, triggerRepaint: repaint };
    const town = await createTownLayer(longitude, latitude);
    const origin = MercatorCoordinate.fromLngLat([longitude, latitude]);
    const matrix = new THREE.Matrix4().makeScale(100000, 100000, 100000)
      .multiply(new THREE.Matrix4().makeTranslation(-origin.x, -origin.y, -origin.z));
    const render = () => town.layer.render(gl, { defaultProjectionData: { mainMatrix: matrix.elements } } as any);
    let projected: { id: string; x: number; y: number; scale: number }[] = [];
    town.setProjectionListener(points => { projected = points; });
    const stores = Array.from({ length: 60 }, (_, i) => ({ id: String(i), latitude, longitude: longitude + i * .00002, brand: i % 2 ? '全家' : '7-11', quantity: 1 }));
    town.layer.onAdd!(map as any, gl);
    document.body.append(canvas);
    try {
      town.setStores(stores.slice(0, 1));
      render();
      draw.calls.reset();
      town.setStores(stores);
      render();
      expect(projected.length).toBe(60);
      expect(draw.calls.count()).toBeGreaterThan(0);
      expect(draw.calls.count()).toBeLessThanOrEqual(6);
      expect(draw.calls.allArgs().reduce((sum, args) => sum + args[4], 0)).toBe(480);
      zoom = 7;
      draw.calls.reset();
      projected = [];
      render();
      expect(draw).not.toHaveBeenCalled();
      expect(projected).toEqual([]);
      zoom = 16;
      render();
      const roof = { ...projected.find(point => point.id === '0')! };
      repaint.calls.reset();
      town.setStores(stores.map(store => ({ ...store, quantity: 9 })).reverse());
      expect(repaint).not.toHaveBeenCalled();
      town.setHighlight('0');
      render();
      const highlighted = projected.find(point => point.id === '0')!;
      expect(highlighted.scale).toBeCloseTo(roof.scale * 1.3);
      town.setHighlight(undefined);
      town.setStores([{ ...stores[0], longitude: longitude + .001 }]);
      draw.calls.reset();
      render();
      expect(projected.length).toBe(1);
      expect(projected[0].x).toBeGreaterThan(roof.x);
      expect(draw.calls.count()).toBeLessThanOrEqual(5);
      town.setStores([]);
      draw.calls.reset();
      render();
      expect(projected).toEqual([]);
      expect(draw).not.toHaveBeenCalled();
    } finally {
      town.layer.onRemove!(map as any, gl);
      canvas.remove();
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    }
  });
});
