export const INSPIRATIONAL_PROMPTS = [
  "A glowing cosmic portal with swirling vortex particles, camera spiral, and lightning arcs",
  "A deep ocean bioluminescent jellyfish pulsing with electric tentacles and floating plankton particles",
  "Hyper-dimensional 4D tesseract rotating through higher dimensional space with glowing wireframe facets",
  "Cyberpunk neon hover-car drifting through rain-soaked streets with reflection puddles and volumetric fog",
  "Quantum black hole with relativistic accretion disk, photon sphere, and gravitational lensing",
  "3D neural synapse brain connectome firing electric action potentials along branching axons",
  "Fluid SPH curl noise turbulence particle symphony with mouse gravity well and chromatic velocity trails",
  "Verlet cloth simulation blowing in dynamic turbulent wind with mouse grab and tearing physics",
  "Modern Swiss kinetic typography sequence with spring-elastic letter bouncing and chromatic split slicing",
  "Chaotic Lorenz strange attractor butterfly effect with thousands of luminous gradient trajectory points",
  "Sci-Fi holographic HUD targeting interface with rotating azimuth dials, reticle tracking, and telemetry graphs",
  "Audio-reactive holographic starburst with 3D oscilloscope ring, bass shockwaves, and frequency bars",
  "Liquid mercury metaballs merging and dividing with surface tension physics and metallic specular reflections",
  "Solar flare coronal mass ejection with Keplerian orbiting planets and atmospheric Rayleigh scattering",
  "Matrix cryptographic digital code rain cascade with glowing green leader glyphs and depth layers",
  "Origami 3D geometric polyhedral transformation unfolding with directional shadows and metallic sheen"
];

export function getRandomInspiration(): string {
  const idx = Math.floor(Math.random() * INSPIRATIONAL_PROMPTS.length);
  return INSPIRATIONAL_PROMPTS[idx];
}

export function enhancePrompt(prompt: string, style?: string): string {
  if (!prompt || prompt.trim() === '') {
    return getRandomInspiration();
  }

  const trimmed = prompt.trim();
  const lower = trimmed.toLowerCase();

  const descriptors = [
    'high-framerate 60FPS fluid simulation',
    'volumetric dynamic lighting with chromatic bloom',
    'cinematic depth of field and motion blur',
    'procedural physics-based particle dynamics',
    'smooth spring-damped easing curves',
    'interactive mouse-responsive trajectory fields'
  ];

  const pickedDescriptor = descriptors[Math.floor(Math.random() * descriptors.length)];

  if (style && style !== 'Auto') {
    return `${trimmed}, rendered in ${style} aesthetic with ${pickedDescriptor}, rich color grading, and harmonic geometric motion`;
  }

  // Detect context
  if (lower.includes('particle') || lower.includes('vortex') || lower.includes('flow')) {
    return `${trimmed}, driven by curl noise vector turbulence with ${pickedDescriptor} and velocity-mapped spectral gradients`;
  } else if (lower.includes('space') || lower.includes('star') || lower.includes('galaxy') || lower.includes('black hole')) {
    return `${trimmed}, featuring relativistic gravitational mechanics, photon sphere glow, cosmic dust trails, and ${pickedDescriptor}`;
  } else if (lower.includes('cyber') || lower.includes('city') || lower.includes('futuristic')) {
    return `${trimmed}, highlighted with ultra-vibrant neon emission, holographic HUD telemetry, atmospheric fog, and ${pickedDescriptor}`;
  } else if (lower.includes('text') || lower.includes('typography') || lower.includes('logo')) {
    return `${trimmed}, orchestrated with staggered spring-elastic keyframes, chromatic aberration slicing, and Swiss minimalist precision`;
  }

  return `${trimmed}, with ${pickedDescriptor}, high-precision physics simulation, and stunning visual atmosphere`;
}
