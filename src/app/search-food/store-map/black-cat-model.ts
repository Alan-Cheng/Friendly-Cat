import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

/** The same procedural character geometry and materials as alan-cheng/components/CatScene.tsx. */
export function createBlackCatModel(): THREE.Group {
  const cat = new THREE.Group();
  const material = (color: string, roughness = .65) => new THREE.MeshStandardMaterial({ color, roughness });
  const black = material('#242a35', .6), charcoal = material('#303746', .5);
  const pink = material('#e8a9b7'), cream = material('#f5efdf');
  const mint = material('#9bb5a0'), gold = material('#edcc80');
  function mesh(geometry: THREE.BufferGeometry, mat: THREE.Material, parent: THREE.Object3D, x = 0, y = 0, z = 0) {
    const object = new THREE.Mesh(geometry, mat);
    object.position.set(x, y, z); parent.add(object); return object;
  }
  function ball(parent: THREE.Object3D, mat: THREE.Material, x: number, y: number, z: number, sx: number, sy = sx, sz = sx) {
    const object = mesh(new THREE.SphereGeometry(1, 36, 28), mat, parent, x, y, z);
    object.scale.set(sx, sy, sz); return object;
  }
  function curve(parent: THREE.Object3D, points: THREE.Vector3[], mat: THREE.Material, radius = .025) {
    return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 24, radius, 8, false), mat, parent);
  }
  ball(cat, black, 0, .83, -.05, .76, .83, .65);
  ball(cat, charcoal, -.5, .29, .08, .38, .35, .42);
  ball(cat, charcoal, .5, .29, .08, .38, .35, .42);
  for (const x of [-.32, .32]) {
    ball(cat, black, x, .42, .42, .23, .4, .24);
    ball(cat, charcoal, x, .17, .61, .28, .18, .32);
  }
  const head = new THREE.Group(); head.position.set(0, 1.85, .1); cat.add(head);
  ball(head, black, 0, 0, 0, 1.02, .83, .77);
  const faceZ = (x: number, y: number) => .77 * Math.sqrt(Math.max(0, 1 - (x / 1.02) ** 2 - (y / .83) ** 2));
  const earShape = new THREE.Shape();
  earShape.moveTo(-.28, 0); earShape.quadraticCurveTo(-.22, .3, -.07, .64);
  earShape.quadraticCurveTo(0, .78, .09, .62); earShape.quadraticCurveTo(.29, .26, .3, 0); earShape.closePath();
  const earGeo = new THREE.ExtrudeGeometry(earShape, { depth: .3, bevelEnabled: true, bevelSegments: 5, steps: 1, bevelSize: .09, bevelThickness: .1 });
  const innerEar = material('#744759', .8);
  for (const x of [-.56, .56]) {
    const ear = mesh(earGeo, black, head, x, .37, -.18); ear.rotation.z = x < 0 ? .18 : -.18;
    const inner = mesh(earGeo, innerEar, ear, 0, .08, .41); inner.scale.set(.55, .65, .08);
  }
  for (const x of [-.38, .38]) {
    const eye = new THREE.Group(); eye.position.set(x, .015, .645); head.add(eye);
    ball(eye, material('#e7deb2', .3), 0, 0, 0, .245, .30, .11);
    const pupil = new THREE.Group(); pupil.position.set(0, -.015, .105); eye.add(pupil);
    ball(pupil, black, 0, 0, 0, .12, .22, .06);
    ball(pupil, cream, -.045, .1, .057, .032, .04, .012);
    ball(head, pink, x * 1.64, -.26, faceZ(x * 1.64, -.26), .13, .065, .025);
    for (let i = 0; i < 2; i++) {
      const side = Math.sign(x), y0 = -.23 - i * .1, y1 = -.2 - i * .13, y2 = -.18 - i * .17;
      curve(head, [new THREE.Vector3(x * 1.22, y0, faceZ(x * 1.22, y0) + .012), new THREE.Vector3(side * .68, y1, faceZ(side * .68, y1) + .012), new THREE.Vector3(side * .82, y2, faceZ(side * .82, y2) + .012)], charcoal, .012);
    }
  }
  ball(head, pink, 0, -.24, faceZ(0, -.24), .075, .052, .025);
  for (const side of [-1, 1]) curve(head, [new THREE.Vector3(0, -.29, faceZ(0, -.29) + .01), new THREE.Vector3(side * .075, -.35, faceZ(side * .075, -.35) + .01), new THREE.Vector3(side * .14, -.30, faceZ(side * .14, -.30) + .01)], charcoal, .018);
  const collar = mesh(new THREE.TorusGeometry(.64, .052, 12, 48), mint, cat, 0, 1.24, .1); collar.rotation.x = Math.PI / 2;
  const nameTag = new THREE.Group(); nameTag.position.set(0, .94, .785); cat.add(nameTag);
  mesh(new THREE.TorusGeometry(.068, .018, 10, 24), gold, nameTag, 0, .215, -.005);
  curve(cat, [new THREE.Vector3(0, 1.24, .74), new THREE.Vector3(0, 1.20, .77), new THREE.Vector3(0, 1.15, .78)], gold, .018);
  mesh(new RoundedBoxGeometry(1.02, .30, .055, 4, .10), gold, nameTag);
  const canvas = document.createElement('canvas'); canvas.width = 2070; canvas.height = 512;
  const context = canvas.getContext('2d')!;
  context.fillStyle = '#edcc80'; context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#453a27'; context.font = '700 300px Arial,"Noto Sans TC",sans-serif';
  context.textAlign = 'center'; context.textBaseline = 'middle'; context.fillText('Alan Cheng', canvas.width / 2, canvas.height / 2);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  mesh(new THREE.PlaneGeometry(.93, .23), new THREE.MeshStandardMaterial({ map: texture, roughness: .85 }), nameTag, 0, 0, .031);
  const tail = new THREE.Group(); tail.position.set(.5, .29, -.3); cat.add(tail);
  curve(tail, [new THREE.Vector3(0, 0, 0), new THREE.Vector3(.66, .06, -.12), new THREE.Vector3(1.06, .44, -.22), new THREE.Vector3(.99, 1.03, -.23), new THREE.Vector3(.72, 1.15, -.2)], black, .15);
  ball(tail, black, .72, 1.15, -.2, .15);
  return cat;
}
