import { PresetAnimation } from '../types/animation';

export const lorenzPreset: PresetAnimation = {
  id: 'lorenz-strange-attractor',
  title: 'Lorenz Strange Attractor & Chaos Dynamics',
  prompt: 'A mathematical 3D Lorenz strange attractor butterfly effect with thousands of luminous trailing trajectory points orbiting chaotic strange attractors',
  description: 'Solves the non-linear Lorenz differential system (dx/dt = σ(y - x), dy/dt = x(ρ - z) - y, dz/dt = xy - βz) rendered in 3D.',
  category: 'Math & Fractals',
  engine: 'canvas2d',
  badge: 'Chaos Math',
  duration: 10,
  parameters: {
    dtSpeed: {
      id: 'dtSpeed',
      label: 'Integration Speed',
      type: 'number',
      value: 1.5,
      min: 0.2,
      max: 3.5,
      step: 0.1,
      category: 'physics'
    },
    tailLength: {
      id: 'tailLength',
      label: 'Trajectory History Length',
      type: 'number',
      value: 2800,
      min: 500,
      max: 6000,
      step: 200,
      category: 'visual'
    },
    scaleZoom: {
      id: 'scaleZoom',
      label: '3D Scale',
      type: 'number',
      value: 9.5,
      min: 4,
      max: 18,
      step: 0.5,
      category: 'visual'
    },
    colorShift: {
      id: 'colorShift',
      label: 'Gradient Base Hue',
      type: 'number',
      value: 280,
      min: 0,
      max: 360,
      step: 5,
      category: 'colors'
    }
  },
  postProcessing: {
    bloom: true,
    bloomIntensity: 1.5,
    bloomRadius: 18,
    chromaticAberration: true
  },
  tags: ['Chaos', 'Lorenz', 'Attractor', 'Differential Equations', 'Math'],
  code: `// Lorenz Strange Attractor Differential Equations
// dx/dt = sigma*(y - x)
// dy/dt = x*(rho - z) - y
// dz/dt = x*y - beta*z
const sigma = 10.0;
const rho = 28.0;
const beta = 8.0 / 3.0;

let lx = 0.1, ly = 0, lz = 0;
const trajectory = [];

function render({ ctx, width, height, time, params, mouse, audioData }) {
  ctx.fillStyle = '#04050a';
  ctx.fillRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2 + 60;
  const dt = 0.007 * (params.dtSpeed || 1.5);
  const maxPoints = params.tailLength || 2800;
  const zoom = params.scaleZoom || 9.5;
  const baseHue = params.colorShift || 280;
  const audioPulse = audioData ? audioData.bass * 2 : 0;

  // Integrate multiple steps per frame for smooth continuous trail
  for (let s = 0; s < 5; s++) {
    const dx = sigma * (ly - lx) * dt;
    const dy = (lx * (rho - lz) - ly) * dt;
    const dz = (lx * ly - beta * lz) * dt;

    lx += dx;
    ly += dy;
    lz += dz;

    trajectory.push({ x: lx, y: ly, z: lz });
    if (trajectory.length > maxPoints) {
      trajectory.shift();
    }
  }

  // 3D rotation angles
  const rotY = time * 0.4 + mouse.x * 2.0;
  const rotX = 0.3 + -mouse.y * 1.2;
  const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
  const cosX = Math.cos(rotX), sinX = Math.sin(rotX);

  ctx.lineWidth = 1.4;

  for (let i = 1; i < trajectory.length; i++) {
    const p1 = trajectory[i - 1];
    const p2 = trajectory[i];

    // Center Z around attractor center (~25)
    const zCenter = 25;

    // Rotate P1
    let x1 = p1.x * cosY - (p1.z - zCenter) * sinY;
    let z1 = (p1.z - zCenter) * cosY + p1.x * sinY;
    let y1 = p1.y * cosX - z1 * sinX;

    // Rotate P2
    let x2 = p2.x * cosY - (p2.z - zCenter) * sinY;
    let z2 = (p2.z - zCenter) * cosY + p2.x * sinY;
    let y2 = p2.y * cosX - z2 * sinX;

    const screenX1 = cx + x1 * zoom;
    const screenY1 = cy - y1 * zoom;
    const screenX2 = cx + x2 * zoom;
    const screenY2 = cy - y2 * zoom;

    const progress = i / trajectory.length;
    const hue = (baseHue + progress * 140) % 360;
    const alpha = Math.max(0.08, Math.pow(progress, 1.8));

    ctx.strokeStyle = \`hsla(\${hue}, 95%, 62%, \${alpha})\`;
    ctx.beginPath();
    ctx.moveTo(screenX1, screenY1);
    ctx.lineTo(screenX2, screenY2);
    ctx.stroke();
  }

  // Current lead point
  if (trajectory.length > 0) {
    const lead = trajectory[trajectory.length - 1];
    let lxRot = lead.x * cosY - (lead.z - 25) * sinY;
    let lzRot = (lead.z - 25) * cosY + lead.x * sinY;
    let lyRot = lead.y * cosX - lzRot * sinX;

    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#00f2fe';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(cx + lxRot * zoom, cy - lyRot * zoom, 4 + audioPulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}
`
};
