# Anify ⚡ — AI Advanced Animation Studio

Anify is an intelligent, high-performance AI Animation Generation & Studio Suite. It translates natural language prompts into advanced, interactive, multi-layered animations running at silky-smooth 60/120 FPS across Canvas2D and WebGL 3D (Three.js) engines.

---

## ✨ Features

### 🧠 1. AI Animation Synthesis Engine
- **Natural Language Prompt-to-Animation**: Type any visual description, physics concept, or motion graphic idea (e.g., *"Quantum cosmic portal with swirling vortex particles and lightning arcs"* or *"Cyberpunk neon megacity 3D flythrough"*).
- **Semantic Compiler**: Synthesizes executable JavaScript/WebGL code with full physics integration, mouse interactivity, audio frequency reactivity, and dynamic parameters.
- **AI Prompt Enhancer**: One-click "Magic Wand" prompt expander and "Surprise Me" generator across 8+ visual aesthetic styles.
- **AI Co-Director Chat**: Real-time conversational assistant that allows you to direct changes to the animation on the fly (*"make it 2x faster"*, *"shift colors to emerald and gold"*, *"add more particles"*, *"increase bloom"*).

### 🚀 2. Masterpiece Preset Showcase (19 Pre-built Archetypes)
1. **Cybernetic Mech Walker 3D (Rigged)**: Three.js 3D character animation with skeletal bone hierarchy, forward walking stride kinematics, heavy hydraulic footfalls, and plasma cannon weapon flares.
2. **Cyber Ninja Acrobatic Flip 3D**: Full 3D skeletal acrobatics with 14-joint kinematic motion, ribbon blade trails, and dynamic camera choreography.
3. **Kinetic Vector Puppet & Character Rig**: Procedural 2D skeletal character puppet rig featuring running cycle kinematics, secondary overlapping hair motion, and parallax city runner environment.
4. **Quantum Black Hole & Gravitational Lensing**: Relativistic accretion disk, photon sphere, Einstein gravitational light bending, and bipolar plasma jets.
5. **Cyberpunk Neon Megacity 3D**: Procedural glowing skyscrapers, flying speeder light trails, night fog, and Three.js camera flythrough.
6. **Neural Connectome & Brain Synapse 3D**: 3D graph cluster with electric action potentials propagating through axons and synapses.
7. **Fluid SPH & Curl Noise Particle Vortex**: 6,000+ interactive particles driven by curl noise vector turbulence and mouse gravity wells.
8. **4D Tesseract & Hyper-Dimensional Geometry**: Stereographic 4D-to-3D projection of a hypercube rotating through XW and YZ 4D planes.
9. **Swiss Kinetic Typography & Tech Reveal**: Modern typography motion graphic with staggered letter springs, chromatic slicing, and telemetry ticker.
10. **Solar Corona & Keplerian Orbital Mechanics**: Gravitational planetary orbits, coronal mass ejections, solar flares, and planetary rings.
11. **Verlet Cloth Physics & Dynamic Wind Field**: Mass-spring cloth fabric physics with wind turbulence, mouse grabbing, and tearing dynamics.
12. **Bioluminescent Abyss Jellyfish**: Translucent pulsing bell with procedural inverse-kinematics trailing tentacles and glowing plankton.
13. **Holographic Audio Equalizer & Starburst**: Dynamic circular 3D oscilloscope, bass shockwaves, and frequency-domain spectrum bars.
14. **Liquid Mercury Metaballs**: Scalar field marching circles fluid droplets merging and splitting with liquid chrome specular highlights.
15. **Sci-Fi Tactical Holographic HUD**: Rotating azimuth dial rings, dynamic target lock-on crosshair, and telemetry readouts.
16. **Lorenz Chaotic Strange Attractor**: Butterfly-effect non-linear differential equations visualized with 12,000 trailing luminous points.
17. **Matrix Digital Rain & Cryptographic Cascade**: Cascading katakana and cipher symbols with glowing leader glyphs and depth layers.
18. **Origami Geometric Transformation 3D**: Morphing 3D geometric polyhedral folding with directional shadows and metallic facets.
19. **Turing Reaction-Diffusion Morphogenesis**: Biological Gray-Scott chemical reaction-diffusion equations generating organic skin patterns and labyrinths.

