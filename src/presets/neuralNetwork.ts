import { PresetAnimation } from '../types/animation';

export const neuralNetworkPreset: PresetAnimation = {
  id: 'neural-synapse-3d',
  title: 'Neural Connectome & Brain Synapse 3D',
  prompt: 'A 3D neural brain network with interconnected glowing neurons firing electrical action potentials along branching axons with camera orbital rotation',
  description: 'Simulates neural connectivity with 3D graph clustering and dynamic electrical signal propagation across synapses.',
  category: '3D & Shaders',
  engine: 'canvas2d',
  badge: 'Graph Neural',
  duration: 12,
  parameters: {
    neuronCount: {
      id: 'neuronCount',
      label: 'Neuron Count',
      type: 'number',
      value: 120,
      min: 40,
      max: 250,
      step: 10,
      category: 'physics'
    },
    signalSpeed: {
      id: 'signalSpeed',
      label: 'Synapse Signal Speed',
      type: 'number',
      value: 1.8,
      min: 0.5,
      max: 4.0,
      step: 0.1,
      category: 'physics'
    },
    connectionDistance: {
      id: 'connectionDistance',
      label: 'Axon Range',
      type: 'number',
      value: 140,
      min: 60,
      max: 250,
      step: 5,
      category: 'physics'
    },
    neuronGlow: {
      id: 'neuronGlow',
      label: 'Neuron Core Color',
      type: 'color',
      value: '#60a5fa',
      category: 'colors'
    },
    actionPotentialColor: {
      id: 'actionPotentialColor',
      label: 'Action Potential Color',
      type: 'color',
      value: '#f43f5e',
      category: 'colors'
    }
  },
  postProcessing: {
    bloom: true,
    bloomIntensity: 1.6,
    bloomRadius: 20,
    chromaticAberration: true
  },
  tags: ['Neural', 'Brain', 'AI', 'BioTech', '3D Graph'],
  code: `// Neural Connectome & Brain Synapse 3D Simulation
const neurons = [];
const signals = [];
const N_COUNT = 150;

// Initialize 3D neural sphere cluster
for (let i = 0; i < N_COUNT; i++) {
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(Math.random() * 2 - 1);
  const r = 100 + Math.random() * 240;

  neurons.push({
    x: r * Math.sin(phi) * Math.cos(theta),
    y: r * Math.sin(phi) * Math.sin(theta),
    z: r * Math.cos(phi),
    baseX: r * Math.sin(phi) * Math.cos(theta),
    baseY: r * Math.sin(phi) * Math.sin(theta),
    baseZ: r * Math.cos(phi),
    radius: 2.5 + Math.random() * 3.5,
    activity: 0.2 + Math.random() * 0.8,
    frequency: 1 + Math.random() * 3,
    connections: []
  });
}

// Build axon connectivity
for (let i = 0; i < neurons.length; i++) {
  for (let j = i + 1; j < neurons.length; j++) {
    const dx = neurons[i].x - neurons[j].x;
    const dy = neurons[i].y - neurons[j].y;
    const dz = neurons[i].z - neurons[j].z;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (dist < 130) {
      neurons[i].connections.push(j);
      // Spawn occasional action potential signal
      if (Math.random() > 0.6) {
        signals.push({
          from: i,
          to: j,
          progress: Math.random(),
          speed: 0.4 + Math.random() * 0.8
        });
      }
    }
  }
}

function render({ ctx, width, height, time, params, mouse, audioData }) {
  ctx.fillStyle = '#06070e';
  ctx.fillRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2;
  const rotY = time * 0.25 + mouse.x * 1.5;
  const rotX = Math.sin(time * 0.15) * 0.2 + -mouse.y * 1.0;
  const signalRate = params.signalSpeed || 1.8;
  const audioKick = audioData ? audioData.bass * 1.2 : 0;

  const cosY = Math.cos(rotY);
  const sinY = Math.sin(rotY);
  const cosX = Math.cos(rotX);
  const sinX = Math.sin(rotX);

  // 3D projection helper
  function project(x, y, z) {
    // Rotate Y
    let x1 = x * cosY - z * sinY;
    let z1 = z * cosY + x * sinY;
    // Rotate X
    let y2 = y * cosX - z1 * sinX;
    let z2 = z1 * cosX + y * sinX;

    const fov = 650;
    const scale = fov / (fov + z2 + 350);
    return {
      x: cx + x1 * scale,
      y: cy + y2 * scale,
      scale: Math.max(0.05, scale),
      z: z2
    };
  }

  const projectedNeurons = neurons.map((n, i) => {
    // Pulse breathing
    const pulse = 1 + 0.15 * Math.sin(time * n.frequency) + audioKick * 0.2;
    const proj = project(n.x * pulse, n.y * pulse, n.z * pulse);
    return { ...proj, radius: n.radius * proj.scale * (1 + audioKick * 0.4), index: i };
  });

  // Sort back-to-front
  projectedNeurons.sort((a, b) => b.z - a.z);

  // 1. Draw Axon connections
  ctx.lineWidth = 1;
  for (let i = 0; i < neurons.length; i++) {
    const p1 = projectedNeurons.find(p => p.index === i);
    if (!p1) continue;

    for (let targetIdx of neurons[i].connections) {
      if (targetIdx > i) {
        const p2 = projectedNeurons.find(p => p.index === targetIdx);
        if (!p2) continue;

        const avgZ = (p1.z + p2.z) / 2;
        const alpha = Math.max(0.05, Math.min(0.6, 0.4 - avgZ * 0.001));

        ctx.strokeStyle = \`rgba(56, 189, 248, \${alpha})\`;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    }
  }

  // 2. Draw propagating electrical action potentials
  for (let sig of signals) {
    sig.progress += sig.speed * signalRate * 0.012;
    if (sig.progress >= 1) {
      sig.progress = 0;
      // Change target randomly
      const nFrom = neurons[sig.from];
      if (nFrom.connections.length > 0) {
        sig.to = nFrom.connections[Math.floor(Math.random() * nFrom.connections.length)];
      }
    }

    const n1 = neurons[sig.from];
    const n2 = neurons[sig.to];
    const curX = n1.x + (n2.x - n1.x) * sig.progress;
    const curY = n1.y + (n2.y - n1.y) * sig.progress;
    const curZ = n1.z + (n2.z - n1.z) * sig.progress;

    const p = project(curX, curY, curZ);
    const size = Math.max(1.5, 3.5 * p.scale * (1 + audioKick));

    ctx.fillStyle = params.actionPotentialColor || '#f43f5e';
    ctx.shadowColor = params.actionPotentialColor || '#f43f5e';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // 3. Draw Neuron somas
  for (let pn of projectedNeurons) {
    const depthAlpha = Math.max(0.2, Math.min(1, 0.7 - pn.z * 0.0015));

    ctx.fillStyle = params.neuronGlow || '#60a5fa';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12 * pn.scale;

    ctx.beginPath();
    ctx.arc(pn.x, pn.y, pn.radius, 0, Math.PI * 2);
    ctx.fill();

    // Center nucleus
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.arc(pn.x, pn.y, pn.radius * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}
`
};
