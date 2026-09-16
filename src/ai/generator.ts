import { AnimationProject, EngineType, AnimationParameter, PostProcessingConfig } from '../types/animation';
import { PRESETS } from '../presets';

export interface GenerationRequest {
  prompt: string;
  style?: string;
  preferredEngine?: 'auto' | 'canvas2d' | 'webgl-three';
  aspectRatio?: '16:9' | '9:16' | '1:1' | '4:3' | '21:9';
  apiKey?: string; // Optional user-provided LLM key
}

export async function generateAnimationFromPrompt(req: GenerationRequest): Promise<AnimationProject> {
  const prompt = req.prompt.trim();
  const lower = prompt.toLowerCase();
  const style = req.style || 'Auto';

  // Simulate AI thinking delay for realism
  await new Promise(res => setTimeout(res, 900));

  // Determine engine
  let engine: EngineType = 'canvas2d';
  if (req.preferredEngine === 'webgl-three') {
    engine = 'webgl-three';
  } else if (req.preferredEngine === 'auto') {
    if (lower.includes('3d') || lower.includes('three.js') || lower.includes('city') || lower.includes('polyhedra') || lower.includes('sphere') || lower.includes('mesh')) {
      engine = 'webgl-three';
    }
  }

  // Check if prompt closely matches any preset directly
  for (const preset of PRESETS) {
    if (lower.includes(preset.title.toLowerCase()) || lower.includes(preset.id.replace(/-/g, ' '))) {
      return createProjectFromPreset(preset, prompt);
    }
  }

  // Generate specialized animation based on prompt semantic analysis
  if (lower.includes('portal') || lower.includes('wormhole') || lower.includes('vortex') || lower.includes('stargate')) {
    return generateCosmicPortal(prompt, style, req.aspectRatio);
  } else if (lower.includes('mech') || lower.includes('robot') || lower.includes('biped') || lower.includes('walker')) {
    const p = PRESETS.find(x => x.id === 'cybernetic-mech-walker-3d')!;
    return createProjectFromPreset(p, prompt);
  } else if (lower.includes('ninja') || lower.includes('parkour') || lower.includes('acrobatic') || lower.includes('sword') || lower.includes('combat')) {
    const p = PRESETS.find(x => x.id === 'ninja-acrobatics-combat-3d')!;
    return createProjectFromPreset(p, prompt);
  } else if (lower.includes('puppet') || lower.includes('runner') || lower.includes('character') || lower.includes('walk cycle') || lower.includes('run cycle') || lower.includes('skeleton')) {
    const p = PRESETS.find(x => x.id === 'vector-puppet-character-runner')!;
    return createProjectFromPreset(p, prompt);
  } else if (lower.includes('fire') || lower.includes('flame') || lower.includes('ember') || lower.includes('magma') || lower.includes('inferno')) {
    return generateVolumetricFire(prompt, style, req.aspectRatio);
  } else if (lower.includes('boid') || lower.includes('flock') || lower.includes('bird') || lower.includes('swarm') || lower.includes('fish')) {
    return generateFlockingBoids(prompt, style, req.aspectRatio);
  } else if (lower.includes('pendulum') || lower.includes('double pendulum') || lower.includes('chaotic motion')) {
    return generateDoublePendulum(prompt, style, req.aspectRatio);
  } else if (lower.includes('dna') || lower.includes('helix') || lower.includes('genetic') || lower.includes('molecule')) {
    return generateDNAHelix(prompt, style, req.aspectRatio);
  } else if (lower.includes('fractal') || lower.includes('julia') || lower.includes('mandelbrot') || lower.includes('kaleidoscope')) {
    return generateFractalMorph(prompt, style, req.aspectRatio);
  } else if (lower.includes('black hole') || lower.includes('singularity') || lower.includes('lensing')) {
    const p = PRESETS.find(x => x.id === 'quantum-black-hole')!;
    return createProjectFromPreset(p, prompt);
  } else if (lower.includes('cloth') || lower.includes('fabric') || lower.includes('flag')) {
    const p = PRESETS.find(x => x.id === 'verlet-cloth-simulation')!;
    return createProjectFromPreset(p, prompt);
  } else if (lower.includes('jellyfish') || lower.includes('abyss') || lower.includes('bioluminescent')) {
    const p = PRESETS.find(x => x.id === 'bioluminescent-jellyfish')!;
    return createProjectFromPreset(p, prompt);
  } else if (lower.includes('hud') || lower.includes('reticle') || lower.includes('tactical') || lower.includes('targeting')) {
    const p = PRESETS.find(x => x.id === 'scifi-tactical-hud')!;
    return createProjectFromPreset(p, prompt);
  } else if (lower.includes('text') || lower.includes('typography') || lower.includes('letter') || lower.includes('words')) {
    const p = PRESETS.find(x => x.id === 'kinetic-typography-motion')!;
    return createProjectFromPreset(p, prompt);
  } else if (lower.includes('audio') || lower.includes('sound') || lower.includes('music') || lower.includes('equalizer') || lower.includes('spectrum')) {
    const p = PRESETS.find(x => x.id === 'holographic-audio-starburst')!;
    return createProjectFromPreset(p, prompt);
  } else if (lower.includes('city') || lower.includes('skyscraper') || lower.includes('cyberpunk 3d')) {
    const p = PRESETS.find(x => x.id === 'cyberpunk-city-3d')!;
    return createProjectFromPreset(p, prompt);
  } else if (lower.includes('neural') || lower.includes('brain') || lower.includes('synapse') || lower.includes('ai')) {
    const p = PRESETS.find(x => x.id === 'neural-synapse-3d')!;
    return createProjectFromPreset(p, prompt);
  }

  // Universal Procedural Neural Generator for any creative prompt!
  return generateUniversalAnimation(prompt, style, req.aspectRatio);
}

