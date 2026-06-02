import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { gsap } from 'gsap';

let currentPanel = null;
let isAnimating  = false;
let controls;

const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || window.innerWidth < 768;
if (isMobile) {
  document.querySelector('.mobile-text').style.display = 'flex';
  document.getElementById('loadingScreen').style.display = 'none';
  const ls = document.getElementById('lazySplash');
  if (ls) ls.style.display = 'none';
} else {
  // ── Lazy-load: show splash first, load Three.js only on click ────────────
  const splashBtn = document.getElementById('splashEnterBtn');
  const lazySplash = document.getElementById('lazySplash');

  splashBtn.addEventListener('click', () => {
    lazySplash.classList.add('hidden');
    setTimeout(() => init(), 400);
  }, { once: true });
}

function dismissLoading() {
  const bar = document.getElementById('loadingBar');
  const scr = document.getElementById('loadingScreen');
  const ban = document.getElementById('banner');
  if (bar) bar.style.width = '100%';
  setTimeout(() => {
    if (scr) scr.classList.add('hidden');
    setTimeout(() => { if (ban) ban.classList.add('visible'); }, 500);
  }, 600);
}

function init() {
  const loadingBar = document.getElementById('loadingBar');
  let prog = 0;
  const iv = setInterval(() => {
    prog += Math.random() * 12 + 5;
    if (prog >= 100) { prog = 100; clearInterval(iv); dismissLoading(); }
    if (loadingBar) loadingBar.style.width = Math.min(prog, 100) + '%';
  }, 110);

  const sizes = { w: window.innerWidth, h: window.innerHeight };

  // ── Scene ──────────────────────────────────────────────────────────────────
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0d0d1a);
  scene.fog = new THREE.Fog(0x0d0d1a, 40, 90);

  // ── Camera ─────────────────────────────────────────────────────────────────
  const camera = new THREE.PerspectiveCamera(45, sizes.w / sizes.h, 0.1, 200);
  camera.position.set(12, 12, 12);
  camera.lookAt(0, 1, 0);

  // ── Renderer ───────────────────────────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(sizes.w, sizes.h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.getElementById('webgl').appendChild(renderer.domElement);

  window.addEventListener('resize', () => {
    sizes.w = window.innerWidth; sizes.h = window.innerHeight;
    camera.aspect = sizes.w / sizes.h;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.w, sizes.h);
  });

  // ── OrbitControls ──────────────────────────────────────────────────────────
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 5;
  controls.maxDistance = 40;
  controls.minPolarAngle = 0.2;
  controls.maxPolarAngle = Math.PI / 2.1;
  controls.target.set(0, 1, 0);
  controls.update();

  // ── Lights ─────────────────────────────────────────────────────────────────
  scene.add(new THREE.AmbientLight(0x9966cc, 3.0));
  scene.add(new THREE.HemisphereLight(0xaa88ff, 0x220033, 2.5));

  const sun = new THREE.DirectionalLight(0xffffff, 2.5);
  sun.position.set(12, 20, 12);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 0.5; sun.shadow.camera.far = 60;
  sun.shadow.camera.left = sun.shadow.camera.bottom = -20;
  sun.shadow.camera.right = sun.shadow.camera.top = 20;
  scene.add(sun);

  const sconce1 = new THREE.PointLight(0xaa55ff, 7, 10);
  sconce1.position.set(-5, 7, -9); scene.add(sconce1);
  const sconce2 = new THREE.PointLight(0xaa55ff, 7, 10);
  sconce2.position.set(2, 7, -9); scene.add(sconce2);
  const screenGlow = new THREE.PointLight(0x88aaff, 4.5, 12);
  screenGlow.position.set(-1, 5, -5); scene.add(screenGlow);
  const deskGlow = new THREE.PointLight(0xaa55ff, 6, 8);
  deskGlow.position.set(-1, 1.5, -2); scene.add(deskGlow);
  const neonGlow = new THREE.PointLight(0x00ffcc, 5, 8);
  neonGlow.position.set(-6, 7, -8.5); scene.add(neonGlow);
  const rugGlow = new THREE.PointLight(0xaa55ff, 4, 7);
  rugGlow.position.set(0, 0.3, 1); scene.add(rugGlow);
  const ghLight = new THREE.PointLight(0xffffff, 4, 5);
  ghLight.position.set(4.5, 6, -8); scene.add(ghLight);
  const liLight = new THREE.PointLight(0x0077b5, 4, 5);
  liLight.position.set(7.5, 6, -8); scene.add(liLight);

  // ── Helper functions ───────────────────────────────────────────────────────
  function mesh(geo, mat) {
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  }
  function mNeon(c) {
    return new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 3.5, roughness: 0.05 });
  }
  function mGlow(c, i = 2.5) {
    return new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: i, roughness: 0.05 });
  }

  // ── Shared materials ───────────────────────────────────────────────────────
  const MAT = {
    wall:     new THREE.MeshStandardMaterial({ color: 0x12122a, roughness: 0.9 }),
    wallL:    new THREE.MeshStandardMaterial({ color: 0x0e0e22, roughness: 0.9 }),
    floor:    new THREE.MeshStandardMaterial({ color: 0x1e1a2e, roughness: 0.8, metalness: 0.05 }),
    ceil:     new THREE.MeshStandardMaterial({ color: 0x090918, roughness: 1 }),
    trim:     new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 }),
    gold:     new THREE.MeshStandardMaterial({ color: 0xeda72d, roughness: 0.2, metalness: 0.8, emissive: 0xeda72d, emissiveIntensity: 0.3 }),
    desk:     new THREE.MeshStandardMaterial({ color: 0x252540, roughness: 0.5, metalness: 0.2 }),
    leg:      new THREE.MeshStandardMaterial({ color: 0x1e1e30, roughness: 0.6 }),
    bezel:    new THREE.MeshStandardMaterial({ color: 0x111122, roughness: 0.5, metalness: 0.5 }),
    screen:   new THREE.MeshStandardMaterial({ color: 0x0a1e40, roughness: 0.1, metalness: 0.2, emissive: 0x3366ff, emissiveIntensity: 0.8 }),
    foam:     new THREE.MeshStandardMaterial({ color: 0x2a2a3e, roughness: 0.95 }),
    chair:    new THREE.MeshStandardMaterial({ color: 0x111122, roughness: 0.7 }),
    shelf:    new THREE.MeshStandardMaterial({ color: 0x2a2a3e, roughness: 0.6, metalness: 0.1 }),
    wood:     new THREE.MeshStandardMaterial({ color: 0x1e1a2e, roughness: 1 }),
    skirt:    new THREE.MeshStandardMaterial({ color: 0xeda72d, roughness: 0.2, metalness: 0.8, emissive: 0xeda72d, emissiveIntensity: 0.2 }),
  };

  // ── FLOOR (PlaneGeometry 22x20) ────────────────────────────────────────────
  const floor = mesh(new THREE.PlaneGeometry(22, 20), MAT.floor);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, 0);
  scene.add(floor);
  // Plank lines every 1.2 units
  for (let i = -10; i <= 10; i += 1.2) {
    const p = mesh(new THREE.BoxGeometry(22, 0.01, 0.04), MAT.wood);
    p.position.set(0, 0.005, i); scene.add(p);
  }

  // ── WALLS ──────────────────────────────────────────────────────────────────
  // Back wall: 22x14 at (0,7,-10)
  const bw = mesh(new THREE.PlaneGeometry(22, 14), MAT.wall);
  bw.position.set(0, 7, -10); scene.add(bw);
  // Left wall: 20x14 at (-11,7,0) rotated Y PI/2
  const lw = mesh(new THREE.PlaneGeometry(20, 14), MAT.wallL);
  lw.position.set(-11, 7, 0); lw.rotation.y = Math.PI / 2; scene.add(lw);
  // Right wall: 20x14 at (11,7,0) rotated -PI/2
  const rw = mesh(new THREE.PlaneGeometry(20, 14), MAT.wallL.clone());
  rw.position.set(11, 7, 0); rw.rotation.y = -Math.PI / 2; scene.add(rw);
  // Front wall: 22x14 at (0,7,10) rotated PI
  const fw = mesh(new THREE.PlaneGeometry(22, 14), MAT.wallL.clone());
  fw.position.set(0, 7, 10); fw.rotation.y = Math.PI; scene.add(fw);
  // Ceiling: 22x20
  const cl = mesh(new THREE.PlaneGeometry(22, 20), MAT.ceil);
  cl.rotation.x = Math.PI / 2; cl.position.y = 14; scene.add(cl);

  // White ceiling trim (BoxGeometry 0.3 thick) along all 4 ceiling edges
  [
    { g: new THREE.BoxGeometry(22, 0.3, 0.3), p: [0, 13.85, -10] },
    { g: new THREE.BoxGeometry(22, 0.3, 0.3), p: [0, 13.85,  10] },
    { g: new THREE.BoxGeometry(0.3, 0.3, 20), p: [-11, 13.85, 0] },
    { g: new THREE.BoxGeometry(0.3, 0.3, 20), p: [11, 13.85, 0] },
  ].forEach(({ g, p }) => {
    const t = mesh(g, MAT.trim.clone());
    t.position.set(...p); scene.add(t);
  });

  // Gold skirting board at floor level along back wall
  const skirt = mesh(new THREE.BoxGeometry(22, 0.18, 0.06), MAT.skirt.clone());
  skirt.position.set(0, 0.09, -9.95); scene.add(skirt);

  // Horizontal gold wall lines at y=3, y=6, y=9 on back wall
  [3, 6, 9].forEach(y => {
    const wl = mesh(new THREE.BoxGeometry(22, 0.06, 0.05), MAT.gold.clone());
    wl.position.set(0, y, -9.93); scene.add(wl);
  });

  // ── NEON STRIPS ────────────────────────────────────────────────────────────
  // Top back wall strip at y=11
  const neonStripL = mesh(new THREE.BoxGeometry(22, 0.07, 0.07), mGlow(0x00ffcc));
  neonStripL.name = 'neonStripL'; neonStripL.position.set(0, 11, -9.9); scene.add(neonStripL);
  // Bottom strip at y=1.5
  const neonStripR = mesh(new THREE.BoxGeometry(22, 0.07, 0.07), mGlow(0xff00aa));
  neonStripR.name = 'neonStripR'; neonStripR.position.set(0, 1.5, -9.9); scene.add(neonStripR);
  // Vertical strips on left wall
  const neonVL = mesh(new THREE.BoxGeometry(0.07, 14, 0.07), mGlow(0x00ffcc));
  neonVL.position.set(-10.92, 7, 0); scene.add(neonVL);
  // Vertical strip on right wall
  const neonVR = mesh(new THREE.BoxGeometry(0.07, 14, 0.07), mGlow(0xff00aa));
  neonVR.position.set(10.92, 7, 0); scene.add(neonVR);

  // Ceiling torus ring named 'ceilRing'
  const ceilRing = mesh(new THREE.TorusGeometry(4, 0.08, 8, 64), mGlow(0x00ffcc, 3));
  ceilRing.name = 'ceilRing'; ceilRing.rotation.x = Math.PI / 2;
  ceilRing.position.set(0, 13.7, 0); scene.add(ceilRing);

  // ── WALL SCONCES (purple lanterns) ─────────────────────────────────────────
  function makeSconce(x) {
    const g = new THREE.Group();
    const body = mesh(new THREE.BoxGeometry(0.4, 0.7, 0.4),
      new THREE.MeshStandardMaterial({ color: 0xaa55ff, emissive: 0xaa55ff, emissiveIntensity: 1.5, transparent: true, opacity: 0.85 }));
    g.add(body);
    [0.39, -0.39].forEach(y => {
      const cap = mesh(new THREE.BoxGeometry(0.5, 0.08, 0.5),
        new THREE.MeshStandardMaterial({ color: 0x333355, roughness: 0.5 }));
      cap.position.y = y; g.add(cap);
    });
    const arm = mesh(new THREE.BoxGeometry(0.08, 0.08, 0.35),
      new THREE.MeshStandardMaterial({ color: 0x333355 }));
    arm.position.set(0, 0, 0.35); g.add(arm);
    g.position.set(x, 7.5, -9.6);
    scene.add(g);
  }
  makeSconce(-5); makeSconce(2);

  // ── ACOUSTIC FOAM (5x6 grid) ───────────────────────────────────────────────
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 6; col++) {
      const f = mesh(new THREE.BoxGeometry(0.55, 0.55, 0.1), MAT.foam.clone());
      f.position.set(3 + col * 0.6, 4.5 + row * 0.6, -9.88); scene.add(f);
      const tip = mesh(new THREE.ConeGeometry(0.2, 0.15, 4),
        new THREE.MeshStandardMaterial({ color: 0x222233, roughness: 0.95 }));
      tip.position.set(3 + col * 0.6, 4.5 + row * 0.6, -9.72);
      tip.rotation.x = Math.PI / 2; scene.add(tip);
    }
  }

  // ── NEON "HM" SIGN ─────────────────────────────────────────────────────────
  function nBar(x, y, z, w, h, d, c) {
    const m = mesh(new THREE.BoxGeometry(w, h, d), mNeon(c));
    m.position.set(x, y, z); scene.add(m);
  }
  // H letter
  nBar(-7.8, 8.2, -9.8, 0.12, 1.8, 0.08, 0x00ffcc);
  nBar(-6.6, 8.2, -9.8, 0.12, 1.8, 0.08, 0x00ffcc);
  nBar(-7.2, 8.2, -9.8, 0.6, 0.12, 0.08, 0x00ffcc);
  // M letter
  nBar(-5.8, 8.2, -9.8, 0.12, 1.8, 0.08, 0x00ffcc);
  nBar(-3.4, 8.2, -9.8, 0.12, 1.8, 0.08, 0x00ffcc);
  nBar(-4.6, 8.2, -9.8, 0.12, 1.8, 0.08, 0x00ffcc);
  nBar(-5.2, 9.0, -9.8, 0.72, 0.12, 0.08, 0x00ffcc);
  nBar(-4.0, 9.0, -9.8, 0.72, 0.12, 0.08, 0x00ffcc);
  // Decorative pink/purple dashes underneath
  [-7.5, -6.5, -5.5, -4.5].forEach((x, i) =>
    nBar(x, 6.8, -9.8, 0.6, 0.08, 0.06, i % 2 === 0 ? 0xff2266 : 0xaa55ff)
  );

  // ── GITHUB PANEL ───────────────────────────────────────────────────────────
  const ghGroup = new THREE.Group(); ghGroup.name = 'githubPanel';

  // Outer dark panel 2.2x2.8
  const ghOuter = mesh(new THREE.BoxGeometry(2.2, 2.8, 0.06),
    new THREE.MeshStandardMaterial({ color: 0x0a0a1a, roughness: 0.8, transparent: true, opacity: 0.92 }));
  ghGroup.add(ghOuter);

  // White glowing double border
  [[2.22, 2.82, 0.07, 0xffffff, 0.8], [2.30, 2.90, 0.05, 0x888899, 0.3]].forEach(([w, h, d, c, op]) => {
    const e = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d)),
      new THREE.LineBasicMaterial({ color: c, transparent: true, opacity: op })
    );
    ghGroup.add(e);
  });

  // Screen inner
  const ghScreen = mesh(new THREE.BoxGeometry(1.9, 2.5, 0.03),
    new THREE.MeshStandardMaterial({ color: 0x050510, roughness: 0.9, emissive: 0x111133, emissiveIntensity: 0.3 }));
  ghScreen.position.z = 0.03; ghGroup.add(ghScreen);

  // 4 spinning OctahedronGeometry gems at corners (named 'ghGem')
  [[-1.0, 1.3], [1.0, 1.3], [-1.0, -1.3], [1.0, -1.3]].forEach(([cx, cy]) => {
    const gem = mesh(new THREE.OctahedronGeometry(0.08),
      new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 2.0, roughness: 0.05 }));
    gem.position.set(cx, cy, 0.05); gem.name = 'ghGem'; ghGroup.add(gem);
  });

  // Octocat head (sphere)
  const ghHead = mesh(new THREE.SphereGeometry(0.38, 20, 20),
    new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.6, roughness: 0.3 }));
  ghHead.position.set(0, 0.25, 0.06); ghGroup.add(ghHead);
  // Cat ears (triangle cones)
  [[-0.28, 0.62], [0.28, 0.62]].forEach(([ex, ey]) => {
    const ear = mesh(new THREE.ConeGeometry(0.11, 0.2, 4),
      new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.6, roughness: 0.3 }));
    ear.position.set(ex, ey, 0.06); ear.rotation.z = ex < 0 ? -0.3 : 0.3; ghGroup.add(ear);
  });
  // Eyes
  [[-0.13, 0.28], [0.13, 0.28]].forEach(([ex, ey]) => {
    const eye = mesh(new THREE.CircleGeometry(0.055, 12),
      new THREE.MeshStandardMaterial({ color: 0x0a0a1a, roughness: 0.9 }));
    eye.position.set(ex, ey + 0.25, 0.12); ghGroup.add(eye);
  });
  // Nose
  const nose = mesh(new THREE.CircleGeometry(0.035, 8),
    new THREE.MeshStandardMaterial({ color: 0x0a0a1a, roughness: 0.9 }));
  nose.position.set(0, 0.2, 0.12); ghGroup.add(nose);
  // Oval body
  const ghBody = mesh(new THREE.SphereGeometry(0.25, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.5, roughness: 0.3 }));
  ghBody.scale.set(1, 0.7, 0.5); ghBody.position.set(0, -0.22, 0.06); ghGroup.add(ghBody);
  // Tentacle arms
  [[-0.42, -0.1, -0.3], [0.42, -0.1, -0.3], [-0.5, -0.45, 0.1], [0.5, -0.45, 0.1]].forEach(([tx, ty, tz], i) => {
    const arm = mesh(new THREE.CylinderGeometry(0.055, 0.04, 0.45, 8),
      new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.5, roughness: 0.3 }));
    arm.position.set(tx, ty + 0.22 + tz, 0.06);
    arm.rotation.z = i < 2 ? (i === 0 ? -1.1 : 1.1) : (i === 2 ? -0.5 : 0.5);
    arm.rotation.x = 0.3; ghGroup.add(arm);
  });

  // GITHUB label bar
  const ghLabel = mesh(new THREE.BoxGeometry(1.6, 0.22, 0.04),
    new THREE.MeshStandardMaterial({ color: 0x1a1a1a, emissive: 0x333333, emissiveIntensity: 0.5 }));
  ghLabel.position.set(0, -1.0, 0.04); ghGroup.add(ghLabel);
  // White glow line at bottom
  const ghLine = mesh(new THREE.BoxGeometry(1.6, 0.04, 0.04),
    new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 3.0, roughness: 0.05 }));
  ghLine.position.set(0, -1.15, 0.04); ghGroup.add(ghLine);
  // Cyan scanning beam (named 'ghBeam')
  const ghBeam = mesh(new THREE.BoxGeometry(1.9, 0.04, 0.03),
    new THREE.MeshStandardMaterial({ color: 0x00ffcc, emissive: 0x00ffcc, emissiveIntensity: 4.0, roughness: 0.05, transparent: true, opacity: 0.7 }));
  ghBeam.position.set(0, 1.2, 0.055); ghBeam.name = 'ghBeam'; ghGroup.add(ghBeam);
  // 8 horizontal scan lines
  for (let i = 0; i < 8; i++) {
    const sl = mesh(new THREE.BoxGeometry(1.9, 0.015, 0.02),
      new THREE.MeshStandardMaterial({ color: 0x4444ff, emissive: 0x4444ff, emissiveIntensity: 1.0, roughness: 0.05, transparent: true, opacity: 0.25 }));
    sl.position.set(0, -1.1 + i * 0.32, 0.055); ghGroup.add(sl);
  }
  // Wall mount screws
  [[-1.05, 1.35], [1.05, 1.35], [-1.05, -1.35], [1.05, -1.35]].forEach(([sx, sy]) => {
    const screw = mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.1, 6),
      new THREE.MeshStandardMaterial({ color: 0x888899, roughness: 0.3, metalness: 0.8 }));
    screw.rotation.x = Math.PI / 2; screw.position.set(sx, sy, -0.07); ghGroup.add(screw);
  });

  ghGroup.position.set(4.5, 6.0, -9.87);
  scene.add(ghGroup);

  // ── LINKEDIN PANEL ─────────────────────────────────────────────────────────
  const liGroup = new THREE.Group(); liGroup.name = 'linkedinPanel';

  // Dark navy panel 2.2x2.8
  const liOuter = mesh(new THREE.BoxGeometry(2.2, 2.8, 0.06),
    new THREE.MeshStandardMaterial({ color: 0x001a2a, roughness: 0.8, transparent: true, opacity: 0.92 }));
  liGroup.add(liOuter);
  // Blue glowing double border
  [[2.22, 2.82, 0.07, 0x0077b5, 1.0], [2.30, 2.90, 0.05, 0x004466, 0.4]].forEach(([w, h, d, c, op]) => {
    const e = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d)),
      new THREE.LineBasicMaterial({ color: c, transparent: true, opacity: op })
    );
    liGroup.add(e);
  });
  const liScreen = mesh(new THREE.BoxGeometry(1.9, 2.5, 0.03),
    new THREE.MeshStandardMaterial({ color: 0x001020, roughness: 0.9, emissive: 0x001a3a, emissiveIntensity: 0.4 }));
  liScreen.position.z = 0.03; liGroup.add(liScreen);
  // 4 spinning cyan gems at corners (named 'liGem')
  [[-1.0, 1.3], [1.0, 1.3], [-1.0, -1.3], [1.0, -1.3]].forEach(([cx, cy]) => {
    const gem = mesh(new THREE.OctahedronGeometry(0.08),
      new THREE.MeshStandardMaterial({ color: 0x0077b5, emissive: 0x0077b5, emissiveIntensity: 2.5, roughness: 0.05 }));
    gem.position.set(cx, cy, 0.05); gem.name = 'liGem'; liGroup.add(gem);
  });

  // Large extruded 3D "in" logo
  const liSq = mesh(new THREE.BoxGeometry(1.2, 1.2, 0.1),
    new THREE.MeshStandardMaterial({ color: 0x0077b5, emissive: 0x0077b5, emissiveIntensity: 0.8, roughness: 0.2, metalness: 0.3 }));
  liSq.position.set(0, 0.15, 0.08); liGroup.add(liSq);
  const liSqInner = mesh(new THREE.BoxGeometry(1.0, 1.0, 0.04),
    new THREE.MeshStandardMaterial({ color: 0x0099dd, emissive: 0x0099dd, emissiveIntensity: 0.5, roughness: 0.3 }));
  liSqInner.position.set(0, 0.15, 0.14); liGroup.add(liSqInner);
  // i-dot
  const liDot = mesh(new THREE.SphereGeometry(0.1, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1.5, roughness: 0.1 }));
  liDot.position.set(-0.27, 0.58, 0.16); liGroup.add(liDot);
  // i-stem
  const liStem = mesh(new THREE.BoxGeometry(0.16, 0.52, 0.08),
    new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1.2, roughness: 0.1 }));
  liStem.position.set(-0.27, 0.18, 0.16); liGroup.add(liStem);
  // n left stem
  const liN1 = mesh(new THREE.BoxGeometry(0.16, 0.7, 0.08),
    new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1.2, roughness: 0.1 }));
  liN1.position.set(0.08, 0.14, 0.16); liGroup.add(liN1);
  // n arch top
  const liNTop = mesh(new THREE.BoxGeometry(0.32, 0.16, 0.08),
    new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1.2, roughness: 0.1 }));
  liNTop.position.set(0.24, 0.45, 0.16); liGroup.add(liNTop);
  // n right stem
  const liN2 = mesh(new THREE.BoxGeometry(0.16, 0.55, 0.08),
    new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1.2, roughness: 0.1 }));
  liN2.position.set(0.39, 0.17, 0.16); liGroup.add(liN2);
  // Label bar
  const liLabel = mesh(new THREE.BoxGeometry(1.6, 0.22, 0.04),
    new THREE.MeshStandardMaterial({ color: 0x001a2a, emissive: 0x003355, emissiveIntensity: 0.5 }));
  liLabel.position.set(0, -1.0, 0.04); liGroup.add(liLabel);
  // Blue glow line at bottom
  const liLine = mesh(new THREE.BoxGeometry(1.6, 0.04, 0.04),
    new THREE.MeshStandardMaterial({ color: 0x0077b5, emissive: 0x0077b5, emissiveIntensity: 3.0, roughness: 0.05 }));
  liLine.position.set(0, -1.15, 0.04); liGroup.add(liLine);
  // Blue scanning beam moving opposite direction (named 'liBeam')
  const liBeam = mesh(new THREE.BoxGeometry(1.9, 0.04, 0.03),
    new THREE.MeshStandardMaterial({ color: 0x0077b5, emissive: 0x0077b5, emissiveIntensity: 4.0, roughness: 0.05, transparent: true, opacity: 0.8 }));
  liBeam.position.set(0, 1.2, 0.055); liBeam.name = 'liBeam'; liGroup.add(liBeam);
  // Scan lines
  for (let i = 0; i < 8; i++) {
    const sl = mesh(new THREE.BoxGeometry(1.9, 0.015, 0.02),
      new THREE.MeshStandardMaterial({ color: 0x0066aa, emissive: 0x0066aa, emissiveIntensity: 1.0, roughness: 0.05, transparent: true, opacity: 0.25 }));
    sl.position.set(0, -1.1 + i * 0.32, 0.055); liGroup.add(sl);
  }
  // Wall mount screws
  [[-1.05, 1.35], [1.05, 1.35], [-1.05, -1.35], [1.05, -1.35]].forEach(([sx, sy]) => {
    const screw = mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.1, 6),
      new THREE.MeshStandardMaterial({ color: 0x888899, roughness: 0.3, metalness: 0.8 }));
    screw.rotation.x = Math.PI / 2; screw.position.set(sx, sy, -0.07); liGroup.add(screw);
  });

  liGroup.position.set(7.5, 6.0, -9.87);
  scene.add(liGroup);

  // ── L-SHAPED DESK ──────────────────────────────────────────────────────────
  // Main desk: BoxGeometry(9, 0.2, 4) at (-1, 2.5, -5.5)
  const desk1 = mesh(new THREE.BoxGeometry(9, 0.2, 4), MAT.desk.clone());
  desk1.position.set(-1, 2.5, -5.5); scene.add(desk1);
  // L extension: BoxGeometry(4, 0.2, 4.5) at (4.5, 2.5, -3)
  const desk2 = mesh(new THREE.BoxGeometry(4, 0.2, 4.5), MAT.desk.clone());
  desk2.position.set(4.5, 2.5, -3); scene.add(desk2);

  // Gold edge trims on front edges
  const dTrim1 = mesh(new THREE.BoxGeometry(9, 0.06, 0.06), MAT.gold.clone());
  dTrim1.position.set(-1, 2.52, -3.5); scene.add(dTrim1);
  const dTrim2 = mesh(new THREE.BoxGeometry(4, 0.06, 0.06), MAT.gold.clone());
  dTrim2.position.set(4.5, 2.52, -0.75); scene.add(dTrim2);

  // 6 legs with gold feet
  [[-4.8, -5.5], [-4.8, -7.2], [2.6, -5.5], [2.6, -7.2], [5.5, -1.2], [3.5, -1.2]].forEach(([x, z]) => {
    const leg = mesh(new THREE.BoxGeometry(0.2, 2.5, 0.2), MAT.leg.clone());
    leg.position.set(x, 1.25, z); scene.add(leg);
    const foot = mesh(new THREE.BoxGeometry(0.3, 0.08, 0.3), MAT.gold.clone());
    foot.position.set(x, 0.04, z); scene.add(foot);
  });

  // Under-desk RGB strip named 'deskStrip'
  const deskStrip = mesh(new THREE.BoxGeometry(9, 0.05, 0.05), mGlow(0xaa55ff));
  deskStrip.name = 'deskStrip'; deskStrip.position.set(-1, 2.35, -3.55); scene.add(deskStrip);

  // Dark desk mat on top
  const dmat = mesh(new THREE.BoxGeometry(5, 0.015, 2.5),
    new THREE.MeshStandardMaterial({ color: 0x111122, roughness: 0.95 }));
  dmat.position.set(-1.5, 2.61, -5.5); scene.add(dmat);

  // ── 3 MONITORS ─────────────────────────────────────────────────────────────
  function makeMonitor(groupName, screenName, w, h) {
    const g = new THREE.Group(); g.name = groupName;
    const bezel = mesh(new THREE.BoxGeometry(w, h, 0.14), MAT.bezel.clone());
    g.add(bezel);
    const scr = mesh(new THREE.BoxGeometry(w - 0.3, h - 0.3, 0.05), MAT.screen.clone());
    scr.position.z = 0.08; scr.name = screenName; g.add(scr);
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(w + 0.02, h + 0.02, 0.15)),
      new THREE.LineBasicMaterial({ color: 0x444466 })
    );
    g.add(edges);
    const strip = mesh(new THREE.BoxGeometry(w - 0.3, 0.06, 0.06), mGlow(0xaa55ff));
    strip.position.set(0, -(h / 2) + 0.1, 0.1); g.add(strip);
    const neck = mesh(new THREE.BoxGeometry(0.18, 0.8, 0.18), MAT.leg.clone());
    neck.position.set(0, -(h / 2) - 0.5, 0); g.add(neck);
    const base = mesh(new THREE.BoxGeometry(1.2, 0.08, 0.6), MAT.leg.clone());
    base.position.set(0, -(h / 2) - 0.95, 0.1); g.add(base);
    return g;
  }

  const monL = makeMonitor('monitorLeft', 'screenL', 3.8, 2.2);
  monL.position.set(-3.5, 4.3, -7.0); monL.rotation.y = 0.15; scene.add(monL);
  const monR = makeMonitor('monitorRight', 'screenR', 3.8, 2.2);
  monR.position.set(0.8, 4.3, -7.2); scene.add(monR);
  const monS = makeMonitor('monitorSide', 'screenSide', 3.2, 1.9);
  monS.position.set(4.5, 4.2, -4.8); monS.rotation.y = -Math.PI / 2; scene.add(monS);

  // ── GAMING CHAIR ───────────────────────────────────────────────────────────
  const chairGroup = new THREE.Group(); chairGroup.name = 'chairGroup';
  const accMat = new THREE.MeshStandardMaterial({
    color: 0xeda72d, roughness: 0.3, metalness: 0.5, emissive: 0xeda72d, emissiveIntensity: 0.2
  });

  // Seat with gold side strips
  const seat = mesh(new THREE.BoxGeometry(2.0, 0.25, 2.0), MAT.chair.clone());
  seat.position.y = 1.6; chairGroup.add(seat);
  [-0.95, 0.95].forEach(x => {
    const s = mesh(new THREE.BoxGeometry(0.08, 0.26, 2.0), accMat.clone());
    s.position.set(x, 1.6, 0); chairGroup.add(s);
  });

  // Tall backrest with gold accent strips
  const back = mesh(new THREE.BoxGeometry(1.9, 2.6, 0.22), MAT.chair.clone());
  back.position.set(0, 3.1, -0.9); chairGroup.add(back);
  [-0.88, 0.88].forEach(x => {
    const s = mesh(new THREE.BoxGeometry(0.08, 2.6, 0.23), accMat.clone());
    s.position.set(x, 3.1, -0.9); chairGroup.add(s);
  });

  // Headrest
  const head = mesh(new THREE.BoxGeometry(1.4, 0.7, 0.22), MAT.chair.clone());
  head.position.set(0, 4.55, -0.9); chairGroup.add(head);

  // Armrests
  [-0.85, 0.85].forEach(x => {
    const arm = mesh(new THREE.BoxGeometry(0.22, 0.12, 0.9), MAT.chair.clone());
    arm.position.set(x, 1.85, -0.1); chairGroup.add(arm);
  });

  // Gas cylinder
  const pole = mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.4, 10), MAT.leg.clone());
  pole.position.y = 0.7; chairGroup.add(pole);

  // 5-arm wheel base (inner group named 'chairTop')
  const chairTop = new THREE.Group(); chairTop.name = 'chairTop';
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const armM = mesh(new THREE.BoxGeometry(1.3, 0.07, 0.1), MAT.leg.clone());
    armM.rotation.y = a;
    armM.position.set(Math.cos(a) * 0.65, 0, Math.sin(a) * 0.65);
    chairTop.add(armM);
    const wheel = mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.1, 8),
      new THREE.MeshStandardMaterial({ color: 0x111111 }));
    wheel.position.set(Math.cos(a) * 1.2, 0, Math.sin(a) * 1.2);
    chairTop.add(wheel);
  }
  chairTop.position.y = 0.05; chairGroup.add(chairTop);
  chairGroup.position.set(0.5, 0, -1.5); chairGroup.rotation.y = 0.2;
  scene.add(chairGroup);

  // ── CUBBY SHELF ────────────────────────────────────────────────────────────
  const shelfGroup = new THREE.Group(); shelfGroup.name = 'shelf';
  // 3.5x5 outer frame
  const sBack = mesh(new THREE.BoxGeometry(3.5, 5.0, 0.12), MAT.shelf.clone());
  sBack.position.z = -0.75; shelfGroup.add(sBack);
  [-1.68, 1.68].forEach(x => {
    const s = mesh(new THREE.BoxGeometry(0.12, 5.0, 1.5), MAT.shelf.clone());
    s.position.x = x; shelfGroup.add(s);
  });
  // 3 rows x 2 columns shelves
  [0, 1, 2].forEach(row => {
    [-0.84, 0.84].forEach(x => {
      const sh = mesh(new THREE.BoxGeometry(1.56, 0.1, 1.5), MAT.shelf.clone());
      sh.position.set(x, -2.3 + row * 1.6, 0); shelfGroup.add(sh);
    });
    const dv = mesh(new THREE.BoxGeometry(0.1, 1.5, 1.5), MAT.shelf.clone());
    dv.position.set(0, -1.55 + row * 1.6, 0); shelfGroup.add(dv);
  });
  const shTop = mesh(new THREE.BoxGeometry(3.5, 0.12, 1.5), MAT.shelf.clone());
  shTop.position.y = 2.56; shelfGroup.add(shTop);
  // 6 colored items in cubbies
  const cubbyColors = [0xc0392b, 0x2980b9, 0x27ae60, 0xf39c12, 0x8e44ad, 0xe74c3c];
  [0, 1, 2].forEach(row => {
    [-0.84, 0.84].forEach((x, ci) => {
      const item = mesh(new THREE.BoxGeometry(0.6, 0.9, 0.4),
        new THREE.MeshStandardMaterial({ color: cubbyColors[row * 2 + ci], roughness: 0.8 }));
      item.position.set(x, -1.8 + row * 1.6, 0.2); shelfGroup.add(item);
    });
  });
  // Green neon strip on top edge
  const shNeon = mesh(new THREE.BoxGeometry(3.5, 0.05, 0.05), mGlow(0x00ff88));
  shNeon.position.set(0, 2.62, 0.76); shelfGroup.add(shNeon);
  // Trophy on shelf: gold cylinder base + sphere top + star
  const tBase1 = mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.18, 12), MAT.gold.clone());
  tBase1.position.set(0, 2.8, 0); shelfGroup.add(tBase1);
  const tBase2 = mesh(new THREE.CylinderGeometry(0.12, 0.22, 0.32, 12), MAT.gold.clone());
  tBase2.position.set(0, 3.05, 0); shelfGroup.add(tBase2);
  const tTop = mesh(new THREE.SphereGeometry(0.18, 10, 10),
    new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xffd700, emissiveIntensity: 0.8, roughness: 0.1, metalness: 0.9 }));
  tTop.position.set(0, 3.42, 0); shelfGroup.add(tTop);
  shelfGroup.position.set(8.5, 1.5, -5); scene.add(shelfGroup);

  // ── GLOWING RUG ────────────────────────────────────────────────────────────
  const rug = mesh(new THREE.PlaneGeometry(6, 5),
    new THREE.MeshStandardMaterial({ color: 0x1a0a3a, roughness: 0.95 }));
  rug.rotation.x = -Math.PI / 2; rug.position.set(0.5, 0.09, -0.5); scene.add(rug);
  const rugInner = mesh(new THREE.PlaneGeometry(5, 4),
    new THREE.MeshStandardMaterial({ color: 0x280d55, roughness: 0.95 }));
  rugInner.rotation.x = -Math.PI / 2; rugInner.position.set(0.5, 0.095, -0.5); scene.add(rugInner);
  // HM logo made of neon purple lines
  const rLm = new THREE.MeshStandardMaterial({ color: 0xaa55ff, emissive: 0xaa55ff, emissiveIntensity: 1.5 });
  [[-0.5, 0], [0.5, 0]].forEach(([x]) => {
    const b = mesh(new THREE.BoxGeometry(0.07, 0.01, 1.2), rLm.clone());
    b.rotation.x = -Math.PI / 2; b.position.set(0.5 + x, 0.1, -0.5); scene.add(b);
  });
  const rc = mesh(new THREE.BoxGeometry(1.1, 0.01, 0.07), rLm.clone());
  rc.rotation.x = -Math.PI / 2; rc.position.set(0.5, 0.1, -0.5); scene.add(rc);
  // Gold edge lines on sides
  [-2.9, 2.9].forEach(x => {
    const e = mesh(new THREE.BoxGeometry(0.04, 0.01, 5),
      new THREE.MeshStandardMaterial({ color: 0xaa55ff, emissive: 0xaa55ff, emissiveIntensity: 2 }));
    e.rotation.x = -Math.PI / 2; e.position.set(0.5 + x, 0.1, -0.5); scene.add(e);
  });

  // ── MICROPHONE ─────────────────────────────────────────────────────────────
  const micArm = mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.5, 8), MAT.leg.clone());
  micArm.position.set(-4.5, 3.8, -5.5); micArm.rotation.z = 0.4; scene.add(micArm);
  const mic = mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.4, 10),
    new THREE.MeshStandardMaterial({ color: 0x333344, roughness: 0.4, metalness: 0.6 }));
  mic.position.set(-3.7, 4.8, -5.5); scene.add(mic);

  // ── HEADPHONES ─────────────────────────────────────────────────────────────
  const hp = new THREE.Group();
  const hpBand = mesh(new THREE.TorusGeometry(0.3, 0.04, 8, 16, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0x111122, roughness: 0.5, metalness: 0.4 }));
  hpBand.rotation.z = Math.PI / 2; hp.add(hpBand);
  [-0.3, 0.3].forEach(y => {
    const cup = mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.1, 12),
      new THREE.MeshStandardMaterial({ color: 0x111122, roughness: 0.5, metalness: 0.4 }));
    cup.position.set(0, y, 0); cup.rotation.x = Math.PI / 2; hp.add(cup);
  });
  hp.position.set(-4.5, 2.72, -4.8); hp.rotation.y = 0.5; scene.add(hp);

  // ── MINI PLANT ─────────────────────────────────────────────────────────────
  const mpPot = mesh(new THREE.CylinderGeometry(0.18, 0.14, 0.3, 10),
    new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.85 }));
  mpPot.position.set(2.5, 2.72, -5.5); scene.add(mpPot);
  const plantTop = mesh(new THREE.SphereGeometry(0.22, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0x1e8a30, roughness: 0.75 }));
  plantTop.scale.set(1, 0.7, 1); plantTop.position.set(2.5, 3.1, -5.5); plantTop.name = 'plantTop';
  scene.add(plantTop);

  // ── TRASH CAN ──────────────────────────────────────────────────────────────
  const trash = mesh(new THREE.CylinderGeometry(0.3, 0.25, 0.7, 12),
    new THREE.MeshStandardMaterial({ color: 0x888899, roughness: 0.5, metalness: 0.6 }));
  trash.position.set(-6, 0.35, -2); scene.add(trash);

  // ── COFFEE MUG ─────────────────────────────────────────────────────────────
  const mugGroup = new THREE.Group(); mugGroup.name = 'mug';
  const mugBM = new THREE.MeshStandardMaterial({ color: 0x1a4a80, roughness: 0.4, metalness: 0.3 });
  const mugB = mesh(new THREE.CylinderGeometry(0.32, 0.27, 0.65, 28), mugBM);
  mugGroup.add(mugB);
  const mugRim = mesh(new THREE.TorusGeometry(0.32, 0.032, 8, 28), MAT.gold.clone());
  mugRim.position.y = 0.325; mugGroup.add(mugRim);
  const mugH = mesh(new THREE.TorusGeometry(0.2, 0.048, 8, 18, Math.PI), mugBM.clone());
  mugH.position.set(0.36, 0, 0); mugH.rotation.y = Math.PI / 2; mugGroup.add(mugH);
  const mugC = mesh(new THREE.CircleGeometry(0.29, 28),
    new THREE.MeshStandardMaterial({ color: 0x3d1a00, roughness: 0.9 }));
  mugC.rotation.x = -Math.PI / 2; mugC.position.y = 0.3; mugGroup.add(mugC);
  // Steam wisps named 'steam', 'steam1', 'steam2'
  for (let i = 0; i < 3; i++) {
    const w = mesh(new THREE.SphereGeometry(0.07 + i * 0.02, 7, 7),
      new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.15 }));
    w.position.set((i - 1) * 0.1, 0.55 + i * 0.18, 0);
    w.name = i === 0 ? 'steam' : `steam${i}`;
    mugGroup.add(w);
  }
  mugGroup.position.set(1.5, 2.72, -5.5); scene.add(mugGroup);

  // ── WALL TV SCREEN ─────────────────────────────────────────────────────────
  // Large TV on the left wall — shows portfolio project cycling
  const tvGroup = new THREE.Group(); tvGroup.name = 'wallTV';

  const tvBezel = mesh(new THREE.BoxGeometry(5.5, 3.2, 0.14),
    new THREE.MeshStandardMaterial({ color: 0x080810, roughness: 0.5, metalness: 0.6 }));
  tvGroup.add(tvBezel);

  const tvScreen = mesh(new THREE.BoxGeometry(5.1, 2.8, 0.05),
    new THREE.MeshStandardMaterial({ color: 0x050520, roughness: 0.1, emissive: 0x3366cc, emissiveIntensity: 0.6 }));
  tvScreen.position.z = 0.08; tvScreen.name = 'tvScreen'; tvGroup.add(tvScreen);

  // TV screen border glow
  const tvBorderGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(5.52, 3.22, 0.15));
  tvGroup.add(new THREE.LineSegments(tvBorderGeo, new THREE.LineBasicMaterial({ color: 0xaa55ff })));

  // RGB strip at bottom of TV
  const tvStrip = mesh(new THREE.BoxGeometry(5.1, 0.06, 0.06),
    new THREE.MeshStandardMaterial({ color: 0xaa55ff, emissive: 0xaa55ff, emissiveIntensity: 3 }));
  tvStrip.name = 'tvStrip'; tvStrip.position.set(0, -1.68, 0.1); tvGroup.add(tvStrip);

  // TV stand / wall mount arms
  [[-1.5, 0], [1.5, 0]].forEach(([x]) => {
    const arm = mesh(new THREE.BoxGeometry(0.12, 0.5, 0.3),
      new THREE.MeshStandardMaterial({ color: 0x333344, roughness: 0.4, metalness: 0.7 }));
    arm.position.set(x, -1.88, -0.15); tvGroup.add(arm);
  });

  // Thin wall plate
  const tvPlate = mesh(new THREE.BoxGeometry(4, 0.08, 0.4),
    new THREE.MeshStandardMaterial({ color: 0x222233, roughness: 0.5, metalness: 0.5 }));
  tvPlate.position.set(0, -2.1, -0.2); tvGroup.add(tvPlate);

  // TV content lines (fake UI on screen)
  const contentColors = [0x00ffcc, 0xaa55ff, 0xff4488, 0xeda72d, 0x4488ff];
  [0.8, 0.35, -0.1, -0.55, -1.0].forEach((y, i) => {
    const w = [3.2, 2.4, 3.8, 2.0, 1.6][i];
    const bar = mesh(new THREE.BoxGeometry(w, 0.14, 0.02),
      new THREE.MeshStandardMaterial({ color: contentColors[i], emissive: contentColors[i], emissiveIntensity: 0.8, roughness: 0.1 }));
    bar.position.set(-0.5, y, 0.09); bar.name = `tvBar${i}`; tvGroup.add(bar);
  });

  tvGroup.rotation.y = Math.PI / 2;
  tvGroup.position.set(-10.8, 6.5, -2);
  scene.add(tvGroup);

  // TV point light
  const tvLight = new THREE.PointLight(0xaa55ff, 3, 8);
  tvLight.position.set(-9.5, 6.5, -2); scene.add(tvLight);

  // ── CLICKABLE KEYBOARD ON DESK ─────────────────────────────────────────────
  const kbGroup = new THREE.Group(); kbGroup.name = 'keyboard';

  // Keyboard base
  const kbBase = mesh(new THREE.BoxGeometry(3.2, 0.1, 1.2),
    new THREE.MeshStandardMaterial({ color: 0x111122, roughness: 0.5, metalness: 0.5 }));
  kbGroup.add(kbBase);

  // Key layout — rows with individual keys
  const keyLayout = [
    { row: 0, keys: 14, startX: -1.45, z: -0.38, w: 0.19, h: 0.19 },
    { row: 1, keys: 14, startX: -1.45, z: -0.18, w: 0.19, h: 0.19 },
    { row: 2, keys: 13, startX: -1.35, z:  0.02, w: 0.19, h: 0.19 },
    { row: 3, keys: 12, startX: -1.25, z:  0.22, w: 0.19, h: 0.19 },
    { row: 4, keys: 5,  startX: -0.85, z:  0.42, w: 0.19, h: 0.19 }, // spacebar area
  ];
  const kbColors = [0xaa55ff, 0x00ffcc, 0xff4488, 0xeda72d, 0x4488ff, 0xff8c00];
  const keyMeshes = []; // store for click interaction

  keyLayout.forEach(({ row, keys, startX, z, w, h }) => {
    for (let k = 0; k < keys; k++) {
      const colorIdx = (row * keys + k) % kbColors.length;
      const keyMat = new THREE.MeshStandardMaterial({
        color: kbColors[colorIdx],
        emissive: kbColors[colorIdx],
        emissiveIntensity: 0.4,
        roughness: 0.7,
      });
      const key = mesh(new THREE.BoxGeometry(w - 0.02, 0.06, h - 0.02), keyMat);
      key.position.set(startX + k * (w + 0.02), 0.08, z);
      key.name = `key_${row}_${k}`;
      key.userData = { isKey: true, baseColor: kbColors[colorIdx], baseIntensity: 0.4 };
      kbGroup.add(key);
      keyMeshes.push(key);
    }
  });

  // Spacebar
  const spacebar = mesh(new THREE.BoxGeometry(1.8, 0.06, 0.17),
    new THREE.MeshStandardMaterial({ color: 0x222244, emissive: 0xaa55ff, emissiveIntensity: 0.6, roughness: 0.6 }));
  spacebar.position.set(0.1, 0.08, 0.42);
  spacebar.name = 'key_spacebar';
  spacebar.userData = { isKey: true, baseColor: 0xaa55ff, baseIntensity: 0.6 };
  kbGroup.add(spacebar); keyMeshes.push(spacebar);

  kbGroup.position.set(-0.5, 2.62, -4.2);
  kbGroup.rotation.x = -0.05;
  scene.add(kbGroup);

  // Assign wave offsets to keys for RGB animation
  let waveIdx = 0;
  kbGroup.traverse(o => {
    if (o.name && o.name.startsWith('key_') && o.userData.isKey) {
      o.userData.waveOffset = waveIdx++;
    }
  });

  // ── TROPHY ON DESK ─────────────────────────────────────────────────────────
  const trBase1 = mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.2, 12), MAT.gold.clone());
  trBase1.position.set(3, 2.72, -6); scene.add(trBase1);
  const trBase2 = mesh(new THREE.CylinderGeometry(0.12, 0.22, 0.35, 12), MAT.gold.clone());
  trBase2.position.set(3, 2.99, -6); scene.add(trBase2);
  const trStar = mesh(new THREE.OctahedronGeometry(0.2),
    new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xffd700, emissiveIntensity: 1.2, roughness: 0.1, metalness: 0.9 }));
  trStar.position.set(3, 3.36, -6); scene.add(trStar);

  // ── STARS BACKGROUND ───────────────────────────────────────────────────────
  const sGeo = new THREE.BufferGeometry();
  const sP = new Float32Array(1200 * 3);
  const sC = new Float32Array(1200 * 3);
  for (let i = 0; i < 1200; i++) {
    sP[i * 3] = (Math.random() - 0.5) * 200;
    sP[i * 3 + 1] = Math.random() * 80 + 15;
    sP[i * 3 + 2] = (Math.random() - 0.5) * 200;
    const palette = [[1, 1, 1], [0.67, 0.33, 1], [0, 1, 0.8]][Math.floor(Math.random() * 3)];
    sC[i * 3] = palette[0]; sC[i * 3 + 1] = palette[1]; sC[i * 3 + 2] = palette[2];
  }
  sGeo.setAttribute('position', new THREE.BufferAttribute(sP, 3));
  sGeo.setAttribute('color', new THREE.BufferAttribute(sC, 3));
  scene.add(new THREE.Points(sGeo,
    new THREE.PointsMaterial({ size: 0.14, vertexColors: true, transparent: true, opacity: 0.85 })));

  // ── CLICKABLES & RAYCASTER ─────────────────────────────────────────────────
  const clickables = [monL, monR, shelfGroup, mugGroup, chairGroup, ghGroup, liGroup];
  const panelMap = {
    monitorLeft: 'panel-about',
    monitorRight: 'panel-projects',
    shelf: 'panel-experience',
    mug: 'panel-contact',
    chairGroup: 'panel-skills',
  };
  const camTargets = {
    monitorLeft:  { x: -5, y: 6, z: 2,  lx: -3.5, ly: 4.3, lz: -7.0 },
    monitorRight: { x:  2, y: 6, z: 2,  lx:  0.8, ly: 4.3, lz: -7.2 },
    shelf:        { x: 10, y: 5, z: 2,  lx:  8.5, ly: 2.5, lz: -5   },
    mug:          { x:  3, y: 5, z: 2,  lx:  1.5, ly: 2.7, lz: -5.5 },
    chairGroup:   { x:  3, y: 5, z: 6,  lx:  0.5, ly: 2.5, lz: -1.5 },
  };
  const camHome = { x: 12, y: 12, z: 12, lx: 0, ly: 1, lz: 0 };

  // Intro drop-in animation for clickable objects
  [monL, monR, shelfGroup, mugGroup, chairGroup].forEach((obj, i) => {
    const origY = obj.position.y;
    obj.position.y = origY + 6;
    setTimeout(() => gsap.to(obj.position, { y: origY, duration: 1.1, ease: 'back.out(1.4)', delay: i * 0.12 }), 1300);
  });

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2(-9, -9);
  let hovered = null;
  let outlines = [];
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0xaa55ff, side: THREE.BackSide });

  renderer.domElement.addEventListener('mousemove', e => {
    mouse.x = (e.clientX / sizes.w) * 2 - 1;
    mouse.y = -(e.clientY / sizes.h) * 2 + 1;
  });

  // ── KEYBOARD CLICK — flash key on click ────────────────────────────────────
  renderer.domElement.addEventListener('click', () => {
    if (isAnimating || currentPanel) return;
    raycaster.setFromCamera(mouse, camera);
    // Check keyboard keys separately
    const kbHits = raycaster.intersectObjects(keyMeshes, false);
    if (kbHits.length) {
      const key = kbHits[0].object;
      // Flash white then return to color
      key.material.color.set(0xffffff);
      key.material.emissive.set(0xffffff);
      key.material.emissiveIntensity = 3.0;
      gsap.to(key.position, { y: key.position.y - 0.03, duration: 0.08, yoyo: true, repeat: 1, ease: 'power2.inOut' });
      setTimeout(() => {
        key.material.emissiveIntensity = 0.4;
      }, 200);
      return;
    }
    const hits = raycaster.intersectObjects(clickables, true);
    if (!hits.length) return;
    const root = getRoot(hits[0].object, clickables);
    if (!root) return;
    if (root.name === 'githubPanel') {
      window.open('https://github.com/hallamohamad1-design', '_blank');
      return;
    }
    if (root.name === 'linkedinPanel') {
      window.open('https://www.linkedin.com/in/halla-mohamed-4b2853357', '_blank');
      return;
    }
    flyTo(root.name, camTargets, panelMap, camera, camHome);
  });

  // Banner button mapping
  const bm = {
    'btn-about': 'monitorLeft',
    'btn-projects': 'monitorRight',
    'btn-skills': 'chairGroup',
    'btn-experience': 'shelf',
    'btn-contact': 'mug',
  };
  Object.entries(bm).forEach(([id, obj]) => {
    document.getElementById(id)?.addEventListener('click', () => {
      if (isAnimating) return;
      if (currentPanel) {
        closePanel(camera, camHome, controls);
        setTimeout(() => flyTo(obj, camTargets, panelMap, camera, camHome), 850);
      } else {
        flyTo(obj, camTargets, panelMap, camera, camHome);
      }
    });
  });
  document.getElementById('backBtn')?.addEventListener('click', () => {
    if (!isAnimating) closePanel(camera, camHome, controls);
  });

  // UI helpers
  const keyHint = document.getElementById('keyHint');
  document.getElementById('keyToggleBtn')?.addEventListener('click', () => keyHint?.classList.toggle('visible'));
  document.getElementById('keyHintClose')?.addEventListener('click', () => keyHint?.classList.remove('visible'));
  document.getElementById('contactForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const btn = e.target.querySelector('button'), orig = btn.textContent;
    btn.textContent = 'Sent! ✦'; btn.style.background = '#10b981';
    setTimeout(() => { btn.textContent = orig; btn.style.background = ''; e.target.reset(); }, 3000);
  });

  setupKeyboardGame(camTargets, panelMap, camera, camHome);

  // ── TOUCH HINT — show briefly after load ──────────────────────────────────
  const touchHint = document.getElementById('touchHint');
  if (touchHint) {
    setTimeout(() => {
      touchHint.classList.add('visible');
      setTimeout(() => touchHint.classList.remove('visible'), 4000);
    }, 2000);
    // Hide on first interaction
    renderer.domElement.addEventListener('pointerdown', () => {
      touchHint.classList.remove('visible');
    }, { once: true });
  }

  // ── TICK LOOP ──────────────────────────────────────────────────────────────
  const clock = new THREE.Clock();
  let neonHue = 0;

  function tick() {
    requestAnimationFrame(tick);
    const t = clock.getElapsedTime();

    controls.update();

    // Slow camera sway when idle
    if (!currentPanel && !isAnimating) {
      camera.position.x += Math.sin(t * 0.07) * 0.002;
      camera.position.y += Math.sin(t * 0.11) * 0.001;
      controls.update();
    }

    // Neon hue cycling
    neonHue = (neonHue + 0.0012) % 1;
    const c1 = new THREE.Color().setHSL(neonHue, 1, 0.6);
    const c2 = new THREE.Color().setHSL((neonHue + 0.5) % 1, 1, 0.6);

    // Update named neon strips
    const stripL = scene.getObjectByName('neonStripL');
    if (stripL) { stripL.material.color.copy(c1); stripL.material.emissive.copy(c1); }
    const stripR = scene.getObjectByName('neonStripR');
    if (stripR) { stripR.material.color.copy(c2); stripR.material.emissive.copy(c2); }

    // deskStrip color cycles
    const ds = scene.getObjectByName('deskStrip');
    if (ds) { ds.material.color.copy(c1); ds.material.emissive.copy(c1); }

    // Ceiling ring rotates and color cycles
    const cr = scene.getObjectByName('ceilRing');
    if (cr) {
      cr.rotation.z = t * 0.12;
      const crc = new THREE.Color().setHSL((neonHue + 0.25) % 1, 1, 0.6);
      cr.material.color.copy(crc); cr.material.emissive.copy(crc);
    }

    // Update point light colors from neon strips
    neonGlow.color.copy(c1);
    sconce1.color.setHSL((neonHue + 0.75) % 1, 1, 0.6);
    sconce2.color.setHSL((neonHue + 0.75) % 1, 1, 0.6);
    deskGlow.color.copy(c1);
    rugGlow.color.copy(c2);

    // Sconce lights pulse
    sconce1.intensity = 7 + Math.sin(t * 1.2) * 2;
    sconce2.intensity = 7 + Math.sin(t * 1.0 + 1) * 2;

    // screenGlow pulses
    screenGlow.intensity = 4.5 + Math.sin(t * 0.9) * 1;
    deskGlow.intensity = 5 + Math.sin(t * 1.5) * 1.5;
    neonGlow.intensity = 4 + Math.sin(t * 0.8) * 1;
    rugGlow.intensity = 3.5 + Math.sin(t * 1.1) * 1;

    // Screen emissiveIntensity breathe
    ['screenL', 'screenR', 'screenSide'].forEach((n, i) => {
      const s = scene.getObjectByName(n);
      if (s) s.material.emissiveIntensity = 0.7 + Math.sin(t * 0.7 + i * 1.3) * 0.25;
    });

    // TV screen breathe + strip color
    const tvScr = scene.getObjectByName('tvScreen');
    if (tvScr) tvScr.material.emissiveIntensity = 0.5 + Math.sin(t * 0.4) * 0.2;
    const tvS = scene.getObjectByName('tvStrip');
    if (tvS) { tvS.material.color.copy(c1); tvS.material.emissive.copy(c1); }
    tvLight.color.copy(c1); tvLight.intensity = 2.5 + Math.sin(t * 0.9) * 0.8;
    // TV content bars scroll / pulse
    for (let i = 0; i < 5; i++) {
      const bar = scene.getObjectByName(`tvBar${i}`);
      if (bar) bar.material.emissiveIntensity = 0.5 + Math.sin(t * 1.2 + i * 0.8) * 0.4;
    }

    // Keyboard RGB wave across keys
    scene.traverse(o => {
      if (o.name && o.name.startsWith('key_') && o.userData.isKey) {
        const idx = o.userData.waveOffset || 0;
        const waveHue = (neonHue + idx * 0.04) % 1;
        const wc = new THREE.Color().setHSL(waveHue, 1, 0.55);
        o.material.color.copy(wc); o.material.emissive.copy(wc);
        o.material.emissiveIntensity = 0.3 + Math.sin(t * 2 + idx * 0.3) * 0.2;
      }
    });
    if (ct) ct.rotation.y = t * 0.2;

    // plantTop sways
    const pt = scene.getObjectByName('plantTop');
    if (pt) pt.rotation.z = Math.sin(t * 0.35) * 0.06;

    // Steam wisps bob and fade
    for (let i = 0; i < 3; i++) {
      const w = scene.getObjectByName(i === 0 ? 'steam' : `steam${i}`);
      if (w) {
        w.position.y = 0.55 + i * 0.18 + Math.sin(t * 2.0 + i * 1.2) * 0.09;
        w.material.opacity = 0.12 + Math.sin(t * 1.7 + i) * 0.07;
      }
    }

    // ghBeam: moves from -1.2 to 1.2 using t*0.8 % 2.4
    const ghBeamObj = scene.getObjectByName('ghBeam');
    if (ghBeamObj) {
      ghBeamObj.position.y = -1.2 + ((t * 0.8) % 2.4);
      ghBeamObj.material.opacity = 0.5 + Math.sin(t * 3) * 0.3;
    }

    // liBeam: moves from 1.2 to -1.2
    const liBeamObj = scene.getObjectByName('liBeam');
    if (liBeamObj) {
      liBeamObj.position.y = 1.2 - ((t * 0.7) % 2.4);
      liBeamObj.material.opacity = 0.5 + Math.sin(t * 2.5 + 1) * 0.3;
    }

    // Spin ghGem and liGem
    scene.traverse(o => {
      if (o.name === 'ghGem') { o.rotation.x += 0.025; o.rotation.y += 0.035; }
      if (o.name === 'liGem') { o.rotation.x -= 0.02; o.rotation.y += 0.03; }
    });

    // githubPanel floats
    const ghPanel = scene.getObjectByName('githubPanel');
    if (ghPanel) ghPanel.position.y = 6.0 + Math.sin(t * 0.6) * 0.12;
    // linkedinPanel floats
    const liPanel = scene.getObjectByName('linkedinPanel');
    if (liPanel) liPanel.position.y = 6.0 + Math.sin(t * 0.6 + 1) * 0.12;

    // ghLight and liLight pulse
    ghLight.intensity = 3.5 + Math.sin(t * 1.2) * 1.5;
    liLight.intensity = 3.5 + Math.sin(t * 1.0 + 0.8) * 1.5;

    // Hover outline (only when idle)
    if (!currentPanel && !isAnimating) {
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(clickables, true);
      const newH = hits.length ? getRoot(hits[0].object, clickables) : null;
      if (newH !== hovered) {
        outlines.forEach(m => scene.remove(m)); outlines = [];
        if (newH) {
          renderer.domElement.style.cursor = 'pointer';
          newH.traverse(child => {
            if (child.isMesh) {
              const ol = new THREE.Mesh(child.geometry, outlineMat.clone());
              ol.scale.setScalar(1.06);
              child.getWorldPosition(ol.position);
              child.getWorldQuaternion(ol.quaternion);
              scene.add(ol); outlines.push(ol);
            }
          });
        } else {
          renderer.domElement.style.cursor = 'auto';
        }
        hovered = newH;
      }
    }

    renderer.render(scene, camera);
  }
  tick();
} // end init()

