// ── Portfolio v3 ──────────────────────────────────────────────────────────────
import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { gsap } from 'gsap';

let currentPanel = null;
let isAnimating  = false;
let orbitCtrl;

// ── Boot ───────────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  const isMob = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || window.innerWidth < 768;
  if (isMob) {
    document.querySelector('.mobile-text').style.display = 'flex';
    document.getElementById('loadingScreen').style.display = 'none';
    document.getElementById('lazySplash').style.display = 'none';
    return;
  }
  // hide splash immediately, start 3D
  document.getElementById('lazySplash').style.display = 'none';
  startScene();
});

function dismissLoading() {
  const s = document.getElementById('loadingScreen');
  const b = document.getElementById('banner');
  if (s) s.classList.add('hidden');
  setTimeout(() => { if (b) b.classList.add('visible'); }, 400);
}

// ══════════════════════════════════════════════════════════════════════════════
async function startScene() {
  // Loading bar
  const loadBar = document.getElementById('loadingBar');
  let p = 0;
  const iv = setInterval(() => {
    p += Math.random() * 10 + 5;
    if (p >= 100) { p = 100; clearInterval(iv); setTimeout(dismissLoading, 300); }
    if (loadBar) loadBar.style.width = p + '%';
  }, 120);

  // ── Core ───────────────────────────────────────────────────────────────────
  const W = window.innerWidth, H = window.innerHeight;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0d0d1a);
  scene.fog = new THREE.Fog(0x0d0d1a, 35, 80);

  const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 200);
  camera.position.set(12, 12, 12);
  camera.lookAt(0, 1, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  document.getElementById('webgl').appendChild(renderer.domElement);

  window.addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    if (typeof cssRenderer !== 'undefined') cssRenderer.setSize(innerWidth, innerHeight);
  });

  orbitCtrl = new OrbitControls(camera, renderer.domElement);
  orbitCtrl.enableDamping = true;
  orbitCtrl.dampingFactor = 0.05;
  orbitCtrl.minDistance = 3;
  orbitCtrl.maxDistance = 45;
  orbitCtrl.minPolarAngle = 0;          // allow looking straight up
  orbitCtrl.maxPolarAngle = Math.PI;    // allow full vertical rotation
  orbitCtrl.enablePan = true;           // allow panning with right-click
  orbitCtrl.panSpeed = 0.8;
  orbitCtrl.rotateSpeed = 0.6;
  orbitCtrl.zoomSpeed = 1.2;
  orbitCtrl.target.set(0, 1, 0);
  orbitCtrl.update();

  // ── Lights ─────────────────────────────────────────────────────────────────
  scene.add(new THREE.AmbientLight(0x9966cc, 3.2));
  scene.add(new THREE.HemisphereLight(0xbb99ff, 0x221133, 2.8));
  const sun = new THREE.DirectionalLight(0xffffff, 2.8);
  sun.position.set(10, 18, 10); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = sun.shadow.camera.bottom = -18;
  sun.shadow.camera.right = sun.shadow.camera.top = 18;
  scene.add(sun);
  const sc1 = new THREE.PointLight(0xaa55ff, 7, 10); sc1.position.set(-5, 7, -9); scene.add(sc1);
  const sc2 = new THREE.PointLight(0xaa55ff, 7, 10); sc2.position.set(2, 7, -9); scene.add(sc2);
  const sg  = new THREE.PointLight(0x88aaff, 5, 12); sg.position.set(-1, 5, -5); scene.add(sg);
  const dg  = new THREE.PointLight(0xaa55ff, 6, 8);  dg.position.set(-1, 1.5, -2); scene.add(dg);
  const ng  = new THREE.PointLight(0x00ffcc, 5, 8);  ng.position.set(-6, 7, -8.5); scene.add(ng);
  const rg  = new THREE.PointLight(0xaa55ff, 4, 7);  rg.position.set(0, 0.3, 1); scene.add(rg);
  const ghl = new THREE.PointLight(0xffffff, 4, 5);  ghl.position.set(4.5, 6, -8); scene.add(ghl);
  const lil = new THREE.PointLight(0x0077b5, 4, 5);  lil.position.set(7.5, 6, -8); scene.add(lil);
  const tvl = new THREE.PointLight(0xaa55ff, 3, 8);  tvl.position.set(-9.5, 6.5, -2); scene.add(tvl);

  // ── Helpers ────────────────────────────────────────────────────────────────
  function mk(geo, mat) { const m = new THREE.Mesh(geo, mat); m.castShadow = m.receiveShadow = true; return m; }
  function neon(c, i = 3) { return new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: i, roughness: 0.05 }); }
  const M = {
    wall:  new THREE.MeshStandardMaterial({ color: 0x12122a, roughness: 0.9 }),
    wallS: new THREE.MeshStandardMaterial({ color: 0x0e0e22, roughness: 0.9 }),
    floor: new THREE.MeshStandardMaterial({ color: 0x1e1a2e, roughness: 0.75, metalness: 0.08 }),
    ceil:  new THREE.MeshStandardMaterial({ color: 0x090918, roughness: 1 }),
    trim:  new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 }),
    gold:  new THREE.MeshStandardMaterial({ color: 0xeda72d, roughness: 0.2, metalness: 0.8, emissive: 0xeda72d, emissiveIntensity: 0.25 }),
    desk:  new THREE.MeshStandardMaterial({ color: 0x252540, roughness: 0.5, metalness: 0.2 }),
    leg:   new THREE.MeshStandardMaterial({ color: 0x1e1e30, roughness: 0.6 }),
    bezel: new THREE.MeshStandardMaterial({ color: 0x111122, roughness: 0.5, metalness: 0.5 }),
    scrn:  new THREE.MeshStandardMaterial({ color: 0x0a1e40, roughness: 0.1, metalness: 0.2, emissive: 0x3366ff, emissiveIntensity: 0.8 }),
    foam:  new THREE.MeshStandardMaterial({ color: 0x2a2a3e, roughness: 0.95 }),
    chair: new THREE.MeshStandardMaterial({ color: 0x111122, roughness: 0.7 }),
    shelf: new THREE.MeshStandardMaterial({ color: 0x2a2a3e, roughness: 0.6 }),
    acc:   new THREE.MeshStandardMaterial({ color: 0xeda72d, roughness: 0.3, metalness: 0.5, emissive: 0xeda72d, emissiveIntensity: 0.2 }),
  };

  // ── ROOM ───────────────────────────────────────────────────────────────────
  const floor = mk(new THREE.PlaneGeometry(22, 20), M.floor);
  floor.rotation.x = -Math.PI / 2; scene.add(floor);
  for (let i = -10; i <= 10; i += 1.2) {
    const p = mk(new THREE.BoxGeometry(22, 0.01, 0.04), new THREE.MeshStandardMaterial({ color: 0x1a162a }));
    p.position.set(0, 0.006, i); scene.add(p);
  }
  const bw = mk(new THREE.PlaneGeometry(22, 14), M.wall); bw.position.set(0, 7, -10); scene.add(bw);
  const lw = mk(new THREE.PlaneGeometry(20, 14), M.wallS); lw.position.set(-11, 7, 0); lw.rotation.y = Math.PI/2; scene.add(lw);
  const rw = mk(new THREE.PlaneGeometry(20, 14), M.wallS.clone()); rw.position.set(11, 7, 0); rw.rotation.y = -Math.PI/2; scene.add(rw);
  const fw = mk(new THREE.PlaneGeometry(22, 14), M.wallS.clone()); fw.position.set(0, 7, 10); fw.rotation.y = Math.PI; scene.add(fw);
  const cl = mk(new THREE.PlaneGeometry(22, 20), M.ceil); cl.rotation.x = Math.PI/2; cl.position.y = 14; scene.add(cl);

  // Ceiling trim
  [[22,0.3,0.3,[0,13.85,-10]],[22,0.3,0.3,[0,13.85,10]],[0.3,0.3,20,[-11,13.85,0]],[0.3,0.3,20,[11,13.85,0]]].forEach(([a,b,c,p]) => {
    const t = mk(new THREE.BoxGeometry(a,b,c), M.trim.clone()); t.position.set(...p); scene.add(t);
  });
  // Gold skirting + horizontal lines
  const sk = mk(new THREE.BoxGeometry(22,0.18,0.06), M.gold.clone()); sk.position.set(0,0.09,-9.95); scene.add(sk);
  [3,6,9].forEach(y => { const l = mk(new THREE.BoxGeometry(22,0.06,0.05), M.gold.clone()); l.position.set(0,y,-9.93); scene.add(l); });

  // Neon strips
  const ns1 = mk(new THREE.BoxGeometry(22,0.07,0.07), neon(0x00ffcc)); ns1.name='neonStripL'; ns1.position.set(0,11,-9.9); scene.add(ns1);
  const ns2 = mk(new THREE.BoxGeometry(22,0.07,0.07), neon(0xff00aa)); ns2.name='neonStripR'; ns2.position.set(0,1.5,-9.9); scene.add(ns2);
  mk(new THREE.BoxGeometry(0.07,14,0.07), neon(0x00ffcc)).position.set(-10.92,7,0); scene.add(scene.children[scene.children.length-1]);
  const nvR = mk(new THREE.BoxGeometry(0.07,14,0.07), neon(0xff00aa)); nvR.position.set(10.92,7,0); scene.add(nvR);
  const cr = mk(new THREE.TorusGeometry(4,0.08,8,64), neon(0x00ffcc,3)); cr.name='ceilRing'; cr.rotation.x=Math.PI/2; cr.position.set(0,13.7,0); scene.add(cr);
  // Floor lines
  [-5,5].forEach(x => { const l = mk(new THREE.BoxGeometry(0.06,0.02,22), new THREE.MeshStandardMaterial({color:0xeda72d,emissive:0xeda72d,emissiveIntensity:1})); l.position.set(x,0.016,-1); scene.add(l); });

  // Wall sconces
  [-5,2].forEach(x => {
    const g = new THREE.Group();
    const b = mk(new THREE.BoxGeometry(0.4,0.7,0.4), new THREE.MeshStandardMaterial({color:0xaa55ff,emissive:0xaa55ff,emissiveIntensity:1.5,transparent:true,opacity:0.85})); g.add(b);
    [-0.39,0.39].forEach(y => { const c = mk(new THREE.BoxGeometry(0.5,0.08,0.5), new THREE.MeshStandardMaterial({color:0x333355})); c.position.y=y; g.add(c); });
    const a = mk(new THREE.BoxGeometry(0.08,0.08,0.35), new THREE.MeshStandardMaterial({color:0x333355})); a.position.set(0,0,0.35); g.add(a);
    g.position.set(x,7.5,-9.6); scene.add(g);
  });

  // Acoustic foam
  for (let r=0;r<5;r++) for (let c=0;c<6;c++) {
    const f = mk(new THREE.BoxGeometry(0.55,0.55,0.1), M.foam.clone()); f.position.set(3+c*0.6,4.5+r*0.6,-9.88); scene.add(f);
    const t = mk(new THREE.ConeGeometry(0.2,0.15,4), new THREE.MeshStandardMaterial({color:0x222233})); t.position.set(3+c*0.6,4.5+r*0.6,-9.72); t.rotation.x=Math.PI/2; scene.add(t);
  }

  // Neon HM sign
  function nb(x,y,z,w,h,d,c){const m=mk(new THREE.BoxGeometry(w,h,d),neon(c));m.position.set(x,y,z);scene.add(m);}
  nb(-7.8,8.2,-9.8,0.12,1.8,0.08,0x00ffcc); nb(-6.6,8.2,-9.8,0.12,1.8,0.08,0x00ffcc); nb(-7.2,8.2,-9.8,0.6,0.12,0.08,0x00ffcc);
  nb(-5.8,8.2,-9.8,0.12,1.8,0.08,0x00ffcc); nb(-4.6,8.2,-9.8,0.12,1.8,0.08,0x00ffcc); nb(-3.4,8.2,-9.8,0.12,1.8,0.08,0x00ffcc);
  nb(-5.2,9.0,-9.8,0.72,0.12,0.08,0x00ffcc); nb(-4.0,9.0,-9.8,0.72,0.12,0.08,0x00ffcc);
  [-7.5,-6.5,-5.5,-4.5].forEach((x,i)=>nb(x,6.8,-9.8,0.6,0.08,0.06,i%2===0?0xff2266:0xaa55ff));

  // ── GITHUB PANEL ──────────────────────────────────────────────────────────
  const ghG = new THREE.Group(); ghG.name = 'githubPanel';
  ghG.add(mk(new THREE.BoxGeometry(2.2,2.8,0.06), new THREE.MeshStandardMaterial({color:0x0a0a1a,transparent:true,opacity:0.92})));
  ghG.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(2.22,2.82,0.07)), new THREE.LineBasicMaterial({color:0xffffff})));
  const ghScr = mk(new THREE.BoxGeometry(1.9,2.5,0.03), new THREE.MeshStandardMaterial({color:0x050510,emissive:0x111133,emissiveIntensity:0.3})); ghScr.position.z=0.03; ghG.add(ghScr);
  [[-1,1.3],[1,1.3],[-1,-1.3],[1,-1.3]].forEach(([cx,cy])=>{ const g=mk(new THREE.OctahedronGeometry(0.08),new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xffffff,emissiveIntensity:2})); g.position.set(cx,cy,0.05); g.name='ghGem'; ghG.add(g); });
  const ghHead = mk(new THREE.SphereGeometry(0.38,16,16), new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xffffff,emissiveIntensity:0.6,roughness:0.3})); ghHead.position.set(0,0.25,0.06); ghG.add(ghHead);
  [[-0.28,0.62],[0.28,0.62]].forEach(([ex,ey])=>{ const e=mk(new THREE.ConeGeometry(0.11,0.2,4),new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xffffff,emissiveIntensity:0.6})); e.position.set(ex,ey,0.06); e.rotation.z=ex<0?-0.3:0.3; ghG.add(e); });
  const ghBod = mk(new THREE.SphereGeometry(0.25,12,12), new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xffffff,emissiveIntensity:0.5})); ghBod.scale.set(1,0.7,0.5); ghBod.position.set(0,-0.22,0.06); ghG.add(ghBod);
  const ghBeam = mk(new THREE.BoxGeometry(1.9,0.04,0.03), neon(0x00ffcc,4)); ghBeam.position.set(0,1.2,0.055); ghBeam.name='ghBeam'; ghG.add(ghBeam);
  for(let i=0;i<8;i++){const sl=mk(new THREE.BoxGeometry(1.9,0.015,0.02),new THREE.MeshStandardMaterial({color:0x4444ff,emissive:0x4444ff,emissiveIntensity:1,transparent:true,opacity:0.25}));sl.position.set(0,-1.1+i*0.32,0.055);ghG.add(sl);}
  const ghLine = mk(new THREE.BoxGeometry(1.6,0.04,0.04), neon(0xffffff,3)); ghLine.position.set(0,-1.15,0.04); ghG.add(ghLine);
  ghG.position.set(4.5,6.0,-9.87); scene.add(ghG);

  // ── LINKEDIN PANEL ─────────────────────────────────────────────────────────
  const liG = new THREE.Group(); liG.name = 'linkedinPanel';
  liG.add(mk(new THREE.BoxGeometry(2.2,2.8,0.06), new THREE.MeshStandardMaterial({color:0x001a2a,transparent:true,opacity:0.92})));
  liG.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(2.22,2.82,0.07)), new THREE.LineBasicMaterial({color:0x0077b5})));
  const liScr = mk(new THREE.BoxGeometry(1.9,2.5,0.03), new THREE.MeshStandardMaterial({color:0x001020,emissive:0x001a3a,emissiveIntensity:0.4})); liScr.position.z=0.03; liG.add(liScr);
  [[-1,1.3],[1,1.3],[-1,-1.3],[1,-1.3]].forEach(([cx,cy])=>{ const g=mk(new THREE.OctahedronGeometry(0.08),new THREE.MeshStandardMaterial({color:0x0077b5,emissive:0x0077b5,emissiveIntensity:2.5})); g.position.set(cx,cy,0.05); g.name='liGem'; liG.add(g); });
  const liSq = mk(new THREE.BoxGeometry(1.2,1.2,0.1), new THREE.MeshStandardMaterial({color:0x0077b5,emissive:0x0077b5,emissiveIntensity:0.8,roughness:0.2})); liSq.position.set(0,0.15,0.08); liG.add(liSq);
  const liDot = mk(new THREE.SphereGeometry(0.1,10,10), new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xffffff,emissiveIntensity:1.5})); liDot.position.set(-0.27,0.58,0.16); liG.add(liDot);
  [[0.16,0.52,[-0.27,0.18]],[0.16,0.7,[0.08,0.14]],[0.32,0.16,[0.24,0.45]],[0.16,0.55,[0.39,0.17]]].forEach(([w,h,[x,y]])=>{ const b=mk(new THREE.BoxGeometry(w,h,0.08),new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xffffff,emissiveIntensity:1.2})); b.position.set(x,y,0.16); liG.add(b); });
  const liBeam = mk(new THREE.BoxGeometry(1.9,0.04,0.03), neon(0x0077b5,4)); liBeam.position.set(0,1.2,0.055); liBeam.name='liBeam'; liG.add(liBeam);
  for(let i=0;i<8;i++){const sl=mk(new THREE.BoxGeometry(1.9,0.015,0.02),new THREE.MeshStandardMaterial({color:0x0066aa,emissive:0x0066aa,emissiveIntensity:1,transparent:true,opacity:0.25}));sl.position.set(0,-1.1+i*0.32,0.055);liG.add(sl);}
  const liLine = mk(new THREE.BoxGeometry(1.6,0.04,0.04), neon(0x0077b5,3)); liLine.position.set(0,-1.15,0.04); liG.add(liLine);
  liG.position.set(7.5,6.0,-9.87); scene.add(liG);

  // ── L-SHAPED DESK ──────────────────────────────────────────────────────────
  const d1 = mk(new THREE.BoxGeometry(9,0.2,4), M.desk.clone()); d1.position.set(-1,2.5,-5.5); scene.add(d1);
  const d2 = mk(new THREE.BoxGeometry(4,0.2,4.5), M.desk.clone()); d2.position.set(4.5,2.5,-3); scene.add(d2);
  const ds = mk(new THREE.BoxGeometry(9,0.05,0.05), neon(0xaa55ff)); ds.name='deskStrip'; ds.position.set(-1,2.35,-3.55); scene.add(ds);
  [[-4.8,-5.5],[-4.8,-7.2],[2.6,-5.5],[2.6,-7.2],[5.5,-1.2],[3.5,-1.2]].forEach(([x,z])=>{
    const l=mk(new THREE.BoxGeometry(0.2,2.5,0.2),M.leg.clone()); l.position.set(x,1.25,z); scene.add(l);
    const f=mk(new THREE.BoxGeometry(0.3,0.08,0.3),M.gold.clone()); f.position.set(x,0.04,z); scene.add(f);
  });
  const dm = mk(new THREE.BoxGeometry(5,0.015,2.5), new THREE.MeshStandardMaterial({color:0x111122,roughness:0.95}));
  dm.position.set(-1.5,2.61,-5.5); scene.add(dm);

  // ── WALL TV — shows project slideshow via CSS3DObject ──────────────────────
  // Import CSS3DRenderer for embedding real HTML on the TV screen
  const { CSS3DRenderer, CSS3DObject } = await import('three/examples/jsm/renderers/CSS3DRenderer.js');

  // CSS3D renderer setup
  const cssRenderer = new CSS3DRenderer();
  cssRenderer.setSize(innerWidth, innerHeight);
  cssRenderer.domElement.style.position = 'fixed';
  cssRenderer.domElement.style.top = '0';
  cssRenderer.domElement.style.left = '0';
  cssRenderer.domElement.style.pointerEvents = 'none';
  cssRenderer.domElement.style.zIndex = '1';
  document.getElementById('webgl').appendChild(cssRenderer.domElement);

  const tvIframe = document.createElement('iframe');
  tvIframe.src = '/tv-screen.html';
  tvIframe.style.width  = '1100px';
  tvIframe.style.height = '620px';
  tvIframe.style.border = 'none';
  tvIframe.style.background = '#050520';
  tvIframe.style.borderRadius = '4px';
  tvIframe.style.pointerEvents = 'none';

  const cssScene = new THREE.Scene();
  const cssObj = new CSS3DObject(tvIframe);
  cssObj.scale.setScalar(0.0028);
  // TV is at (-10.8, 6.5, -2) rotation.y = PI/2
  cssObj.position.set(-10.78, 6.5, -2);
  cssObj.rotation.y = Math.PI / 2;
  cssScene.add(cssObj);

  const tvG = new THREE.Group(); tvG.name='wallTV';
  tvG.add(mk(new THREE.BoxGeometry(5.5,3.2,0.14), new THREE.MeshStandardMaterial({color:0x080810,roughness:0.5,metalness:0.6})));
  const tvScr = mk(new THREE.BoxGeometry(5.1,2.8,0.05), new THREE.MeshStandardMaterial({color:0x050520,emissive:0x3366cc,emissiveIntensity:0.6,roughness:0.1})); tvScr.position.z=0.08; tvScr.name='tvScreen'; tvG.add(tvScr);
  tvG.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(5.52,3.22,0.15)), new THREE.LineBasicMaterial({color:0xaa55ff})));
  const tvS = mk(new THREE.BoxGeometry(5.1,0.06,0.06), neon(0xaa55ff)); tvS.name='tvStrip'; tvS.position.set(0,-1.68,0.1); tvG.add(tvS);
  [[0.8,0.35,-0.1,-0.55,-1.0],[3.2,2.4,3.8,2.0,1.6]].forEach(()=>{});
  [0.8,0.35,-0.1,-0.55,-1.0].forEach((y,i)=>{
    const w=[3.2,2.4,3.8,2.0,1.6][i]; const c=[0x00ffcc,0xaa55ff,0xff4488,0xeda72d,0x4488ff][i];
    const bar=mk(new THREE.BoxGeometry(w,0.14,0.02), new THREE.MeshStandardMaterial({color:c,emissive:c,emissiveIntensity:0.8}));
    bar.position.set(-0.5,y,0.09); bar.name=`tvBar${i}`; tvG.add(bar);
  });
  tvG.rotation.y = Math.PI/2; tvG.position.set(-10.8,6.5,-2); scene.add(tvG);

  // ── MONITORS ───────────────────────────────────────────────────────────────
  function makeMon(name, sName, w, h) {
    const g = new THREE.Group(); g.name = name;
    g.add(mk(new THREE.BoxGeometry(w,h,0.14), M.bezel.clone()));
    const s = mk(new THREE.BoxGeometry(w-0.3,h-0.3,0.05), M.scrn.clone()); s.position.z=0.08; s.name=sName; g.add(s);
    g.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(w+0.02,h+0.02,0.15)), new THREE.LineBasicMaterial({color:0x444466})));
    const strip = mk(new THREE.BoxGeometry(w-0.3,0.06,0.06), neon(0xaa55ff)); strip.position.set(0,-(h/2)+0.1,0.1); g.add(strip);
    const neck = mk(new THREE.BoxGeometry(0.18,0.8,0.18), M.leg.clone()); neck.position.set(0,-(h/2)-0.5,0); g.add(neck);
    const base = mk(new THREE.BoxGeometry(1.2,0.08,0.6), M.leg.clone()); base.position.set(0,-(h/2)-0.95,0.1); g.add(base);
    return g;
  }
  const monL = makeMon('monitorLeft','screenL',3.8,2.2);
  monL.position.set(-3.5,4.3,-7); monL.rotation.y=0.15; scene.add(monL);
  const monR = makeMon('monitorRight','screenR',3.8,2.2);
  monR.position.set(0.8,4.3,-7.2); scene.add(monR);
  const monS = makeMon('monitorSide','screenSide',3.2,1.9);
  monS.position.set(4.5,4.2,-4.8); monS.rotation.y=-Math.PI/2; scene.add(monS);

  // ── GAMING CHAIR ───────────────────────────────────────────────────────────
  const chG = new THREE.Group(); chG.name='chairGroup';
  const seat=mk(new THREE.BoxGeometry(2,0.25,2),M.chair.clone()); seat.position.y=1.6; chG.add(seat);
  [-0.95,0.95].forEach(x=>{const s=mk(new THREE.BoxGeometry(0.08,0.26,2),M.acc.clone());s.position.set(x,1.6,0);chG.add(s);});
  const back=mk(new THREE.BoxGeometry(1.9,2.6,0.22),M.chair.clone()); back.position.set(0,3.1,-0.9); chG.add(back);
  [-0.88,0.88].forEach(x=>{const s=mk(new THREE.BoxGeometry(0.08,2.6,0.23),M.acc.clone());s.position.set(x,3.1,-0.9);chG.add(s);});
  const hd=mk(new THREE.BoxGeometry(1.4,0.7,0.22),M.chair.clone()); hd.position.set(0,4.55,-0.9); chG.add(hd);
  [-0.85,0.85].forEach(x=>{const a=mk(new THREE.BoxGeometry(0.22,0.12,0.9),M.chair.clone());a.position.set(x,1.85,-0.1);chG.add(a);});
  const pole=mk(new THREE.CylinderGeometry(0.1,0.1,1.4,10),M.leg.clone()); pole.position.y=0.7; chG.add(pole);
  const ctop=new THREE.Group(); ctop.name='chairTop';
  for(let i=0;i<5;i++){const a=(i/5)*Math.PI*2; const arm=mk(new THREE.BoxGeometry(1.3,0.07,0.1),M.leg.clone()); arm.rotation.y=a; arm.position.set(Math.cos(a)*0.65,0,Math.sin(a)*0.65); ctop.add(arm); const w=mk(new THREE.CylinderGeometry(0.12,0.12,0.1,8),new THREE.MeshStandardMaterial({color:0x111111})); w.position.set(Math.cos(a)*1.2,0,Math.sin(a)*1.2); ctop.add(w);}
  ctop.position.y=0.05; chG.add(ctop);
  chG.position.set(0.5,0,-1.5); chG.rotation.y=0.2; scene.add(chG);

  // ── SHELF ──────────────────────────────────────────────────────────────────
  const shG = new THREE.Group(); shG.name='shelf';
  const sback=mk(new THREE.BoxGeometry(3.5,5,0.12),M.shelf.clone()); sback.position.z=-0.75; shG.add(sback);
  [-1.68,1.68].forEach(x=>{const s=mk(new THREE.BoxGeometry(0.12,5,1.5),M.shelf.clone());s.position.x=x;shG.add(s);});
  [0,1,2].forEach(row=>{[-0.84,0.84].forEach(x=>{const s=mk(new THREE.BoxGeometry(1.56,0.1,1.5),M.shelf.clone());s.position.set(x,-2.3+row*1.6,0);shG.add(s);}); const dv=mk(new THREE.BoxGeometry(0.1,1.5,1.5),M.shelf.clone());dv.position.set(0,-1.55+row*1.6,0);shG.add(dv);});
  const shTop=mk(new THREE.BoxGeometry(3.5,0.12,1.5),M.shelf.clone()); shTop.position.y=2.56; shG.add(shTop);
  [0xc0392b,0x2980b9,0x27ae60,0xf39c12,0x8e44ad,0xe74c3c].forEach((c,i)=>{const item=mk(new THREE.BoxGeometry(0.6,0.9,0.4),new THREE.MeshStandardMaterial({color:c,roughness:0.8}));item.position.set(i%2===0?-0.84:0.84,-1.8+Math.floor(i/2)*1.6,0.2);shG.add(item);});
  const shNeon=mk(new THREE.BoxGeometry(3.5,0.05,0.05),neon(0x00ff88)); shNeon.position.set(0,2.62,0.76); shG.add(shNeon);
  shG.position.set(8.5,1.5,-5); scene.add(shG);

  // ── RUG ────────────────────────────────────────────────────────────────────
  const rug=mk(new THREE.PlaneGeometry(6,5),new THREE.MeshStandardMaterial({color:0x1a0a3a,roughness:0.95})); rug.rotation.x=-Math.PI/2; rug.position.set(0.5,0.09,-0.5); scene.add(rug);
  const rugI=mk(new THREE.PlaneGeometry(5,4),new THREE.MeshStandardMaterial({color:0x280d55,roughness:0.95})); rugI.rotation.x=-Math.PI/2; rugI.position.set(0.5,0.095,-0.5); scene.add(rugI);
  const rLm=new THREE.MeshStandardMaterial({color:0xaa55ff,emissive:0xaa55ff,emissiveIntensity:1.5});
  [[-0.5,0],[0.5,0]].forEach(([x])=>{const b=mk(new THREE.BoxGeometry(0.07,0.01,1.2),rLm.clone());b.rotation.x=-Math.PI/2;b.position.set(0.5+x,0.1,-0.5);scene.add(b);});
  const rc=mk(new THREE.BoxGeometry(1.1,0.01,0.07),rLm.clone()); rc.rotation.x=-Math.PI/2; rc.position.set(0.5,0.1,-0.5); scene.add(rc);
  [-2.9,2.9].forEach(x=>{const e=mk(new THREE.BoxGeometry(0.04,0.01,5),new THREE.MeshStandardMaterial({color:0xaa55ff,emissive:0xaa55ff,emissiveIntensity:2}));e.rotation.x=-Math.PI/2;e.position.set(0.5+x,0.1,-0.5);scene.add(e);});

  // ── SMALL DETAILS ──────────────────────────────────────────────────────────
  // Mic
  const mic=mk(new THREE.CylinderGeometry(0.04,0.04,2.5,8),M.leg.clone()); mic.position.set(-4.5,3.8,-5.5); mic.rotation.z=0.4; scene.add(mic);
  const mh=mk(new THREE.CylinderGeometry(0.12,0.12,0.4,10),new THREE.MeshStandardMaterial({color:0x333344,roughness:0.4,metalness:0.6})); mh.position.set(-3.7,4.8,-5.5); scene.add(mh);
  // Plant
  const pot=mk(new THREE.CylinderGeometry(0.18,0.14,0.3,10),new THREE.MeshStandardMaterial({color:0x8b4513,roughness:0.85})); pot.position.set(2.5,2.72,-5.5); scene.add(pot);
  const leaf=mk(new THREE.SphereGeometry(0.22,8,8),new THREE.MeshStandardMaterial({color:0x1e8a30,roughness:0.75})); leaf.scale.set(1,0.7,1); leaf.position.set(2.5,3.1,-5.5); leaf.name='plantTop'; scene.add(leaf);
  // Trash
  const trash=mk(new THREE.CylinderGeometry(0.3,0.25,0.7,12),new THREE.MeshStandardMaterial({color:0x888899,roughness:0.5,metalness:0.6})); trash.position.set(-6,0.35,-2); scene.add(trash);
  // Trophy
  const tr1=mk(new THREE.CylinderGeometry(0.22,0.28,0.2,12),M.gold.clone()); tr1.position.set(3,2.72,-6); scene.add(tr1);
  const tr2=mk(new THREE.CylinderGeometry(0.12,0.22,0.35,12),M.gold.clone()); tr2.position.set(3,2.99,-6); scene.add(tr2);
  const trS=mk(new THREE.OctahedronGeometry(0.2),new THREE.MeshStandardMaterial({color:0xffd700,emissive:0xffd700,emissiveIntensity:1.2,roughness:0.1,metalness:0.9})); trS.position.set(3,3.36,-6); scene.add(trS);

  // ── MUG (contact) ──────────────────────────────────────────────────────────
  const mugG = new THREE.Group(); mugG.name='mug';
  const mugM = new THREE.MeshStandardMaterial({color:0x1a4a80,roughness:0.4,metalness:0.3});
  mugG.add(mk(new THREE.CylinderGeometry(0.32,0.27,0.65,28), mugM));
  const mr=mk(new THREE.TorusGeometry(0.32,0.032,8,28),M.gold.clone()); mr.position.y=0.325; mugG.add(mr);
  const mh2=mk(new THREE.TorusGeometry(0.2,0.048,8,18,Math.PI),mugM.clone()); mh2.position.set(0.36,0,0); mh2.rotation.y=Math.PI/2; mugG.add(mh2);
  const mc=mk(new THREE.CircleGeometry(0.29,28),new THREE.MeshStandardMaterial({color:0x3d1a00,roughness:0.9})); mc.rotation.x=-Math.PI/2; mc.position.y=0.3; mugG.add(mc);
  for(let i=0;i<3;i++){const w=mk(new THREE.SphereGeometry(0.07+i*0.02,7,7),new THREE.MeshStandardMaterial({color:0xffffff,transparent:true,opacity:0.15}));w.position.set((i-1)*0.1,0.55+i*0.18,0);w.name=i===0?'steam':`steam${i}`;mugG.add(w);}
  mugG.position.set(1.5,2.72,-5.5); scene.add(mugG);

  // ── KEYBOARD ───────────────────────────────────────────────────────────────
  const kbG = new THREE.Group(); kbG.name='keyboard';
  kbG.add(mk(new THREE.BoxGeometry(3.2,0.1,1.2), new THREE.MeshStandardMaterial({color:0x111122,roughness:0.5,metalness:0.5})));
  const kc=[0xaa55ff,0x00ffcc,0xff4488,0xeda72d,0x4488ff,0xff8c00];
  const keyMs=[];
  [{row:0,n:14,sx:-1.45,z:-0.38},{row:1,n:14,sx:-1.45,z:-0.18},{row:2,n:13,sx:-1.35,z:0.02},{row:3,n:12,sx:-1.25,z:0.22}].forEach(({row,n,sx,z})=>{
    for(let k=0;k<n;k++){const c=kc[(row*n+k)%kc.length];const km=mk(new THREE.BoxGeometry(0.17,0.06,0.17),new THREE.MeshStandardMaterial({color:c,emissive:c,emissiveIntensity:0.4,roughness:0.7}));km.position.set(sx+k*0.21,0.08,z);km.name=`key_${row}_${k}`;km.userData={isKey:true,wi:row*n+k};kbG.add(km);keyMs.push(km);}
  });
  const sp=mk(new THREE.BoxGeometry(1.8,0.06,0.17),new THREE.MeshStandardMaterial({color:0x222244,emissive:0xaa55ff,emissiveIntensity:0.6,roughness:0.6})); sp.position.set(0.1,0.08,0.42); sp.name='key_space'; sp.userData={isKey:true,wi:99}; kbG.add(sp); keyMs.push(sp);
  kbG.position.set(-0.5,2.62,-4.2); kbG.rotation.x=-0.05; scene.add(kbG);

  // ── STARS ──────────────────────────────────────────────────────────────────
  const sGeo=new THREE.BufferGeometry(); const sP=new Float32Array(1200*3); const sC=new Float32Array(1200*3);
  for(let i=0;i<1200;i++){sP[i*3]=(Math.random()-0.5)*200;sP[i*3+1]=Math.random()*80+15;sP[i*3+2]=(Math.random()-0.5)*200;const p=[[1,1,1],[0.67,0.33,1],[0,1,0.8]][Math.floor(Math.random()*3)];sC[i*3]=p[0];sC[i*3+1]=p[1];sC[i*3+2]=p[2];}
  sGeo.setAttribute('position',new THREE.BufferAttribute(sP,3)); sGeo.setAttribute('color',new THREE.BufferAttribute(sC,3));
  scene.add(new THREE.Points(sGeo,new THREE.PointsMaterial({size:0.14,vertexColors:true,transparent:true,opacity:0.85})));

  // ── EXTRA ROOM DETAILS ─────────────────────────────────────────────────────

  // 1. WINDOW on right wall — city glow effect
  const winFrame = mk(new THREE.BoxGeometry(4.5,3.2,0.15), new THREE.MeshStandardMaterial({color:0x1a1a2e,roughness:0.5,metalness:0.3}));
  winFrame.position.set(10.88,6.5,-3); winFrame.rotation.y=-Math.PI/2; scene.add(winFrame);
  const winGlass = mk(new THREE.BoxGeometry(4.0,2.7,0.04), new THREE.MeshStandardMaterial({color:0x223355,emissive:0x335588,emissiveIntensity:0.6,roughness:0.05,metalness:0.1,transparent:true,opacity:0.6}));
  winGlass.position.set(10.85,6.5,-3); winGlass.rotation.y=-Math.PI/2; scene.add(winGlass);
  // Window cross bars
  ['h','v'].forEach((dir,i)=>{const g=dir==='h'?[4.0,0.08,0.06]:[0.08,2.7,0.06];const bar=mk(new THREE.BoxGeometry(...g),M.leg.clone());bar.position.set(10.82,6.5,-3);bar.rotation.y=-Math.PI/2;scene.add(bar);});
  // City glow light from window
  const cityLight = new THREE.PointLight(0x334466,3,12); cityLight.position.set(9,6.5,-3); scene.add(cityLight);
  // Window frame gold trim
  const winTrim = mk(new THREE.BoxGeometry(0.08,3.2,4.5), M.gold.clone()); winTrim.position.set(10.9,6.5,-3); scene.add(winTrim);

  // 2. FRAMED CERTIFICATES on back wall (left side, above bookshelf area)
  [
    {x:-7.5,y:4.0,label:'NTI',color:0xeda72d},
    {x:-6.0,y:4.0,label:'MS',color:0x0077b5},
    {x:-4.5,y:4.0,label:'PY',color:0x3776ab},
  ].forEach(({x,y,label,color})=>{
    const frame=mk(new THREE.BoxGeometry(1.1,0.85,0.06),new THREE.MeshStandardMaterial({color:0x1a1a2e,roughness:0.6}));
    frame.position.set(x,y,-9.92); scene.add(frame);
    frame.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.12,0.87,0.07)),new THREE.LineBasicMaterial({color:color})));
    const inner=mk(new THREE.BoxGeometry(0.9,0.68,0.03),new THREE.MeshStandardMaterial({color:0x0a0a18,roughness:0.9,emissive:color,emissiveIntensity:0.08}));
    inner.position.z=0.02; frame.add(inner);
    // Badge
    const badge=mk(new THREE.BoxGeometry(0.25,0.25,0.04),new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:0.5,roughness:0.2}));
    badge.position.set(0,0.05,0.04); frame.add(badge);
    // Glow line
    const gl=mk(new THREE.BoxGeometry(0.9,0.04,0.04),new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:2}));
    gl.position.set(0,-0.28,0.04); frame.add(gl);
  });

  // 3. DESK LAMP (angle-poise style)
  const lampBase=mk(new THREE.CylinderGeometry(0.18,0.22,0.08,12),M.leg.clone()); lampBase.position.set(-1.8,2.62,-7.1); scene.add(lampBase);
  const lampArm1=mk(new THREE.CylinderGeometry(0.04,0.04,1.1,8),M.leg.clone()); lampArm1.position.set(-1.8,3.22,-7.1); lampArm1.rotation.z=0.25; scene.add(lampArm1);
  const lampArm2=mk(new THREE.CylinderGeometry(0.04,0.04,0.9,8),M.leg.clone()); lampArm2.position.set(-1.55,3.8,-7.1); lampArm2.rotation.z=-0.35; scene.add(lampArm2);
  const lampHead=mk(new THREE.ConeGeometry(0.22,0.35,12,1,true),new THREE.MeshStandardMaterial({color:0x1a1a2e,roughness:0.5,side:THREE.DoubleSide})); lampHead.position.set(-1.35,4.1,-7.1); lampHead.rotation.z=-0.3; scene.add(lampHead);
  const lampBulb=mk(new THREE.SphereGeometry(0.08,8,8),new THREE.MeshStandardMaterial({color:0xffd060,emissive:0xffd060,emissiveIntensity:3})); lampBulb.position.set(-1.35,4.0,-7.1); scene.add(lampBulb);
  const lampLight=new THREE.PointLight(0xffd060,4,5); lampLight.position.set(-1.35,3.9,-7.1); scene.add(lampLight);

  // 4. FLOATING AMBIENT DUST PARTICLES
  const dustGeo=new THREE.BufferGeometry(); const dustP=new Float32Array(200*3); const dustC=new Float32Array(200*3);
  for(let i=0;i<200;i++){dustP[i*3]=(Math.random()-0.5)*18;dustP[i*3+1]=Math.random()*8+0.5;dustP[i*3+2]=(Math.random()-0.5)*14;const c=[[0.93,0.65,0.11],[0.67,0.33,1],[0,0.8,1]][Math.floor(Math.random()*3)];dustC[i*3]=c[0];dustC[i*3+1]=c[1];dustC[i*3+2]=c[2];}
  const dustGeoB=new THREE.BufferGeometry(); dustGeoB.setAttribute('position',new THREE.BufferAttribute(dustP,3)); dustGeoB.setAttribute('color',new THREE.BufferAttribute(dustC,3));
  const dustPts=new THREE.Points(dustGeoB,new THREE.PointsMaterial({size:0.06,vertexColors:true,transparent:true,opacity:0.5})); dustPts.name='dustPts'; scene.add(dustPts);

  // 5. SPEAKER on desk (right side)
  const spkBase=mk(new THREE.BoxGeometry(0.55,0.8,0.45),new THREE.MeshStandardMaterial({color:0x111122,roughness:0.6,metalness:0.3})); spkBase.position.set(-2.8,3.02,-7.2); scene.add(spkBase);
  const spkGrill=mk(new THREE.BoxGeometry(0.42,0.6,0.04),new THREE.MeshStandardMaterial({color:0x0a0a1a,roughness:0.9})); spkGrill.position.set(-2.8,3.02,-6.96); scene.add(spkGrill);
  for(let r=0;r<4;r++){for(let c=0;c<3;c++){const dot=mk(new THREE.CircleGeometry(0.03,8),new THREE.MeshStandardMaterial({color:0x222233,roughness:0.9}));dot.position.set(-2.92+c*0.12,2.82+r*0.15,-6.94);scene.add(dot);}}
  const spkLED=mk(new THREE.CircleGeometry(0.04,8),neon(0x00ffcc,3)); spkLED.position.set(-2.8,3.42,-6.95); scene.add(spkLED);
  // Second speaker (right desk)
  const spk2=spkBase.clone(); spk2.position.set(3.8,3.02,-7.0); scene.add(spk2);
  const spk2g=spkGrill.clone(); spk2g.position.set(3.8,3.02,-6.76); scene.add(spk2g);

  // 6. BOOKSHELF DETAILS — coloured spines with gold letters effect
  [-2,2].forEach(x=>{
    const bookend=mk(new THREE.BoxGeometry(0.08,1.0,1.3),new THREE.MeshStandardMaterial({color:0xeda72d,roughness:0.3,metalness:0.6}));
    bookend.position.set(x+8.5,0.08,-5); scene.add(bookend);
  });

  // 7. SMALL SUCCULENT PLANT on shelf top
  const sucPot=mk(new THREE.CylinderGeometry(0.12,0.1,0.2,10),new THREE.MeshStandardMaterial({color:0xc68642,roughness:0.85})); sucPot.position.set(8.5,5.4,-5); scene.add(sucPot);
  const sucLeaf=mk(new THREE.SphereGeometry(0.16,8,8),new THREE.MeshStandardMaterial({color:0x2d8a3e,roughness:0.7})); sucLeaf.scale.set(1,0.6,1); sucLeaf.position.set(8.5,5.68,-5); scene.add(sucLeaf);

  // 8. NEON SIGN "AI × UX" on left wall
  function nw(x,y,z,w,h,d,c){const m=mk(new THREE.BoxGeometry(w,h,d),neon(c));m.position.set(x,y,z);scene.add(m);}
  // "AI"
  nw(-10.5,9.5,-1,0.1,1.4,0.07,0xaa55ff); nw(-10.5,9.5,-1,0.7,0.1,0.07,0xaa55ff); // I
  nw(-10.0,9.5,-1,0.1,1.4,0.07,0xaa55ff); nw(-9.6,9.5,-1,0.1,1.4,0.07,0xaa55ff); // A legs
  nw(-9.8,9.5,-1,0.5,0.1,0.07,0xaa55ff); // A crossbar
  // "×" divider
  nw(-9.0,9.5,-1,0.6,0.1,0.07,0xeda72d); nw(-9.0,9.5,-1,0.1,0.6,0.07,0xeda72d);
  // "UX"
  nw(-8.2,9.5,-1,0.1,1.4,0.07,0x00ffcc); nw(-7.8,9.5,-1,0.1,1.4,0.07,0x00ffcc); // U sides
  nw(-8.0,8.9,-1,0.5,0.1,0.07,0x00ffcc); // U bottom
  nw(-7.2,9.5,-1,0.55,0.1,0.07,0x00ffcc); nw(-6.85,9.5,-1,0.55,0.1,0.07,0x00ffcc); // X diagonals approx
  nw(-7.0,9.5,-1,0.1,1.4,0.07,0x00ffcc);

  // 9. COFFEE STEAM more wisps
  for(let i=0;i<2;i++){
    const sw=mk(new THREE.SphereGeometry(0.05+i*0.02,6,6),new THREE.MeshStandardMaterial({color:0xffffff,transparent:true,opacity:0.12}));
    sw.position.set(1.8+(i-0.5)*0.15,3.0+i*0.2,-5.5); sw.name=`steamX${i}`; scene.add(sw);
  }

  // 10. POWER STRIP under desk
  const pstrip=mk(new THREE.BoxGeometry(1.8,0.12,0.35),new THREE.MeshStandardMaterial({color:0x111111,roughness:0.7})); pstrip.position.set(-3,0.06,-6.5); scene.add(pstrip);
  for(let i=0;i<5;i++){const pl=mk(new THREE.CircleGeometry(0.04,8),new THREE.MeshStandardMaterial({color:0x333333,roughness:0.9}));pl.position.set(-3.5+i*0.38,0.13,-6.33);pl.rotation.x=-Math.PI/2;pstrip.add(pl);}
  // Indicator LED on power strip
  const psLED=mk(new THREE.CircleGeometry(0.04,8),neon(0x00ff44,4)); psLED.position.set(-2.56,0.13,-6.33); psLED.rotation.x=-Math.PI/2; scene.add(psLED);

  // 11. STICKY NOTES on monitor bezels
  [[0xffdd44,0],[0xff8866,1],[0x88ff88,2]].forEach(([c,i])=>{
    const note=mk(new THREE.BoxGeometry(0.3,0.3,0.02),new THREE.MeshStandardMaterial({color:c,roughness:0.9}));
    note.position.set(-3.5+(i*0.35),4.6,-6.6); note.rotation.y=0.15; note.rotation.z=(Math.random()-0.5)*0.2; scene.add(note);
  });

  // 12. CABLE MANAGEMENT — desk cable bundle
  const cable=mk(new THREE.CylinderGeometry(0.04,0.04,2.5,6),new THREE.MeshStandardMaterial({color:0x222233,roughness:0.9}));
  cable.rotation.z=Math.PI/2; cable.position.set(-1,2.1,-7.5); scene.add(cable);
  // Build a dedicated laptop group for Skills so camera flies to it
  const laptopGroup = new THREE.Group(); laptopGroup.name = 'laptop';
  // Laptop base
  const lapBase = mk(new THREE.BoxGeometry(2.8,0.12,1.9), new THREE.MeshStandardMaterial({color:0x111122,roughness:0.5,metalness:0.5}));
  laptopGroup.add(lapBase);
  // Keyboard area
  const lapKB = mk(new THREE.BoxGeometry(2.5,0.02,1.5), new THREE.MeshStandardMaterial({color:0x1a1a2e,roughness:0.7}));
  lapKB.position.set(0,0.07,0.1); laptopGroup.add(lapKB);
  // RGB laptop keys (mini)
  const lkc = [0xaa55ff,0x00ffcc,0xff4488,0xeda72d,0x4488ff];
  for(let r=0;r<3;r++) for(let c=0;c<10;c++){
    const col=lkc[(r*10+c)%lkc.length];
    const k=mk(new THREE.BoxGeometry(0.18,0.015,0.15),new THREE.MeshStandardMaterial({color:col,emissive:col,emissiveIntensity:0.45,roughness:0.8}));
    k.position.set(-1.05+c*0.22,0.088,-0.4+r*0.22); laptopGroup.add(k);
  }
  // Lid with screen
  const lapLid = new THREE.Group();
  const lapLidBody = mk(new THREE.BoxGeometry(2.8,1.8,0.1), new THREE.MeshStandardMaterial({color:0x111122,roughness:0.5,metalness:0.5}));
  lapLid.add(lapLidBody);
  const lapScr = mk(new THREE.BoxGeometry(2.5,1.55,0.04), new THREE.MeshStandardMaterial({color:0x050520,emissive:0x3366ff,emissiveIntensity:0.75,roughness:0.1}));
  lapScr.position.z=0.06; lapScr.name='screenLaptop'; lapLid.add(lapScr);
  const lapLogo = mk(new THREE.CircleGeometry(0.18,16), new THREE.MeshStandardMaterial({color:0xeda72d,emissive:0xeda72d,emissiveIntensity:0.8}));
  lapLogo.position.set(0,0,-0.06); lapLogo.rotation.y=Math.PI; lapLid.add(lapLogo);
  const lapStrip = mk(new THREE.BoxGeometry(2.5,0.05,0.05), neon(0xaa55ff)); lapStrip.position.set(0,-0.9,0.06); lapLid.add(lapStrip);
  lapLid.position.set(0,0.9,-0.95); lapLid.rotation.x=-1.15; laptopGroup.add(lapLid);
  // Gold front trim
  const lapTrim = mk(new THREE.BoxGeometry(2.82,0.06,0.06), M.gold.clone()); lapTrim.position.set(0,0.1,0.96); laptopGroup.add(lapTrim);
  // Laptop stand legs
  [-1.3,1.3].forEach(x=>{ const f=mk(new THREE.BoxGeometry(0.18,0.04,1.9),new THREE.MeshStandardMaterial({color:0x0a0a18,roughness:0.6})); f.position.set(x,-0.08,0); laptopGroup.add(f); });

  laptopGroup.position.set(1.8, 2.63, -5.5);
  scene.add(laptopGroup);

  const clickables = [monL, monR, laptopGroup, shG, mugG, chG, ghG, liG];
  const panelMap = { monitorLeft:'panel-about', monitorRight:'panel-projects', laptop:'panel-skills', shelf:'panel-experience', mug:'panel-contact', chairGroup:'panel-skills' };
  const camT = {
    monitorLeft:  {x:-5,  y:6,   z:2,   lx:-3.5, ly:4.3,  lz:-7.0 },
    monitorRight: {x:2,   y:6,   z:2,   lx:0.8,  ly:4.3,  lz:-7.2 },
    laptop:       {x:2,   y:5.5, z:0.5, lx:1.8,  ly:3.2,  lz:-5.5 },
    shelf:        {x:10,  y:5,   z:2,   lx:8.5,  ly:2.5,  lz:-5   },
    mug:          {x:3,   y:4.5, z:0.5, lx:1.5,  ly:2.7,  lz:-5.5 },
    chairGroup:   {x:2,   y:5.5, z:0.5, lx:1.8,  ly:3.2,  lz:-5.5 },
  };
  const camHome = {x:12,y:12,z:12,lx:0,ly:1,lz:0};

  // Intro drop-in — includes laptop
  [monL,monR,laptopGroup,shG,mugG,chG].forEach((obj,i)=>{
    const oy=obj.position.y; obj.position.y=oy+6;
    setTimeout(()=>gsap.to(obj.position,{y:oy,duration:1.1,ease:'back.out(1.4)',delay:i*0.12}),1300);
  });

  // Raycaster
  const ray=new THREE.Raycaster(); const mouse=new THREE.Vector2(-9,-9);
  let hovered=null, outlines=[];
  const outMat=new THREE.MeshBasicMaterial({color:0xaa55ff,side:THREE.BackSide});

  renderer.domElement.addEventListener('mousemove',e=>{
    mouse.x=(e.clientX/innerWidth)*2-1;
    mouse.y=-(e.clientY/innerHeight)*2+1;
  });

  renderer.domElement.addEventListener('click',()=>{
    if(isAnimating||currentPanel) return;
    ray.setFromCamera(mouse,camera);
    // Keyboard keys
    const kh=ray.intersectObjects(keyMs,false);
    if(kh.length){
      const k=kh[0].object;
      k.material.color.set(0xffffff); k.material.emissive.set(0xffffff); k.material.emissiveIntensity=3;
      gsap.to(k.position,{y:k.position.y-0.025,duration:0.06,yoyo:true,repeat:1});
      setTimeout(()=>k.material.emissiveIntensity=0.4,200);
      return;
    }
    const hits=ray.intersectObjects(clickables,true);
    if(!hits.length) return;
    const root=getRootObj(hits[0].object,clickables);
    if(!root) return;
    if(root.name==='githubPanel'){window.open('https://github.com/hallamohamad1-design','_blank');return;}
    if(root.name==='linkedinPanel'){window.open('https://www.linkedin.com/in/halla-mohamed-4b2853357','_blank');return;}
    doFly(root.name,camT,panelMap,camera,camHome);
  });

  // Banner
  const bm={'btn-about':'monitorLeft','btn-projects':'monitorRight','btn-skills':'laptop','btn-experience':'shelf','btn-contact':'mug'};
  Object.entries(bm).forEach(([id,obj])=>{
    document.getElementById(id)?.addEventListener('click',()=>{
      if(isAnimating) return;
      if(currentPanel){doClose(camera,camHome);setTimeout(()=>doFly(obj,camT,panelMap,camera,camHome),850);}
      else doFly(obj,camT,panelMap,camera,camHome);
    });
  });
  document.getElementById('backBtn')?.addEventListener('click',()=>{if(!isAnimating)doClose(camera,camHome);});

  const kh2=document.getElementById('keyHint');
  document.getElementById('keyToggleBtn')?.addEventListener('click',()=>kh2?.classList.toggle('visible'));
  document.getElementById('keyHintClose')?.addEventListener('click',()=>kh2?.classList.remove('visible'));
  document.getElementById('contactForm')?.addEventListener('submit',e=>{
    e.preventDefault();
    const btn=e.target.querySelector('button'),orig=btn.textContent;
    btn.textContent='Sent! ✦';btn.style.background='#10b981';
    setTimeout(()=>{btn.textContent=orig;btn.style.background='';e.target.reset();},3000);
  });

  // ── Controls info overlay ───────────────────────────────────────────────────
  const controlsInfo = document.getElementById('touchHint');
  if (controlsInfo) {
    controlsInfo.querySelector('.touch-hint-inner').innerHTML =
      '<span class="touch-icon">🖱️</span><span>Left drag: rotate &nbsp;|&nbsp; Right drag: pan &nbsp;|&nbsp; Scroll: zoom &nbsp;|&nbsp; Click objects to explore</span>';
    setTimeout(() => { controlsInfo.classList.add('visible'); setTimeout(() => controlsInfo.classList.remove('visible'), 5000); }, 2500);
    renderer.domElement.addEventListener('pointerdown', () => controlsInfo.classList.remove('visible'), { once: true });
  }

  // ── CV Download — smart fallback ────────────────────────────────────────────
  document.getElementById('cvDownloadBtn')?.addEventListener('click', function(e) {
    // Try local file first, fall back gracefully
    fetch('/HALLA-CV.pdf', { method: 'HEAD' }).then(r => {
      if (!r.ok) {
        e.preventDefault();
        // Show instructions if no PDF uploaded yet
        const msg = document.createElement('div');
        msg.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:rgba(13,13,26,0.95);border:1px solid rgba(237,167,45,0.4);border-radius:10px;padding:1rem 1.5rem;color:#e8d5b0;font-size:0.82rem;z-index:9999;text-align:center;backdrop-filter:blur(12px);max-width:340px;';
        msg.innerHTML = '📄 To enable CV download:<br><strong style="color:#eda72d">Drop HALLA-CV.pdf into the public/ folder</strong><br><small style="color:#666;margin-top:0.4rem;display:block">Then run: git add . && git commit -m "Add CV" && git push</small>';
        document.body.appendChild(msg);
        setTimeout(() => msg.remove(), 5000);
      }
    }).catch(() => {});
  });

  setupKB(camT,panelMap,camera,camHome);

  // Touch hint
  const th=document.getElementById('touchHint');
  if(th){setTimeout(()=>{th.classList.add('visible');setTimeout(()=>th.classList.remove('visible'),4000);},2500);renderer.domElement.addEventListener('pointerdown',()=>th.classList.remove('visible'),{once:true});}

  // ── TICK ───────────────────────────────────────────────────────────────────
  const clock=new THREE.Clock(); let nh=0;
  function tick(){
    requestAnimationFrame(tick);
    const t=clock.getElapsedTime();
    orbitCtrl.update();

    nh=(nh+0.0012)%1;
    const c1=new THREE.Color().setHSL(nh,1,0.6);
    const c2=new THREE.Color().setHSL((nh+0.5)%1,1,0.6);
    const sL=scene.getObjectByName('neonStripL'); if(sL){sL.material.color.copy(c1);sL.material.emissive.copy(c1);}
    const sR=scene.getObjectByName('neonStripR'); if(sR){sR.material.color.copy(c2);sR.material.emissive.copy(c2);}
    const dStr=scene.getObjectByName('deskStrip'); if(dStr){dStr.material.color.copy(c1);dStr.material.emissive.copy(c1);}
    const cRing=scene.getObjectByName('ceilRing'); if(cRing){cRing.rotation.z=t*0.12;const rc=new THREE.Color().setHSL((nh+0.25)%1,1,0.6);cRing.material.color.copy(rc);cRing.material.emissive.copy(rc);}
    sc1.color.setHSL((nh+0.75)%1,1,0.6); sc2.color.setHSL((nh+0.75)%1,1,0.6);
    sc1.intensity=7+Math.sin(t*1.2)*2; sc2.intensity=7+Math.sin(t*1.0+1)*2;
    sg.intensity=4.5+Math.sin(t*0.9)*1; dg.intensity=5+Math.sin(t*1.5)*1.5;
    ng.color.copy(c1); ng.intensity=4+Math.sin(t*0.8)*1;
    rg.color.copy(c2); rg.intensity=3.5+Math.sin(t*1.1)*1;
    ghl.intensity=3.5+Math.sin(t*1.2)*1.5; lil.intensity=3.5+Math.sin(t*1.0+0.8)*1.5;
    tvl.color.copy(c1); tvl.intensity=2.5+Math.sin(t*0.9)*0.8;
    ['screenL','screenR','screenSide'].forEach((n,i)=>{const s=scene.getObjectByName(n);if(s)s.material.emissiveIntensity=0.7+Math.sin(t*0.7+i*1.3)*0.25;});
    const tvS2=scene.getObjectByName('tvScreen'); if(tvS2)tvS2.material.emissiveIntensity=0.5+Math.sin(t*0.4)*0.2;
    const tvStr=scene.getObjectByName('tvStrip'); if(tvStr){tvStr.material.color.copy(c1);tvStr.material.emissive.copy(c1);}
    for(let i=0;i<5;i++){const b=scene.getObjectByName(`tvBar${i}`);if(b)b.material.emissiveIntensity=0.5+Math.sin(t*1.2+i*0.8)*0.4;}
    const ghB=scene.getObjectByName('ghBeam'); if(ghB){ghB.position.y=-1.2+((t*0.8)%2.4);ghB.material.opacity=0.5+Math.sin(t*3)*0.3;}
    const liB=scene.getObjectByName('liBeam'); if(liB){liB.position.y=1.2-((t*0.7)%2.4);liB.material.opacity=0.5+Math.sin(t*2.5+1)*0.3;}
    scene.traverse(o=>{
      if(o.name==='ghGem'){o.rotation.x+=0.025;o.rotation.y+=0.035;}
      if(o.name==='liGem'){o.rotation.x-=0.02;o.rotation.y+=0.03;}
      if(o.name&&o.name.startsWith('key_')&&o.userData.isKey){const wi=o.userData.wi||0;const wh=(nh+wi*0.04)%1;const wc=new THREE.Color().setHSL(wh,1,0.55);o.material.color.copy(wc);o.material.emissive.copy(wc);o.material.emissiveIntensity=0.3+Math.sin(t*2+wi*0.3)*0.2;}
    });
    const ghP=scene.getObjectByName('githubPanel'); if(ghP)ghP.position.y=6+Math.sin(t*0.6)*0.12;
    const liP=scene.getObjectByName('linkedinPanel'); if(liP)liP.position.y=6+Math.sin(t*0.6+1)*0.12;
    const ct=scene.getObjectByName('chairTop'); if(ct)ct.rotation.y=t*0.2;
    const pt=scene.getObjectByName('plantTop'); if(pt)pt.rotation.z=Math.sin(t*0.35)*0.06;
    for(let i=0;i<3;i++){const w=scene.getObjectByName(i===0?'steam':`steam${i}`);if(w){w.position.y=0.55+i*0.18+Math.sin(t*2.0+i*1.2)*0.09;w.material.opacity=0.12+Math.sin(t*1.7+i)*0.07;}}
    // Extra steam wisps
    for(let i=0;i<2;i++){const w=scene.getObjectByName(`steamX${i}`);if(w){w.position.y=3.0+i*0.2+Math.sin(t*1.8+i*1.5)*0.08;w.material.opacity=0.08+Math.sin(t*2.1+i)*0.06;}}
    // Dust particles drift
    const dp=scene.getObjectByName('dustPts');
    if(dp){dp.rotation.y=t*0.02;const pp=dp.geometry.attributes.position;for(let i=0;i<pp.count;i++){pp.setY(i,pp.getY(i)+Math.sin(t*0.3+i*0.5)*0.0008);}pp.needsUpdate=true;}
    // Desk lamp pulse
    if(typeof lampLight!=='undefined')lampLight.intensity=3.5+Math.sin(t*2.2)*1.0;
    // Laptop screen breathe
    const ls=scene.getObjectByName('screenLaptop'); if(ls)ls.material.emissiveIntensity=0.65+Math.sin(t*0.9)*0.2;
    // City light pulse through window
    if(typeof cityLight!=='undefined')cityLight.intensity=2.5+Math.sin(t*0.7)*0.8;
    // Hover outline
    if(!currentPanel&&!isAnimating){
      ray.setFromCamera(mouse,camera);
      const h=ray.intersectObjects(clickables,true);
      const newH=h.length?getRootObj(h[0].object,clickables):null;
      if(newH!==hovered){
        outlines.forEach(m=>scene.remove(m));outlines=[];
        if(newH){renderer.domElement.style.cursor='pointer';newH.traverse(child=>{if(child.isMesh){const ol=new THREE.Mesh(child.geometry,outMat.clone());ol.scale.setScalar(1.06);child.getWorldPosition(ol.position);child.getWorldQuaternion(ol.quaternion);scene.add(ol);outlines.push(ol);}});}
        else renderer.domElement.style.cursor='auto';
        hovered=newH;
      }
    }
    renderer.render(scene,camera);
    cssRenderer.render(cssScene, camera);
  }
  tick();
} // end startScene

