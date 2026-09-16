import { PresetAnimation } from '../types/animation';

export const kineticTextPreset: PresetAnimation = {
  id: 'kinetic-typography-motion',
  title: 'Kinetic Typography & Tech Brand Reveal',
  prompt: 'Modern Swiss kinetic typography animation with staggered spring-elastic text transitions, chromatic split slicing, dynamic grid lines, and particle accents',
  description: 'Clean high-end vector motion graphic sequence with spring-damped letter morphing, chromatic glitching, and layout dynamics.',
  category: 'Motion Graphics',
  engine: 'canvas2d',
  badge: 'Motion Graphic',
  duration: 6,
  parameters: {
    headlineText: {
      id: 'headlineText',
      label: 'Main Headline',
      type: 'select',
      value: 'INNOVATION',
      options: [
        { label: 'INNOVATION', value: 'INNOVATION' },
        { label: 'FUTURE AI', value: 'FUTURE AI' },
        { label: 'SUPERHUMAN', value: 'SUPERHUMAN' },
        { label: 'QUANTUM VELOCITY', value: 'QUANTUM' }
      ],
      category: 'visual'
    },
    accentColor: {
      id: 'accentColor',
      label: 'Accent Color',
      type: 'color',
      value: '#38bdf8',
      category: 'colors'
    },
    springTension: {
      id: 'springTension',
      label: 'Spring Bounce',
      type: 'number',
      value: 1.2,
      min: 0.5,
      max: 2.5,
      step: 0.1,
      category: 'physics'
    },
    chromaticSplit: {
      id: 'chromaticSplit',
      label: 'Chromatic Slice',
      type: 'number',
      value: 6,
      min: 0,
      max: 20,
      step: 1,
      category: 'visual'
    }
  },
  postProcessing: {
    bloom: false,
    chromaticAberration: true,
    vignette: true
  },
  tags: ['Typography', 'Motion Design', 'Branding', 'Minimalist', 'Kinetic'],
  code: `// Modern Swiss Kinetic Typography & Motion Graphics
function easeOutElastic(x) {
  const c4 = (2 * Math.PI) / 3;
  return x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
}

function easeInOutQuad(x) {
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}

function render({ ctx, width, height, time, params, mouse, audioData }) {
  // Dark luxury aesthetic
  ctx.fillStyle = '#08090e';
  ctx.fillRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2;
  const loopT = (time % 6);
  const text = params.headlineText || 'INNOVATION';
  const accent = params.accentColor || '#38bdf8';
  const split = params.chromaticSplit || 6;
  const bounce = params.springTension || 1.2;
  const audioPulse = audioData ? audioData.bass * 15 : 0;

  // 1. Dynamic Architectural Grid lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  const step = 60;
  for (let x = (time * 10) % step; x < width; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // 2. Animated Framing Brackets & Crosshairs
  const bracketExpand = Math.min(1, easeInOutQuad(Math.min(1, loopT / 0.8)));
  const boxW = (width * 0.75) * bracketExpand;
  const boxH = 260 * bracketExpand;

  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  
  // Top-left
  ctx.beginPath();
  ctx.moveTo(cx - boxW / 2 + 30, cy - boxH / 2);
  ctx.lineTo(cx - boxW / 2, cy - boxH / 2);
  ctx.lineTo(cx - boxW / 2, cy - boxH / 2 + 30);
  ctx.stroke();

  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(cx + boxW / 2 - 30, cy + boxH / 2);
  ctx.lineTo(cx + boxW / 2, cy + boxH / 2);
  ctx.lineTo(cx + boxW / 2, cy + boxH / 2 - 30);
  ctx.stroke();

  // 3. Staggered Kinetic Letters
  const letters = text.split('');
  const fontSize = Math.min(width / (letters.length + 1) * 1.5, 96);
  ctx.font = \`900 \${fontSize}px "Space Grotesk", "Inter", sans-serif\`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const totalWidth = letters.length * (fontSize * 0.65);
  const startX = cx - totalWidth / 2 + (fontSize * 0.325);

  letters.forEach((char, idx) => {
    // Delay each character's entrance
    const charDelay = 0.4 + idx * 0.08;
    const charProgress = Math.max(0, Math.min(1, (loopT - charDelay) / 0.7));
    const anim = easeOutElastic(charProgress) * bounce;

    const x = startX + idx * (fontSize * 0.65);
    const yOffset = (1 - Math.min(1, anim)) * 140;
    const y = cy + yOffset - audioPulse;
    const alpha = Math.min(1, charProgress * 1.5);

    if (alpha <= 0) return;

    ctx.save();
    ctx.globalAlpha = alpha;

    // Chromatic glitch split
    if (split > 0 && loopT > 1.2 && (loopT % 2 < 0.25 || audioPulse > 8)) {
      // Red shift
      ctx.fillStyle = '#ff0055';
      ctx.fillText(char, x - split, y);
      // Cyan shift
      ctx.fillStyle = '#00ffff';
      ctx.fillText(char, x + split, y);
    }

    // Main Crisp Text
    ctx.fillStyle = '#ffffff';
    ctx.fillText(char, x, y);
    ctx.restore();
  });

  // 4. Sub-header & Telemetry Ticker
  if (loopT > 1.0) {
    const subProgress = Math.min(1, (loopT - 1.0) / 0.5);
    ctx.globalAlpha = subProgress;
    ctx.font = '600 13px "Fira Code", monospace';
    ctx.fillStyle = accent;
    ctx.textAlign = 'center';
    ctx.fillText('// NEXT-GEN GENERATIVE ENGINE // SYSTEM READY', cx, cy + 95);

    // Coordinate markers
    ctx.font = '400 11px monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.textAlign = 'left';
    ctx.fillText(\`TIME: \${time.toFixed(2)}s\`, cx - boxW / 2 + 10, cy + boxH / 2 - 12);
    ctx.textAlign = 'right';
    ctx.fillText('FPS: 60 • ANIFY STUDIO', cx + boxW / 2 - 10, cy + boxH / 2 - 12);
    ctx.globalAlpha = 1;
  }
}
`
};