// ── NAV & KEYBOARD (module-level functions) ────────────────────────────────

function setupKeyboardGame(camTargets, panelMap, camera, camHome) {
  const codes = {
    about: 'monitorLeft',
    projects: 'monitorRight',
    skills: 'chairGroup',
    experience: 'shelf',
    contact: 'mug',
  };
  const numMap = { '1': 'about', '2': 'projects', '3': 'skills', '4': 'experience', '5': 'contact' };
  const keyBuffer = document.getElementById('keyBuffer');
  const keyHint   = document.getElementById('keyHint');
  let buffer = '', hintShown = false;

  window.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'Escape') {
      if (currentPanel) closePanel(camera, camHome, controls);
      buffer = ''; if (keyBuffer) keyBuffer.textContent = ''; return;
    }
    if (!hintShown) { hintShown = true; if (keyHint) keyHint.classList.add('visible'); }
    if (numMap[e.key]) {
      triggerNav(codes[numMap[e.key]], panelMap, camera, camHome, camTargets);
      buffer = ''; if (keyBuffer) keyBuffer.textContent = ''; flashKey(e.key); return;
    }
    if (e.key === 'Backspace') {
      buffer = buffer.slice(0, -1);
      if (keyBuffer) keyBuffer.textContent = buffer.toUpperCase(); return;
    }
    if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
      buffer = (buffer + e.key.toLowerCase()).slice(-12);
      if (keyBuffer) keyBuffer.textContent = buffer.toUpperCase();
      for (const [word, obj] of Object.entries(codes)) {
        if (buffer.endsWith(word)) {
          triggerNav(obj, panelMap, camera, camHome, camTargets);
          buffer = ''; if (keyBuffer) keyBuffer.textContent = ''; break;
        }
      }
    }
  });
}

