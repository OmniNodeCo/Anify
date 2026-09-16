import { PresetAnimation } from '../types/animation';

export const puppetRunnerPreset: PresetAnimation = {
  id: 'vector-puppet-character-runner',
  title: 'Kinetic Vector Puppet & Character Rig',
  prompt: 'A stylized 2D/2.5D kinetic character puppet running across a dynamic parallax cityscape with skeletal bone hierarchy, facial expressions, and spring hair physics',
  description: 'Procedural 2D skeletal character puppet rig featuring running cycle kinematics, secondary overlapping hair motion, and parallax city runner environment.',
  category: 'Character & Rigging',
  engine: 'canvas2d',
  badge: '2D Rig Puppet',
  duration: 8,
  parameters: {
    runPace: {
      id: 'runPace',
      label: 'Run Cadence',
      type: 'number',
      value: 1.5,
      min: 0.5,
      max: 3.0,
      step: 0.1,
      category: 'physics'
    },
    characterScale: {
      id: 'characterScale',
      label: 'Character Scale',
      type: 'number',
      value: 1.3,
      min: 0.8,
      max: 2.2,
      step: 0.1,
      category: 'visual'
    },
    outfitColor: {
      id: 'outfitColor',
      label: 'Suit Color',
      type: 'color',
      value: '#f59e0b',
      category: 'colors'
    },
    sneakerGlow: {
      id: 'sneakerGlow',
      label: 'Sneaker Light Pulse',
      type: 'color',
      value: '#00f2fe',
      category: 'colors'
    }
  },
  postProcessing: {
    bloom: true,
    bloomIntensity: 1.4,
    bloomRadius: 16,
    vignette: true
  },
  tags: ['Character', 'Puppet', 'Rigging', 'Run Cycle', '2D Animation', 'Vector'],
  code: `// Kinetic Vector Puppet & Character Rig Running Cycle
const dustParticles = [];

function render({ ctx, width, height, time, params, mouse, audioData }) {
  // Midnight cyber runner sky
  ctx.fillStyle = '#080a14';
  ctx.fillRect(0, 0, width, height);

  const cx = width * 0.42;
  const groundY = height * 0.76;
  const pace = params.runPace || 1.5;
  const scale = params.characterScale || 1.3;
  const suitCol = params.outfitColor || '#f59e0b';
  const glowCol = params.sneakerGlow || '#00f2fe';
  const audioPulse = audioData ? audioData.bass * 10 : 0;

  // 1. Parallax City Skyline Background
  const speedBg = time * 80 * pace;
  ctx.fillStyle = '#101426';
  for (let bx = -100; bx < width + 100; bx += 70) {
    const bh = 140 + Math.sin(bx * 0.05) * 60;
    const px = ((bx - speedBg * 0.3) % (width + 140));
    ctx.fillRect(px, groundY - bh, 60, bh);
  }

  // Neon highway line
  ctx.strokeStyle = glowCol;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(width, groundY);
  ctx.stroke();

  // 2. Running Kinematics (Skeletal Joints)
  const runPhase = time * pace * 9.0;
  const hipBob = Math.sin(runPhase * 2) * 12 * scale;
  const hipY = groundY - 110 * scale + hipBob - audioPulse;

  // Left & Right Leg Angles (Sinusoidal stride)
  const thighLAngle = Math.sin(runPhase) * 0.85;
  const kneeLAngle = Math.max(0, -Math.sin(runPhase + 0.4) * 1.3);

  const thighRAngle = -Math.sin(runPhase) * 0.85;
  const kneeRAngle = Math.max(0, Math.sin(runPhase - 0.4) * 1.3);

  // Arm counter-swing
  const armLAngle = -thighLAngle * 0.9;
  const armRAngle = -thighRAngle * 0.9;

  // Draw Back Leg First (Depth layer)
  drawLeg(ctx, cx, hipY, thighRAngle, kneeRAngle, scale, '#94a3b8', glowCol);

  // 3. Torso & Spine
  const torsoTilt = 0.22; // forward lean
  const chestX = cx + Math.sin(torsoTilt) * 45 * scale;
  const chestY = hipY - Math.cos(torsoTilt) * 45 * scale;

  ctx.strokeStyle = suitCol;
  ctx.lineWidth = 18 * scale;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx, hipY);
  ctx.lineTo(chestX, chestY);
  ctx.stroke();

  // Draw Back Arm
  drawArm(ctx, chestX, chestY, armRAngle, scale, '#64748b');

  // 4. Head & Face
  const headX = chestX + 6 * scale;
  const headY = chestY - 26 * scale;
  const headR = 17 * scale;

  // Head base
  ctx.fillStyle = '#fed7aa';
  ctx.beginPath();
  ctx.arc(headX, headY, headR, 0, Math.PI * 2);
  ctx.fill();

  // Sunglasses / Visor
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(headX + 4 * scale, headY - 4 * scale, 12 * scale, 8 * scale);
  ctx.fillStyle = glowCol;
  ctx.fillRect(headX + 6 * scale, headY - 2 * scale, 8 * scale, 3 * scale);

  // Dynamic Hair Bounce (Overlapping spring physics)
  const hairBounce = Math.sin(runPhase * 2 - 0.8) * 6 * scale;
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(headX - 6 * scale, headY - 6 * scale + hairBounce, headR * 0.95, 0, Math.PI * 2);
  ctx.fill();

  // 5. Draw Front Arm & Front Leg
  drawLeg(ctx, cx, hipY, thighLAngle, kneeLAngle, scale, suitCol, glowCol);
  drawArm(ctx, chestX, chestY, armLAngle, scale, suitCol);

  // 6. Running Footfall Dust Sparks
  if (Math.abs(Math.sin(runPhase)) > 0.92) {
    dustParticles.push({
      x: cx - 25 * scale,
      y: groundY - 2,
      vx: -2 - Math.random() * 3,
      vy: -1 - Math.random() * 2,
      size: 3 + Math.random() * 4,
      alpha: 1.0
    });
  }

  for (let i = dustParticles.length - 1; i >= 0; i--) {
    const d = dustParticles[i];
    d.x += d.vx;
    d.y += d.vy;
    d.alpha *= 0.92;

    ctx.fillStyle = glowCol;
    ctx.globalAlpha = d.alpha;
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
    ctx.fill();
    if (d.alpha < 0.05) dustParticles.splice(i, 1);
  }
  ctx.globalAlpha = 1.0;
}

function drawLeg(ctx, hx, hy, tAngle, kAngle, scale, col, glowCol) {
  const thighLen = 38 * scale;
  const shinLen = 36 * scale;

  const kx = hx + Math.sin(tAngle) * thighLen;
  const ky = hy + Math.cos(tAngle) * thighLen;

  const fx = kx + Math.sin(tAngle + kAngle) * shinLen;
  const fy = ky + Math.cos(tAngle + kAngle) * shinLen;

  // Thigh
  ctx.strokeStyle = col;
  ctx.lineWidth = 11 * scale;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(hx, hy);
  ctx.lineTo(kx, ky);
  ctx.stroke();

  // Shin
  ctx.lineWidth = 8 * scale;
  ctx.beginPath();
  ctx.moveTo(kx, ky);
  ctx.lineTo(fx, fy);
  ctx.stroke();

  // Glowing Sneaker
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(fx + 6 * scale, fy, 10 * scale, 4 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = glowCol;
  ctx.shadowColor = glowCol;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(fx + 4 * scale, fy, 2.5 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

function drawArm(ctx, cx, cy, angle, scale, col) {
  const armLen = 28 * scale;
  const handLen = 24 * scale;

  const ex = cx + Math.sin(angle) * armLen;
  const ey = cy + Math.cos(angle) * armLen;

  const hx = ex + Math.sin(angle + 0.8) * handLen;
  const hy = ey + Math.cos(angle + 0.8) * handLen;

  ctx.strokeStyle = col;
  ctx.lineWidth = 7 * scale;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(ex, ey);
  ctx.lineTo(hx, hy);
  ctx.stroke();

  // Hand fist
  ctx.fillStyle = '#fed7aa';
  ctx.beginPath();
  ctx.arc(hx, hy, 4 * scale, 0, Math.PI * 2);
  ctx.fill();
}
`
};
