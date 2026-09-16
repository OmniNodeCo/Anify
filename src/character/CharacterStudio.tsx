import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  Camera, 
  Eye, 
  Download, 
  Bot, 
  Sliders, 
  Gamepad2, 
  Maximize2, 
  Minimize2,
  FastForward
} from 'lucide-react';
import { 
  CharacterAction, 
  CharacterModel, 
  CharacterState, 
  globalCharacterEngine 
} from './characterEngine';
import { generateBlenderCharacterScript } from './blenderCharacterRig';
import { ExportEngine } from '../runtime/exportEngine';

interface CharacterStudioProps {
  onToggleChat?: () => void;
}

const ACTIONS: { id: CharacterAction; label: string; icon: string; desc: string }[] = [
  { id: 'backflip', label: 'Backflip', icon: '🔄', desc: '360° Acrobatic tuck & superhero landing' },
  { id: 'walk', label: 'Walk', icon: '🚶', desc: 'Bipedal natural stride cycle' },
  { id: 'run', label: 'Run', icon: '🏃', desc: 'High-energy athletic running kinematics' },
  { id: 'sprint', label: 'Sprint', icon: '⚡', desc: 'Maximum velocity supersonic dash' },
  { id: 'jump', label: 'High Jump', icon: '🦘', desc: 'Explosive vertical leap & descent' },
  { id: 'roll', label: 'Parkour Roll', icon: '🤸', desc: 'Forward diving somersault roll' },
  { id: 'attack', label: 'Katana Slash', icon: '⚔️', desc: '3-hit dual energy katana combo' },
  { id: 'breakdance', label: 'Breakdance', icon: '🕺', desc: 'Windmill floor acrobatics' },
  { id: 'slide', label: 'Knee Slide', icon: '🛑', desc: 'Ground friction slide with sparks' },
  { id: 'idle', label: 'Combat Idle', icon: '🧘', desc: 'Weight-shifting & breathing stance' },
];

const MODELS: { id: CharacterModel; name: string; badge: string; color: string }[] = [
  { id: 'ninja', name: 'Cyber Ninja (Ren)', badge: 'Acrobatic', color: '#00f2fe' },
  { id: 'mech', name: 'Titan Mech (Goliath)', badge: 'Armored', color: '#f59e0b' },
  { id: 'cyborg', name: 'Cyborg Valkyrie', badge: 'Kinetic', color: '#ec4899' },
  { id: 'puppet', name: 'Vector Puppet', badge: '2.5D Rig', color: '#10b981' },
];

