import { PresetAnimation } from '../types/animation';

export const sciFiHUDPreset: PresetAnimation = {
  id: 'scifi-tactical-hud',
  title: 'Sci-Fi Holographic HUD & Tactical Targeting',
  prompt: 'A futuristic holographic sci-fi tactical HUD interface with rotating telemetry rings, lock-on target crosshairs, waveform monitors, and azimuth compass',
  description: 'Military sci-fi UI motion design with rotating concentric dial rings, dynamic reticles, lock-on tracking, and telemetry data readouts.',
  category: 'Cyber & HUD',
  engine: 'canvas2d',
  badge: 'Sci-Fi HUD',
  duration: 8,
  parameters: {
    hudColor: {
      id: 'hudColor',
      label: 'Interface Glow',
      type: 'color',
      value: '#00f2fe',
      category: 'colors'
    },
    targetLock: {
      id: 'targetLock',
      label: 'Track Mouse Target',
      type: 'boolean',
      value: true,
      category: 'visual'
    },
    reticleScale: {
      id: 'reticleScale',
      label: 'HUD Diameter',
      type: 'number',
      value: 180,
      min: 80,
      max: 300,
      step: 10,
      category: 'visual'
    },
    dialSpeed: {
      id: 'dialSpeed',
      label: 'Dial Rotation Speed',
      type: 'number',
      value: 1.2,
      min: 0.2,
      max: 3.5,
      step: 0.1,
      category: 'physics'
    }
  },
  postProcessing: {
    bloom: true,
    bloomIntensity: 1.6,
    bloomRadius: 16,
    scanlines: true,
    vignette: true
  },
  tags: ['HUD', 'Sci-Fi', 'Hologram', 'Interface', 'Cybernetic'],
  code: `// Sci-Fi Holographic HUD & Tactical Targeting
function render({ ctx, width, height, time, params, mouse, audioData }) {
  ctx.fillStyle = '#05070e';
  ctx.fillRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2;
  const col = params.hudColor || '#00f2fe';
  const r = params.reticleScale || 180;
  const speed = params.dialSpeed || 1.2;
  const audioPulse = audioData ? audioData.bass * 15 : 0;

  // Target coordinates (interpolating towards mouse)
  const tx = params.targetLock ? cx + mouse.x * (width * 0.35) : cx;
  const ty = params.targetLock ? cy - mouse.y * (height * 0.35) : cy;

  ctx.strokeStyle = col;
  ctx.fillStyle = col;
  ctx.lineWidth = 1.5;

  // 1. Center concentric rotating dials
  ctx.save();
  ctx.translate(cx, cy);

  // Outer segmented ring
  ctx.save();
  ctx.rotate(time * 0.4 * speed);
  ctx.beginPath();
  ctx.arc(0, 0, r + 40, 0, Math.PI * 1.5);
  ctx.stroke();

  // Tick marks
  for (let i = 0; i < 36; i++) {
    const angle = (i * Math.PI) / 18;
    const len = i % 3 === 0 ? 12 : 6;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * (r + 40), Math.sin(angle) * (r + 40));
    ctx.lineTo(Math.cos(angle) * (r + 40 + len), Math.sin(angle) * (r + 40 + len));
    ctx.stroke();
  }
  ctx.restore();

  // Middle counter-rotating dashed ring
  ctx.save();
  ctx.rotate(-time * 0.6 * speed);
  ctx.setLineDash([14, 8]);
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // Inner cardinal reticle
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.6 + audioPulse, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();

  // 2. Lock-on Crosshair tracking Target
  ctx.save();
  ctx.translate(tx, ty);

  // Bounding reticle box
  const boxS = 35 + Math.sin(time * 8) * 4;
  ctx.beginPath();
  // Corner brackets
  ctx.moveTo(-boxS, -boxS + 12); ctx.lineTo(-boxS, -boxS); ctx.lineTo(-boxS + 12, -boxS);
  ctx.moveTo(boxS - 12, -boxS); ctx.lineTo(boxS, -boxS); ctx.lineTo(boxS, -boxS + 12);
  ctx.moveTo(boxS, boxS - 12); ctx.lineTo(boxS, boxS); ctx.lineTo(boxS - 12, boxS);
  ctx.moveTo(-boxS + 12, boxS); ctx.lineTo(-boxS, boxS); ctx.lineTo(-boxS, boxS - 12);
  ctx.stroke();

  // Central dot
  ctx.beginPath();
  ctx.arc(0, 0, 3, 0, Math.PI * 2);
  ctx.fill();

  // Lock telemetry text
  ctx.font = '600 10px monospace';
  ctx.fillText('TARGET LOCK: 98.4%', boxS + 8, -boxS + 10);
  ctx.fillText(\`RANGE: \${(1450 + Math.sin(time) * 50).toFixed(0)}m\`, boxS + 8, -boxS + 24);
  ctx.restore();

  // 3. Bottom Oscilloscope Waveform
  const waveY = height - 60;
  ctx.beginPath();
  ctx.moveTo(50, waveY);
  for (let x = 50; x < width - 50; x += 6) {
    const norm = (x - 50) / (width - 100);
    const yVal = Math.sin(norm * 25 + time * 6) * 12 * (1 + (audioData ? audioData.treble * 2 : 0.5));
    ctx.lineTo(x, waveY + yVal);
  }
  ctx.stroke();

  // 4. Header status readouts
  ctx.font = '700 12px "Space Grotesk", monospace';
  ctx.fillText('SYS.ORBITAL_DEFENSE // ACTIVE', 40, 45);
  ctx.font = '400 10px monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.fillText(\`COORDS: LAT \${(34.05 + mouse.x * 2).toFixed(3)} | LNG \${(-118.25 + mouse.y * 2).toFixed(3)}\`, 40, 62);
  ctx.fillText(\`QUANTUM MATRIX: STABLE [T+\${time.toFixed(1)}s]\`, 40, 78);
}
`
};
