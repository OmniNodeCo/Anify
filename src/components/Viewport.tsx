import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  Monitor, 
  Smartphone, 
  Square,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import { AnimationProject, AspectRatioType } from '../types/animation';
import { AnimationRunner, AnimationRunnerRef } from '../runtime/AnimationRunner';

interface ViewportProps {
  project: AnimationProject;
  runnerRef: React.RefObject<AnimationRunnerRef | null>;
  isPlaying: boolean;
  currentTime: number;
  onTogglePlay: () => void;
  onTimeUpdate: (time: number) => void;
  aspectRatio: AspectRatioType;
  onChangeAspectRatio: (ratio: AspectRatioType) => void;
  onReset: () => void;
  onStepFrame: (frames: number) => void;
}

export const Viewport: React.FC<ViewportProps> = ({
  project,
  runnerRef,
  isPlaying,
  currentTime,
  onTogglePlay,
  onTimeUpdate,
  aspectRatio,
  onChangeAspectRatio,
  onReset,
  onStepFrame,
}) => {
  const [fps, setFps] = useState<number>(60);
  const [frameTimeMs, setFrameTimeMs] = useState<number>(16.6);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
  };

  const totalDuration = project.duration || 10;
  const progressPct = totalDuration > 0 ? ((currentTime % totalDuration) / totalDuration) * 100 : 0;

  return (
    <div ref={containerRef} className="relative flex-1 w-full h-full flex flex-col bg-[#07080f] overflow-hidden">
      {/* Top Floating Info & Aspect Ratio Bar */}
      <div className="absolute top-3 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        {/* Left: Engine & Performance stats */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 backdrop-blur-md border border-white/10 text-xs shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono font-semibold text-slate-200">{fps} FPS</span>
            <span className="text-slate-500 font-mono">({frameTimeMs}ms)</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 backdrop-blur-md border border-white/10 text-xs shadow-lg text-slate-300">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span className="capitalize">{project.engine}</span>
          </div>

          {project.audio.enabled && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/80 backdrop-blur-md border border-indigo-500/40 text-xs shadow-lg text-indigo-300">
              <Activity className="w-3.5 h-3.5 animate-bounce" />
              <span>Audio Reactive</span>
            </div>
          )}
        </div>

        {/* Right: Aspect Ratio & Fullscreen */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Aspect Ratio Switcher */}
          <div className="flex items-center bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-lg p-0.5 shadow-lg">
            <button
              onClick={() => onChangeAspectRatio('16:9')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
                aspectRatio === '16:9' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
              title="16:9 Landscape"
            >
              <Monitor className="w-3 h-3" />
              <span>16:9</span>
            </button>
            <button
              onClick={() => onChangeAspectRatio('9:16')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
                aspectRatio === '9:16' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
              title="9:16 Mobile Story / Reels"
            >
              <Smartphone className="w-3 h-3" />
              <span>9:16</span>
            </button>
            <button
              onClick={() => onChangeAspectRatio('1:1')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
                aspectRatio === '1:1' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
              title="1:1 Square"
            >
              <Square className="w-3 h-3" />
              <span>1:1</span>
            </button>
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-slate-900/80 backdrop-blur-md border border-white/10 text-slate-300 hover:text-white shadow-lg transition-colors cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Stage Viewport Runner */}
      <div className="flex-1 w-full h-full relative">
        <AnimationRunner
          ref={runnerRef as any}
          project={project}
          isPlaying={isPlaying}
          currentTime={currentTime}
          onTimeUpdate={onTimeUpdate}
          onFpsUpdate={(f, ms) => {
            setFps(f);
            setFrameTimeMs(ms);
          }}
          aspectRatio={aspectRatio}
        />
      </div>

      {/* Interactive Floating Hint (Bottom Left) */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-none hidden sm:block">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/60 backdrop-blur-md border border-white/5 text-[11px] text-slate-400">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>Interactive Viewport: Drag mouse to influence motion field / vortex</span>
        </div>
      </div>

      {/* Bottom Floating Transport Controls Bar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-900/90 backdrop-blur-lg border border-white/15 shadow-2xl">
        <button
          onClick={onReset}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title="Reset to 0s (R)"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={() => onStepFrame(-1)}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title="Step Back 1 Frame (Left Arrow)"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Master Play/Pause */}
        <button
          onClick={onTogglePlay}
          className="w-11 h-11 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-cyan-500/30 hover:scale-105 transition-all cursor-pointer"
          title="Play / Pause (Space)"
        >
          {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
        </button>

        <button
          onClick={() => onStepFrame(1)}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title="Step Forward 1 Frame (Right Arrow)"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <div className="h-5 w-[1px] bg-white/15 mx-1" />

        {/* Timecode Readout */}
        <div className="font-mono text-xs font-semibold tracking-wider text-slate-200">
          <span className="text-cyan-400">{formatTime(currentTime)}</span>
          <span className="text-slate-500 mx-1">/</span>
          <span className="text-slate-400">{formatTime(totalDuration)}</span>
        </div>
      </div>
    </div>
  );
};