function triggerNav(objName, panelMap, camera, camHome, camTargets) {
  if (isAnimating) return;
  if (currentPanel) {
    closePanel(camera, camHome, controls);
    setTimeout(() => flyTo(objName, camTargets, panelMap, camera, camHome), 850);
  } else {
    flyTo(objName, camTargets, panelMap, camera, camHome);
  }
}

function flashKey(key) {
  const el = document.querySelector(`[data-key="${key}"]`);
  if (el) { el.classList.add('pressed'); setTimeout(() => el.classList.remove('pressed'), 300); }
}

function getRoot(obj, clickables) {
  let cur = obj;
  while (cur) { if (clickables.includes(cur)) return cur; cur = cur.parent; }
  return null;
}

function flyTo(objName, camTargets, panelMap, camera, camHome) {
  const t = camTargets[objName]; if (!t) return;
  isAnimating = true;
  if (controls) controls.enabled = false;
  const look = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
  gsap.to(camera.position, { x: t.x, y: t.y, z: t.z, duration: 1.4, ease: 'power3.inOut' });
  gsap.to(look, {
    x: t.lx, y: t.ly, z: t.lz, duration: 1.4, ease: 'power3.inOut',
    onUpdate: () => camera.lookAt(look.x, look.y, look.z),
    onComplete: () => { isAnimating = false; openPanel(panelMap[objName]); },
  });
  document.getElementById('backBtn')?.classList.add('visible');
}