function createProjectFromPreset(preset: any, customPrompt?: string): AnimationProject {
  return {
    id: 'proj_' + Math.random().toString(36).substring(2, 9),
    title: preset.title,
    prompt: customPrompt || preset.prompt,
    description: preset.description,
    engine: preset.engine,
    code: preset.code,
    duration: preset.duration || 10,
    fps: 60,
    aspectRatio: '16:9',
    resolution: { width: 1280, height: 720 },
    parameters: JSON.parse(JSON.stringify(preset.parameters || {})),
    keyframeTracks: [
      {
        id: 'track-speed',
        name: 'Master Speed',
        targetProperty: 'speed',
        defaultValue: 1.0,
        min: 0.2,
        max: 3.0,
        keyframes: [
          { id: 'k1', time: 0, value: 1.0, easing: 'easeInOutQuad' },
          { id: 'k2', time: 5, value: 1.5, easing: 'easeInOutQuad' },
          { id: 'k3', time: 10, value: 1.0, easing: 'easeInOutQuad' }
        ]
      }
    ],
    postProcessing: {
      bloom: preset.postProcessing?.bloom ?? true,
      bloomIntensity: preset.postProcessing?.bloomIntensity ?? 1.5,
      bloomRadius: preset.postProcessing?.bloomRadius ?? 16,
      chromaticAberration: preset.postProcessing?.chromaticAberration ?? false,
      aberrationAmount: 3,
      motionBlur: preset.postProcessing?.motionBlur ?? false,
      motionBlurDecay: 0.2,
      vignette: preset.postProcessing?.vignette ?? true,
      vignetteDarkness: 0.7,
      scanlines: preset.postProcessing?.scanlines ?? false,
      grain: preset.postProcessing?.grain ?? false,
      grainIntensity: 0.1
    },
    audio: {
      enabled: false,
      synthPreset: 'synthwave',
      volume: 0.5,
      reactivitySensitivity: 1.5,
      bassImpact: 1.0,
      trebleImpact: 1.0
    },
    tags: preset.tags || ['Animation', 'Procedural'],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}

// Specialized Generator 1: Quantum Cosmic Portal & Lightning Vortex
function generateCosmicPortal(prompt: string, style: string, aspectRatio?: any): AnimationProject {
  const code = `// Quantum Cosmic Portal with Swirling Vortex & Lightning Arcs
const rings = [];
const arcs = [];
const sparks = [];

for (let i = 0; i < 12; i++) {
  rings.push({
    radius: 30 + i * 26,
    speed: (i % 2 === 0 ? 1 : -1) * (0.8 + (12 - i) * 0.15),
    segments: 18 + i * 4,
    colorShift: i * 25
  });
}

for (let i = 0; i < 200; i++) {
  sparks.push({
    angle: Math.random() * Math.PI * 2,
    dist: 40 + Math.random() * 260,
    speed: 1 + Math.random() * 3,
    size: 1 + Math.random() * 2.5
  });
}

function render({ ctx, width, height, time, params, mouse, audioData }) {
  ctx.fillStyle = '#04050d';
  ctx.fillRect(0, 0, width, height);

  const cx = width / 2 + mouse.x * 50;
  const cy = height / 2 - mouse.y * 35;
  const portalSpeed = params.portalSpeed || 1.3;
  const col1 = params.primaryColor || '#00f2fe';
  const col2 = params.coreColor || '#9d4edd';
  const audioPulse = 1 + (audioData ? audioData.bass * 0.4 : 0);

  // 1. Singularity Center Warp
  const warpGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 320 * audioPulse);
  warpGrad.addColorStop(0, '#ffffff');
  warpGrad.addColorStop(0.15, col1);
  warpGrad.addColorStop(0.45, col2);
  warpGrad.addColorStop(0.8, 'rgba(10, 2, 30, 0.4)');
  warpGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = warpGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, 320 * audioPulse, 0, Math.PI * 2);
  ctx.fill();

  // 2. Rotating Segmented Portal Rings
  ctx.save();
  ctx.translate(cx, cy);

  for (let r of rings) {
    const curR = r.radius * audioPulse;
    const rot = time * r.speed * portalSpeed * 0.3;
    ctx.strokeStyle = (r.radius > 160) ? col1 : col2;
    ctx.lineWidth = 2.2;
    ctx.shadowColor = col1;
    ctx.shadowBlur = 10;

    ctx.beginPath();
    for (let s = 0; s < r.segments; s++) {
      if (s % 2 === 0) continue; // broken ring glyphs
      const a1 = rot + (s * Math.PI * 2) / r.segments;
      const a2 = rot + ((s + 0.8) * Math.PI * 2) / r.segments;
      ctx.arc(0, 0, curR, a1, a2);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
  ctx.restore();

  // 3. Electric Lightning Arcs discharging across portal
  if (Math.random() > 0.3) {
    const boltAngle = Math.random() * Math.PI * 2;
    const startR = 40;
    const endR = 260 * audioPulse;

    ctx.strokeStyle = '#ffffff';
    ctx.shadowColor = col1;
    ctx.shadowBlur = 15;
    ctx.lineWidth = 1.8;
    ctx.beginPath();

    let curX = cx + Math.cos(boltAngle) * startR;
    let curY = cy + Math.sin(boltAngle) * startR;
    ctx.moveTo(curX, curY);

    const steps = 8;
    for (let st = 1; st <= steps; st++) {
      const stepR = startR + (endR - startR) * (st / steps);
      const jitterA = boltAngle + (Math.random() - 0.5) * 0.3;
      curX = cx + Math.cos(jitterA) * stepR + (Math.random() - 0.5) * 14;
      curY = cy + Math.sin(jitterA) * stepR + (Math.random() - 0.5) * 14;
      ctx.lineTo(curX, curY);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // 4. Inward Swirling Sparks
  for (let sp of sparks) {
    sp.dist -= sp.speed * portalSpeed;
    sp.angle += (portalSpeed * 2.5) / (sp.dist + 10);
    if (sp.dist < 20) {
      sp.dist = 280 + Math.random() * 40;
      sp.angle = Math.random() * Math.PI * 2;
    }

    const px = cx + Math.cos(sp.angle) * sp.dist;
    const py = cy + Math.sin(sp.angle) * sp.dist;

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(px, py, sp.size, 0, Math.PI * 2);
    ctx.fill();
  }
}
`;

  return {
    id: 'proj_' + Math.random().toString(36).substring(2, 9),
    title: 'Quantum Cosmic Portal & Lightning Vortex',
    prompt,
    description: 'A multi-ring hyper-dimensional cosmic wormhole with electric lightning arcs and accretion vortex.',
    engine: 'canvas2d',
    duration: 10,
    fps: 60,
    aspectRatio: aspectRatio || '16:9',
    resolution: { width: 1280, height: 720 },
    parameters: {
      portalSpeed: { id: 'portalSpeed', label: 'Vortex Spin Rate', type: 'number', value: 1.3, min: 0.2, max: 3.5, step: 0.1, category: 'physics' },
      primaryColor: { id: 'primaryColor', label: 'Portal Outer Ring', type: 'color', value: '#00f2fe', category: 'colors' },
      coreColor: { id: 'coreColor', label: 'Singularity Core', type: 'color', value: '#9d4edd', category: 'colors' }
    },
    keyframeTracks: [],
    postProcessing: {
      bloom: true,
      bloomIntensity: 1.8,
      bloomRadius: 20,
      chromaticAberration: true,
      aberrationAmount: 4,
      motionBlur: false,
      motionBlurDecay: 0.2,
      vignette: true,
      vignetteDarkness: 0.8,
      scanlines: false,
      grain: false,
      grainIntensity: 0.1
    },
    audio: { enabled: false, synthPreset: 'techno', volume: 0.5, reactivitySensitivity: 1.5, bassImpact: 1.0, trebleImpact: 1.0 },
    tags: ['Portal', 'Vortex', 'Cosmic', 'Sci-Fi', 'Lightning'],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}

// Specialized Generator 2: Volumetric Fire & Embers
function generateVolumetricFire(prompt: string, style: string, aspectRatio?: any): AnimationProject {
  const code = `// Volumetric Fire Simulation & Turbulent Floating Embers
const particles = [];
const NUM_FIRE = 450;

for (let i = 0; i < NUM_FIRE; i++) {
  particles.push({
    x: 0,
    y: 0,
    vx: (Math.random() - 0.5) * 2,
    vy: -2 - Math.random() * 4,
    life: Math.random() * 80,
    maxLife: 60 + Math.random() * 60,
    size: 15 + Math.random() * 30
  });
}

const embers = [];
for (let i = 0; i < 80; i++) {
  embers.push({
    x: (Math.random() - 0.5) * 400,
    y: Math.random() * 400,
    vx: (Math.random() - 0.5) * 1.5,
    vy: -1.5 - Math.random() * 3,
    size: 1.5 + Math.random() * 2.5,
    sparkle: Math.random() * Math.PI * 2
  });
}

function render({ ctx, width, height, time, params, mouse, audioData }) {
  ctx.fillStyle = '#060404';
  ctx.fillRect(0, 0, width, height);

  const cx = width / 2;
  const baseY = height * 0.82;
  const flameH = params.flameHeight || 1.4;
  const windX = mouse.x * 2.5;
  const audioPulse = audioData ? audioData.bass * 20 : 0;

  ctx.save();
  ctx.translate(cx, baseY);
  ctx.globalCompositeOperation = 'screen';

  // 1. Convection fire blobs
  for (let p of particles) {
    p.life++;
    p.y += p.vy * flameH;
    p.x += p.vx + windX + Math.sin(time * 6 + p.y * 0.05) * 1.2;
    p.size *= 0.985;

    if (p.life > p.maxLife || p.size < 2) {
      p.x = (Math.random() - 0.5) * 120;
      p.y = 0;
      p.vx = (Math.random() - 0.5) * 2;
      p.vy = -3 - Math.random() * 4.5;
      p.size = (20 + Math.random() * 35) + audioPulse;
      p.life = 0;
    }

    const progress = p.life / p.maxLife; // 0 (bottom) to 1 (top)

    // Color gradient from white-yellow core to orange-red to dark smoke
    let r = 255, g = 0, b = 0, alpha = 0.4;
    if (progress < 0.2) {
      r = 255; g = 240; b = 180; alpha = 0.7;
    } else if (progress < 0.5) {
      r = 255; g = 140; b = 20; alpha = 0.5;
    } else if (progress < 0.8) {
      r = 220; g = 40; b = 10; alpha = 0.3;
    } else {
      r = 80; g = 20; b = 10; alpha = 0.15;
    }

    ctx.fillStyle = \`rgba(\${r}, \${g}, \${b}, \${alpha})\`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }

  // 2. High-speed drifting ember sparks
  ctx.globalCompositeOperation = 'lighter';
  for (let emb of embers) {
    emb.y += emb.vy;
    emb.x += emb.vx + windX + Math.sin(time * 8 + emb.y * 0.04) * 2;

    if (emb.y < -500) {
      emb.x = (Math.random() - 0.5) * 160;
      emb.y = 0;
      emb.vy = -2 - Math.random() * 4;
    }

    const a = 0.4 + 0.6 * Math.sin(time * 10 + emb.sparkle);
    ctx.fillStyle = \`rgba(255, 200, 50, \${a})\`;
    ctx.beginPath();
    ctx.arc(emb.x, emb.y, emb.size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
`;

  return {
    id: 'proj_' + Math.random().toString(36).substring(2, 9),
    title: 'Volumetric Fire Simulation & Turbulent Embers',
    prompt,
    description: 'Realistic additive particle fire convection simulation with floating ember sparks and dynamic wind.',
    engine: 'canvas2d',
    duration: 8,
    fps: 60,
    aspectRatio: aspectRatio || '16:9',
    resolution: { width: 1280, height: 720 },
    parameters: {
      flameHeight: { id: 'flameHeight', label: 'Flame Convection Height', type: 'number', value: 1.4, min: 0.5, max: 2.8, step: 0.1, category: 'physics' },
      fireColor: { id: 'fireColor', label: 'Ember Glow Tint', type: 'color', value: '#ff5500', category: 'colors' }
    },
    keyframeTracks: [],
    postProcessing: {
      bloom: true,
      bloomIntensity: 1.7,
      bloomRadius: 20,
      vignette: true,
      chromaticAberration: false
    } as any,
    audio: { enabled: false, synthPreset: 'ambient', volume: 0.5, reactivitySensitivity: 1.5, bassImpact: 1.0, trebleImpact: 1.0 },
    tags: ['Fire', 'Fluid', 'Physics', 'Embers', 'Volumetric'],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}

// Specialized Generator 3: Flocking Boids / Swarm Behavior
function generateFlockingBoids(prompt: string, style: string, aspectRatio?: any): AnimationProject {
  const code = `// Craig Reynolds Flocking Boids (Separation, Alignment, Cohesion)
const boids = [];
const NUM_BOIDS = 180;

for (let i = 0; i < NUM_BOIDS; i++) {
  boids.push({
    x: Math.random() * 1000,
    y: Math.random() * 700,
    vx: (Math.random() - 0.5) * 4,
    vy: (Math.random() - 0.5) * 4,
    size: 4 + Math.random() * 3
  });
}

function render({ ctx, width, height, time, params, mouse, audioData }) {
  ctx.fillStyle = '#060913';
  ctx.fillRect(0, 0, width, height);

  const speedLimit = params.flightSpeed || 3.5;
  const col = params.boidColor || '#38bdf8';
  const mx = (mouse.x + 1) * 0.5 * width;
  const my = (-mouse.y + 1) * 0.5 * height;

  const visualRange = 75;
  const minDistance = 25;

  for (let i = 0; i < boids.length; i++) {
    const b = boids[i];
    let centerX = 0, centerY = 0, numNeighbors = 0;
    let avgVx = 0, avgVy = 0;
    let sepX = 0, sepY = 0;

    for (let j = 0; j < boids.length; j++) {
      if (i === j) continue;
      const other = boids[j];
      const dx = other.x - b.x;
      const dy = other.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < minDistance) {
        sepX -= dx * 0.05;
        sepY -= dy * 0.05;
      } else if (dist < visualRange) {
        centerX += other.x;
        centerY += other.y;
        avgVx += other.vx;
        avgVy += other.vy;
        numNeighbors++;
      }
    }

    if (numNeighbors > 0) {
      centerX /= numNeighbors;
      centerY /= numNeighbors;
      avgVx /= numNeighbors;
      avgVy /= numNeighbors;

      // Cohesion + Alignment
      b.vx += (centerX - b.x) * 0.0008 + (avgVx - b.vx) * 0.04;
      b.vy += (centerY - b.y) * 0.0008 + (avgVy - b.vy) * 0.04;
    }

    // Separation
    b.vx += sepX;
    b.vy += sepY;

    // Mouse predator or attractor
    const distToMouse = Math.hypot(mx - b.x, my - b.y);
    if (distToMouse < 180) {
      const force = mouse.isDown ? 0.08 : -0.06; // Attract on click, repel otherwise
      b.vx += (mx - b.x) * force;
      b.vy += (my - b.y) * force;
    }

    // Speed clamping
    const speed = Math.hypot(b.vx, b.vy);
    if (speed > speedLimit) {
      b.vx = (b.vx / speed) * speedLimit;
      b.vy = (b.vy / speed) * speedLimit;
    }

    b.x += b.vx;
    b.y += b.vy;

    // Screen wrapping
    if (b.x < 0) b.x = width;
    if (b.x > width) b.x = 0;
    if (b.y < 0) b.y = height;
    if (b.y > height) b.y = 0;

    // Draw boid wedge heading along velocity
    const angle = Math.atan2(b.vy, b.vx);
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(angle);

    ctx.fillStyle = col;
    ctx.shadowColor = col;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(b.size * 2, 0);
    ctx.lineTo(-b.size, -b.size * 0.7);
    ctx.lineTo(-b.size * 0.4, 0);
    ctx.lineTo(-b.size, b.size * 0.7);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}
`;

  return {
    id: 'proj_' + Math.random().toString(36).substring(2, 9),
    title: 'Flocking Boids & Emergent Swarm Intelligence',
    prompt,
    description: 'Artificial life multi-agent simulation with flocking rules: separation, cohesion, and obstacle avoidance.',
    engine: 'canvas2d',
    duration: 12,
    fps: 60,
    aspectRatio: aspectRatio || '16:9',
    resolution: { width: 1280, height: 720 },
    parameters: {
      flightSpeed: { id: 'flightSpeed', label: 'Maximum Velocity', type: 'number', value: 3.5, min: 1.0, max: 6.0, step: 0.2, category: 'physics' },
      boidColor: { id: 'boidColor', label: 'Boid Glow Color', type: 'color', value: '#38bdf8', category: 'colors' }
    },
    keyframeTracks: [],
    postProcessing: { bloom: true, bloomIntensity: 1.4, bloomRadius: 16 } as any,
    audio: { enabled: false, synthPreset: 'ambient', volume: 0.5, reactivitySensitivity: 1.5, bassImpact: 1.0, trebleImpact: 1.0 },
    tags: ['Boids', 'Swarm', 'Emergence', 'AI', 'Simulation'],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}

// Specialized Generator 4: Chaotic Double Pendulum
function generateDoublePendulum(prompt: string, style: string, aspectRatio?: any): AnimationProject {
  const code = `// Chaotic Double Pendulum Physics Simulation (Runge-Kutta Lagrangian)
let r1 = 140, r2 = 130;
let m1 = 18, m2 = 18;
let a1 = Math.PI / 2, a2 = Math.PI / 2;
let a1_v = 0, a2_v = 0;
const g = 0.98;
const trace = [];

function render({ ctx, width, height, time, params, mouse, audioData }) {
  ctx.fillStyle = '#05070e';
  ctx.fillRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height * 0.35;
  const traceLen = params.traceLength || 1500;
  const pendCol = params.pendulumColor || '#00f2fe';

  // Solve Lagrangian equations of motion
  const num1 = -g * (2 * m1 + m2) * Math.sin(a1);
  const num2 = -m2 * g * Math.sin(a1 - 2 * a2);
  const num3 = -2 * Math.sin(a1 - a2) * m2;
  const num4 = a2_v * a2_v * r2 + a1_v * a1_v * r1 * Math.cos(a1 - a2);
  const den1 = r1 * (2 * m1 + m2 - m2 * Math.cos(2 * a1 - 2 * a2));
  const a1_a = (num1 + num2 + num3 * num4) / den1;

  const num5 = 2 * Math.sin(a1 - a2);
  const num6 = a1_v * a1_v * r1 * (m1 + m2);
  const num7 = g * (m1 + m2) * Math.cos(a1);
  const num8 = a2_v * a2_v * r2 * m2 * Math.cos(a1 - a2);
  const den2 = r2 * (2 * m1 + m2 - m2 * Math.cos(2 * a1 - 2 * a2));
  const a2_a = (num5 * (num6 + num7 + num8)) / den2;

  a1_v += a1_a;
  a2_v += a2_a;
  a1 += a1_v;
  a2 += a2_v;

  // Damping
  a1_v *= 0.999;
  a2_v *= 0.999;

  const x1 = cx + r1 * Math.sin(a1);
  const y1 = cy + r1 * Math.cos(a1);
  const x2 = x1 + r2 * Math.sin(a2);
  const y2 = y1 + r2 * Math.cos(a2);

  trace.push({ x: x2, y: y2 });
  if (trace.length > traceLen) trace.shift();

  // 1. Draw Chaotic Luminous Trajectory Trail
  ctx.lineWidth = 1.6;
  for (let i = 1; i < trace.length; i++) {
    const p1 = trace[i - 1];
    const p2 = trace[i];
    const pct = i / trace.length;
    const hue = (pct * 300 + time * 20) % 360;

    ctx.strokeStyle = \`hsla(\${hue}, 90%, 60%, \${Math.pow(pct, 2)})\`;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }

  // 2. Draw Pendulum Rods & Bobs
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  // Bob 1
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x1, y1, 8, 0, Math.PI * 2);
  ctx.fill();

  // Bob 2 (Glowing tip)
  ctx.fillStyle = pendCol;
  ctx.shadowColor = pendCol;
  ctx.shadowBlur = 18;
  ctx.beginPath();
  ctx.arc(x2, y2, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}
`;

  return {
    id: 'proj_' + Math.random().toString(36).substring(2, 9),
    title: 'Chaotic Double Pendulum Physics',
    prompt,
    description: 'Lagrangian mechanics simulation displaying deterministic chaos and rainbow trajectory paths.',
    engine: 'canvas2d',
    duration: 10,
    fps: 60,
    aspectRatio: aspectRatio || '16:9',
    resolution: { width: 1280, height: 720 },
    parameters: {
      traceLength: { id: 'traceLength', label: 'Trail Length', type: 'number', value: 1500, min: 400, max: 3000, step: 100, category: 'visual' },
      pendulumColor: { id: 'pendulumColor', label: 'Bob Glow Color', type: 'color', value: '#00f2fe', category: 'colors' }
    },
    keyframeTracks: [],
    postProcessing: { bloom: true, bloomIntensity: 1.5, bloomRadius: 18 } as any,
    audio: { enabled: false, synthPreset: 'techno', volume: 0.5, reactivitySensitivity: 1.5, bassImpact: 1.0, trebleImpact: 1.0 },
    tags: ['Physics', 'Chaos', 'Pendulum', 'Lagrangian', 'Mechanics'],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}

// Specialized Generator 5: DNA Double Helix
function generateDNAHelix(prompt: string, style: string, aspectRatio?: any): AnimationProject {
  const code = `// 3D Rotating DNA Double Helix with Base Pair Bonds
function render({ ctx, width, height, time, params, mouse, audioData }) {
  ctx.fillStyle = '#060712';
  ctx.fillRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2;
  const nodes = 38;
  const spacing = 14;
  const radius = 90;
  const speed = params.helixSpeed || 1.4;
  const colA = params.strandAColor || '#38bdf8';
  const colB = params.strandBColor || '#ec4899';
  const audioPulse = audioData ? audioData.bass * 20 : 0;

  const totalH = nodes * spacing;
  const startY = cy - totalH / 2;

  // Base pair colors (Adenine, Thymine, Guanine, Cytosine)
  const bpColors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b'];

  for (let i = 0; i < nodes; i++) {
    const y = startY + i * spacing;
    const angle = time * speed + i * 0.28 + mouse.x * 2;

    const x1 = cx + Math.cos(angle) * (radius + audioPulse);
    const z1 = Math.sin(angle) * (radius + audioPulse);

    const x2 = cx + Math.cos(angle + Math.PI) * (radius + audioPulse);
    const z2 = Math.sin(angle + Math.PI) * (radius + audioPulse);

    // Depth perspective
    const scale1 = 400 / (400 + z1);
    const scale2 = 400 / (400 + z2);

    // Connecting hydrogen bond rung
    const bpCol = bpColors[i % 4];
    ctx.strokeStyle = bpCol;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x1, y);
    ctx.lineTo(x2, y);
    ctx.stroke();

    // Node A
    ctx.fillStyle = colA;
    ctx.shadowColor = colA;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(x1, y, 6 * scale1, 0, Math.PI * 2);
    ctx.fill();

    // Node B
    ctx.fillStyle = colB;
    ctx.shadowColor = colB;
    ctx.beginPath();
    ctx.arc(x2, y, 6 * scale2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}
`;

  return {
    id: 'proj_' + Math.random().toString(36).substring(2, 9),
    title: 'Holographic DNA Double Helix 3D',
    prompt,
    description: '3D genetic molecular double helix rotating with nucleotide base pair bonds and depth perspective.',
    engine: 'canvas2d',
    duration: 8,
    fps: 60,
    aspectRatio: aspectRatio || '16:9',
    resolution: { width: 1280, height: 720 },
    parameters: {
      helixSpeed: { id: 'helixSpeed', label: 'Rotation Speed', type: 'number', value: 1.4, min: 0.2, max: 3.5, step: 0.1, category: 'physics' },
      strandAColor: { id: 'strandAColor', label: 'Strand A Tint', type: 'color', value: '#38bdf8', category: 'colors' },
      strandBColor: { id: 'strandBColor', label: 'Strand B Tint', type: 'color', value: '#ec4899', category: 'colors' }
    },
    keyframeTracks: [],
    postProcessing: { bloom: true, bloomIntensity: 1.6, bloomRadius: 18 } as any,
    audio: { enabled: false, synthPreset: 'cyberpulse', volume: 0.5, reactivitySensitivity: 1.5, bassImpact: 1.0, trebleImpact: 1.0 },
    tags: ['DNA', 'Biotech', 'Helix', 'Molecular', 'Science'],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}

// Specialized Generator 6: Fractal Julia Morph
function generateFractalMorph(prompt: string, style: string, aspectRatio?: any): AnimationProject {
  const code = `// Complex Julia Set Dynamic Fractal Morphing
let offCanvas = null;
let offCtx = null;
const SCALE = 3;

function render({ ctx, width, height, time, params, mouse, audioData }) {
  const w = Math.floor(width / SCALE);
  const h = Math.floor(height / SCALE);

  if (!offCanvas || offCanvas.width !== w || offCanvas.height !== h) {
    offCanvas = document.createElement('canvas');
    offCanvas.width = w;
    offCanvas.height = h;
    offCtx = offCanvas.getContext('2d', { willReadFrequently: true });
  }

  const speed = params.morphSpeed || 1.0;
  const maxIter = params.iterations || 45;
  const baseHue = params.baseHue || 200;
  const audioPulse = audioData ? audioData.bass * 0.15 : 0;

  // Constant C moving along a lemniscate / Lissajous curve
  const cx = -0.7 + Math.sin(time * 0.5 * speed) * 0.1 + mouse.x * 0.15;
  const cy = 0.27015 + Math.cos(time * 0.7 * speed) * 0.1 - mouse.y * 0.15 + audioPulse;

  const imgData = offCtx.createImageData(w, h);
  const data = imgData.data;

  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++) {
      // Map pixel to complex plane [-1.5, 1.5]
      let zx = 1.5 * (px - w / 2) / (0.5 * w);
      let zy = (py - h / 2) / (0.5 * h);

      let i = maxIter;
      while (zx * zx + zy * zy < 4 && i > 0) {
        let tmp = zx * zx - zy * zy + cx;
        zy = 2.0 * zx * zy + cy;
        zx = tmp;
        i--;
      }

      const idx = (py * w + px) * 4;
      if (i === 0) {
        data[idx] = 4;
        data[idx + 1] = 6;
        data[idx + 2] = 12;
        data[idx + 3] = 255;
      } else {
        const hue = (baseHue + (i / maxIter) * 360) % 360;
        // Simple HSL to RGB
        const s = 0.9, l = (i / maxIter) * 0.7 + 0.1;
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
        const m = l - c / 2;
        let r1 = 0, g1 = 0, b1 = 0;
        if (hue < 60) { r1 = c; g1 = x; }
        else if (hue < 120) { r1 = x; g1 = c; }
        else if (hue < 180) { g1 = c; b1 = x; }
        else if (hue < 240) { g1 = x; b1 = c; }
        else if (hue < 300) { r1 = x; b1 = c; }
        else { r1 = c; b1 = x; }

        data[idx] = Math.floor((r1 + m) * 255);
        data[idx + 1] = Math.floor((g1 + m) * 255);
        data[idx + 2] = Math.floor((b1 + m) * 255);
        data[idx + 3] = 255;
      }
    }
  }

  offCtx.putImageData(imgData, 0, 0);

  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(offCanvas, 0, 0, width, height);
}
`;

  return {
    id: 'proj_' + Math.random().toString(36).substring(2, 9),
    title: 'Julia Set Dynamic Fractal Morphing',
    prompt,
    description: 'Real-time complex number plane Julia set iteration with dynamic continuous parameter animation.',
    engine: 'canvas2d',
    duration: 10,
    fps: 60,
    aspectRatio: aspectRatio || '16:9',
    resolution: { width: 1280, height: 720 },
    parameters: {
      morphSpeed: { id: 'morphSpeed', label: 'Morph Velocity', type: 'number', value: 1.0, min: 0.2, max: 3.0, step: 0.1, category: 'physics' },
      iterations: { id: 'iterations', label: 'Fractal Depth', type: 'number', value: 45, min: 20, max: 80, step: 5, category: 'visual' },
      baseHue: { id: 'baseHue', label: 'Color Spectrum Hue', type: 'number', value: 200, min: 0, max: 360, step: 5, category: 'colors' }
    },
    keyframeTracks: [],
    postProcessing: { bloom: true, bloomIntensity: 1.4, bloomRadius: 16 } as any,
    audio: { enabled: false, synthPreset: 'ambient', volume: 0.5, reactivitySensitivity: 1.5, bassImpact: 1.0, trebleImpact: 1.0 },
    tags: ['Fractal', 'Julia Set', 'Math', 'Morphing', 'Complex Plane'],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}

// Universal Procedural Generator for ANY arbitrary prompt
function generateUniversalAnimation(prompt: string, style: string, aspectRatio?: any): AnimationProject {
  const code = `// Dynamic Procedural Animation Synthesized by Anify AI
// Prompt: "${prompt.replace(/"/g, '\\"')}"

const elements = [];
const COUNT = 160;

for (let i = 0; i < COUNT; i++) {
  elements.push({
    x: Math.random() * 1200,
    y: Math.random() * 800,
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2,
    size: 2 + Math.random() * 6,
    angle: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.05,
    hue: Math.random() * 360
  });
}

function render({ ctx, width, height, time, params, mouse, audioData }) {
  ctx.fillStyle = '#060814';
  ctx.fillRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2;
  const speed = params.animationSpeed || 1.2;
  const mainCol = params.primaryColor || '#00f2fe';
  const audioPulse = audioData ? audioData.bass * 1.5 : 0;

  // Central Harmonic Rings
  ctx.save();
  ctx.translate(cx, cy);
  for (let r = 1; r <= 4; r++) {
    const radius = r * 65 + Math.sin(time * 3 + r) * 15 * (1 + audioPulse);
    ctx.strokeStyle = mainCol;
    ctx.globalAlpha = 0.35 / r;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  // Floating Procedural Luminous Nodes & Kinetic Links
  ctx.globalAlpha = 1.0;
  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    el.x += el.vx * speed;
    el.y += el.vy * speed;
    el.angle += el.rotSpeed * speed;

    if (el.x < 0) el.x = width;
    if (el.x > width) el.x = 0;
    if (el.y < 0) el.y = height;
    if (el.y > height) el.y = 0;

    // Connect close neighbors
    for (let j = i + 1; j < elements.length; j++) {
      const other = elements[j];
      const dx = el.x - other.x;
      const dy = el.y - other.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 90) {
        ctx.strokeStyle = mainCol;
        ctx.globalAlpha = (1 - dist / 90) * 0.45;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(el.x, el.y);
        ctx.lineTo(other.x, other.y);
        ctx.stroke();
      }
    }

    // Draw glowing node
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = mainCol;
    ctx.shadowColor = mainCol;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(el.x, el.y, el.size * (1 + audioPulse * 0.4), 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}
`;

  return {
    id: 'proj_' + Math.random().toString(36).substring(2, 9),
    title: prompt.slice(0, 36) || 'Synthesized Animation',
    prompt,
    description: `Procedurally generated animation driven by natural language prompt: "${prompt}".`,
    engine: 'canvas2d',
    duration: 10,
    fps: 60,
    aspectRatio: aspectRatio || '16:9',
    resolution: { width: 1280, height: 720 },
    parameters: {
      animationSpeed: { id: 'animationSpeed', label: 'Master Speed', type: 'number', value: 1.2, min: 0.2, max: 3.5, step: 0.1, category: 'physics' },
      primaryColor: { id: 'primaryColor', label: 'Primary Glow', type: 'color', value: '#00f2fe', category: 'colors' }
    },
    keyframeTracks: [],
    postProcessing: {
      bloom: true,
      bloomIntensity: 1.5,
      bloomRadius: 16,
      chromaticAberration: false,
      aberrationAmount: 3,
      motionBlur: false,
      motionBlurDecay: 0.2,
      vignette: true,
      vignetteDarkness: 0.7,
      scanlines: false,
      grain: false,
      grainIntensity: 0.1
    },
    audio: { enabled: false, synthPreset: 'synthwave', volume: 0.5, reactivitySensitivity: 1.5, bassImpact: 1.0, trebleImpact: 1.0 },
    tags: ['AI Generated', 'Procedural', style],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}
