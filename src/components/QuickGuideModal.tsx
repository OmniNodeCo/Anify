import React from 'react';
import { 
  X, 
  Keyboard, 
  Sparkles, 
  Code2, 
  Sliders, 
  Download, 
  Volume2 
} from 'lucide-react';

interface QuickGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickGuideModal: React.FC<QuickGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Space', desc: 'Play / Pause animation playback' },
    { key: '← / →', desc: 'Step backward / forward 1 frame' },
    { key: 'R', desc: 'Rewind & reset timeline to 0:00' },
    { key: 'G', desc: 'Open AI Prompt Generator' },
    { key: 'P', desc: 'Browse 16 Preset Masterpieces' },
    { key: 'E', desc: 'Open Export Menu (Video / GIF / ZIP)' },
    { key: 'M', desc: 'Open Audio Synthesizer & Reactivity' },
    { key: 'Mouse Drag', desc: 'Direct gravity well & vortex forces on particles' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0f111f] border border-white/10 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="h-14 px-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-sky-950/40 to-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Keyboard className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">STUDIO GUIDE & SHORTCUTS</h2>
              <p className="text-[11px] text-sky-300">Master the Anify AI Animation Studio</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Shortcuts Grid */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Keyboard Shortcuts</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {shortcuts.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-slate-900/70 border border-white/5 text-xs">
                  <span className="text-slate-400 text-[11px]">{s.desc}</span>
                  <kbd className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-[11px] font-bold border border-white/10 shadow-sm shrink-0 ml-2">
                    {s.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="space-y-2.5 pt-2 border-t border-white/10">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">How to Use Anify</h3>
            
            <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
              <div className="p-2.5 rounded-xl bg-slate-900/40 border border-white/5 flex gap-2.5 items-start">
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white font-medium">Prompt-to-Animation:</strong> Type any idea or visual description into the AI generator. The synthesizer compiles procedural physics and 3D code automatically.
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/40 border border-white/5 flex gap-2.5 items-start">
                <Sliders className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white font-medium">Live Inspector:</strong> Adjust speed, turbulence, particle counts, and post-processing bloom/vignette in real-time.
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/40 border border-white/5 flex gap-2.5 items-start">
                <Code2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white font-medium">Live Code Editor:</strong> Switch to the Code tab to inspect or modify the JavaScript/Three.js code directly with instant hot-reload.
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/40 border border-white/5 flex gap-2.5 items-start">
                <Download className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white font-medium">Client-Side Export:</strong> Export hardware-accelerated 60FPS WebM videos, animated GIFs, PNG frame sequence ZIPs, or standalone single-file HTML bundles with zero server wait time!
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
