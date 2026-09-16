import { PresetAnimation } from '../types/animation';

export const metaballsPreset: PresetAnimation = {
  id: 'liquid-mercury-metaballs',
  title: 'Liquid Mercury Metaballs & Fluid Coalescence',
  prompt: 'Morphing organic liquid mercury metaballs merging and dividing in real-time with metallic specular highlights, refraction rim, and surface tension dynamics',
  description: 'Simulates scalar field thresholding (metaballs) with smooth surface tension blending and metallic chrome reflections.',
  category: 'Organic & Nature',
  engine: 'canvas2d',
  badge: 'Scalar Field',
  duration: 10,
  parameters: {
    blobCount: {
      id: 'blobCount',
      label: 'Droplet Count',
      type: 'number',
      value: 12,
      min: 5,
      max: 20,
      step: 1,
      category: 'physics'
    },
    liquidViscosity: {
      id: 'liquidViscosity',
      label: 'Flow Speed',
      type: 'number',
      value: 1.2,
      min: 0.2,
      max: 3.0,
      step: 0.1,
      category: 'physics'
    },
    thresholdVal: {
      id: 'thresholdVal',
      label: 'Coalescence Threshold',
      type: 'number',
      value: 0.0035,
      min: 0.001,
      max: 0.008,
      step: 0.0005,
      category: 'visual'
    },
    liquidTint: {
      id: 'liquidTint',
      label: 'Chrome Tint',
      type: 'color',
      value: '#67e8f9',
      category: 'colors'
    }
  },
  postProcessing: {
    bloom: true,
    bloomIntensity: 1.2,
    bloomRadius: 14,
    chromaticAberration: true
  },
  tags: ['Metaballs', 'Liquid', 'Mercury', 'Fluid', 'Organic'],
  code: `// Liquid Mercury Metaballs Simulation
const blobs = [];
for (let i = 0; i < 18; i++) {
  blobs.push({
    x: 300 + Math.random() * 400,
    y: 200 + Math.random() * 300,
    vx: (Math.random() - 0.5) * 3,
    vy: (Math.random() - 0.5) * 3,
    r: 35 + Math.random() * 45,
    mass: 1
  });
}

// Low-resolution sampling canvas for blazing fast 60fps scalar field rendering
let offCanvas = null;
let offCtx = null;
const SCALE = 4; // 1/4 res pixel sampling with smooth scaling

function render({ ctx, width, height, time, params, mouse, audioData }) {
  const tint = params.liquidTint || '#67e8f9';
  const speed = params.liquidViscosity || 1.2;
  const count = Math.min(blobs.length, params.blobCount || 12);
  const audioPulse = audioData ? audioData.bass * 20 : 0;

  const w = Math.floor(width / SCALE);
  const h = Math.floor(height / SCALE);

  if (!offCanvas || offCanvas.width !== w || offCanvas.height !== h) {
    offCanvas = document.createElement('canvas');
    offCanvas.width = w;
    offCanvas.height = h;
    offCtx = offCanvas.getContext('2d', { willReadFrequently: true });
  }

  // Update blob physics
  const mx = (mouse.x + 1) * 0.5 * width;
  const my = (-mouse.y + 1) * 0.5 * height;

  for (let i = 0; i < count; i++) {
    const b = blobs[i];
    b.x += b.vx * speed;
    b.y += b.vy * speed;

    // Bounce walls
    if (b.x < b.r) { b.x = b.r; b.vx *= -1; }
    if (b.x > width - b.r) { b.x = width - b.r; b.vx *= -1; }
    if (b.y < b.r) { b.y = b.r; b.vy *= -1; }
    if (b.y > height - b.r) { b.y = height - b.r; b.vy *= -1; }

    // Mouse attraction
    if (mouse.isDown) {
      const dx = mx - b.x;
      const dy = my - b.y;
      b.vx += dx * 0.001;
      b.vy += dy * 0.001;
    }
  }

  // Calculate scalar field on low-res buffer
  const imgData = offCtx.createImageData(w, h);
  const data = imgData.data;
  const threshold = 1.0;

  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++) {
      const sx = px * SCALE;
      const sy = py * SCALE;
      let sum = 0;

      for (let i = 0; i < count; i++) {
        const b = blobs[i];
        const dx = sx - b.x;
        const dy = sy - b.y;
        const distSq = dx * dx + dy * dy;
        const currentR = b.r + (i === 0 ? audioPulse : 0);
        sum += (currentR * currentR) / (distSq + 1);
      }

      const idx = (py * w + px) * 4;
      if (sum >= threshold) {
        // Shading: chrome edge gradient
        const edge = Math.min(1, (sum - threshold) * 2.2);
        data[idx] = Math.floor(180 + edge * 75);     // R
        data[idx + 1] = Math.floor(220 + edge * 35); // G
        data[idx + 2] = 255;                         // B
        data[idx + 3] = 255;                         // A
      } else {
        data[idx + 3] = 0; // Transparent
      }
    }
  }

  offCtx.putImageData(imgData, 0, 0);

  // Background
  ctx.fillStyle = '#060812';
  ctx.fillRect(0, 0, width, height);

  // Draw scaled scalar field with smooth bilinear interpolation
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(offCanvas, 0, 0, width, height);

  // Liquid chrome specular sheen
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < count; i++) {
    const b = blobs[i];
    const grad = ctx.createRadialGradient(b.x - b.r * 0.3, b.y - b.r * 0.3, 2, b.x, b.y, b.r);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
    grad.addColorStop(0.3, tint);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
`
};
