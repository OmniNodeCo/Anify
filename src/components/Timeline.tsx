import React, { useRef, useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Key, 
  Repeat, 
  ZoomIn, 
  ZoomOut, 
  Clock,
  Activity,
  Sliders,
  ChevronDown
} from 'lucide-react';
import { AnimationProject, Keyframe, EasingFunction } from '../types/animation';

interface TimelineProps {
  project: AnimationProject;
  currentTime: number;
  onSeek: (time: number) => void;
  onAddKeyframe?: (trackId: string, time: number, value: number) => void;
  onUpdateDuration: (duration: number) => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  project,
  currentTime,
  onSeek,
  onAddKeyframe,
  onUpdateDuration,
}) => {
  const rulerRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<string>('speed');

  const duration = project.duration || 10;
  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    updateTimeFromPointer(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      updateTimeFromPointer(e);
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const updateTimeFromPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!rulerRef.current) return;
    const rect = rulerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const newTime = (x / rect.width) * duration;
    onSeek(newTime);
  };

  // Generate tick markers
  const ticks = [];
  const tickStep = duration <= 8 ? 0.5 : 1.0;
  for (let t = 0; t <= duration; t += tickStep) {
    const pct = (t / duration) * 100;
    ticks.push({ time: t, pct, isMajor: t % 1 === 0 });
  }

  return (
    <div 
      className="h-44 border-t border-white/10 bg-[#0a0b14] flex flex-col select-none shrink-0"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Timeline Controls Header */}
      <div className="h-9 px-4 border-b border-white/10 bg-[#0d0f1a] flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-cyan-400 font-semibold font-mono">
            <Clock className="w-3.5 h-3.5" />
            <span>TIMELINE SEQUENCER</span>
          </div>

          <div className="h-3 w-[1px] bg-white/10" />

          {/* Duration Selector */}
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="text-[11px]">Duration:</span>
            <select
              value={project.duration}
              onChange={(e) => onUpdateDuration(Number(e.target.value))}
              className="bg-slate-800 text-slate-200 border border-white/10 rounded px-2 py-0.5 text-xs focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value={4}>4s</option>
              <option value={6}>6s</option>
              <option value={8}>8s</option>
              <option value={10}>10s</option>
              <option value={12}>12s</option>
              <option value={16}>16s</option>
              <option value={30}>30s</option>
            </select>
          </div>
        </div>

        {/* Right side: Keyframe & Track controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (onAddKeyframe) {
                onAddKeyframe(selectedTrack, currentTime, 1.0);
              }
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-[11px] font-medium transition-colors cursor-pointer"
          >
            <Key className="w-3 h-3 text-cyan-400" />
            <span>Add Keyframe</span>
          </button>
        </div>
      </div>

      {/* Main Track View (Track headers on left, Scrubber canvas on right) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Track Headers (Left sidebar) */}
        <div className="w-48 border-r border-white/10 bg-[#0b0d17] flex flex-col shrink-0 text-xs text-slate-300">
          <div className="h-6 px-3 border-b border-white/5 flex items-center font-mono text-[10px] text-slate-500 uppercase">
            Tracks
          </div>
          <div className="flex-1 overflow-y-auto">
            <div 
              onClick={() => setSelectedTrack('speed')}
              className={`h-9 px-3 flex items-center justify-between border-b border-white/5 cursor-pointer transition-colors ${
                selectedTrack === 'speed' ? 'bg-cyan-500/10 text-cyan-300 font-medium' : 'hover:bg-white/5'
              }`}
            >
              <span className="truncate">Master Dynamics</span>
              <Activity className="w-3.5 h-3.5 text-cyan-400 opacity-80" />
            </div>

            <div 
              onClick={() => setSelectedTrack('camera')}
              className={`h-9 px-3 flex items-center justify-between border-b border-white/5 cursor-pointer transition-colors ${
                selectedTrack === 'camera' ? 'bg-cyan-500/10 text-cyan-300 font-medium' : 'hover:bg-white/5'
              }`}
            >
              <span className="truncate">Camera / Scale</span>
              <Sliders className="w-3.5 h-3.5 text-purple-400 opacity-80" />
            </div>

            <div 
              onClick={() => setSelectedTrack('lighting')}
              className={`h-9 px-3 flex items-center justify-between border-b border-white/5 cursor-pointer transition-colors ${
                selectedTrack === 'lighting' ? 'bg-cyan-500/10 text-cyan-300 font-medium' : 'hover:bg-white/5'
              }`}
            >
              <span className="truncate">Lighting & Glow</span>
              <Key className="w-3.5 h-3.5 text-amber-400 opacity-80" />
            </div>
          </div>
        </div>

        {/* Scrubber Area with Ruler and Keyframe Lanes */}
        <div 
          ref={rulerRef}
          onPointerDown={handlePointerDown}
          className="flex-1 relative bg-[#080911] cursor-pointer overflow-hidden"
        >
          {/* Time Ruler (Top bar) */}
          <div className="h-6 border-b border-white/10 bg-[#0d0f1b] relative">
            {ticks.map((t, idx) => (
              <div
                key={idx}
                className="absolute top-0 bottom-0 pointer-events-none flex flex-col justify-end"
                style={{ left: `${t.pct}%` }}
              >
                <div className={`w-[1px] ${t.isMajor ? 'h-3 bg-white/30' : 'h-1.5 bg-white/15'}`} />
                {t.isMajor && (
                  <span className="text-[9px] font-mono text-slate-400 ml-1 mb-0.5 select-none">
                    {t.time}s
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Lane 1: Master Dynamics */}
          <div className="h-9 border-b border-white/5 relative flex items-center">
            {/* Keyframe diamond indicators */}
            <div 
              className="absolute w-3 h-3 bg-cyan-400 border border-white rotate-45 -ml-1.5 shadow-md shadow-cyan-400/50 cursor-pointer hover:scale-125 transition-transform"
              style={{ left: '0%' }}
              title="Keyframe at 0.0s (1.0x)"
            />
            <div 
              className="absolute w-3 h-3 bg-cyan-400 border border-white rotate-45 -ml-1.5 shadow-md shadow-cyan-400/50 cursor-pointer hover:scale-125 transition-transform"
              style={{ left: '50%' }}
              title="Keyframe at mid duration"
            />
            <div 
              className="absolute w-3 h-3 bg-cyan-400 border border-white rotate-45 -ml-1.5 shadow-md shadow-cyan-400/50 cursor-pointer hover:scale-125 transition-transform"
              style={{ left: '100%' }}
              title="Keyframe at end duration"
            />
          </div>

          {/* Lane 2: Camera / Scale */}
          <div className="h-9 border-b border-white/5 relative flex items-center">
            <div 
              className="absolute w-3 h-3 bg-purple-400 border border-white rotate-45 -ml-1.5 shadow-md shadow-purple-400/50 cursor-pointer hover:scale-125 transition-transform"
              style={{ left: '25%' }}
              title="Camera Dolly Zoom"
            />
            <div 
              className="absolute w-3 h-3 bg-purple-400 border border-white rotate-45 -ml-1.5 shadow-md shadow-purple-400/50 cursor-pointer hover:scale-125 transition-transform"
              style={{ left: '75%' }}
              title="Camera Reset"
            />
          </div>

          {/* Lane 3: Lighting & Glow */}
          <div className="h-9 border-b border-white/5 relative flex items-center">
            <div 
              className="absolute w-3 h-3 bg-amber-400 border border-white rotate-45 -ml-1.5 shadow-md shadow-amber-400/50 cursor-pointer hover:scale-125 transition-transform"
              style={{ left: '40%' }}
              title="Bloom Peak"
            />
          </div>

          {/* Red Playhead Indicator */}
          <div
            className="absolute top-0 bottom-0 pointer-events-none z-30 flex flex-col items-center"
            style={{ left: `${progressPct}%` }}
          >
            {/* Playhead Head */}
            <div className="w-3.5 h-3.5 bg-red-500 rotate-45 -mt-1 shadow-md shadow-red-500/60 border border-white" />
            {/* Playhead Line */}
            <div className="w-[1.5px] flex-1 bg-red-500 shadow-sm shadow-red-500" />
          </div>
        </div>
      </div>
    </div>
  );
};