### 🎬 3. Character Animation & Skeletal Rigging
- **Bipedal / Mech Walking Cycles**: Forward and backward kinematics, ankle and foot planting, hydraulic ground impact, and pelvic bobbing.
- **Acrobatic Flips & Combat Routines**: 14-joint bone rotation, dual energy weapon ribbon trails, and dynamic jumping trajectory phases.
- **2D/2.5D Vector Puppet Rigs**: Procedural multi-segment limbs, overlapping secondary motion (hair bounce, clothing flutter), and running stride mechanics.

### 🧊 4. Blender Compatibility & Python Integration
- **Direct Blender Export (`.py`)**: One-click download of an executable Python script compatible with Blender 3.6 LTS, 4.0, 4.1, and 4.2+ (Eevee Next / Cycles).
- **Automated Blender Scene Reconstruction**:
  - Sets up matching frame rate, start/end frame boundaries, resolution, and render engine.
  - Builds Blender materials with Principled BSDF and Emission shaders matching the animation's colors.
  - Reconstructs character armatures, bone hierarchies, camera orbital paths, and inserts keyframes into Blender's F-Curves (`insert_keyframe`).
  - Command-line execution: `blender --python anify_animation.py` or run directly inside Blender's Scripting workspace.

### 🎛️ 3. Full Professional Studio Interface
- **Live Viewport Stage**: Aspect ratio presets (16:9 Landscape, 9:16 Mobile Story/TikTok, 1:1 Square, 4:3 Classic, 21:9 Ultra-wide) with real-time FPS & frame-time monitors.
- **Multi-Track Timeline**: Keyframe sequencing for Master Dynamics, Camera/Scale, and Lighting/Glow, with scrub bar, duration picker, and timecode readouts.
- **Live Parameter Inspector**: Real-time sliders and color pickers tailored to each animation, tweaking variables with zero frame drop or reload.
- **Post-Processing Shaders**: Cinematic Bloom, RGB Chromatic Aberration, Vignette, and Retro CRT Scanlines.
- **Integrated Code & Shader Editor**: In-editor live JavaScript/Three.js code view with line numbers, error diagnostics, "Run" trigger, and inline AI prompt.
- **Audio Reactivity Studio**: Built-in procedural Web Audio synthesizer (Synthwave, Dark Techno, Cyberpulse, Ambient) or custom MP3 upload with live FFT frequency spectrum analysis.

### 📦 4. Client-Side Export Engine
- **WebM / MP4 Video Export**: Hardware-accelerated 60 FPS recording via MediaRecorder.
- **Animated GIF Export**: Looping GIF generation using pure client-side color quantization and LZW encoding.
- **PNG Frame Sequence ZIP**: Frame-by-frame PNG archive generation using JSZip.
- **Standalone Single-File HTML Bundle**: One-click download of a self-contained, responsive HTML file runnable in any browser without external dependencies.
- **Project JSON Import/Export**: Save and restore animation projects.

---

## 🛠️ Tech Stack
- **Framework**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4, Lucide Icons
- **3D Engine**: Three.js (WebGL)
- **Audio Engine**: Web Audio API (procedural synthesis & FFT analyzer)
- **Export**: MediaRecorder API, JSZip, Canvas API, Custom Pure JS GIF89a Encoder

---

## ⌨️ Keyboard Shortcuts
- `Space`: Play / Pause
- `← / →`: Step backward / forward 1 frame
- `R`: Rewind to beginning (00:00.00)
- `G`: Open AI Prompt Generator
- `P`: Open Preset Gallery (16 Masterpieces)
- `E`: Open Export Modal
- `M`: Open Audio Reactivity Studio
- `Mouse Drag`: Apply gravitational vortex force to particle fields
