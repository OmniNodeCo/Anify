import { PresetAnimation } from '../types/animation';

export const ninjaParkourPreset: PresetAnimation = {
  id: 'ninja-acrobatics-combat-3d',
  title: 'Cyber Ninja Acrobatic Flip 3D',
  prompt: 'A sleek cyber ninja executing high-speed acrobatic backflips, spin kicks, dual glowing energy katana trails, and fluttering cloth scarf physics in 3D',
  description: 'Full 3D skeletal acrobatics animation with 14-joint kinematic motion, ribbon blade trails, and dynamic camera choreography.',
  category: 'Character & Rigging',
  engine: 'canvas2d',
  badge: 'Skeletal 3D',
  duration: 8,
  parameters: {
    flipSpeed: {
      id: 'flipSpeed',
      label: 'Acrobatic Flip Speed',
      type: 'number',
      value: 1.3,
      min: 0.5,
      max: 3.0,
      step: 0.1,
      category: 'physics'
    },
    katanaGlow: {
      id: 'katanaGlow',
      label: 'Blade Trail Glow',
      type: 'color',
      value: '#00f2fe',
      category: 'colors'
    },
    ninjaArmor: {
      id: 'ninjaArmor',
      label: 'Ninja Armor Hue',
      type: 'color',
      value: '#ec4899',
      category: 'colors'
    },
    trailLength: {
      id: 'trailLength',
      label: 'Blade Ribbon Trail',
      type: 'number',
      value: 24,
      min: 8,
      max: 48,
      step: 2,
      category: 'visual'
    }
  },
  postProcessing: {
    bloom: true,
    bloomIntensity: 1.8,
    bloomRadius: 20,
    chromaticAberration: true
  },
  tags: ['Character', 'Ninja', 'Acrobatics', 'Combat', 'Rigging', 'Skeletal'],
  code: `// Cyber Ninja Acrobatic Flip & Combat Katana 3D
const bladeTrails = [];
const scarfPoints = [];
for (let i = 0; i < 16; i++) {
  scarfPoints.push({ x: 0, y: 0, z: 0 });
}

function render({ ctx, width, height, time, params, mouse, audioData }) {
  ctx.fillStyle = '#060713';
  ctx.fillRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2 + 50;
  const speed = params.flipSpeed || 1.3;
  const bladeCol = params.katanaGlow || '#00f2fe';
  const armorCol = params.ninjaArmor || '#ec4899';
  const maxTrail = params.trailLength || 24;
  const audioPulse = audioData ? audioData.bass * 15 : 0;

  // Ground Grid Perspective
  ctx.strokeStyle = 'rgba(0, 242, 254, 0.12)';
  ctx.lineWidth = 1;
  const groundY = cy + 140;
  for (let z = 1; z <= 8; z++) {
    const gy = groundY + z * 18;
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(width, gy);
    ctx.stroke();
  }
  for (let gx = -600; gx <= 600; gx += 80) {
    ctx.beginPath();
    ctx.moveTo(cx + gx * 0.2, groundY);
    ctx.lineTo(cx + gx * 1.8, height);
    ctx.stroke();
  }

  // Acrobatic Flip Phase (360 deg rotational backflip cycle)
  const cycleTime = (time * speed) % 3.0; // 3-second routine
  let bodyY = 0;
  let bodyRot = 0;
  let posePhase = 0;

  if (cycleTime < 0.6) {
    // 1. Crouch & Anticipation jump
    const t = cycleTime / 0.6;
    bodyY = Math.sin(t * Math.PI) * -30;
    bodyRot = t * 0.2;
    posePhase = 0;
  } else if (cycleTime < 1.8) {
    // 2. Mid-air backflip & dual katana spin
    const t = (cycleTime - 0.6) / 1.2;
    bodyY = -120 * Math.sin(t * Math.PI) - 40;
    bodyRot = t * Math.PI * 2;
    posePhase = 1;
  } else {
    // 3. Heroic landing & strike pose
    const t = (cycleTime - 1.8) / 1.2;
    bodyY = (1 - t) * -20;
    bodyRot = Math.sin(t * Math.PI * 0.5) * 0.1;
    posePhase = 2;
  }

  // Camera 3D Orbit
  const camAngle = mouse.x * 1.5;
  const cosCam = Math.cos(camAngle), sinCam = Math.sin(camAngle);

  function project(x, y, z) {
    // Rotate world around Y
    let x1 = x * cosCam - z * sinCam;
    let z1 = z * cosCam + x * sinCam;
    const fov = 450;
    const scale = fov / (fov + z1 + 180);
    return {
      x: cx + x1 * scale,
      y: (cy + bodyY) + y * scale,
      z: z1,
      scale
    };
  }

  // Compute 3D Humanoid Skeleton Joints
  const cosB = Math.cos(bodyRot), sinB = Math.sin(bodyRot);
  function rotateBody(x, y, z) {
    return {
      x,
      y: y * cosB - z * sinB,
      z: z * cosB + y * sinB
    };
  }

  // 14 Skeletal Joints
  const jPelvis = rotateBody(0, 0, 0);
  const jChest = rotateBody(0, -42, 0);
  const jHead = rotateBody(0, -68, 0);

  // Left & Right Arms with dual Katanas
  const armSwing = Math.sin(bodyRot * 2);
  const jShoulderL = rotateBody(18, -42, 0);
  const jElbowL = rotateBody(32, -25 + armSwing * 20, 10);
  const jHandL = rotateBody(44, -10 + armSwing * 35, 20);
  const jBladeTipL = rotateBody(75, 20 + armSwing * 60, 35);

  const jShoulderR = rotateBody(-18, -42, 0);
  const jElbowR = rotateBody(-32, -25 - armSwing * 20, -10);
  const jHandR = rotateBody(-44, -10 - armSwing * 35, -20);
  const jBladeTipR = rotateBody(-75, 20 - armSwing * 60, -35);

  // Left & Right Legs (Kicking kinematics)
  const legSwing = Math.cos(bodyRot * 2);
  const jHipL = rotateBody(12, 10, 0);
  const jKneeL = rotateBody(16, 45 + legSwing * 25, legSwing * 20);
  const jFootL = rotateBody(18, 85 + legSwing * 35, legSwing * 35);

  const jHipR = rotateBody(-12, 10, 0);
  const jKneeR = rotateBody(-16, 45 - legSwing * 25, -legSwing * 20);
  const jFootR = rotateBody(-18, 85 - legSwing * 35, -legSwing * 35);

  // Store blade tip for glowing ribbon trail
  const projBladeL = project(jBladeTipL.x, jBladeTipL.y, jBladeTipL.z);
  const projBladeR = project(jBladeTipR.x, jBladeTipR.y, jBladeTipR.z);
  bladeTrails.push({ l: projBladeL, r: projBladeR, alpha: 1.0 });
  if (bladeTrails.length > maxTrail) bladeTrails.shift();

  // 1. Render Blade Ribbon Trails
  for (let i = 1; i < bladeTrails.length; i++) {
    const t1 = bladeTrails[i - 1];
    const t2 = bladeTrails[i];
    const pct = i / bladeTrails.length;

    ctx.strokeStyle = bladeCol;
    ctx.lineWidth = 4 * pct;
    ctx.globalAlpha = Math.pow(pct, 2) * 0.8;
    ctx.beginPath();
    ctx.moveTo(t1.l.x, t1.l.y);
    ctx.lineTo(t2.l.x, t2.l.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(t1.r.x, t1.r.y);
    ctx.lineTo(t2.r.x, t2.r.y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1.0;

  // Project all joints
  const pPelvis = project(jPelvis.x, jPelvis.y, jPelvis.z);
  const pChest = project(jChest.x, jChest.y, jChest.z);
  const pHead = project(jHead.x, jHead.y, jHead.z);

  const pShL = project(jShoulderL.x, jShoulderL.y, jShoulderL.z);
  const pElL = project(jElbowL.x, jElbowL.y, jElbowL.z);
  const pHdL = project(jHandL.x, jHandL.y, jHandL.z);
  const pTipL = projBladeL;

  const pShR = project(jShoulderR.x, jShoulderR.y, jShoulderR.z);
  const pElR = project(jElbowR.x, jElbowR.y, jElbowR.z);
  const pHdR = project(jHandR.x, jHandR.y, jHandR.z);
  const pTipR = projBladeR;

  const pHipL = project(jHipL.x, jHipL.y, jHipL.z);
  const pKnL = project(jKneeL.x, jKneeL.y, jKneeL.z);
  const pFtL = project(jFootL.x, jFootL.y, jFootL.z);

  const pHipR = project(jHipR.x, jHipR.y, jHipR.z);
  const pKnR = project(jKneeR.x, jKneeR.y, jKneeR.z);
  const pFtR = project(jFootR.x, jFootR.y, jFootR.z);

  // Helper to draw bone limb
  function drawBone(p1, p2, width, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width * p1.scale;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }

  // 2. Draw Bones
  // Legs
  drawBone(pHipL, pKnL, 7, '#1e293b');
  drawBone(pKnL, pFtL, 5, armorCol);

  drawBone(pHipR, pKnR, 7, '#1e293b');
  drawBone(pKnR, pFtR, 5, armorCol);

  // Spine & Torso
  drawBone(pPelvis, pChest, 12, '#0f172a');
  drawBone(pChest, pHead, 10, armorCol);

  // Head & Glowing Visor
  ctx.fillStyle = armorCol;
  ctx.beginPath();
  ctx.arc(pHead.x, pHead.y, 11 * pHead.scale, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = bladeCol;
  ctx.shadowColor = bladeCol;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(pHead.x + 3 * pHead.scale, pHead.y - 2 * pHead.scale, 3.5 * pHead.scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Arms
  drawBone(pChest, pShL, 6, '#1e293b');
  drawBone(pShL, pElL, 5, armorCol);
  drawBone(pElL, pHdL, 4, '#ffffff');

  drawBone(pChest, pShR, 6, '#1e293b');
  drawBone(pShR, pElR, 5, armorCol);
  drawBone(pElR, pHdR, 4, '#ffffff');

  // Glowing Cyber Katanas
  drawBone(pHdL, pTipL, 4.5, bladeCol);
  drawBone(pHdR, pTipR, 4.5, bladeCol);
}
`
};
