import { PresetAnimation } from '../types/animation';

export const solarSystemPreset: PresetAnimation = {
  id: 'solar-corona-planetary',
  title: 'Solar Corona & Keplerian Orbital Mechanics',
  prompt: 'A blazing star with dynamic solar coronal flares, orbiting terrestrial planets with atmospheric light scattering, planetary rings, and cosmic dust',
  description: 'Simulates gravitational orbital motion, planetary rings, solar wind particle flares, and atmospheric rim lighting.',
  category: 'Cosmic & Physics',
  engine: 'canvas2d',
  badge: 'Celestial',
  duration: 14,
  parameters: {
    orbitSpeed: {
      id: 'orbitSpeed',
      label: 'Orbital Velocity',
      type: 'number',
      value: 1.0,
      min: 0.2,
      max: 3.0,
      step: 0.1,
      category: 'physics'
    },
    flareIntensity: {
      id: 'flareIntensity',
      label: 'Solar Flares',
      type: 'number',
      value: 1.4,
      min: 0.2,
      max: 3.0,
      step: 0.1,
      category: 'visual'
    },
    sunColor: {
      id: 'sunColor',
      label: 'Star Core Color',
      type: 'color',
      value: '#ffaa00',
      category: 'colors'
    },
    cameraTilt: {
      id: 'cameraTilt',
      label: 'Orbital Plane Tilt',
      type: 'number',
      value: 0.35,
      min: 0.1,
      max: 0.8,
      step: 0.05,
      category: 'camera'
    }
  },
  postProcessing: {
    bloom: true,
    bloomIntensity: 1.8,
    bloomRadius: 24,
    vignette: true
  },
  tags: ['Sun', 'Planets', 'Space', 'Orbit', 'Solar Flares'],
  code: `// Solar Corona & Keplerian Orbital Mechanics
const planets = [
  { name: 'Mercury', r: 75, size: 4, speed: 4.1, color: '#a3a3a3', trail: [] },
  { name: 'Venus', r: 115, size: 7, speed: 1.6, color: '#eab308', trail: [] },
  { name: 'Earth', r: 165, size: 8, speed: 1.0, color: '#38bdf8', ring: false, trail: [] },
  { name: 'Mars', r: 215, size: 5, speed: 0.53, color: '#ef4444', trail: [] },
  { name: 'Jupiter', r: 285, size: 18, speed: 0.2, color: '#fb923c', trail: [] },
  { name: 'Saturn', r: 360, size: 14, speed: 0.12, color: '#fef08a', ring: true, trail: [] },
];

const flares = [];
for (let i = 0; i < 40; i++) {
  flares.push({
    angle: Math.random() * Math.PI * 2,
    len: 10 + Math.random() * 35,
    speed: 0.5 + Math.random() * 1.5,
    width: 2 + Math.random() * 4
  });
}

function render({ ctx, width, height, time, params, mouse, audioData }) {
  ctx.fillStyle = '#030408';
  ctx.fillRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2;
  const speedMul = params.orbitSpeed || 1.0;
  const tilt = params.cameraTilt || 0.35;
  const flareMul = params.flareIntensity || 1.4;
  const sunCol = params.sunColor || '#ffaa00';
  const sunR = 40 * (1 + (audioData ? audioData.bass * 0.25 : 0));

  // 1. Solar Corona Ambient Glow
  const coronaGrad = ctx.createRadialGradient(cx, cy, sunR * 0.8, cx, cy, sunR * 4.5);
  coronaGrad.addColorStop(0, 'rgba(255, 230, 150, 0.9)');
  coronaGrad.addColorStop(0.2, sunCol);
  coronaGrad.addColorStop(0.6, 'rgba(255, 60, 0, 0.2)');
  coronaGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = coronaGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, sunR * 4.5, 0, Math.PI * 2);
  ctx.fill();

  // 2. Dynamic Solar Flares & Prominences
  ctx.save();
  ctx.translate(cx, cy);
  for (let f of flares) {
    const curAngle = f.angle + time * 0.2 * f.speed;
    const wave = Math.sin(time * 3 + f.angle * 4) * 12 * flareMul;
    const flareLen = sunR + f.len * flareMul + wave;

    const x1 = Math.cos(curAngle) * sunR;
    const y1 = Math.sin(curAngle) * sunR;
    const x2 = Math.cos(curAngle + 0.1) * flareLen;
    const y2 = Math.sin(curAngle + 0.1) * flareLen;

    ctx.strokeStyle = 'rgba(255, 200, 50, 0.6)';
    ctx.lineWidth = f.width;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(x2 * 1.1, y2 * 1.1, Math.cos(curAngle + 0.2) * sunR, Math.sin(curAngle + 0.2) * sunR);
    ctx.stroke();
  }
  ctx.restore();

  // 3. Central Star Core
  ctx.save();
  ctx.shadowColor = sunCol;
  ctx.shadowBlur = 35;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx, cy, sunR, 0, Math.PI * 2);
  ctx.fill();

  const coreGrad = ctx.createRadialGradient(cx - sunR * 0.2, cy - sunR * 0.2, 5, cx, cy, sunR);
  coreGrad.addColorStop(0, '#ffffff');
  coreGrad.addColorStop(0.4, '#fff7ed');
  coreGrad.addColorStop(0.8, sunCol);
  coreGrad.addColorStop(1, '#ea580c');
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, sunR, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 4. Orbital Ellipses and Planets
  planets.forEach((p, idx) => {
    // Draw orbit track
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(cx, cy, p.r, p.r * tilt, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Planet position
    const theta = time * p.speed * speedMul * 0.6 + idx * 1.2;
    const px = cx + Math.cos(theta) * p.r;
    const py = cy + Math.sin(theta) * p.r * tilt;

    // Saturn Ring
    if (p.ring) {
      ctx.save();
      ctx.translate(px, py);
      ctx.strokeStyle = 'rgba(220, 200, 150, 0.6)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size * 2.2, p.size * 0.7, -0.3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Planet sphere with sunlight shading
    ctx.save();
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(px, py, p.size, 0, Math.PI * 2);
    ctx.fill();

    // Atmospheric rim glow facing the sun
    const angleToSun = Math.atan2(cy - py, cx - px);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(px, py, p.size + 0.5, angleToSun - Math.PI * 0.4, angleToSun + Math.PI * 0.4);
    ctx.stroke();
    ctx.restore();
  });
}
`
};
