import { PresetAnimation } from '../types/animation';

export const blackHolePreset: PresetAnimation = {
  id: 'quantum-black-hole',
  title: 'Quantum Black Hole & Gravitational Lensing',
  prompt: 'A hyper-realistic black hole with relativistic accretion disk, photon sphere, gravitational light bending, and cosmic plasma jets',
  description: 'Simulates general relativity light bending around a Schwarzschild black hole with Doppler beaming and particle accretion disk.',
  category: 'Cosmic & Physics',
  engine: 'canvas2d',
  badge: 'Relativity',
  duration: 10,
  parameters: {
    eventHorizonRadius: {
      id: 'eventHorizonRadius',
      label: 'Event Horizon Size',
      type: 'number',
      value: 65,
      min: 20,
      max: 150,
      step: 1,
      category: 'physics'
    },
    diskDensity: {
      id: 'diskDensity',
      label: 'Accretion Disk Density',
      type: 'number',
      value: 1200,
      min: 200,
      max: 3000,
      step: 50,
      category: 'physics'
    },
    spinSpeed: {
      id: 'spinSpeed',
      label: 'Accretion Spin Speed',
      type: 'number',
      value: 1.2,
      min: 0.1,
      max: 4.0,
      step: 0.1,
      category: 'physics'
    },
    lensingPower: {
      id: 'lensingPower',
      label: 'Gravitational Lensing',
      type: 'number',
      value: 1.5,
      min: 0.5,
      max: 3.0,
      step: 0.1,
      category: 'physics'
    },
    primaryColor: {
      id: 'primaryColor',
      label: 'Plasma Glow Color',
      type: 'color',
      value: '#ff7700',
      category: 'colors'
    },
    secondaryColor: {
      id: 'secondaryColor',
      label: 'Relativistic Blue Shift',
      type: 'color',
      value: '#00d4ff',
      category: 'colors'
    },
    jetIntensity: {
      id: 'jetIntensity',
      label: 'Relativistic Jets',
      type: 'number',
      value: 0.8,
      min: 0,
      max: 2.0,
      step: 0.1,
      category: 'visual'
    }
  },
  postProcessing: {
    bloom: true,
    bloomIntensity: 1.4,
    bloomRadius: 18,
    vignette: true,
    vignetteDarkness: 0.8,
    chromaticAberration: true,
    aberrationAmount: 3
  },
  tags: ['Black Hole', 'Astrophysics', 'Simulation', 'Space', 'Gravitational Lensing'],
  code: `// Quantum Black Hole with Relativistic Accretion Disk & Lensing
const particles = [];
const NUM_PARTICLES = 1600;

for (let i = 0; i < NUM_PARTICLES; i++) {
  const angle = Math.random() * Math.PI * 2;
  const radius = 80 + Math.pow(Math.random(), 1.5) * 280;
  particles.push({
    angle,
    radius,
    baseRadius: radius,
    speed: (0.8 + Math.random() * 0.6) / Math.sqrt(radius),
    size: 0.8 + Math.random() * 2.2,
    brightness: 0.3 + Math.random() * 0.7,
    layer: Math.random() > 0.5 ? 1 : -1,
    drift: Math.random() * 0.1
  });
}

const stars = [];
for (let i = 0; i < 300; i++) {
  stars.push({
    x: (Math.random() - 0.5) * 1600,
    y: (Math.random() - 0.5) * 1200,
    size: 0.5 + Math.random() * 1.5,
    twinkle: Math.random() * Math.PI * 2
  });
}

function render({ ctx, width, height, time, params, mouse, audioData }) {
  // Clear with cosmic deep black
  ctx.fillStyle = '#05060b';
  ctx.fillRect(0, 0, width, height);

  const cx = width / 2 + mouse.x * 40;
  const cy = height / 2 - mouse.y * 30;
  const rs = params.eventHorizonRadius || 65;
  const spin = params.spinSpeed || 1.2;
  const lensing = params.lensingPower || 1.5;
  const audioPulse = 1 + (audioData ? audioData.bass * 0.35 : 0);
  const currentRs = rs * audioPulse;

  // 1. Background stars distorted by gravitational lensing
  ctx.save();
  for (let s of stars) {
    const dx = s.x - (cx - width / 2);
    const dy = s.y - (cy - height / 2);
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    // Einstein deflection angle
    let px = s.x + width / 2;
    let py = s.y + height / 2;
    if (dist > currentRs && dist < 500) {
      const deflection = (currentRs * currentRs * lensing * 0.4) / dist;
      px += (dx / dist) * deflection;
      py += (dy / dist) * deflection;
    }

    const alpha = (0.4 + 0.6 * Math.sin(time * 2 + s.twinkle));
    ctx.fillStyle = \`rgba(220, 235, 255, \${alpha})\`;
    ctx.beginPath();
    ctx.arc(px, py, s.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 2. Relativistic Plasma Jets (Bipolar outflows)
  const jetPower = params.jetIntensity || 0.8;
  if (jetPower > 0.05) {
    ctx.save();
    ctx.translate(cx, cy);
    for (let dir of [-1, 1]) {
      const grad = ctx.createLinearGradient(0, 0, 0, dir * 350 * jetPower);
      grad.addColorStop(0, 'rgba(0, 240, 255, 0.8)');
      grad.addColorStop(0.3, 'rgba(160, 50, 255, 0.4)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(-currentRs * 0.3, 0);
      ctx.lineTo(currentRs * 0.3, 0);
      ctx.lineTo(dir * 12, dir * 350 * jetPower);
      ctx.lineTo(-dir * 12, dir * 350 * jetPower);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // 3. Gravitational Lensing Halo (Einstein Ring & Secondary Image)
  ctx.save();
  const ringGrad = ctx.createRadialGradient(cx, cy, currentRs * 0.95, cx, cy, currentRs * 2.8);
  ringGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
  ringGrad.addColorStop(0.1, params.secondaryColor || '#00d4ff');
  ringGrad.addColorStop(0.4, params.primaryColor || '#ff7700');
  ringGrad.addColorStop(0.8, 'rgba(255, 80, 0, 0.15)');
  ringGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = ringGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, currentRs * 2.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 4. Accretion Disk (Upper & Lower bent projection)
  ctx.save();
  ctx.translate(cx, cy);

  const diskTilt = 0.28; // visual tilt angle
  const pCount = Math.min(particles.length, params.diskDensity || 1200);

  // Doppler beaming effect (left approaching side is blue-shifted & brighter)
  for (let i = 0; i < pCount; i++) {
    const p = particles[i];
    p.angle += p.speed * spin * 0.04;
    
    // Inward orbital spiral
    p.radius -= p.drift * 0.1;
    if (p.radius < currentRs * 1.1) {
      p.radius = 280 + Math.random() * 50;
    }

    const cosA = Math.cos(p.angle);
    const sinA = Math.sin(p.angle);
    
    // Relativistic bending: particles behind the event horizon curve over the top/bottom
    const x = cosA * p.radius;
    let y = sinA * p.radius * diskTilt;

    // Lensing distortion of the back of the disk
    if (sinA < 0) {
      const distFromCenter = Math.sqrt(x * x + y * y);
      if (distFromCenter < currentRs * 2.2) {
        y -= (currentRs * 1.2) * Math.sin(Math.acos(Math.max(-1, Math.min(1, x / (currentRs * 2.2)))));
      }
    }

    // Doppler shift: left side (cosA < 0) approaching observer
    const doppler = (-cosA + 1) * 0.5; // 0 to 1
    const pSize = p.size * (0.8 + 0.4 * doppler);
    
    const r = Math.floor(255 * (1 - doppler * 0.6));
    const g = Math.floor(120 + 80 * doppler);
    const b = Math.floor(50 + 205 * doppler);
    const alpha = (0.2 + 0.8 * p.brightness) * (0.5 + 0.5 * doppler);

    ctx.fillStyle = \`rgba(\${r}, \${g}, \${b}, \${alpha})\`;
    ctx.beginPath();
    ctx.arc(x, y, pSize, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 5. The Event Horizon (Pure Black Shadow + Photon Sphere Edge)
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, currentRs, 0, Math.PI * 2);
  ctx.fillStyle = '#000000';
  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = 12;
  ctx.fill();
  ctx.restore();

  // 6. Photon Sphere razor-thin white glow
  ctx.beginPath();
  ctx.arc(cx, cy, currentRs * 1.04, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.lineWidth = 2.5;
  ctx.stroke();
}
`
};
