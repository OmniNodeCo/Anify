import { PresetAnimation } from '../types/animation';

export const matrixRainPreset: PresetAnimation = {
  id: 'matrix-digital-cascade',
  title: 'Matrix Digital Rain & Cyber Decryption',
  prompt: 'A 3D cascading Matrix digital rain with cryptographic symbols, glowing leader glyphs, depth layers, and data stream shockwaves',
  description: 'Simulates the iconic cascading green digital cipher code with multi-layered depth, randomized glyph mutations, and bright leader heads.',
  category: 'Cyber & HUD',
  engine: 'canvas2d',
  badge: 'Cyber Matrix',
  duration: 10,
  parameters: {
    fallSpeed: {
      id: 'fallSpeed',
      label: 'Cascade Speed',
      type: 'number',
      value: 1.4,
      min: 0.4,
      max: 3.5,
      step: 0.1,
      category: 'physics'
    },
    codeColor: {
      id: 'codeColor',
      label: 'Glyph Color',
      type: 'color',
      value: '#22c55e',
      category: 'colors'
    },
    fontSize: {
      id: 'fontSize',
      label: 'Font Size',
      type: 'number',
      value: 16,
      min: 10,
      max: 28,
      step: 1,
      category: 'visual'
    },
    density: {
      id: 'density',
      label: 'Column Density',
      type: 'number',
      value: 1,
      min: 1,
      max: 3,
      step: 1,
      category: 'visual'
    }
  },
  postProcessing: {
    bloom: true,
    bloomIntensity: 1.5,
    bloomRadius: 18,
    scanlines: true
  },
  tags: ['Matrix', 'Cyber', 'Code', 'Hacker', 'Green'],
  code: `// Matrix Digital Rain & Cryptographic Cascade
const chars = '0123456789ABCDEFｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ';
let columns = null;

function initColumns(width, fontSize) {
  const colCount = Math.floor(width / fontSize);
  const cols = [];
  for (let i = 0; i < colCount; i++) {
    cols.push({
      y: Math.random() * -100,
      speed: 0.6 + Math.random() * 1.5,
      chars: [],
      length: 12 + Math.floor(Math.random() * 22)
    });
  }
  return cols;
}

function render({ ctx, width, height, time, params, mouse, audioData }) {
  const fs = params.fontSize || 16;
  const speed = params.fallSpeed || 1.4;
  const colColor = params.codeColor || '#22c55e';
  const audioPulse = audioData ? audioData.bass * 2 : 0;

  if (!columns || columns.length !== Math.floor(width / fs)) {
    columns = initColumns(width, fs);
  }

  // Semi-transparent black wash for trails
  ctx.fillStyle = 'rgba(5, 8, 12, 0.22)';
  ctx.fillRect(0, 0, width, height);

  ctx.font = \`bold \${fs}px "Fira Code", monospace\`;

  for (let c = 0; c < columns.length; c++) {
    const col = columns[c];
    col.y += col.speed * speed * (1 + audioPulse * 0.3);

    // If stream reaches bottom, reset to top
    if (col.y > height / fs + col.length) {
      col.y = -col.length;
      col.speed = 0.6 + Math.random() * 1.5;
      col.length = 12 + Math.floor(Math.random() * 22);
    }

    const leadY = Math.floor(col.y);

    for (let j = 0; j < col.length; j++) {
      const charY = leadY - j;
      if (charY < 0 || charY > height / fs) continue;

      const px = c * fs;
      const py = charY * fs;

      // Randomly mutate characters
      if (Math.random() > 0.96 || !col.chars[j]) {
        col.chars[j] = chars[Math.floor(Math.random() * chars.length)];
      }

      if (j === 0) {
        // Glowing white leader head
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = colColor;
        ctx.shadowBlur = 12;
        ctx.fillText(col.chars[j], px, py);
        ctx.shadowBlur = 0;
      } else {
        // Fading tail glyphs
        const alpha = Math.max(0.1, 1 - j / col.length);
        ctx.fillStyle = colColor;
        ctx.globalAlpha = alpha;
        ctx.fillText(col.chars[j], px, py);
        ctx.globalAlpha = 1.0;
      }
    }
  }
}
`
};
