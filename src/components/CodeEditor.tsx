import React, { useState } from 'react';
import { 
  Code2, 
  Play, 
  Copy, 
  Check, 
  Download, 
  Sparkles, 
  RotateCcw,
  Terminal
} from 'lucide-react';
import { ExportEngine } from '../runtime/exportEngine';

interface CodeEditorProps {
  code: string;
  onChangeCode: (code: string) => void;
  onRecompile: () => void;
  onAskAI: (prompt: string) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChangeCode,
  onRecompile,
  onAskAI,
}) => {
  const [copied, setCopied] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isApplyingAI, setIsApplyingAI] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    ExportEngine.downloadText(code, 'animation_script.js', 'application/javascript');
  };

  const handleAiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setIsApplyingAI(true);
    onAskAI(aiPrompt);
    setAiPrompt('');
    setTimeout(() => setIsApplyingAI(false), 600);
  };

  const lines = code.split('\n');

  return (
    <div className="w-96 border-l border-white/10 bg-[#090b14] flex flex-col h-full select-none shrink-0 text-slate-200">
      {/* Code Header */}
      <div className="h-12 px-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#0d0f1c]">
        <div className="flex items-center gap-2 text-xs font-bold tracking-wide text-cyan-400">
          <Code2 className="w-4 h-4" />
          <span>SCRIPT & SHADER ENGINE</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Copy script to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleDownload}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Download .js file"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onRecompile}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer ml-1"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Run</span>
          </button>
        </div>
      </div>

      {/* AI Inline Code Prompt Bar */}
      <form onSubmit={handleAiSubmit} className="p-2 border-b border-white/10 bg-[#0e1120]">
        <div className="flex items-center gap-1.5 bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1 focus-within:border-cyan-500/50">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <input
            type="text"
            placeholder="Ask AI to modify this code..."
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!aiPrompt.trim() || isApplyingAI}
            className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 disabled:opacity-40 transition-colors cursor-pointer"
          >
            Apply
          </button>
        </div>
      </form>

      {/* Code Textarea with Line Numbers */}
      <div className="flex-1 flex overflow-hidden font-mono text-xs">
        {/* Line numbers */}
        <div className="w-10 bg-[#07080e] border-r border-white/5 py-3 select-none text-right pr-2 text-slate-600 text-[11px] shrink-0 font-mono">
          {lines.map((_, i) => (
            <div key={i} className="leading-5">{i + 1}</div>
          ))}
        </div>

        {/* Text Area */}
        <textarea
          value={code}
          onChange={(e) => onChangeCode(e.target.value)}
          spellCheck={false}
          className="flex-1 bg-transparent p-3 text-slate-200 leading-5 resize-none focus:outline-none font-mono text-xs selection:bg-cyan-500/30 overflow-auto whitespace-pre"
        />
      </div>

      {/* Footer Info */}
      <div className="h-7 px-3 border-t border-white/10 bg-[#0b0d18] flex items-center justify-between text-[10px] text-slate-500 font-mono">
        <span>render(ctx, width, height, time, params, mouse)</span>
        <span>{lines.length} lines</span>
      </div>
    </div>
  );
};
