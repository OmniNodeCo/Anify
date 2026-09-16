import { PresetAnimation } from '../types/animation';

export const particleVortexPreset: PresetAnimation = {
  id: 'fluid-particle-vortex',
  title: 'Fluid SPH & Curl Noise Particle Vortex',
  prompt: 'A dynamic vortex of 8000 glowing fluid particles flowing through a 3D curl noise turbulence field with mouse gravity and chromatic speed trails',
  description: 'Simulates curl-noise driven fluid mechanics with interactive mouse attractor forces and velocity-mapped spectral coloring.',
  category: 'Cosmic & Physics',
  engine: 'canvas2d',
  badge: 'Curl Fluid',
  duration: 10,
  parameters: {
    particleCount: {
      id: 'particleCount',
      label: 'Particle Count',
      type: 'number',
      value: 3500,
      min: 1000,
      max: 6000,
      step: 250,
      category: 'physics'
    },
    flowSpeed: {
      id: 'flowSpeed',
      label: 'Flow Velocity',
      type: 'number',
      value: 1.6,
      min: 0.2,
      max: 4.0,
      step: 0.1,
      category: 'physics'
    },
    turbulenceScale: {
      id: 'turbulenceScale',
      label: 'Turbulence Scale',
      type: 'number',
      value: 0.0035,
      min: 0.001,
      max: 0.01,
      step: 0.0005,
      category: 'physics'
    },
    trailDecay: {
      id: 'trailDecay',
      label: 'Trail Persistence',
      type: 'number',
      value: 0.18,
      min: 0.05,
      max: 0.5,
      step: 0.02,
      category: 'visual'
    },
    colorPalette: {
      id: 'colorPalette',
      label: 'Hue Shift',
      type: 'number',
      value: 180,
      min: 0,
      max: 360,
      step: 5,
      category: 'colors'
    }
  },
  postProcessing: {
    bloom: true,
    bloomIntensity: 1.5,
    bloomRadius: 16,
    motionBlur: true
  },
  tags: ['Fluid', 'Particles', 'Curl Noise', 'Physics', 'Vortex'],
  code: `// Fluid SPH & Curl Noise Particle Vortex
const particles = [];
const MAX_P = 6000;

for (let i = 0; i < MAX_P; i++) {
  particles.push({
    x: Math.random() * 1200,
    y: Math.random() * 800,
    vx: 0,
    vy: 0,
    life: Math.random() * 200,
    maxLife: 150 + Math.random() * 150,
    size: 1.0 + Math.random() * 2.0
  });
}

// Pseudo Simplex/Perlin noise helper
function noise2D(x, y, t) {
  const s = Math.sin(x * 1.3 + t * 0.4) + Math.cos(y * 1.7 - t * 0.5);
  const c = Math.cos(x * 0.8 - y * 0.9 + t * 0.3);
  return s * 0.6 + c * 0.4;
}

// Compute curl of noise field for divergence-free incompressible flow
function curlNoise(x, y, t, scale) {
  const eps = 0.5;
  const n1 = noise2D(x * scale, (y + eps) * scale, t);
  const n2 = noise2D(x * scale, (y - eps) * scale, t);
  const n3 = noise2D((x + eps) * scale, y * scale, t);
  const n4 = noise2D((x - eps) * scale, y * scale, t);

  const dx = (n1 - n2) / (2 * eps);
  const dy = (n3 - n4) / (2 * eps);
  return { u: dy * 2.5, v: -dx * 2.5 };
}

function render({ ctx, width, height, time, params, mouse, audioData }) {
  // Semi-transparent fade creates silky trails
  const decay = params.trailDecay || 0.18;
  ctx.fillStyle = \`rgba(6, 8, 16, \${decay})\`;
  ctx.fillRect(0, 0, width, height);

  const count = Math.min(particles.length, params.particleCount || 3500);
  const speed = params.flowSpeed || 1.6;
  const turbScale = params.turbulenceScale || 0.0035;
  const baseHue = params.colorPalette || 180;
  const audioBump = audioData ? audioData.bass * 2.5 : 0;

  const mx = (mouse.x + 1) * 0.5 * width;
  const my = (-mouse.y + 1) * 0.5 * height;
  const hasMousePull = mouse.isDown || (mouse.x !== 0 || mouse.y !== 0);

  ctx.lineWidth = 1.4;

  for (let i = 0; i < count; i++) {
    const p = particles[i];

    // Compute curl noise vector
    const curl = curlNoise(p.x, p.y, time * 0.6, turbScale);
    p.vx = p.vx * 0.88 + curl.u * speed * 0.4;
    p.vy = p.vy * 0.88 + curl.v * speed * 0.4;

    // Mouse gravity well / vortex
    if (hasMousePull) {
      const dx = mx - p.x;
      const dy = my - p.y;
      const distSq = dx * dx + dy * dy;
      if (distSq > 100 && distSq < 160000) {
        const force = (1200 / distSq) * (mouse.isDown ? -2.5 : 1.2);
        // Tangential vortex force + inward attraction
        p.vx += (dx * 0.5 - dy * 0.8) * force * 0.05;
        p.vy += (dy * 0.5 + dx * 0.8) * force * 0.05;
      }
    }

    const prevX = p.x;
    const prevY = p.y;

    p.x += p.vx * (1 + audioBump * 0.4);
    p.y += p.vy * (1 + audioBump * 0.4);
    p.life++;

    // Screen wrapping or reset
    if (p.x < 0) p.x = width;
    if (p.x > width) p.x = 0;
    if (p.y < 0) p.y = height;
    if (p.y > height) p.y = 0;

    if (p.life > p.maxLife) {
      p.x = Math.random() * width;
      p.y = Math.random() * height;
      p.vx = 0;
      p.vy = 0;
      p.life = 0;
    }

    // Velocity-mapped chromatic hue
    const vel = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
    const hue = (baseHue + vel * 25 + time * 15) % 360;
    const alpha = Math.min(1, Math.sin((p.life / p.maxLife) * Math.PI) * 0.85);

    ctx.strokeStyle = \`hsla(\${hue}, 90%, 60%, \${alpha})\`;
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }
}
`
};
