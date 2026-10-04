import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

// One continuous space along -Z. The camera flies through a stone ring into each world.
// A: dusk monoliths (0 → -70) · B: galaxy (-70 → -150) · C: dawn ocean (-150 → -230) · D: night aurora (-230 → end)
export const PORTALS = [-70, -150, -230];
export const END_Z = -285;
export const START_Z = 26;

type Palette = { top: string; horizon: string; bottom: string; sun: string; fog: string; density: number; light: string; sunY: number; sunPow: number };
const PALETTES: Palette[] = [
  { top: "#0d1322", horizon: "#b8612e", bottom: "#0b0c10", sun: "#ffb070", fog: "#2b2225", density: .02, light: "#ffb27a", sunY: .06, sunPow: 180 },
  { top: "#020308", horizon: "#1a0f2e", bottom: "#020308", sun: "#3a2a70", fog: "#07060f", density: .012, light: "#b9a4ff", sunY: .02, sunPow: 40 },
  { top: "#2a4a74", horizon: "#e89660", bottom: "#152438", sun: "#d9a878", fog: "#9a7a72", density: .011, light: "#ffd2a0", sunY: .03, sunPow: 260 },
  { top: "#01020a", horizon: "#0a1a32", bottom: "#010205", sun: "#12503f", fog: "#030814", density: .013, light: "#7fe8ff", sunY: .2, sunPow: 12 },
];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (a: number, b: number, x: number) => { const t = Math.min(Math.max((x - a) / (b - a), 0), 1); return t * t * (3 - 2 * t); };

// Tileable fractal value noise, 0..1, used for stone surfaces and cloud shapes.
function fbm(size: number, base: number, octaves: number, seed: number) {
  let st = seed; const rnd = () => (st = (st * 16807) % 2147483647) / 2147483647;
  const out = new Float32Array(size * size);
  let amp = 1, total = 0;
  for (let o = 0; o < octaves; o++) {
    const cells = base << o, grid = new Float32Array(cells * cells).map(rnd);
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const gx = x / size * cells, gy = y / size * cells, x0 = Math.floor(gx), y0 = Math.floor(gy);
      const fx = gx - x0, fy = gy - y0, sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
      const g = (i: number, j: number) => grid[((j % cells) * cells) + (i % cells)];
      const top = g(x0, y0) + (g(x0 + 1, y0) - g(x0, y0)) * sx, bot = g(x0, y0 + 1) + (g(x0 + 1, y0 + 1) - g(x0, y0 + 1)) * sx;
      out[y * size + x] += (top + (bot - top) * sy) * amp;
    }
    total += amp; amp *= .5;
  }
  for (let i = 0; i < out.length; i++) out[i] /= total;
  return out;
}
function noiseCanvasTexture(size: number, paint: (v: Float32Array, img: ImageData) => void, v: Float32Array) {
  const c = document.createElement("canvas"); c.width = c.height = size;
  const g = c.getContext("2d")!; const img = g.createImageData(size, size); paint(v, img); g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
let stoneTex: THREE.CanvasTexture | null = null;
function stoneTexture() {
  if (stoneTex) return stoneTex;
  const size = 256, v = fbm(size, 4, 6, 7), ridge = fbm(size, 8, 3, 19);
  stoneTex = noiseCanvasTexture(size, (n, img) => { for (let i = 0; i < n.length; i++) { const c = Math.min(255, Math.max(0, (n[i] * .75 + Math.abs(ridge[i] - .5) * .5) * 255)); img.data.set([c, c, c, 255], i * 4); } }, v);
  return stoneTex;
}
function cloudTexture() {
  const size = 256, v = fbm(size, 3, 6, 42);
  const t = noiseCanvasTexture(size, (n, img) => {
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const i = y * size + x, dx = (x / size - .5) * 2, dy = (y / size - .5) * 2.4, fall = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy));
      const a = Math.max(0, n[i] * 1.6 - .55) * Math.pow(fall, 1.2);
      img.data.set([255, 255, 255, Math.min(255, a * 360)], i * 4);
    }
  }, v);
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; t.colorSpace = THREE.SRGBColorSpace; return t;
}