function openPanel(panelId) {
  if (!panelId) return;
  currentPanel = panelId;
  document.getElementById(panelId)?.classList.add('visible');
  document.querySelectorAll('.banner-link').forEach(b => b.classList.remove('active'));
  const m = {
    'panel-about': 'btn-about',
    'panel-projects': 'btn-projects',
    'panel-skills': 'btn-skills',
    'panel-experience': 'btn-experience',
    'panel-contact': 'btn-contact',
  };
  if (m[panelId]) document.getElementById(m[panelId])?.classList.add('active');
}

function closePanel(camera, camHome, ctrl) {
  if (!currentPanel) return;
  document.getElementById(currentPanel)?.classList.remove('visible');
  document.querySelectorAll('.banner-link').forEach(b => b.classList.remove('active'));
  currentPanel = null;
  isAnimating = true;
  document.getElementById('backBtn')?.classList.remove('visible');
  const look = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
  gsap.to(camera.position, { x: camHome.x, y: camHome.y, z: camHome.z, duration: 1.2, ease: 'power2.inOut' });
  gsap.to(look, {
    x: camHome.lx, y: camHome.ly, z: camHome.lz, duration: 1.2, ease: 'power2.inOut',
    onUpdate: () => camera.lookAt(look.x, look.y, look.z),
    onComplete: () => {
      isAnimating = false;
      if (ctrl) {
        ctrl.target.set(camHome.lx, camHome.ly, camHome.lz);
        ctrl.enabled = true;
        ctrl.update();
      }
    },
  });
}
