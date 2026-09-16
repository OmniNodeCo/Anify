import { PresetAnimation } from '../types/animation';

export const tesseractPreset: PresetAnimation = {
  id: '4d-tesseract-hypercube',
  title: '4D Tesseract & Hyper-Dimensional Geometry',
  prompt: 'A rotating 4D hypercube (tesseract) projected into 3D and 2D with glowing edges, chromatic vertices, and dimensional rotation across the XW and YZ planes',
  description: 'Mathematical 4-dimensional polytope perspective projection rotating through 4D space with dynamic vertex coordinates.',
  category: 'Math & Fractals',
  engine: 'canvas2d',
  badge: '4D Math',
  duration: 8,
  parameters: {
    rotationSpeed4D: {
      id: 'rotationSpeed4D',
      label: '4D Hyper-Rotation Speed',
      type: 'number',
      value: 1.2,
      min: 0.1,
      max: 3.5,
      step: 0.1,
      category: 'physics'
    },
    hypercubeSize: {
      id: 'hypercubeSize',
      label: 'Scale Size',
      type: 'number',
      value: 220,
      min: 80,
      max: 400,
      step: 10,
      category: 'visual'
    },
    edgeGlow: {
      id: 'edgeGlow',
      label: 'Edge Color',
      type: 'color',
      value: '#00f2fe',
      category: 'colors'
    },
    innerEdgeColor: {
      id: 'innerEdgeColor',
      label: 'Inner Facet Color',
      type: 'color',
      value: '#ff007f',
      category: 'colors'
    },
    wireframeWidth: {
      id: 'wireframeWidth',
      label: 'Edge Line Width',
      type: 'number',
      value: 2.5,
      min: 1,
      max: 6,
      step: 0.5,
      category: 'visual'
    }
  },
  postProcessing: {
    bloom: true,
    bloomIntensity: 1.6,
    bloomRadius: 18,
    chromaticAberration: true
  },
  tags: ['4D', 'Tesseract', 'Math', 'Sacred Geometry', 'Hypercube'],
  code: `// 4D Tesseract (Hypercube) Projection
// 16 4D vertices: (±1, ±1, ±1, ±1)
const vertices4D = [];
for (let i = 0; i < 16; i++) {
  vertices4D.push([
    (i & 1) ? 1 : -1,
    (i & 2) ? 1 : -1,
    (i & 4) ? 1 : -1,
    (i & 8) ? 1 : -1
  ]);
}

// 32 edges connecting vertices that differ by only 1 bit
const edges = [];
for (let i = 0; i < 16; i++) {
  for (let j = i + 1; j < 16; j++) {
    // Check if Hamming distance == 1
    const xor = i ^ j;
    if ((xor & (xor - 1)) === 0) {
      edges.push([i, j]);
    }
  }
}

function render({ ctx, width, height, time, params, mouse, audioData }) {
  ctx.fillStyle = '#05060b';
  ctx.fillRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2;
  const scale = params.hypercubeSize || 220;
  const speed = params.rotationSpeed4D || 1.2;
  const edgeColor = params.edgeGlow || '#00f2fe';
  const innerColor = params.innerEdgeColor || '#ff007f';
  const lw = params.wireframeWidth || 2.5;
  const audioPulse = 1 + (audioData ? audioData.bass * 0.4 : 0);

  // 4D Rotation angles
  const aXW = time * 0.8 * speed;
  const aYZ = time * 0.6 * speed;
  const aXY = mouse.x * 2;
  const aXZ = -mouse.y * 2;

  // Transform 4D vertices
  const projected = vertices4D.map(v => {
    let [x, y, z, w] = v;

    // Rotate in XW plane
    let cos = Math.cos(aXW), sin = Math.sin(aXW);
    let x1 = x * cos - w * sin;
    let w1 = x * sin + w * cos;

    // Rotate in YZ plane
    cos = Math.cos(aYZ); sin = Math.sin(aYZ);
    let y1 = y * cos - z * sin;
    let z1 = y * sin + z * cos;

    // Rotate in 3D (camera tilt / mouse)
    cos = Math.cos(aXY); sin = Math.sin(aXY);
    let x2 = x1 * cos - y1 * sin;
    let y2 = x1 * sin + y1 * cos;

    cos = Math.cos(aXZ); sin = Math.sin(aXZ);
    let x3 = x2 * cos - z1 * sin;
    let z3 = x2 * sin + z1 * cos;

    // 4D to 3D perspective projection
    const distance4D = 2.4;
    const wProj = 1 / (distance4D - w1);
    const px3D = x3 * wProj;
    const py3D = y2 * wProj;
    const pz3D = z3 * wProj;

    // 3D to 2D screen projection
    const distance3D = 3.2;
    const zProj = 1 / (distance3D - pz3D);
    const screenX = cx + px3D * zProj * scale * audioPulse;
    const screenY = cy + py3D * zProj * scale * audioPulse;

    return {
      x: screenX,
      y: screenY,
      w: w1,
      z: pz3D,
      scale: zProj * 1.5
    };
  });

  // Draw 4D Hypercube edges
  ctx.lineWidth = lw;
  for (let [i, j] of edges) {
    const p1 = projected[i];
    const p2 = projected[j];

    // Check depth to interpolate color between 4D layers
    const avgW = (p1.w + p2.w) / 2;
    const alpha = Math.max(0.15, Math.min(1, 0.6 + avgW * 0.4));

    ctx.strokeStyle = avgW > 0 ? edgeColor : innerColor;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Draw Glowing Vertices
  for (let p of projected) {
    const r = Math.max(2.5, 4.5 * p.scale);
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = p.w > 0 ? edgeColor : innerColor;
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}
`
};
