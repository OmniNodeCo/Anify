import { PresetAnimation } from '../types/animation';

export const jellyfishPreset: PresetAnimation = {
  id: 'bioluminescent-jellyfish',
  title: 'Bioluminescent Abyss Jellyfish',
  prompt: 'A translucent bioluminescent jellyfish floating gracefully through the deep dark abyss, pulsing bell canopy, fluid inverse-kinematics tentacles, and drifting plankton particles',
  description: 'Simulates underwater organic locomotion with pulsing bell deformations and multi-jointed trailing inverse-kinematics tentacles.',
  category: 'Organic & Nature',
  engine: 'canvas2d',
  badge: 'Organic IK',
  duration: 9,
  parameters: {
    pulseRate: {
      id: 'pulseRate',
      label: 'Contraction Pulse Rate',
      type: 'number',
      value: 1.2,
      min: 0.4,
      max: 3.0,
      step: 0.1,
      category: 'physics'
    },
    tentacleCount: {
      id: 'tentacleCount',
      label: 'Tentacle Count',
      type: 'number',
      value: 8,
      min: 4,
      max: 16,
      step: 1,
      category: 'visual'
    },
    tentacleLength: {
      id: 'tentacleLength',
      label: 'Tentacle Length',
      type: 'number',
      value: 28,
      min: 15,
      max: 45,
      step: 1,
      category: 'visual'
    },
    glowColor: {
      id: 'glowColor',
      label: 'Bioluminescent Glow',
      type: 'color',
      value: '#00f2fe',
      category: 'colors'
    },
    innerOrganColor: {
      id: 'innerOrganColor',
      label: 'Internal Organ Glow',
      type: 'color',
      value: '#ec4899',
      category: 'colors'
    }
  },
  postProcessing: {
    bloom: true,
    bloomIntensity: 1.8,
    bloomRadius: 22,
    vignette: true
  },
  tags: ['Jellyfish', 'Bioluminescence', 'Ocean', 'Creature', 'Organic'],
  code: `// Bioluminescent Abyss Jellyfish Simulation
const plankton = [];
for (let i = 0; i < 150; i++) {
  plankton.push({
    x: Math.random() * 1200,
    y: Math.random() * 800,
    r: 0.8 + Math.random() * 2,
    twinkle: Math.random() * Math.PI * 2,
    vy: -0.2 - Math.random() * 0.4
  });
}

// Tentacle joint memory for smooth physics
let tentacleJoints = null;

function render({ ctx, width, height, time, params, mouse, audioData }) {
  // Midnight abyss background
  ctx.fillStyle = '#020610';
  ctx.fillRect(0, 0, width, height);

  const cx = width / 2 + mouse.x * 60;
  const pulseRate = params.pulseRate || 1.2;
  const numTentacles = params.tentacleCount || 8;
  const segCount = params.tentacleLength || 28;
  const glow = params.glowColor || '#00f2fe';
  const innerGlow = params.innerOrganColor || '#ec4899';
  const audioPulse = audioData ? audioData.bass * 0.4 : 0;

  // 1. Drifting Plankton Particles
  for (let p of plankton) {
    p.y += p.vy;
    if (p.y < 0) p.y = height;
    const a = 0.2 + 0.5 * Math.sin(time * 2 + p.twinkle);
    ctx.fillStyle = \`rgba(150, 230, 255, \${a})\`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Locomotion vertical bobbing & pulsing
  const pulsePhase = (time * pulseRate * 2.2);
  const contraction = Math.pow(Math.max(0, Math.sin(pulsePhase)), 2.5); // Sharp burst, slow relax
  const cy = height * 0.42 + Math.sin(time * 0.8) * 35 - contraction * 20;

  // Initialize tentacles array if needed
  if (!tentacleJoints || tentacleJoints.length !== numTentacles) {
    tentacleJoints = [];
    for (let t = 0; t < numTentacles; t++) {
      const joints = [];
      for (let s = 0; s < 50; s++) {
        joints.push({ x: cx, y: cy + s * 8 });
      }
      tentacleJoints.push(joints);
    }
  }

  // 2. Jellyfish Bell Geometry
  const bellRadius = 85 * (1 - contraction * 0.22) * (1 + audioPulse);
  const bellHeight = 65 * (1 + contraction * 0.35);

  ctx.save();
  ctx.translate(cx, cy);

  // Bioluminescent Radial Gradient
  const bellGrad = ctx.createRadialGradient(0, -10, 10, 0, 0, bellRadius * 1.3);
  bellGrad.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
  bellGrad.addColorStop(0.2, glow);
  bellGrad.addColorStop(0.7, 'rgba(0, 180, 255, 0.25)');
  bellGrad.addColorStop(1, 'rgba(0, 50, 150, 0)');

  ctx.fillStyle = bellGrad;
  ctx.beginPath();
  ctx.moveTo(-bellRadius, 0);
  ctx.bezierCurveTo(-bellRadius, -bellHeight * 1.6, bellRadius, -bellHeight * 1.6, bellRadius, 0);
  
  // Scalloped undulating rim
  const rimPoints = 16;
  for (let i = rimPoints; i >= 0; i--) {
    const rx = ((i / rimPoints) * 2 - 1) * bellRadius;
    const wave = Math.sin(i * 1.2 + time * 6) * 6;
    ctx.lineTo(rx, wave);
  }
  ctx.closePath();
  ctx.fill();

  // Bell rim highlight
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // 3. Inner Glowing Organs / Gonads (Horseshoe rings)
  ctx.shadowColor = innerGlow;
  ctx.shadowBlur = 18;
  ctx.strokeStyle = innerGlow;
  ctx.lineWidth = 3;
  for (let angle of [-0.6, -0.2, 0.2, 0.6]) {
    ctx.beginPath();
    ctx.arc(angle * bellRadius * 0.5, -bellHeight * 0.45, 12, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
  ctx.restore();

  // 4. Trailing Physics Tentacles (Verlet link trailing)
  for (let t = 0; t < numTentacles; t++) {
    const spread = ((t / (numTentacles - 1)) * 2 - 1) * (bellRadius * 0.75);
    const rootX = cx + spread;
    const rootY = cy + 5;

    const joints = tentacleJoints[t];
    joints[0].x = rootX;
    joints[0].y = rootY;

    // Propagate joints with damping and water drag
    for (let s = 1; s < segCount; s++) {
      const prev = joints[s - 1];
      const cur = joints[s];

      const dx = cur.x - prev.x;
      const dy = cur.y - prev.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const targetDist = 7.5;

      if (dist > 0.01) {
        cur.x = prev.x + (dx / dist) * targetDist;
        cur.y = prev.y + (dy / dist) * targetDist;
      }

      // Lateral water current ripple
      const wave = Math.sin(time * 3 + s * 0.25 + t * 0.7) * 1.4;
      cur.x += wave;
      cur.y += 0.8; // gravity/drag
    }

    // Draw tentacle curve
    ctx.strokeStyle = t % 2 === 0 ? glow : innerGlow;
    ctx.lineWidth = Math.max(0.6, 2.2 - (t / numTentacles) * 1.0);
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.moveTo(joints[0].x, joints[0].y);
    for (let s = 1; s < segCount; s++) {
      ctx.lineTo(joints[s].x, joints[s].y);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}
`
};
