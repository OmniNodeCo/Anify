import { PresetAnimation } from '../types/animation';

export const cyberMechPreset: PresetAnimation = {
  id: 'cybernetic-mech-walker-3d',
  title: 'Cybernetic Mech Walker 3D (Rigged)',
  prompt: 'A 3D heavy armored cybernetic bipedal mech walker marching with skeletal inverse kinematics, dual shoulder plasma cannons, energy core reactor, and dynamic ground shadows',
  description: 'Three.js 3D character animation with skeletal bone hierarchy, forward walking stride kinematics, heavy hydraulic footfalls, and energy weapon flares.',
  category: 'Character & Rigging',
  engine: 'webgl-three',
  badge: '3D Character',
  duration: 8,
  parameters: {
    strideSpeed: {
      id: 'strideSpeed',
      label: 'Walk Stride Speed',
      type: 'number',
      value: 1.4,
      min: 0.4,
      max: 3.5,
      step: 0.1,
      category: 'physics'
    },
    stepHeight: {
      id: 'stepHeight',
      label: 'Step Lift Height',
      type: 'number',
      value: 1.2,
      min: 0.5,
      max: 2.5,
      step: 0.1,
      category: 'physics'
    },
    mechArmorColor: {
      id: 'mechArmorColor',
      label: 'Armor Plating',
      type: 'color',
      value: '#0284c7',
      category: 'colors'
    },
    coreVisorGlow: {
      id: 'coreVisorGlow',
      label: 'Reactor Visor Glow',
      type: 'color',
      value: '#00f2fe',
      category: 'colors'
    },
    cannonColor: {
      id: 'cannonColor',
      label: 'Plasma Cannon Glow',
      type: 'color',
      value: '#ff007f',
      category: 'colors'
    }
  },
  postProcessing: {
    bloom: true,
    bloomIntensity: 1.8,
    bloomRadius: 20,
    chromaticAberration: true,
    vignette: true
  },
  tags: ['Character', 'Mech', 'Robot', 'Rigging', '3D', 'Three.js', 'Walk Cycle'],
  code: `// Cybernetic Mech Walker 3D (Rigged Skeletal Hierarchy)
let scene, camera, renderer;
let mechRoot, pelvis, torso, head, leftLeg, rightLeg, leftArm, rightArm;
let leftThigh, leftShin, leftFoot, rightThigh, rightShin, rightFoot;
let sparks = [];
let initialized = false;

function init(canvas) {
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x070914, 0.015);

  camera = new THREE.PerspectiveCamera(55, canvas.width / canvas.height, 0.1, 500);
  camera.position.set(12, 8, 16);

  // Lighting
  const ambLight = new THREE.AmbientLight(0x1a243b, 1.2);
  scene.add(ambLight);

  const dirLight = new THREE.DirectionalLight(0x00f2fe, 2.0);
  dirLight.position.set(15, 25, 20);
  scene.add(dirLight);

  const rimLight = new THREE.DirectionalLight(0xff007f, 1.4);
  rimLight.position.set(-15, 10, -15);
  scene.add(rimLight);

  // Ground Grid
  const grid = new THREE.GridHelper(80, 40, 0x00f2fe, 0x111e38);
  grid.position.y = 0;
  scene.add(grid);

  // Mech Hierarchy Root
  mechRoot = new THREE.Group();
  scene.add(mechRoot);

  const chassisMat = new THREE.MeshStandardMaterial({
    color: 0x182030,
    metalness: 0.85,
    roughness: 0.3
  });

  const armorMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    metalness: 0.7,
    roughness: 0.35
  });

  const glowMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe });
  const cannonMat = new THREE.MeshBasicMaterial({ color: 0xff007f });

  // 1. Pelvis
  pelvis = new THREE.Group();
  pelvis.position.y = 4.2;
  mechRoot.add(pelvis);

  const pelvisMesh = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.0, 1.8), chassisMat);
  pelvis.add(pelvisMesh);

  // 2. Torso & Cockpit
  torso = new THREE.Group();
  torso.position.y = 1.0;
  pelvis.add(torso);

  const chestMesh = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.4, 2.8), armorMat);
  torso.add(chestMesh);

  // Glowing Reactor Visor
  const visorMesh = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.5, 0.4), glowMat);
  visorMesh.position.set(0, 0.3, 1.45);
  torso.add(visorMesh);

  // Dual Shoulder Cannons
  for (let s of [-1.9, 1.9]) {
    const cannon = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 3.2, 8), chassisMat);
    cannon.rotation.x = Math.PI / 2;
    cannon.position.set(s, 1.2, 0.2);
    torso.add(cannon);

    const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.3, 8), cannonMat);
    tip.rotation.x = Math.PI / 2;
    tip.position.set(s, 1.2, 1.8);
    torso.add(tip);
  }

  // 3. Legs Helper
  function createLeg(xSide) {
    const legGroup = new THREE.Group();
    legGroup.position.set(xSide * 1.5, -0.4, 0);

    // Thigh
    const thigh = new THREE.Group();
    legGroup.add(thigh);
    const thighMesh = new THREE.Mesh(new THREE.BoxGeometry(0.9, 2.2, 1.1), chassisMat);
    thighMesh.position.y = -1.1;
    thigh.add(thighMesh);

    // Shin / Knee
    const shin = new THREE.Group();
    shin.position.y = -2.2;
    thigh.add(shin);
    const shinMesh = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2.2, 1.0), armorMat);
    shinMesh.position.y = -1.1;
    shin.add(shinMesh);

    // Foot Pad
    const foot = new THREE.Group();
    foot.position.y = -2.2;
    shin.add(foot);
    const footMesh = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.4, 2.2), chassisMat);
    footMesh.position.set(0, -0.2, 0.3);
    foot.add(footMesh);

    return { root: legGroup, thigh, shin, foot };
  }

  leftLeg = createLeg(1);
  pelvis.add(leftLeg.root);

  rightLeg = createLeg(-1);
  pelvis.add(rightLeg.root);

  initialized = true;
}

function render({ canvas, time, deltaTime, params, mouse, audioData }) {
  if (!window.THREE) return;
  if (!initialized) init(canvas);

  const speed = params.strideSpeed || 1.4;
  const lift = params.stepHeight || 1.2;
  const audioPulse = audioData ? audioData.bass * 0.3 : 0;

  // Stride animation cycle
  const stridePhase = time * speed * 3.5;
  const legLAngle = Math.sin(stridePhase) * 0.65;
  const legRAngle = -Math.sin(stridePhase) * 0.65;

  // Pelvis vertical hydraulic bounce
  pelvis.position.y = 4.3 + Math.abs(Math.sin(stridePhase)) * 0.25 - audioPulse;

  // Torso subtle roll and pitch
  torso.rotation.y = Math.sin(stridePhase) * 0.12;
  torso.rotation.z = Math.cos(stridePhase) * 0.05;
  torso.rotation.x = 0.08 + Math.abs(Math.sin(stridePhase)) * 0.04;

  // Leg joint rotations (Forward & Backward IK swing)
  leftLeg.thigh.rotation.x = legLAngle;
  leftLeg.shin.rotation.x = Math.max(0, -legLAngle * 1.1 * lift);
  leftLeg.foot.rotation.x = -leftLeg.thigh.rotation.x - leftLeg.shin.rotation.x * 0.5;

  rightLeg.thigh.rotation.x = legRAngle;
  rightLeg.shin.rotation.x = Math.max(0, -legRAngle * 1.1 * lift);
  rightLeg.foot.rotation.x = -rightLeg.thigh.rotation.x - rightLeg.shin.rotation.x * 0.5;

  // Camera Orbit
  const camDist = 18;
  const camAngle = time * 0.2 + mouse.x * 2.0;
  camera.position.x = Math.sin(camAngle) * camDist;
  camera.position.z = Math.cos(camAngle) * camDist;
  camera.position.y = 7 + -mouse.y * 6;
  camera.lookAt(0, 3.5, 0);

  // Renderer
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