// ── NAV HELPERS ───────────────────────────────────────────────────────────────
function setupKB(camT, panelMap, camera, camHome) {
  const codes = {about:'monitorLeft',projects:'monitorRight',skills:'laptop',experience:'shelf',contact:'mug'};
  const nums  = {'1':'about','2':'projects','3':'skills','4':'experience','5':'contact'};
  const kb = document.getElementById('keyBuffer');
  const kh = document.getElementById('keyHint');
  let buf='', shown=false;
  window.addEventListener('keydown', e => {
    if (e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA') return;
    if (e.key==='Escape') { if(currentPanel) doClose(camera,camHome); buf=''; if(kb) kb.textContent=''; return; }
    if (!shown) { shown=true; if(kh) kh.classList.add('visible'); }
    if (nums[e.key]) { doFly(codes[nums[e.key]],camT,panelMap,camera,camHome); buf=''; if(kb) kb.textContent=''; flashK(e.key); return; }
    if (e.key==='Backspace') { buf=buf.slice(0,-1); if(kb) kb.textContent=buf.toUpperCase(); return; }
    if (e.key.length===1&&/[a-zA-Z]/.test(e.key)) {
      buf=(buf+e.key.toLowerCase()).slice(-12);
      if (kb) kb.textContent=buf.toUpperCase();
      for (const [w,o] of Object.entries(codes)) {
        if (buf.endsWith(w)) { doFly(o,camT,panelMap,camera,camHome); buf=''; if(kb) kb.textContent=''; break; }
      }
    }
  });
}

function flashK(key) {
  const el = document.querySelector(`[data-key="${key}"]`);
  if (el) { el.classList.add('pressed'); setTimeout(()=>el.classList.remove('pressed'),300); }
}

function getRootObj(obj, list) {
  let cur=obj; while(cur){if(list.includes(cur)) return cur; cur=cur.parent;} return null;
}

function doFly(name, camT, panelMap, camera, camHome) {
  const t=camT[name]; if(!t) return;
  isAnimating=true;
  if(orbitCtrl) orbitCtrl.enabled=false;
  const lk={x:camera.position.x,y:camera.position.y,z:camera.position.z};
  gsap.to(camera.position,{x:t.x,y:t.y,z:t.z,duration:1.4,ease:'power3.inOut'});
  gsap.to(lk,{x:t.lx,y:t.ly,z:t.lz,duration:1.4,ease:'power3.inOut',
    onUpdate:()=>camera.lookAt(lk.x,lk.y,lk.z),
    onComplete:()=>{isAnimating=false; openP(panelMap[name]);}
  });
  document.getElementById('backBtn')?.classList.add('visible');
}

function openP(id) {
  if (!id) return;
  currentPanel=id;
  document.getElementById(id)?.classList.add('visible');
  document.querySelectorAll('.banner-link').forEach(b=>b.classList.remove('active'));
  const m={'panel-about':'btn-about','panel-projects':'btn-projects','panel-skills':'btn-skills','panel-experience':'btn-experience','panel-contact':'btn-contact'};
  if(m[id]) document.getElementById(m[id])?.classList.add('active');
}

function doClose(camera, camHome) {
  if (!currentPanel) return;
  document.getElementById(currentPanel)?.classList.remove('visible');
  document.querySelectorAll('.banner-link').forEach(b=>b.classList.remove('active'));
  currentPanel=null; isAnimating=true;
  document.getElementById('backBtn')?.classList.remove('visible');
  const lk={x:camera.position.x,y:camera.position.y,z:camera.position.z};
  gsap.to(camera.position,{x:camHome.x,y:camHome.y,z:camHome.z,duration:1.2,ease:'power2.inOut'});
  gsap.to(lk,{x:camHome.lx,y:camHome.ly,z:camHome.lz,duration:1.2,ease:'power2.inOut',
    onUpdate:()=>camera.lookAt(lk.x,lk.y,lk.z),
    onComplete:()=>{
      isAnimating=false;
      if(orbitCtrl){orbitCtrl.target.set(0,1,0);orbitCtrl.enabled=true;orbitCtrl.update();}
    }
  });
}
