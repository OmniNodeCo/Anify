import React from 'react';
import { 
  Sliders, 
  Sparkles, 
  Palette, 
  Eye, 
  Compass, 
  Layers,
  RotateCcw
} from 'lucide-react';
import { AnimationProject, AnimationParameter, PostProcessingConfig } from '../types/animation';

interface ParameterPanelProps {
  project: AnimationProject;
  onUpdateParam: (id: string, value: any) => void;
  onUpdatePostProcessing: (config: Partial<PostProcessingConfig>) => void;
  onResetParams: () => void;
}

export const ParameterPanel: React.FC<ParameterPanelProps> = ({
  project,
  onUpdateParam,
  onUpdatePostProcessing,
  onResetParams,
}) => {
  const paramsList = Object.values(project.parameters);
  const post = project.postProcessing;

  return (
    <div className="w-80 border-l border-white/10 bg-[#0c0e17] flex flex-col h-full select-none shrink-0 text-slate-200">
      {/* Panel Header */}
      <div className="h-12 px-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#0f111d]">
        <div className="flex items-center gap-2 text-xs font-bold tracking-wide text-cyan-400">
          <Sliders className="w-4 h-4" />
          <span>INSPECTOR & PARAMETERS</span>
        </div>
        <button
          onClick={onResetParams}
          className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Reset to Defaults"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Dynamic Animation Parameters */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Simulation Variables ({paramsList.length})</span>
          </div>

          <div className="space-y-4">
            {paramsList.map((param) => (
              <div key={param.id} className="space-y-1.5 bg-slate-900/60 p-2.5 rounded-xl border border-white/5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-300">{param.label}</span>
                  <span className="font-mono text-[11px] text-cyan-400">
                    {param.type === 'color' ? param.value : typeof param.value === 'number' ? param.value.toFixed(param.step && param.step < 1 ? 2 : 0) : String(param.value)}
                  </span>
                </div>

                {param.type === 'number' && (
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="range"
                      min={param.min ?? 0}
                      max={param.max ?? 100}
                      step={param.step ?? 1}
                      value={param.value}
                      onChange={(e) => onUpdateParam(param.id, parseFloat(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>
                )}

                {param.type === 'color' && (
                  <div className="flex items-center gap-3 pt-1">
                    <input
                      type="color"
                      value={param.value}
                      onChange={(e) => onUpdateParam(param.id, e.target.value)}
                      className="w-8 h-8 rounded-lg border border-white/20 bg-transparent cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={param.value}
                      onChange={(e) => onUpdateParam(param.id, e.target.value)}
                      className="flex-1 bg-slate-950 border border-white/10 rounded px-2 py-1 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                )}

                {param.type === 'boolean' && (
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-slate-400">Toggle State</span>
                    <button
                      onClick={() => onUpdateParam(param.id, !param.value)}
                      className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                        param.value ? 'bg-cyan-500 justify-end' : 'bg-slate-700 justify-start'
                      }`}
                    >
                      <div className="bg-white w-3.5 h-3.5 rounded-full shadow-md" />
                    </button>
                  </div>
                )}

                {param.type === 'select' && param.options && (
                  <select
                    value={param.value}
                    onChange={(e) => onUpdateParam(param.id, e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    {param.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Post-Processing FX Controls */}
        <div className="pt-2 border-t border-white/10">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Post-Processing Shaders</span>
          </div>

          <div className="space-y-3.5">
            {/* Bloom Glow */}
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300">Cinematic Bloom</span>
                <button
                  onClick={() => onUpdatePostProcessing({ bloom: !post.bloom })}
                  className={`w-9 h-5 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                    post.bloom ? 'bg-purple-600 justify-end' : 'bg-slate-700 justify-start'
                  }`}
                >
                  <div className="bg-white w-3 h-3 rounded-full shadow-md" />
                </button>
              </div>

              {post.bloom && (
                <div className="pt-1 space-y-1.5">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Intensity</span>
                    <span className="font-mono text-purple-300">{post.bloomIntensity.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={3.0}
                    step={0.1}
                    value={post.bloomIntensity}
                    onChange={(e) => onUpdatePostProcessing({ bloomIntensity: parseFloat(e.target.value) })}
                    className="w-full accent-purple-400 cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Chromatic Aberration */}
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300">Chromatic Aberration</span>
                <button
                  onClick={() => onUpdatePostProcessing({ chromaticAberration: !post.chromaticAberration })}
                  className={`w-9 h-5 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                    post.chromaticAberration ? 'bg-purple-600 justify-end' : 'bg-slate-700 justify-start'
                  }`}
                >
                  <div className="bg-white w-3 h-3 rounded-full shadow-md" />
                </button>
              </div>

              {post.chromaticAberration && (
                <div className="pt-1 space-y-1.5">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Color Fringe Offset</span>
                    <span className="font-mono text-purple-300">{post.aberrationAmount}px</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={12}
                    step={1}
                    value={post.aberrationAmount}
                    onChange={(e) => onUpdatePostProcessing({ aberrationAmount: parseInt(e.target.value) })}
                    className="w-full accent-purple-400 cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Vignette */}
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300">Cinematic Vignette</span>
                <button
                  onClick={() => onUpdatePostProcessing({ vignette: !post.vignette })}
                  className={`w-9 h-5 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                    post.vignette ? 'bg-purple-600 justify-end' : 'bg-slate-700 justify-start'
                  }`}
                >
                  <div className="bg-white w-3 h-3 rounded-full shadow-md" />
                </button>
              </div>
            </div>

            {/* CRT Scanlines */}
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-white/5 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-300">Retro CRT Scanlines</span>
              <button
                onClick={() => onUpdatePostProcessing({ scanlines: !post.scanlines })}
                className={`w-9 h-5 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  post.scanlines ? 'bg-purple-600 justify-end' : 'bg-slate-700 justify-start'
                }`}
              >
                <div className="bg-white w-3 h-3 rounded-full shadow-md" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
