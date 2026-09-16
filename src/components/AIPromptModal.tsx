import React, { useState } from 'react';
import { 
  Sparkles, 
  Wand2, 
  Dices, 
  X, 
  Layers, 
  Monitor, 
  Cpu, 
  Check, 
  Loader2 
} from 'lucide-react';
import { getRandomInspiration, enhancePrompt } from '../ai/promptEnhancer';
import { EngineType, AspectRatioType } from '../types/animation';

interface AIPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (prompt: string, style: string, engine: 'auto' | 'canvas2d' | 'webgl-three', ratio: AspectRatioType) => Promise<void>;
}

const STYLES = [
  'Auto',
  'Cosmic Physics',
  'Cyberpunk Neon',
  'Swiss Minimalist',
  'Bioluminescent Abyss',
  'Retrowave Synth',
  'Sci-Fi Tactical HUD',
  'Sacred Geometry',
  'Abstract Fluid'
];

export const AIPromptModal: React.FC<AIPromptModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
}) => {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('Auto');
  const [preferredEngine, setPreferredEngine] = useState<'auto' | 'canvas2d' | 'webgl-three'>('auto');
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('16:9');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleRandom = () => {
    setPrompt(getRandomInspiration());
  };

  const handleEnhance = () => {
    setPrompt(enhancePrompt(prompt, selectedStyle));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    try {
      await onGenerate(prompt, selectedStyle, preferredEngine, aspectRatio);
      onClose();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl bg-[#0f111e] border border-white/10 shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="h-14 px-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-cyan-950/40 to-indigo-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">AI ANIMATION GENERATOR</h2>
              <p className="text-[11px] text-cyan-300/80">Synthesize advanced animations from natural language</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Prompt Area */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">Prompt Description</label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleRandom}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <Dices className="w-3 h-3 text-cyan-400" />
                  <span>Surprise Me</span>
                </button>
                <button
                  type="button"
                  onClick={handleEnhance}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-purple-900/40 hover:bg-purple-800/50 border border-purple-500/30 text-[11px] text-purple-300 hover:text-white transition-colors cursor-pointer"
                >
                  <Wand2 className="w-3 h-3 text-purple-400" />
                  <span>Enhance</span>
                </button>
              </div>
            </div>

            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. A hyper-futuristic quantum core with orbiting energy rings, gravitational distortion, pulsating glowing runes, and dynamic particle flares..."
              className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 resize-none leading-relaxed"
            />
          </div>

          {/* Aesthetic Styles */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Visual Aesthetic Preset</label>
            <div className="flex flex-wrap gap-1.5">
              {STYLES.map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setSelectedStyle(style)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    selectedStyle === style
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/5'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Engine & Format Options */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Rendering Engine</label>
              <select
                value={preferredEngine}
                onChange={(e) => setPreferredEngine(e.target.value as any)}
                className="w-full bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="auto">Auto-Detect Best Engine</option>
                <option value="canvas2d">High-Perf 2D Canvas</option>
                <option value="webgl-three">WebGL 3D (Three.js)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Target Aspect Ratio</label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value as any)}
                className="w-full bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="16:9">16:9 Landscape</option>
                <option value="9:16">9:16 Mobile / TikTok</option>
                <option value="1:1">1:1 Square</option>
                <option value="4:3">4:3 Standard</option>
                <option value="21:9">21:9 Ultra-Wide</option>
              </select>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={!prompt.trim() || isGenerating}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Animation Pipeline...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Advanced Animation</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
