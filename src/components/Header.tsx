import React from 'react';
import { 
  Sparkles, 
  Film, 
  Download, 
  Code2, 
  Sliders, 
  Volume2, 
  LayoutGrid, 
  HelpCircle,
  Play,
  Pause,
  Bot
} from 'lucide-react';
import { AnimationProject } from '../types/animation';

interface HeaderProps {
  appMode: 'character' | 'fx';
  onChangeAppMode: (mode: 'character' | 'fx') => void;
  project: AnimationProject;
  onUpdateTitle: (title: string) => void;
  onOpenAIGenerator: () => void;
  onOpenGallery: () => void;
  onOpenExport: () => void;
  onOpenAudio: () => void;
  onOpenHelp: () => void;
  onToggleChat: () => void;
  isChatOpen: boolean;
  activeRightTab: 'params' | 'code';
  onChangeRightTab: (tab: 'params' | 'code') => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  appMode,
  onChangeAppMode,
  project,
  onUpdateTitle,
  onOpenAIGenerator,
  onOpenGallery,
  onOpenExport,
  onOpenAudio,
  onOpenHelp,
  onToggleChat,
  isChatOpen,
  activeRightTab,
  onChangeRightTab,
  isPlaying,
  onTogglePlay,
}) => {
  return (
    <header className="h-14 border-b border-white/10 bg-[#0d0f18]/90 backdrop-blur-md px-4 flex items-center justify-between select-none z-30 shrink-0">
      {/* Brand & Mode Switcher */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 cursor-pointer group" onClick={onOpenGallery}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 via-indigo-500 to-pink-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-cyan-400 via-sky-200 to-purple-400 bg-clip-text text-transparent">
              ANIFY
            </span>
            <span className="text-[10px] font-semibold tracking-wider text-cyan-400/80 uppercase ml-1.5 px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40">
              APP
            </span>
          </div>
        </div>

        <div className="h-4 w-[1px] bg-white/10" />

        {/* Master Mode Switcher (Character Studio vs FX Studio) */}
        <div className="flex items-center bg-slate-900 border border-white/10 rounded-lg p-0.5 shadow-inner">
          <button
            onClick={() => onChangeAppMode('character')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
              appMode === 'character'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🤖 Character App</span>
          </button>
          <button
            onClick={() => onChangeAppMode('fx')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
              appMode === 'fx'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>⚡ FX & Shaders</span>
          </button>
        </div>
      </div>

      {/* Middle Action: AI Generate Trigger */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenAIGenerator}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all cursor-pointer group"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-200 group-hover:rotate-12 transition-transform" />
          <span>New AI Animation</span>
        </button>

        <button
          onClick={onOpenGallery}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-slate-300 hover:text-white text-xs font-medium transition-all cursor-pointer"
        >
          <LayoutGrid className="w-3.5 h-3.5 text-slate-400" />
          <span>Presets (19)</span>
        </button>

        <button
          onClick={onToggleChat}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
            isChatOpen 
              ? 'bg-purple-900/40 border-purple-500/60 text-purple-300 shadow-md shadow-purple-900/30' 
              : 'bg-slate-800/80 hover:bg-slate-700/80 border-white/10 text-slate-300 hover:text-white'
          }`}
        >
          <Bot className="w-3.5 h-3.5 text-purple-400" />
          <span>AI Director</span>
        </button>
      </div>

      {/* Right Controls: Audio, Code/Inspector Switcher, Export */}
      <div className="flex items-center gap-2">
        {/* Audio Reactive modal trigger */}
        <button
          onClick={onOpenAudio}
          className={`p-2 rounded-lg border transition-all cursor-pointer ${
            project.audio.enabled
              ? 'bg-indigo-900/40 border-indigo-500/50 text-indigo-300'
              : 'bg-slate-800/70 hover:bg-slate-700/70 border-white/10 text-slate-400 hover:text-white'
          }`}
          title="Audio Reactivity & Synthesizer"
        >
          <Volume2 className="w-4 h-4" />
        </button>

        {/* Tab switchers: Parameters vs Code */}
        <div className="hidden md:flex items-center bg-slate-900/80 border border-white/10 rounded-lg p-0.5">
          <button
            onClick={() => onChangeRightTab('params')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
              activeRightTab === 'params'
                ? 'bg-slate-800 text-cyan-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3 h-3" />
            <span>Inspector</span>
          </button>
          <button
            onClick={() => onChangeRightTab('code')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
              activeRightTab === 'code'
                ? 'bg-slate-800 text-cyan-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3 h-3" />
            <span>Code</span>
          </button>
        </div>

        {/* Export Modal Trigger */}
        <button
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-950/40 transition-all cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>

        {/* Quick Guide */}
        <button
          onClick={onOpenHelp}
          className="p-2 rounded-lg bg-slate-800/70 hover:bg-slate-700/70 border border-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
          title="Hotkeys & Guide"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