export const CharacterStudio: React.FC<CharacterStudioProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Character State
  const [state, setState] = useState<CharacterState>({
    model: 'ninja',
    action: 'backflip',
    prevAction: 'idle',
    actionTime: 0,
    blendFactor: 1.0,
    speedMultiplier: 1.0,
    showSkeleton: false,
    showTrails: true,
    showShadows: true,
    primaryColor: '#00f2fe',
    secondaryColor: '#ff007f',
    metalColor: '#1e293b'
  });

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [slowMo, setSlowMo] = useState<number>(1.0); // 1.0 = normal, 0.5 = slowmo, 0.25 = ultra slowmo
  const [cameraAngle, setCameraAngle] = useState<number>(0.35);
  const [cameraElevation, setCameraElevation] = useState<number>(0.15);
  const [zoom, setZoom] = useState<number>(1.0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [lastMouse, setLastMouse] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'moves' | 'rig' | 'camera'>('moves');

  const timeRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(performance.now());
  const animFrameRef = useRef<number | null>(null);

  // Switch action handler
  const handleSelectAction = (action: CharacterAction) => {
    setState((prev) => ({
      ...prev,
      prevAction: prev.action,
      action,
      actionTime: 0,
      blendFactor: 0.0
    }));
    timeRef.current = 0; // restart cycle for crisp moves
  };

  // Switch model handler
  const handleSelectModel = (model: CharacterModel) => {
    const defaultColor = model === 'mech' ? '#f59e0b' : model === 'cyborg' ? '#ec4899' : '#00f2fe';
    setState((prev) => ({
      ...prev,
      model,
      primaryColor: defaultColor
    }));
  };

  // Export character to Blender
  const handleExportBlender = () => {
    const script = generateBlenderCharacterScript(state);
    ExportEngine.downloadText(
      script,
      `anify_${state.model}_${state.action}_blender.py`,
      'text/x-python'
    );
  };

  // AI Prompt Synthesizer
  const handleAiActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    const lower = aiPrompt.toLowerCase();
    if (lower.includes('backflip') || lower.includes('flip')) {
      handleSelectAction('backflip');
    } else if (lower.includes('sprint') || lower.includes('dash') || lower.includes('fast')) {
      handleSelectAction('sprint');
    } else if (lower.includes('run') || lower.includes('jog')) {
      handleSelectAction('run');
    } else if (lower.includes('walk') || lower.includes('stride')) {
      handleSelectAction('walk');
    } else if (lower.includes('jump') || lower.includes('leap')) {
      handleSelectAction('jump');
    } else if (lower.includes('roll') || lower.includes('somersault')) {
      handleSelectAction('roll');
    } else if (lower.includes('attack') || lower.includes('slash') || lower.includes('sword')) {
      handleSelectAction('attack');
    } else if (lower.includes('dance') || lower.includes('spin') || lower.includes('breakdance')) {
      handleSelectAction('breakdance');
    } else if (lower.includes('slide')) {
      handleSelectAction('slide');
    } else {
      handleSelectAction('backflip');
    }
    setAiPrompt('');
  };

  // Mouse camera orbit listeners
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - lastMouse.x;
    const dy = e.clientY - lastMouse.y;
    setLastMouse({ x: e.clientX, y: e.clientY });

    setCameraAngle((prev) => prev + dx * 0.008);
    setCameraElevation((prev) => Math.max(-0.4, Math.min(0.6, prev + dy * 0.008)));
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Keyboard navigation for character moves
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleSelectAction('backflip');
      } else if (e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        handleSelectAction('walk');
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleSelectAction('run');
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handleSelectAction('sprint');
      } else if (e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        handleSelectAction('attack');
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        handleSelectAction('roll');
      } else if (e.key === 'i' || e.key === 'I') {
        e.preventDefault();
        handleSelectAction('idle');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Main Render Animation Loop
  useEffect(() => {
    let active = true;

    const loop = (now: number) => {
      if (!active) return;

      const delta = Math.min(0.1, (now - lastFrameTimeRef.current) / 1000);
      lastFrameTimeRef.current = now;

      if (isPlaying) {
        timeRef.current += delta * slowMo;
      }

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          const w = canvas.width / dpr;
          const h = canvas.height / dpr;

          globalCharacterEngine.renderStudio(
            ctx,
            w,
            h,
            timeRef.current,
            state,
            cameraAngle,
            cameraElevation,
            zoom
          );
        }
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      active = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, slowMo, state, cameraAngle, cameraElevation, zoom]);

  // Resize canvas
  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex-1 w-full h-full flex flex-col bg-[#070913] text-slate-100 overflow-hidden select-none relative">
      {/* Top Floating Bar: Character Model Selector & Camera Presets */}
      <div className="h-12 border-b border-white/10 bg-[#0d0f1c]/90 backdrop-blur-md px-4 flex items-center justify-between shrink-0 z-20">
        {/* Model Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 hidden sm:inline">Character:</span>
          <div className="flex items-center bg-slate-900 border border-white/10 rounded-lg p-0.5">
            {MODELS.map((m) => (
              <button
                key={m.id}
                onClick={() => handleSelectModel(m.id)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
                  state.model === m.id
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {m.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Center: AI Action Prompt Input */}
        <form onSubmit={handleAiActionSubmit} className="hidden md:flex items-center gap-1.5 bg-slate-900 border border-white/10 rounded-xl px-3 py-1 focus-within:border-cyan-500/50 w-80">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <input
            type="text"
            placeholder="AI Action: backflip, sprint, roll, attack..."
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!aiPrompt.trim()}
            className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 transition-colors disabled:opacity-40 cursor-pointer"
          >
            Play
          </button>
        </form>

        {/* Camera & Blender Export */}
        <div className="flex items-center gap-2">
          {/* Camera Angles */}
          <div className="flex items-center bg-slate-900 border border-white/10 rounded-lg p-0.5">
            <button
              onClick={() => { setCameraAngle(0.35); setCameraElevation(0.15); }}
              className="px-2 py-1 text-[11px] rounded text-slate-300 hover:text-white cursor-pointer"
              title="3D Dynamic 3/4 Angle"
            >
              Perspective
            </button>
            <button
              onClick={() => { setCameraAngle(Math.PI / 2); setCameraElevation(0.0); }}
              className="px-2 py-1 text-[11px] rounded text-slate-300 hover:text-white cursor-pointer"
              title="Side Profile 2D (Walk/Run Cycle Analysis)"
            >
              Side 2D
            </button>
            <button
              onClick={() => { setCameraAngle(0); setCameraElevation(0.05); }}
              className="px-2 py-1 text-[11px] rounded text-slate-300 hover:text-white cursor-pointer"
              title="Frontal View"
            >
              Front
            </button>
          </div>

          {/* Export to Blender Button */}
          <button
            onClick={handleExportBlender}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600/90 hover:bg-orange-500 text-white text-xs font-semibold shadow-md shadow-orange-950/50 transition-all cursor-pointer"
            title="Download Blender Python Script (.py)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Blender Rig (.py)</span>
          </button>
        </div>
      </div>

      {/* Main 3D Canvas Viewport */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="flex-1 w-full relative overflow-hidden cursor-grab active:cursor-grabbing"
      >
        <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />

        {/* Top-Left Action Badge */}
        <div className="absolute top-4 left-4 z-10 pointer-events-none flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-xl flex items-center gap-2">
            <span className="text-base">{ACTIONS.find(a => a.id === state.action)?.icon}</span>
            <div>
              <div className="text-xs font-extrabold text-cyan-300 uppercase tracking-wider">
                {state.action}
              </div>
              <div className="text-[10px] text-slate-400">
                {ACTIONS.find(a => a.id === state.action)?.desc}
              </div>
            </div>
          </div>
        </div>

        {/* Top-Right Rig Options Toggle */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5">
          <button
            onClick={() => setState(s => ({ ...s, showSkeleton: !s.showSkeleton }))}
            className={`px-3 py-1.5 rounded-xl border text-xs font-medium backdrop-blur-md shadow-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              state.showSkeleton 
                ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300' 
                : 'bg-slate-900/80 border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>X-Ray Bones</span>
          </button>

          <button
            onClick={() => setState(s => ({ ...s, showTrails: !s.showTrails }))}
            className={`px-3 py-1.5 rounded-xl border text-xs font-medium backdrop-blur-md shadow-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              state.showTrails 
                ? 'bg-pink-500/25 border-pink-400 text-pink-300' 
                : 'bg-slate-900/80 border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <span>Blade Trails</span>
          </button>
        </div>

        {/* Floating Hint (Drag to Orbit) */}
        <div className="absolute bottom-4 left-4 z-10 pointer-events-none text-[11px] text-slate-500 bg-slate-950/60 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-white/5">
          Drag to 3D Orbit Camera • Keys: [Space] Backflip • [W] Walk • [R] Run • [S] Sprint • [J] Slash
        </div>

        {/* Floating Playback & Slow-Mo Controls */}
        <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-2xl shadow-xl">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors cursor-pointer"
            title="Play / Pause"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>

          <button
            onClick={() => { timeRef.current = 0; }}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Restart Action"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-[1px] bg-white/15 mx-1" />

          {/* Slow Motion Selector */}
          <div className="flex items-center gap-1 text-[11px] font-mono">
            {[
              { val: 0.25, label: '0.25x' },
              { val: 0.5, label: '0.5x' },
              { val: 1.0, label: '1.0x' },
              { val: 2.0, label: '2.0x' },
            ].map((s) => (
              <button
                key={s.val}
                onClick={() => setSlowMo(s.val)}
                className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                  slowMo === s.val
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Action Move-Set Bar (Interactive Character Controller) */}
      <div className="border-t border-white/10 bg-[#0a0c17] p-3 shrink-0 z-20">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Action Move-Set & Kinematics ({ACTIONS.length})
            </span>
          </div>

          <span className="text-[11px] text-slate-500 hidden sm:inline">
            Click any action button to trigger real-time kinematic transition
          </span>
        </div>

        {/* Scrollable Action Cards */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {ACTIONS.map((action) => {
            const isActive = state.action === action.id;
            return (
              <button
                key={action.id}
                onClick={() => handleSelectAction(action.id)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-left transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-950/60 to-indigo-950/60 border-cyan-400 text-white shadow-lg shadow-cyan-500/20 scale-[1.02]'
                    : 'bg-slate-900/60 hover:bg-slate-800/80 border-white/5 text-slate-400 hover:text-slate-200 hover:border-white/20'
                }`}
              >
                <span className="text-lg">{action.icon}</span>
                <div>
                  <div className={`text-xs font-bold ${isActive ? 'text-cyan-300' : 'text-slate-200'}`}>
                    {action.label}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono truncate max-w-[130px]">
                    {action.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