function softTexture() {
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const g = c.getContext("2d")!; const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(255,255,255,1)"); grad.addColorStop(.4, "rgba(255,255,255,.45)"); grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad; g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

function rocky<T extends THREE.BufferGeometry>(geo: T, amount: number, seed = 1) {
  const p = geo.attributes.position as THREE.BufferAttribute; const v = new THREE.Vector3();
  let s = seed; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const cache = new Map<string, number>();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const key = `${v.x.toFixed(3)},${v.y.toFixed(3)},${v.z.toFixed(3)}`;
    if (!cache.has(key)) cache.set(key, 1 + (rnd() - .5) * amount);
    v.multiplyScalar(cache.get(key)!); p.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals(); return geo;
}

const stoneMat = (flat = true, repeat = 3) => {
  const tex = stoneTexture().clone(); tex.needsUpdate = true; tex.repeat.set(repeat, flat ? repeat : 1);
  return new THREE.MeshStandardMaterial({ color: "#2a2a30", roughness: flat ? .55 : .42, metalness: flat ? .35 : .5, flatShading: flat, bumpMap: tex, bumpScale: flat ? 2.2 : 3.2, roughnessMap: tex });
};

function portal(z: number, rim: string, discColor: string) {
  const g = new THREE.Group(); g.position.set(0, .4, z);
  const ring = new THREE.Mesh(rocky(new THREE.TorusGeometry(6.6, 1.15, 48, 220), .012, Math.abs(z)), stoneMat(false, 6));
  const glow = new THREE.Mesh(new THREE.TorusGeometry(5.48, .05, 8, 160), new THREE.MeshBasicMaterial({ color: new THREE.Color(rim).multiplyScalar(2.2), transparent: true, opacity: .9, blending: THREE.AdditiveBlending, fog: false }));
  const disc = new THREE.Mesh(new THREE.CircleGeometry(5.5, 64), new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { color: { value: new THREE.Color(discColor) }, strength: { value: 0 }, time: { value: 0 } },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }",
    fragmentShader: `uniform vec3 color; uniform float strength; uniform float time; varying vec2 vUv;
      void main(){ float d = length(vUv - .5) * 2.; float swirl = .5 + .5 * sin(atan(vUv.y-.5, vUv.x-.5) * 6. + time * 1.5 - d * 8.);
      float a = (smoothstep(1., .0, d) * .55 + smoothstep(1., .85, d) * .6) * (0.9 + swirl * .1) * strength; gl_FragColor = vec4(color * a, a); }`,
  }));
  g.add(ring, glow, disc);
  return { group: g, disc: disc.material as THREE.ShaderMaterial, glow: glow.material as THREE.MeshBasicMaterial, z };
}

