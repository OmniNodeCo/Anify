import { PresetAnimation } from '../types/animation';

export const cyberCityPreset: PresetAnimation = {
  id: 'cyberpunk-city-3d',
  title: 'Cyberpunk Neon Megacity 3D',
  prompt: 'A flythrough across a 3D dystopian cyberpunk megacity at night with towering neon skyscrapers, flying vehicle light trails, rain, and holographic grids',
  description: 'Full Three.js WebGL procedural city generator with dynamic camera velocity, neon materials, and flying aerial traffic.',
  category: '3D & Shaders',
  engine: 'webgl-three',
  badge: 'WebGL 3D',
  duration: 12,
  parameters: {
    flightSpeed: {
      id: 'flightSpeed',
      label: 'Flythrough Speed',
      type: 'number',
      value: 1.5,
      min: 0.2,
      max: 4.0,
      step: 0.1,
      category: 'camera'
    },
    buildingDensity: {
      id: 'buildingDensity',
      label: 'City Size',
      type: 'number',
      value: 120,
      min: 40,
      max: 200,
      step: 10,
      category: 'visual'
    },
    neonColor1: {
      id: 'neonColor1',
      label: 'Primary Neon',
      type: 'color',
      value: '#00f2fe',
      category: 'colors'
    },
    neonColor2: {
      id: 'neonColor2',
      label: 'Secondary Neon',
      type: 'color',
      value: '#ff007f',
      category: 'colors'
    },
    trafficDensity: {
      id: 'trafficDensity',
      label: 'Air Traffic Count',
      type: 'number',
      value: 80,
      min: 10,
      max: 150,
      step: 5,
      category: 'physics'
    }
  },
  postProcessing: {
    bloom: true,
    bloomIntensity: 1.8,
    bloomRadius: 22,
    scanlines: true,
    vignette: true,
    chromaticAberration: true
  },
  tags: ['Cyberpunk', '3D', 'Three.js', 'City', 'Neon', 'Futuristic'],
  code: `// Cyberpunk Neon Megacity 3D Flythrough using Three.js
let scene, camera, renderer, buildingsGroup, trafficGroup, gridHelper;
let traffic = [];
let initialized = false;

function init(canvas) {
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x060814, 0.007);

  camera = new THREE.PerspectiveCamera(65, canvas.width / canvas.height, 0.1, 1000);
  camera.position.set(0, 35, 120);

  buildingsGroup = new THREE.Group();
  scene.add(buildingsGroup);

  trafficGroup = new THREE.Group();
  scene.add(trafficGroup);

  // Ground Grid
  gridHelper = new THREE.GridHelper(600, 60, 0x00f2fe, 0x111b33);
  gridHelper.position.y = -1;
  scene.add(gridHelper);

  // Ambient & directional lights
  const ambLight = new THREE.AmbientLight(0x1a2138, 1.2);
  scene.add(ambLight);

  const dirLight = new THREE.DirectionalLight(0x00f2fe, 1.8);
  dirLight.position.set(50, 100, 50);
  scene.add(dirLight);

  const dirLight2 = new THREE.DirectionalLight(0xff007f, 1.2);
  dirLight2.position.set(-50, 80, -50);
  scene.add(dirLight2);

  // Generate Procedural Skyscrapers
  const boxGeo = new THREE.BoxGeometry(1, 1, 1);
  const cityWidth = 240;
  const cityLength = 500;

  for (let i = 0; i < 140; i++) {
    const w = 8 + Math.random() * 12;
    const d = 8 + Math.random() * 12;
    const h = 25 + Math.random() * 110;

    const x = (Math.random() - 0.5) * cityWidth;
    const z = (Math.random() - 0.5) * cityLength;

    // Leave a central highway avenue empty
    if (Math.abs(x) < 22) continue;

    const isNeonSpire = Math.random() > 0.7;
    const color = isNeonSpire ? (Math.random() > 0.5 ? 0x00f2fe : 0xff007f) : 0x0d1326;

    const mat = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.2,
      metalness: 0.8,
      emissive: isNeonSpire ? color : 0x050a14,
      emissiveIntensity: isNeonSpire ? 0.6 : 0.1,
    });

    const mesh = new THREE.Mesh(boxGeo, mat);
    mesh.scale.set(w, h, d);
    mesh.position.set(x, h / 2, z);
    buildingsGroup.add(mesh);

    // Glowing rooftop beacon
    if (isNeonSpire) {
      const beaconGeo = new THREE.SphereGeometry(1.2, 8, 8);
      const beaconMat = new THREE.MeshBasicMaterial({ color: color });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.set(x, h + 1.2, z);
      buildingsGroup.add(beacon);
    }
  }

  // Generate Flying Speeders (Traffic)
  const speederGeo = new THREE.CylinderGeometry(0.3, 0.3, 8, 6);
  speederGeo.rotateX(Math.PI / 2);

  for (let i = 0; i < 90; i++) {
    const isCyan = Math.random() > 0.5;
    const col = isCyan ? 0x00f2fe : 0xff007f;
    const mat = new THREE.MeshBasicMaterial({ color: col });
    const mesh = new THREE.Mesh(speederGeo, mat);

    const laneX = (Math.random() - 0.5) * 36;
    const laneY = 15 + Math.random() * 45;
    const laneZ = (Math.random() - 0.5) * cityLength;
    const speed = (isCyan ? 1 : -1) * (0.8 + Math.random() * 1.5);

    mesh.position.set(laneX, laneY, laneZ);
    trafficGroup.add(mesh);
    traffic.push({ mesh, speed });
  }

  initialized = true;
}

function render({ canvas, time, deltaTime, params, mouse, audioData }) {
  if (!window.THREE) return;
  if (!initialized) {
    init(canvas);
  }

  // Update camera flight along highway
  const speed = params.flightSpeed || 1.5;
  const audioKick = audioData ? audioData.bass * 8 : 0;

  camera.position.z -= speed * 40 * deltaTime;
  if (camera.position.z < -180) {
    camera.position.z = 180;
  }

  // Mouse sway
  camera.position.x = mouse.x * 25;
  camera.position.y = 32 + -mouse.y * 15 + audioKick;
  camera.lookAt(mouse.x * 15, 25, camera.position.z - 80);

  // Update aerial traffic
  const cityLength = 500;
  for (let t of traffic) {
    t.mesh.position.z += t.speed * 60 * deltaTime;
    if (t.mesh.position.z > cityLength / 2) t.mesh.position.z = -cityLength / 2;
    if (t.mesh.position.z < -cityLength / 2) t.mesh.position.z = cityLength / 2;
  }

  // Render Three scene
  if (!renderer) {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setSize(canvas.width, canvas.height, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  } else {
    renderer.setSize(canvas.width, canvas.height, false);
  }

  renderer.render(scene, camera);
}
`
};
