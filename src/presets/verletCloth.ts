import { PresetAnimation } from '../types/animation';

export const verletClothPreset: PresetAnimation = {
  id: 'verlet-cloth-simulation',
  title: 'Verlet Cloth Physics & Dynamic Wind Field',
  prompt: 'A realistic cloth mesh simulation with Verlet integration, structural spring constraints, dynamic wind turbulence, and mouse grab tearing',
  description: 'Simulates physics cloth fabric with mass-spring constraints, gravitational pull, turbulent wind vectors, and direct mouse interaction.',
  category: 'Cosmic & Physics',
  engine: 'canvas2d',
  badge: 'Verlet Physics',
  duration: 10,
  parameters: {
    windStrength: {
      id: 'windStrength',
      label: 'Wind Turbulence',
      type: 'number',
      value: 1.4,
      min: 0,
      max: 3.5,
      step: 0.1,
      category: 'physics'
    },
    gravityVal: {
      id: 'gravityVal',
      label: 'Gravity',
      type: 'number',
      value: 0.35,
      min: 0,
      max: 1.0,
      step: 0.05,
      category: 'physics'
    },
    clothColor: {
      id: 'clothColor',
      label: 'Fabric Color',
      type: 'color',
      value: '#ec4899',
      category: 'colors'
    },
    wireframeOnly: {
      id: 'wireframeOnly',
      label: 'Wireframe Grid Only',
      type: 'boolean',
      value: false,
      category: 'visual'
    }
  },
  postProcessing: {
    bloom: false,
    vignette: true
  },
  tags: ['Cloth', 'Physics', 'Verlet', 'Wind', 'Interactive'],
  code: `// Verlet Cloth Physics with Mass-Spring Constraints
const COLS = 26;
const ROWS = 18;
const SPACING = 18;
const points = [];
const constraints = [];

// Initialize grid points
for (let y = 0; y < ROWS; y++) {
  for (let x = 0; x < COLS; x++) {
    const px = 200 + x * SPACING;
    const py = 90 + y * SPACING;
    const pinned = (y === 0 && (x % 4 === 0 || x === COLS - 1));
    points.push({
      x: px,
      y: py,
      oldX: px,
      oldY: py,
      pinned,
      col: x,
      row: y
    });
  }
}

// Build constraints (horizontal and vertical springs)
for (let y = 0; y < ROWS; y++) {
  for (let x = 0; x < COLS; x++) {
    const idx = y * COLS + x;
    // Horizontal link
    if (x < COLS - 1) {
      constraints.push({ p1: idx, p2: idx + 1, dist: SPACING });
    }
    // Vertical link
    if (y < ROWS - 1) {
      constraints.push({ p1: idx, p2: idx + COLS, dist: SPACING });
    }
  }
}

function render({ ctx, width, height, time, params, mouse, audioData }) {
  ctx.fillStyle = '#070913';
  ctx.fillRect(0, 0, width, height);

  const wind = params.windStrength || 1.4;
  const gravity = params.gravityVal || 0.35;
  const color = params.clothColor || '#ec4899';
  const audioPulse = audioData ? audioData.bass * 2.0 : 0;

  const mx = (mouse.x + 1) * 0.5 * width;
  const my = (-mouse.y + 1) * 0.5 * height;

  // 1. Verlet Integration (Velocity from displacement)
  for (let p of points) {
    if (p.pinned) continue;

    const vx = (p.x - p.oldX) * 0.98;
    const vy = (p.y - p.oldY) * 0.98;

    p.oldX = p.x;
    p.oldY = p.y;

    // Wind wave
    const windForce = Math.sin(time * 3 + p.row * 0.4) * (0.8 * wind) + (wind * 0.6) + audioPulse * 0.5;
    
    // Mouse grab interaction
    let mouseForceX = 0;
    let mouseForceY = 0;
    if (mouse.isDown) {
      const dx = mx - p.x;
      const dy = my - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        mouseForceX = (dx / (dist + 1)) * 4.0;
        mouseForceY = (dy / (dist + 1)) * 4.0;
      }
    }

    p.x += vx + windForce + mouseForceX;
    p.y += vy + gravity + mouseForceY;
  }

  // 2. Solve Constraints (Relaxation iterations)
  const iterations = 5;
  for (let iter = 0; iter < iterations; iter++) {
    for (let c of constraints) {
      const p1 = points[c.p1];
      const p2 = points[c.p2];

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const diff = (c.dist - dist) / (dist || 1);

      const offsetX = dx * diff * 0.5;
      const offsetY = dy * diff * 0.5;

      if (!p1.pinned) {
        p1.x -= offsetX;
        p1.y -= offsetY;
      }
      if (!p2.pinned) {
        p2.x += offsetX;
        p2.y += offsetY;
      }
    }
  }

  // 3. Render Cloth (Filled quads or wireframe)
  const isWireframe = params.wireframeOnly;

  if (!isWireframe) {
    for (let y = 0; y < ROWS - 1; y++) {
      for (let x = 0; x < COLS - 1; x++) {
        const i1 = y * COLS + x;
        const i2 = y * COLS + (x + 1);
        const i3 = (y + 1) * COLS + (x + 1);
        const i4 = (y + 1) * COLS + x;

        const p1 = points[i1];
        const p2 = points[i2];
        const p3 = points[i3];
        const p4 = points[i4];

        // Normal-based fake shading
        const depth = Math.sin(p1.x * 0.02 + time * 2) * 0.3 + 0.7;

        ctx.fillStyle = color;
        ctx.globalAlpha = 0.55 * depth;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.lineTo(p4.x, p4.y);
        ctx.closePath();
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  // Draw Springs
  ctx.strokeStyle = isWireframe ? color : 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let c of constraints) {
    const p1 = points[c.p1];
    const p2 = points[c.p2];
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
  }
  ctx.stroke();

  // Pin anchors
  ctx.fillStyle = '#ffffff';
  for (let p of points) {
    if (p.pinned) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
`
};
