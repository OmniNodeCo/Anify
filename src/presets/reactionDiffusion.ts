import { PresetAnimation } from '../types/animation';

export const reactionDiffusionPreset: PresetAnimation = {
  id: 'turing-reaction-diffusion',
  title: 'Turing Reaction-Diffusion & Morphogenesis',
  prompt: 'An organic reaction-diffusion simulation creating self-organizing chemical Turing patterns, leopard spots, and coral labyrinths with dynamic nutrient feed',
  description: 'Simulates Gray-Scott reaction-diffusion equations generating biological skin patterns, spots, and labyrinthine growth.',
  category: 'Organic & Nature',
  engine: 'canvas2d',
  badge: 'Turing PDE',
  duration: 10,
  parameters: {
    feedRate: {
      id: 'feedRate',
      label: 'Nutrient Feed (F)',
      type: 'number',
      value: 0.0545,
      min: 0.02,
      max: 0.08,
      step: 0.002,
      category: 'physics'
    },
    killRate: {
      id: 'killRate',
      label: 'Removal Rate (k)',
      type: 'number',
      value: 0.062,
      min: 0.04,
      max: 0.07,
      step: 0.002,
      category: 'physics'
    },
    patternColor: {
      id: 'patternColor',
      label: 'Morphogen Color',
      type: 'color',
      value: '#f43f5e',
      category: 'colors'
    },
    simSpeed: {
      id: 'simSpeed',
      label: 'Iteration Speed',
      type: 'number',
      value: 3,
      min: 1,
      max: 6,
      step: 1,
      category: 'physics'
    }
  },
  postProcessing: {
    bloom: true,
    bloomIntensity: 1.2,
    bloomRadius: 12
  },
  tags: ['Turing', 'Biology', 'Reaction-Diffusion', 'Math', 'Organic'],
  code: `// Turing Reaction-Diffusion Gray-Scott Simulation
const W = 160;
const H = 100;

let gridA = new Float32Array(W * H);
let gridB = new Float32Array(W * H);
let nextA = new Float32Array(W * H);
let nextB = new Float32Array(W * H);

// Initialize chemical field
for (let i = 0; i < W * H; i++) {
  gridA[i] = 1.0;
  gridB[i] = 0.0;
}

// Seed spots of Chemical B
for (let s = 0; s < 12; s++) {
  const sx = Math.floor(Math.random() * W);
  const sy = Math.floor(Math.random() * H);
  for (let dy = -4; dy <= 4; dy++) {
    for (let dx = -4; dx <= 4; dx++) {
      const idx = ((sy + dy + H) % H) * W + ((sx + dx + W) % W);
      gridB[idx] = 1.0;
    }
  }
}

let offscreen = null;
let offCtx = null;

function render({ ctx, width, height, time, params, mouse, audioData }) {
  if (!offscreen) {
    offscreen = document.createElement('canvas');
    offscreen.width = W;
    offscreen.height = H;
    offCtx = offscreen.getContext('2d', { willReadFrequently: true });
  }

  const F = params.feedRate || 0.0545;
  const K = params.killRate || 0.062;
  const iters = params.simSpeed || 3;
  const col = params.patternColor || '#f43f5e';
  const audioPulse = audioData ? audioData.bass * 0.01 : 0;

  const Da = 1.0;
  const Db = 0.5;

  // Mouse disturbance creates new seeds
  if (mouse.isDown) {
    const mx = Math.floor(((mouse.x + 1) * 0.5) * W);
    const my = Math.floor(((-mouse.y + 1) * 0.5) * H);
    for (let dy = -3; dy <= 3; dy++) {
      for (let dx = -3; dx <= 3; dx++) {
        const idx = ((my + dy + H) % H) * W + ((mx + dx + W) % W);
        gridB[idx] = 1.0;
      }
    }
  }

  // PDE Solver iterations
  for (let it = 0; it < iters; it++) {
    for (let y = 1; y < H - 1; y++) {
      for (let x = 1; x < W - 1; x++) {
        const idx = y * W + x;
        const a = gridA[idx];
        const b = gridB[idx];

        // 2D Laplacian convolution
        const lapA = (
          gridA[idx - 1] + gridA[idx + 1] + gridA[idx - W] + gridA[idx + W]
        ) * 0.2 + (
          gridA[idx - W - 1] + gridA[idx - W + 1] + gridA[idx + W - 1] + gridA[idx + W + 1]
        ) * 0.05 - a;

        const lapB = (
          gridB[idx - 1] + gridB[idx + 1] + gridB[idx - W] + gridB[idx + W]
        ) * 0.2 + (
          gridB[idx - W - 1] + gridB[idx - W + 1] + gridB[idx + W - 1] + gridB[idx + W + 1]
        ) * 0.05 - b;

        const reaction = a * b * b;
        const currentF = F + audioPulse;

        nextA[idx] = a + (Da * lapA - reaction + currentF * (1 - a));
        nextB[idx] = b + (Db * lapB + reaction - (K + currentF) * b);
      }
    }

    // Swap buffers
    const tempA = gridA; gridA = nextA; nextA = tempA;
    const tempB = gridB; gridB = nextB; nextB = tempB;
  }

  // Render to offscreen canvas
  const imgData = offCtx.createImageData(W, H);
  const data = imgData.data;

  for (let i = 0; i < W * H; i++) {
    const val = Math.max(0, Math.min(1, gridB[i] * 2.8));
    const idx = i * 4;

    data[idx] = Math.floor(10 + val * 230);
    data[idx + 1] = Math.floor(12 + val * 50);
    data[idx + 2] = Math.floor(22 + val * 120);
    data[idx + 3] = 255;
  }

  offCtx.putImageData(imgData, 0, 0);

  // Upscale to main screen with smooth bilinear filtering
  ctx.drawImage(offscreen, 0, 0, width, height);
}
`
};
