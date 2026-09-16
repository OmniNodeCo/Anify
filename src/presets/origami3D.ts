import { PresetAnimation } from '../types/animation';

export const origami3DPreset: PresetAnimation = {
  id: 'origami-3d-folding',
  title: 'Origami Geometric Transformation 3D',
  prompt: 'A 3D origami geometric polyhedra unfolding and tessellating in mesmerizing rotational symmetry with directional lighting, cast shadows, and metallic facets',
  description: 'Simulates origami folding kinematic mathematics with dynamic face dihedral angles and smooth geometric morphing.',
  category: '3D & Shaders',
  engine: 'canvas2d',
  badge: 'Kinematic 3D',
  duration: 9,
  parameters: {
    foldSpeed: {
      id: 'foldSpeed',
      label: 'Folding Cycle Speed',
      type: 'number',
      value: 1.2,
      min: 0.2,
      max: 3.0,
      step: 0.1,
      category: 'physics'
    },
    facetCount: {
      id: 'facetCount',
      label: 'Radial Wings',
      type: 'number',
      value: 10,
      min: 6,
      max: 16,
      step: 1,
      category: 'visual'
    },
    origamiColor1: {
      id: 'origamiColor1',
      label: 'Exterior Facet',
      type: 'color',
      value: '#8b5cf6',
      category: 'colors'
    },
    origamiColor2: {
      id: 'origamiColor2',
      label: 'Interior Fold',
      type: 'color',
      value: '#ec4899',
      category: 'colors'
    }
  },
  postProcessing: {
    bloom: true,
    bloomIntensity: 1.3,
    bloomRadius: 16,
    chromaticAberration: true
  },
  tags: ['Origami', 'Geometry', '3D', 'Folding', 'Kinematics'],
  code: `// Origami Geometric Transformation 3D
function render({ ctx, width, height, time, params, mouse, audioData }) {
  ctx.fillStyle = '#070810';
  ctx.fillRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2;
  const speed = params.foldSpeed || 1.2;
  const wings = params.facetCount || 10;
  const col1 = params.origamiColor1 || '#8b5cf6';
  const col2 = params.origamiColor2 || '#ec4899';
  const audioPulse = audioData ? audioData.bass * 20 : 0;

  // Folding angle oscillating smoothly
  const foldAngle = (Math.sin(time * speed * 1.5) * 0.5 + 0.5) * Math.PI * 0.7;
  const rotY = time * 0.5 + mouse.x * 2.0;
  const rotX = 0.5 + -mouse.y * 1.5;

  const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
  const cosX = Math.cos(rotX), sinX = Math.sin(rotX);

  function project(x, y, z) {
    let x1 = x * cosY - z * sinY;
    let z1 = z * cosY + x * sinY;
    let y2 = y * cosX - z1 * sinX;
    let z2 = z1 * cosX + y * sinX;

    const fov = 500;
    const scale = fov / (fov + z2 + 300);
    return {
      x: cx + x1 * scale,
      y: cy + y2 * scale,
      z: z2,
      scale
    };
  }

  // Generate folding origami triangular facets
  const facets = [];
  const baseRadius = 60 + audioPulse;
  const wingLength = 160;

  for (let i = 0; i < wings; i++) {
    const a1 = (i * Math.PI * 2) / wings;
    const a2 = ((i + 1) * Math.PI * 2) / wings;
    const midA = (a1 + a2) / 2;

    // Center vertex
    const pCenter = { x: 0, y: 0, z: Math.cos(foldAngle * 2) * 30 };

    // Inner rim vertices
    const p1 = {
      x: Math.cos(a1) * baseRadius,
      y: Math.sin(a1) * baseRadius,
      z: 0
    };
    const p2 = {
      x: Math.cos(a2) * baseRadius,
      y: Math.sin(a2) * baseRadius,
      z: 0
    };

    // Folded outer wing tip
    const outerR = baseRadius + Math.cos(foldAngle) * wingLength;
    const outerZ = Math.sin(foldAngle) * (i % 2 === 0 ? wingLength : -wingLength * 0.5);
    const pTip = {
      x: Math.cos(midA) * outerR,
      y: Math.sin(midA) * outerR,
      z: outerZ
    };

    // Triangle 1: Base facet
    facets.push({
      p: [pCenter, p1, p2],
      type: 'base',
      index: i
    });

    // Triangle 2: Outer folded wing
    facets.push({
      p: [p1, pTip, p2],
      type: 'wing',
      index: i
    });
  }

  // Project and sort faces back-to-front
  const projectedFacets = facets.map(f => {
    const proj = f.p.map(pt => project(pt.x, pt.y, pt.z));
    const avgZ = (proj[0].z + proj[1].z + proj[2].z) / 3;
    return { proj, avgZ, type: f.type, index: f.index };
  });

  projectedFacets.sort((a, b) => b.avgZ - a.avgZ);

  // Render origami facets
  for (let f of projectedFacets) {
    const p0 = f.proj[0];
    const p1 = f.proj[1];
    const p2 = f.proj[2];

    // Compute surface normal for realistic directional lighting
    const ux = p1.x - p0.x, uy = p1.y - p0.y;
    const vx = p2.x - p0.x, vy = p2.y - p0.y;
    const normalZ = ux * vy - uy * vx;

    const isBackFacing = normalZ < 0;
    const shade = Math.min(1, Math.max(0.2, (f.index % 2 === 0 ? 0.75 : 0.5) + (isBackFacing ? -0.2 : 0.25)));

    ctx.fillStyle = f.type === 'wing' ? col1 : col2;
    ctx.globalAlpha = Math.max(0.3, shade);

    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.closePath();
    ctx.fill();

    // Crease edge lines
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}
`
};
