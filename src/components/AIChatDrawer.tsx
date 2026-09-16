import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  X, 
  User, 
  Zap, 
  CheckCircle2 
} from 'lucide-react';
import { AIChatMessage } from '../types/animation';

interface AIChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  messages: AIChatMessage[];
  onSendMessage: (message: string) => void;
  isProcessing?: boolean;
}

const QUICK_ACTIONS = [
  "🚀 Make it 2x faster",
  "🔮 Slower & cinematic",
  "🎨 Emerald matrix green",
  "💜 Neon purple glow",
  "✨ Boost cinematic bloom",
  "🌌 Increase particle density",
  "🎵 Link to audio beat",
  "📺 Add CRT scanlines"
];

export const AIChatDrawer: React.FC<AIChatDrawerProps> = ({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  isProcessing = false,
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="absolute top-14 bottom-44 left-0 w-84 z-30 bg-[#0d0f1b]/95 backdrop-blur-xl border-r border-white/10 flex flex-col shadow-2xl animate-in slide-in-from-left duration-200">
      {/* Header */}
      <div className="h-12 px-4 border-b border-white/10 flex items-center justify-between bg-[#111322]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-purple-600/30 border border-purple-500/40 flex items-center justify-center">
            <Bot className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide">AI CO-DIRECTOR</h3>
            <p className="text-[10px] text-purple-300">Live Animation Assistant</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Action Chips */}
      <div className="p-2 border-b border-white/5 bg-[#0a0c16] flex gap-1.5 overflow-x-auto select-none no-scrollbar">
        {QUICK_ACTIONS.map((action, i) => (
          <button
            key={i}
            onClick={() => onSendMessage(action)}
            className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-purple-900/40 hover:border-purple-500/40 border border-white/5 text-[11px] text-slate-300 hover:text-purple-200 transition-all cursor-pointer shrink-0"
          >
            {action}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-1.5 mb-1 px-1">
              {m.role === 'user' ? (
                <>
                  <span className="text-[10px] text-slate-400 font-medium">You</span>
                  <User className="w-3 h-3 text-cyan-400" />
                </>
              ) : (
                <>
                  <Bot className="w-3 h-3 text-purple-400" />
                  <span className="text-[10px] text-purple-300 font-medium">AI Director</span>
                </>
              )}
            </div>

            <div
              className={`max-w-[90%] p-2.5 rounded-xl text-xs leading-relaxed ${
                m.role === 'user'
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-tr-none'
                  : 'bg-slate-800/90 border border-white/10 text-slate-200 rounded-tl-none shadow-md'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg text-xs text-slate-400 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <span>AI Director updating animation parameters...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Bar */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-white/10 bg-[#0e101f]">
        <div className="flex items-center gap-1.5 bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 focus-within:border-purple-500/60 focus-within:ring-1 focus-within:ring-purple-500/30">
          <input
            type="text"
            placeholder="Direct the AI (e.g. make it faster, more glow)..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isProcessing}
            className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || isProcessing}
            className="p-1 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
