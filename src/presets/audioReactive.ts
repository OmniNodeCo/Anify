import { PresetAnimation } from '../types/animation';

export const audioReactivePreset: PresetAnimation = {
  id: 'holographic-audio-starburst',
  title: 'Holographic Audio Equalizer & Starburst',
  prompt: 'A 3D radial holographic audio visualizer reacting to frequency spectrum data with pulsing circular oscilloscope, bass shockwaves, and explosive starburst particles',
  description: 'Full frequency-domain FFT audio visualizer with circular radial spectrum bars, beat-detection shockwaves, and particle burst dynamics.',
  category: 'Cyber & HUD',
  engine: 'canvas2d',
  badge: 'Audio FFT',
  duration: 10,
  parameters: {
    radialBars: {
      id: 'radialBars',
      label: 'Radial Bar Count',
      type: 'number',
      value: 64,
      min: 32,
      max: 128,
      step: 4,
      category: 'visual'
    },
    sensitivity: {
      id: 'sensitivity',
      label: 'Audio Reactivity Sensitivity',
      type: 'number',
      value: 1.6,
      min: 0.5,
      max: 3.0,
      step: 0.1,
      category: 'physics'
    },
    baseRadius: {
      id: 'baseRadius',
      label: 'Inner Ring Radius',
      type: 'number',
      value: 110,
      min: 50,
      max: 220,
      step: 5,
      category: 'visual'
    },
    pulseColor: {
      id: 'pulseColor',
      label: 'Bass Core Color',
      type: 'color',
      value: '#8b5cf6',
      category: 'colors'
    },
    barColor: {
      id: 'barColor',
      label: 'Highs Color',
      type: 'color',
      value: '#06b6d4',
      category: 'colors'
    }
  },
  postProcessing: {
    bloom: true,
    bloomIntensity: 1.8,
    bloomRadius: 20,
    chromaticAberration: true
  },
  tags: ['Audio Reactive', 'Music', 'Visualizer', 'Equalizer', 'Spectrum'],
  code: `// Holographic Audio Equalizer & Starburst
const shockwaves = [];
const sparks = [];

for (let i = 0; i < 180; i++) {
  sparks.push({
    angle: Math.random() * Math.PI * 2,
    dist: 120 + Math.random() * 200,
    speed: 1 + Math.random() * 3,
    size: 1 + Math.random() * 2.5,
    hue: Math.random() * 60 + 180
  });
}

let lastBass = 0;

function render({ ctx, width, height, time, params, mouse, audioData }) {
  ctx.fillStyle = '#060712';
  ctx.fillRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2;
  const bars = params.radialBars || 64;
  const sensitivity = params.sensitivity || 1.6;
  const baseR = params.baseRadius || 110;
  const pulseCol = params.pulseColor || '#8b5cf6';
  const barCol = params.barColor || '#06b6d4';

  const bass = audioData ? audioData.bass * sensitivity : (Math.sin(time * 5) * 0.4 + 0.6);
  const treble = audioData ? audioData.treble * sensitivity : (Math.cos(time * 7) * 0.3 + 0.5);
  const freq = (audioData && audioData.frequency) ? audioData.frequency : null;

  // Beat kick shockwave detection
  if (bass > 0.8 && bass - lastBass > 0.25) {
    shockwaves.push({ r: baseR, alpha: 1.0, speed: 8 + bass * 6 });
  }
  lastBass = bass;

  // 1. Expanding Shockwaves
  for (let i = shockwaves.length - 1; i >= 0; i--) {
    const sw = shockwaves[i];
    sw.r += sw.speed;
    sw.alpha *= 0.94;

    ctx.strokeStyle = pulseCol;
    ctx.lineWidth = 3;
    ctx.globalAlpha = sw.alpha;
    ctx.beginPath();
    ctx.arc(cx, cy, sw.r, 0, Math.PI * 2);
    ctx.stroke();

    if (sw.alpha < 0.05) shockwaves.splice(i, 1);
  }
  ctx.globalAlpha = 1.0;

  // 2. Central Core Pulsing Orb
  const currentR = baseR * (1 + bass * 0.3);
  const coreGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, currentR);
  coreGrad.addColorStop(0, '#ffffff');
  coreGrad.addColorStop(0.3, pulseCol);
  coreGrad.addColorStop(0.8, 'rgba(139, 92, 246, 0.2)');
  coreGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, currentR, 0, Math.PI * 2);
  ctx.fill();

  // 3. Radial Frequency Spectrum Bars
  const angleStep = (Math.PI * 2) / bars;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(time * 0.15);

  for (let i = 0; i < bars; i++) {
    const angle = i * angleStep;
    // Sample frequency bin or synthetic wave
    let amp = 0.3;
    if (freq && freq.length > 0) {
      const binIdx = Math.floor((i / bars) * (freq.length / 2));
      amp = (freq[binIdx] / 255) * sensitivity;
    } else {
      amp = (Math.sin(time * 6 + i * 0.3) * 0.5 + 0.5) * sensitivity;
    }

    const barLen = 15 + amp * 120;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    const x1 = cosA * currentR;
    const y1 = sinA * currentR;
    const x2 = cosA * (currentR + barLen);
    const y2 = sinA * (currentR + barLen);

    const grad = ctx.createLinearGradient(x1, y1, x2, y2);
    grad.addColorStop(0, pulseCol);
    grad.addColorStop(1, barCol);

    ctx.strokeStyle = grad;
    ctx.lineWidth = Math.max(2, (Math.PI * 2 * currentR) / bars * 0.6);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Peak dot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x2, y2, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 4. Starburst Audio Sparks
  for (let s of sparks) {
    s.dist += s.speed * (1 + bass * 3);
    if (s.dist > Math.max(width, height) * 0.6) {
      s.dist = currentR + 10;
      s.angle = Math.random() * Math.PI * 2;
    }

    const px = cx + Math.cos(s.angle) * s.dist;
    const py = cy + Math.sin(s.angle) * s.dist;

    ctx.fillStyle = \`hsl(\${s.hue}, 100%, 75%)\`;
    ctx.beginPath();
    ctx.arc(px, py, s.size * (1 + treble * 0.8), 0, Math.PI * 2);
    ctx.fill();
  }
}
`
};