export function createWorlds(canvas: HTMLCanvasElement, mobile: boolean) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.6 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: mobile ? 2 : 4 });
  const composer = new EffectComposer(renderer, target);
  const camera = new THREE.PerspectiveCamera(62, 1, .1, 900);
  scene.fog = new THREE.FogExp2("#2b2225", .02);
  const soft = softTexture(); const cloud = cloudTexture();
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), .6, .5, .86); composer.addPass(bloom);
  composer.addPass(new OutputPass());

  // Sky dome that follows the camera; colours blend between worlds.
  const sky = new THREE.Mesh(new THREE.SphereGeometry(500, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color() }, horizon: { value: new THREE.Color() }, bottom: { value: new THREE.Color() }, sun: { value: new THREE.Color() }, sunDir: { value: new THREE.Vector3(0, .05, -1) }, sunPow: { value: 100 } },
    vertexShader: "varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }",
    fragmentShader: `uniform vec3 top, horizon, bottom, sun, sunDir; uniform float sunPow; varying vec3 vDir;
      void main(){ float h = vDir.y; vec3 c = mix(horizon, top, smoothstep(-.02, .55, h)); c = mix(c, bottom, smoothstep(0., -.35, h));
      float s = max(dot(normalize(vDir), normalize(sunDir)), 0.); c += sun * (pow(s, sunPow) * 2.2 + pow(s, 6.) * .35); gl_FragColor = vec4(c, 1.); }`,
  }));
  scene.add(sky);
  const skyU = (sky.material as THREE.ShaderMaterial).uniforms;

  const hemi = new THREE.HemisphereLight("#ffffff", "#101014", .55); scene.add(hemi);
  const sunLight = new THREE.DirectionalLight("#ffb27a", 3.4); sunLight.position.set(6, 5, -20); scene.add(sunLight, sunLight.target);

  // Stars (follow the camera, fade in for space + night).
  const starCount = mobile ? 1500 : 3000;
  const starPos = new Float32Array(starCount * 3), starSeed = new Float32Array(starCount);
  for (let i = 0; i < starCount; i++) {
    const u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2, r = 420;
    const y = Math.abs(u) * .95 + .02, rr = Math.sqrt(1 - y * y);
    starPos.set([Math.cos(th) * rr * r, y * r, Math.sin(th) * rr * r], i * 3); starSeed[i] = Math.random() * 6.28;
  }
  const starGeo = new THREE.BufferGeometry(); starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3)); starGeo.setAttribute("seed", new THREE.BufferAttribute(starSeed, 1));
  const starMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
    uniforms: { time: { value: 0 }, opacity: { value: 0 }, px: { value: renderer.getPixelRatio() } },
    vertexShader: "attribute float seed; uniform float time; uniform float px; varying float vA; void main(){ vA = .45 + .55 * sin(time * 1.6 + seed * 3.); gl_PointSize = (1.2 + fract(seed) * 1.8) * px; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }",
    fragmentShader: "uniform float opacity; varying float vA; void main(){ float d = length(gl_PointCoord - .5); if (d > .5) discard; gl_FragColor = vec4(vec3(1.), (1. - d * 2.) * vA * opacity); }",
  });
  const stars = new THREE.Points(starGeo, starMat); scene.add(stars);
  const meteors = Array.from({ length: 3 }, () => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(14, .06), new THREE.MeshBasicMaterial({ map: soft, color: "#dff6ff", transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    m.userData = { t: -Math.random() * 6, speed: .5 + Math.random() * .4 }; scene.add(m); return m;
  });

  // ── World A: dusk, floating monoliths above a sea of cloud ──
  const worldA = new THREE.Group(); scene.add(worldA);

  // Hero: the ring standing on a cliff edge, a cloud sea below, mountains in the haze.
  const cliff = new THREE.Mesh(new THREE.PlaneGeometry(70, 60, 180, 150), new THREE.MeshStandardMaterial({ color: "#221f23", roughness: .85, metalness: .12, bumpMap: (() => { const t = stoneTexture().clone(); t.needsUpdate = true; t.repeat.set(14, 12); return t; })(), bumpScale: 3 }));
  {
    const p = cliff.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i) + 14, y = p.getY(i);
      const edge = x < -6 ? -(Math.pow(-6 - x, 1.4)) * .9 : 0;
      p.setZ(i, Math.random() * .22 + Math.sin(x * 1.3 + y * .7) * .18 + Math.sin(x * .35) * Math.cos(y * .3) * .8 + Math.max(0, x - 10) * .12 + edge);
    }
    cliff.geometry.computeVertexNormals();
  }
  cliff.rotation.x = -Math.PI / 2; cliff.position.set(14, -5.6, 10); worldA.add(cliff);
  for (let i = 0; i < 8; i++) {
    const h = 18 + Math.random() * 22, side = i % 2 ? 1 : -1;
    const m = new THREE.Mesh(rocky(new THREE.ConeGeometry(h * (.8 + Math.random() * .5), h, 28, 14), .14, i + 21), new THREE.MeshStandardMaterial({ color: "#1c1c22", roughness: .9, bumpMap: stoneTexture(), bumpScale: 4 }));
    m.position.set(side * (26 + Math.random() * 45), -12 + h / 2 - 4, -25 - Math.random() * 70); worldA.add(m);
  }
  const stones: { m: THREE.Mesh; base: THREE.Vector3; spin: THREE.Vector3; phase: number }[] = [];
  for (let i = 0; i < 9; i++) {
    const side = i % 2 ? 1 : -1;
    const geo = i % 3 === 0 ? rocky(new THREE.BoxGeometry(1.6, 5.5 + Math.random() * 3, 1.3, 3, 6, 3), .18, i + 3) : rocky(new THREE.IcosahedronGeometry(1 + Math.random() * 1.4, 1), .35, i + 7);
    const m = new THREE.Mesh(geo, stoneMat());
    const base = new THREE.Vector3(side * (11 + Math.random() * 7), -3 + Math.random() * 9, -8 - i * 6.5);
    m.position.copy(base); worldA.add(m);
    stones.push({ m, base, spin: new THREE.Vector3(Math.random() * .2, .15 + Math.random() * .25, Math.random() * .1), phase: Math.random() * 6.28 });
  }
  const clouds: { s: THREE.Sprite; speed: number }[] = [];
  const cloudCount = mobile ? 40 : 75;
  for (let i = 0; i < cloudCount; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloud, color: "#9d9097", transparent: true, opacity: .55, depthWrite: false, rotation: Math.random() * Math.PI * 2 }));
    const sc = 14 + Math.random() * 22; s.scale.set(sc, sc * .45, 1);
    s.position.set((Math.random() - .5) * 110, -10 + Math.random() * 3.5, 40 - Math.random() * 115);
    worldA.add(s); clouds.push({ s, speed: .2 + Math.random() * .5 });
  }
  const emberCount = mobile ? 250 : 500;
  const emberPos = new Float32Array(emberCount * 3);
  for (let i = 0; i < emberCount; i++) emberPos.set([(Math.random() - .5) * 30, -6 + Math.random() * 14, 26 - Math.random() * 96], i * 3);
  const emberGeo = new THREE.BufferGeometry(); emberGeo.setAttribute("position", new THREE.BufferAttribute(emberPos, 3));
  const embers = new THREE.Points(emberGeo, new THREE.PointsMaterial({ map: soft, color: "#ffb46b", size: .16, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  worldA.add(embers);

  // ── World B: a spiral galaxy the camera skims across ──
  const worldB = new THREE.Group(); worldB.position.set(0, -2.6, -112); worldB.rotation.x = .08; scene.add(worldB);
  const galaxyCount = mobile ? 16000 : 42000;
  const gPos = new Float32Array(galaxyCount * 3), gCol = new Float32Array(galaxyCount * 3), gR = new Float32Array(galaxyCount);
  const inner = new THREE.Color("#ffe2a8"), mid = new THREE.Color("#ff9a5a"), outer = new THREE.Color("#6d5cff"); const col = new THREE.Color();
  for (let i = 0; i < galaxyCount; i++) {
    const r = Math.pow(Math.random(), 1.6) * 34, arm = (i % 3) * (Math.PI * 2 / 3), spin = r * .32;
    const spread = (1 - r / 40) * 1.4 + .3; const rx = (Math.random() - .5) * spread * (1 + r * .08), rz = (Math.random() - .5) * spread * (1 + r * .08);
    gPos.set([Math.cos(arm + spin) * r + rx, (Math.random() - .5) * (1.6 - r / 30) * 1.2, Math.sin(arm + spin) * r + rz], i * 3);
    col.copy(inner).lerp(mid, Math.min(r / 12, 1)).lerp(outer, Math.max((r - 12) / 22, 0)); gCol.set([col.r, col.g, col.b], i * 3); gR[i] = r;
  }
  const gGeo = new THREE.BufferGeometry(); gGeo.setAttribute("position", new THREE.BufferAttribute(gPos, 3)); gGeo.setAttribute("color", new THREE.BufferAttribute(gCol, 3)); gGeo.setAttribute("radius", new THREE.BufferAttribute(gR, 1));
  const gMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true,
    uniforms: { time: { value: 0 }, px: { value: renderer.getPixelRatio() }, opacity: { value: 1 } },
    vertexShader: `attribute float radius; uniform float time; uniform float px; varying vec3 vC; varying float vF;
      void main(){ vC = color; float a = time * (0.9 / (radius + 3.)); float c = cos(a), s = sin(a);
      vec3 p = vec3(position.x * c - position.z * s, position.y, position.x * s + position.z * c);
      vec4 mv = modelViewMatrix * vec4(p, 1.); vF = smoothstep(110., 40., -mv.z); gl_PointSize = px * 38. / -mv.z; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: "uniform float opacity; varying vec3 vC; varying float vF; void main(){ float d = length(gl_PointCoord - .5); if (d > .5) discard; gl_FragColor = vec4(vC, pow(1. - d * 2., 2.) * .85 * opacity * vF); }",
  });
  worldB.add(new THREE.Points(gGeo, gMat));
  const core = new THREE.Sprite(new THREE.SpriteMaterial({ map: soft, color: "#ffd9a0", transparent: true, opacity: .9, depthWrite: false, blending: THREE.AdditiveBlending }));
  core.scale.set(14, 14, 1); worldB.add(core);
  const nebulaColors = ["#6d4cff", "#ff8a4c", "#b04cff", "#4c8aff", "#ff5c8a"];
  for (let i = 0; i < (mobile ? 10 : 18); i++) {
    const n = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloud, color: nebulaColors[i % nebulaColors.length], transparent: true, opacity: .16 + Math.random() * .12, depthWrite: false, blending: THREE.AdditiveBlending, rotation: Math.random() * 6.28 }));
    const a = Math.random() * 6.28, r = 12 + Math.random() * 30, sc = 22 + Math.random() * 30;
    n.position.set(Math.cos(a) * r, (Math.random() - .5) * 8, Math.sin(a) * r); n.scale.set(sc, sc * .6, 1); worldB.add(n);
  }

  // ── World C: dawn ocean ──
  const ocean = new THREE.Mesh(new THREE.PlaneGeometry(260, 110, mobile ? 110 : 200, mobile ? 50 : 90), new THREE.ShaderMaterial({
    transparent: true, depthWrite: true,
    uniforms: { presence: { value: 0 }, time: { value: 0 }, deep: { value: new THREE.Color("#0b1c30") }, light: { value: new THREE.Color("#ffc58f") }, fogColor: { value: new THREE.Color() }, fogDensity: { value: .011 }, sunDir: { value: new THREE.Vector3(0, .05, -1) } },
    vertexShader: `uniform float time; varying vec3 vWorld; varying float vH;
      void main(){ vec3 p = position; float h = sin(p.x * .18 + time * .9) * .35 + sin(p.y * .27 - time * 1.2) * .28 + sin((p.x + p.y) * .09 + time * .6) * .5 + sin(p.x * .6 - p.y * .4 + time * 2.) * .06;
      p.z += h; vH = h; vec4 w = modelMatrix * vec4(p, 1.); vWorld = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `uniform vec3 deep, light, fogColor, sunDir; uniform float fogDensity, presence; varying vec3 vWorld; varying float vH;
      void main(){ vec3 n = normalize(cross(dFdx(vWorld), dFdy(vWorld))); if (n.y < 0.) n = -n; vec3 v = normalize(cameraPosition - vWorld);
      float fres = pow(1. - max(dot(n, v), 0.), 4.); vec3 r = reflect(-v, n); float spec = pow(max(dot(r, normalize(sunDir)), 0.), 90.);
      vec3 c = mix(deep, light * .55, fres) + light * spec * 2.5 + vec3(vH * .04);
      float d = length(cameraPosition - vWorld); float f = 1. - exp(-fogDensity * fogDensity * d * d); gl_FragColor = vec4(mix(c, fogColor, f), presence); }`,
  }));
  ocean.rotation.x = -Math.PI / 2; ocean.position.set(0, -3.2, -195); ocean.visible = false; // retired: water read badly and cut the rings
  const worldC = new THREE.Group(); scene.add(worldC);
  const dawnClouds: { s: THREE.Sprite; base: number; speed: number }[] = [];
  const dawnTints = ["#f6d6c4", "#f0c3ad", "#e8b39c", "#fbe4d3"];
  for (let i = 0; i < (mobile ? 55 : 120); i++) {
    const m = new THREE.SpriteMaterial({ map: cloud, color: dawnTints[i % dawnTints.length], transparent: true, opacity: 0, depthWrite: false, rotation: Math.random() * 6.28 });
    const sp = new THREE.Sprite(m); const sc = 18 + Math.random() * 30; sp.scale.set(sc, sc * .42, 1);
    sp.position.set((Math.random() - .5) * 150, -13 + Math.random() * 4.5, -142 - Math.random() * 100);
    worldC.add(sp); dawnClouds.push({ s: sp, base: .5 + Math.random() * .35, speed: .1 + Math.random() * .3 });
  }
  const islands: { m: THREE.Mesh; y: number; phase: number }[] = [];
  for (let i = 0; i < 6; i++) {
    const side = i % 2 ? 1 : -1, r = 2.5 + Math.random() * 3.5;
    const m = new THREE.Mesh(rocky(new THREE.IcosahedronGeometry(r, 2), .28, i + 51), stoneMat(true, 2));
    m.scale.y = .55; m.position.set(side * (15 + Math.random() * 18), -3 + Math.random() * 6, -158 - i * 12);
    worldC.add(m); islands.push({ m, y: m.position.y, phase: Math.random() * 6.28 });
  }
  const oceanU = (ocean.material as THREE.ShaderMaterial).uniforms;

  // ── World D: night, aurora, a lone ring on the ridge ──
  const worldD = new THREE.Group(); scene.add(worldD);
  const ground = new THREE.Mesh(rocky(new THREE.PlaneGeometry(160, 130, 140, 110), .0, 9), new THREE.MeshStandardMaterial({ color: "#101318", roughness: .98, metalness: 0, flatShading: true, bumpMap: (() => { const t = stoneTexture().clone(); t.needsUpdate = true; t.repeat.set(20, 16); return t; })(), bumpScale: 2.5, transparent: true, opacity: 0 }));
  { const p = ground.geometry.attributes.position as THREE.BufferAttribute; for (let i = 0; i < p.count; i++) p.setZ(i, Math.pow(Math.random(), 2.2) * 1.6 + Math.abs(Math.sin(p.getX(i) * .21 + p.getY(i) * .13)) * 1.4 + Math.max(0, Math.abs(p.getX(i)) - 12) * .12); ground.geometry.computeVertexNormals(); }
  ground.rotation.x = -Math.PI / 2; ground.position.set(0, -8.5, -305); worldD.add(ground);
  const auroraMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false,
    uniforms: { time: { value: 0 }, opacity: { value: 0 } },
    vertexShader: `uniform float time; varying vec2 vUv; void main(){ vUv = uv; vec3 p = position; p.z += sin(p.x * .05 + time * .3) * 8.; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.); }`,
    fragmentShader: `uniform float time, opacity; varying vec2 vUv;
      void main(){ float x = vUv.x * 10.; float band = sin(x * 1.3 + time * .5) * .5 + sin(x * 3.1 - time * .8) * .3 + sin(x * 7. + time) * .15;
      float streak = pow(.5 + .5 * sin(x * 22. + band * 4.), 3.); float fall = smoothstep(0., .25, vUv.y) * smoothstep(1., .35, vUv.y);
      vec3 c = mix(vec3(.15, 1., .65), vec3(.45, .3, 1.), smoothstep(.3, 1., vUv.y)); float a = fall * (.35 + streak * .65) * (.6 + band * .4) * opacity * .45;
      gl_FragColor = vec4(c * a, a); }`,
  });
  for (let i = 0; i < 3; i++) { const a = new THREE.Mesh(new THREE.PlaneGeometry(240, 55, 60, 1), auroraMat); a.position.set(-20 + i * 20, 32 + i * 6, -360 - i * 30); a.rotation.y = (i - 1) * .25; worldD.add(a); }

  const portals = [portal(PORTALS[0], "#ffb070", "#ffcf96"), portal(PORTALS[1], "#b39cff", "#c9b8ff"), portal(PORTALS[2], "#ffd6a0", "#8ff0d6"), portal(-335, "#5ff0c8", "#5ff0c8"), portal(0, "#ffb070", "#ffd6a0")];
  portals.forEach(p => scene.add(p.group));
  portals[3].group.position.y = 2.4; portals[3].group.scale.setScalar(1.5);
  portals[4].group.position.y = 1.6; portals[4].group.scale.setScalar(1.15); portals[4].group.rotation.y = -.35;

  const cA = new THREE.Color(), cB = new THREE.Color(); const lookTarget = new THREE.Vector3(), lookGoal = new THREE.Vector3(); let lookInit = false; let pointerX = 0, pointerY = 0, portrait = false, snapNext = false;
  const mixHex = (key: keyof Palette, w: number[], out: THREE.Color) => { out.setRGB(0, 0, 0); w.forEach((wi, i) => { if (wi > 0) out.add(cA.set(PALETTES[i][key] as string).multiplyScalar(wi)); }); return out; };

  function weights(z: number) {
    const s = PORTALS.reduce((sum, p) => sum + smooth(p + 6, p - 6, z), 0);
    return [0, 1, 2, 3].map(k => Math.max(0, 1 - Math.abs(s - k)));
  }

  renderer.compile(scene, camera);

  return {
    resize(w: number, h: number) { renderer.setSize(w, h, false); composer.setPixelRatio(renderer.getPixelRatio()); composer.setSize(w, h); camera.aspect = w / h; portrait = w < h; camera.fov = w < h ? 78 : 62; camera.updateProjectionMatrix(); },
    pointer(x: number, y: number) { pointerX = x; pointerY = y; },
    snap() { snapNext = true; },
    render(z: number, time: number, shot = 0) {
      const cOcean = smooth(PORTALS[1], PORTALS[2], z);
      const w = weights(z);
      // camera glides on a gentle S-curve with pointer parallax
      // Hero (z > 0): start off to the left of the ring, the way the photo frames it, then swing in and fly through.
      const h = smooth(0, START_Z, z), hs = h * h;
      // Each slide has its own framing: a sideways offset, a height and a look direction.
      // Near a ring, fade out every sideways offset so the camera threads the opening instead of the stone.
      const ringNear = [0, ...PORTALS].reduce((m, p) => Math.max(m, smooth(16, 3, Math.abs(z - p))), 0);
      const free = 1 - ringNear * .9;
      const k0 = Math.floor(shot), f = shot - k0, sf = f * f * (3 - 2 * f);
      const shotOf = (k: number) => k === 0 ? [0, 0, 0] : [Math.sin(k * 2.39) * 3, Math.cos(k * 1.7) * 1.1, Math.sin(k * 1.31 + 1) * 7];
      const [ax, ay, al] = shotOf(k0), [bx, by, bl] = shotOf(k0 + 1);
      const sx = lerp(ax, bx, sf) * (1 - hs) * free, sy = lerp(ay, by, sf) * (1 - hs) * free, sl = lerp(al, bl, sf) * (1 - hs) * free;
      const px = lerp(Math.sin(z * .045) * 2.2 * free, -7.5, hs) + sx + pointerX * .9 * free;
      const py = lerp(.4 + Math.sin(z * .07) * .7 * free, 1.2, hs) + sy - pointerY * .5 * free + Math.sin(time * .4) * .12;
      camera.position.lerp(new THREE.Vector3(px, py, z), snapNext ? 1 : .16); snapNext = false;
      lookGoal.set(lerp(px * .4 + sl, portrait ? -4.8 : -10, hs), lerp(py * .7 - .3, 1.4, hs), z - 12);
      if (!lookInit || snapNext) { lookTarget.copy(lookGoal); lookInit = true; } else lookTarget.lerp(lookGoal, .12);
      camera.lookAt(lookTarget);
      camera.rotation.z += Math.sin(time * .25) * .01 + Math.sin(z * .03) * .02;

      mixHex("top", w, skyU.top.value); mixHex("horizon", w, skyU.horizon.value); mixHex("bottom", w, skyU.bottom.value); mixHex("sun", w, skyU.sun.value);
      const sunY = w.reduce((s, wi, i) => s + wi * PALETTES[i].sunY, 0) + w[2] * cOcean * .16;
      skyU.sunDir.value.set(.25 * w[0], sunY, -1); skyU.sunPow.value = w.reduce((s, wi, i) => s + wi * PALETTES[i].sunPow, 0);
      sky.position.copy(camera.position); stars.position.copy(camera.position);
      const fog = scene.fog as THREE.FogExp2; mixHex("fog", w, fog.color); fog.density = w.reduce((s, wi, i) => s + wi * PALETTES[i].density, 0);
      mixHex("light", w, sunLight.color); sunLight.position.set(camera.position.x + 8, 6, z - 25); sunLight.target.position.set(camera.position.x, 0, z - 10);
      hemi.intensity = .6 + w[2] * .3;
      starMat.uniforms.time.value = time; starMat.uniforms.opacity.value = w[1] * .8 + w[3];
      meteors.forEach(m => {
        const u = m.userData as { t: number; speed: number; x?: number; y?: number };
        u.t += .016 * u.speed;
        if (u.t > 1.4) { u.t = -2 - Math.random() * 5; u.x = -60 + Math.random() * 80; u.y = 40 + Math.random() * 30; }
        const k = Math.max(0, u.t);
        m.position.set(camera.position.x + (u.x ?? 0) + k * 70, camera.position.y + (u.y ?? 50) - k * 28, camera.position.z - 120);
        m.rotation.z = -.38;
        (m.material as THREE.MeshBasicMaterial).opacity = w[3] * (u.t > 0 && u.t < 1 ? Math.sin(u.t * Math.PI) : 0);
      });

      if (z > PORTALS[0] - 30) {
        stones.forEach(s => { s.m.rotation.x = s.spin.x * time; s.m.rotation.y = s.spin.y * time + s.phase; s.m.position.y = s.base.y + Math.sin(time * .6 + s.phase) * .45; });
        clouds.forEach(c => { c.s.position.x += c.speed * .016; if (c.s.position.x > 50) c.s.position.x = -50; });
        const p = emberGeo.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < emberCount; i++) { let y = p.getY(i) + .012 + (i % 5) * .002; if (y > 9) y = -6; p.setY(i, y); p.setX(i, p.getX(i) + Math.sin(time + i) * .004); }
        p.needsUpdate = true;
      }
      gMat.uniforms.time.value = time; core.material.opacity = .45 * smooth(PORTALS[0] + 60, PORTALS[0] - 10, z);
      const dawn = smooth(PORTALS[1] + 8, PORTALS[1] - 8, z) * (1 - smooth(PORTALS[2] + 4, PORTALS[2] - 20, z));
      dawnClouds.forEach(c => { (c.s.material as THREE.SpriteMaterial).opacity = c.base * dawn; c.s.position.x += c.speed * .016; if (c.s.position.x > 75) c.s.position.x = -75; });
      islands.forEach(isl => { isl.m.position.y = isl.y + Math.sin(time * .5 + isl.phase) * .5; isl.m.rotation.y = time * .05 + isl.phase; isl.m.visible = dawn > .01; });
      oceanU.presence.value = 0; oceanU.time.value = time; oceanU.fogColor.value.copy(fog.color); oceanU.fogDensity.value = fog.density; oceanU.sunDir.value.copy(skyU.sunDir.value);
      (ground.material as THREE.MeshStandardMaterial).opacity = smooth(PORTALS[2] + 25, PORTALS[2] - 5, z);
      auroraMat.uniforms.time.value = time; auroraMat.uniforms.opacity.value = w[3];

      portals.forEach(p => {
        const d = Math.abs(camera.position.z - p.z);
        p.disc.uniforms.time.value = time; // Glow builds as you approach, then clears right before the crossing so the view never whites out.
        p.disc.uniforms.strength.value = smooth(26, 9, d) * smooth(1.5, 7, d) * .5 * (camera.position.z > p.z ? 1 : .4);
        p.glow.opacity = .55 + Math.sin(time * 2 + p.z) * .25;
        p.group.rotation.z = Math.sin(time * .2 + p.z) * .05;
      });
      bloom.strength = .62 - w[2] * .3 - w[3] * .2;
      composer.render();
    },
    dispose() { composer.dispose(); target.dispose(); renderer.dispose(); scene.traverse(o => { const m = o as THREE.Mesh; m.geometry?.dispose(); const mat = m.material as THREE.Material | undefined; mat?.dispose?.(); }); soft.dispose(); },
  };
}
