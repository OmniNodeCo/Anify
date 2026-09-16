import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Volume2, 
  VolumeX, 
  Play, 
  Square, 
  Upload, 
  Music, 
  Activity, 
  Radio 
} from 'lucide-react';
import { AudioConfig } from '../types/animation';
import { globalAudio } from '../runtime/audioEngine';

interface AudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  audioConfig: AudioConfig;
  onUpdateAudioConfig: (config: Partial<AudioConfig>) => void;
}

export const AudioModal: React.FC<AudioModalProps> = ({
  isOpen,
  onClose,
  audioConfig,
  onUpdateAudioConfig,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(globalAudio.getIsPlaying());
  const [preset, setPreset] = useState<'synthwave' | 'techno' | 'cyberpulse' | 'ambient'>(
    (audioConfig.synthPreset as any) || 'synthwave'
  );
  const [volume, setVolume] = useState<number>(audioConfig.volume ?? 0.5);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    setIsPlaying(globalAudio.getIsPlaying());
  }, [isOpen]);

  // Live oscilloscope visualizer inside modal
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const data = globalAudio.getAudioData();
      const w = canvas.width;
      const h = canvas.height;

      ctx.fillStyle = '#0a0d18';
      ctx.fillRect(0, 0, w, h);

      // Draw frequency bars
      const freq = data.frequency;
      const barW = w / freq.length;
      for (let i = 0; i < freq.length; i++) {
        const val = freq[i] / 255;
        const barH = val * h * 0.8;
        ctx.fillStyle = `hsl(${180 + i * 3}, 90%, 55%)`;
        ctx.fillRect(i * barW, h - barH, barW - 1, barH);
      }

      // Draw waveform
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      const wave = data.waveform;
      const step = w / wave.length;
      for (let i = 0; i < wave.length; i++) {
        const y = (wave[i] * 0.4 + 0.5) * h;
        if (i === 0) ctx.moveTo(0, y);
        else ctx.lineTo(i * step, y);
      }
      ctx.stroke();

      animFrameRef.current = requestAnimationFrame(draw);
    };

    animFrameRef.current = requestAnimationFrame(draw);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTogglePlay = () => {
    if (isPlaying) {
      globalAudio.stop();
      setIsPlaying(false);
      onUpdateAudioConfig({ enabled: false });
    } else {
      globalAudio.startPreset(preset);
      setIsPlaying(true);
      onUpdateAudioConfig({ enabled: true, synthPreset: preset, volume });
    }
  };

  const handleSelectPreset = (p: 'synthwave' | 'techno' | 'cyberpulse' | 'ambient') => {
    setPreset(p);
    if (isPlaying) {
      globalAudio.startPreset(p);
    }
    onUpdateAudioConfig({ synthPreset: p });
  };

  const handleVolumeChange = (v: number) => {
    setVolume(v);
    globalAudio.setVolume(v);
    onUpdateAudioConfig({ volume: v });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        await globalAudio.loadAudioFile(e.target.files[0]);
        setIsPlaying(true);
        onUpdateAudioConfig({ enabled: true });
      } catch (err) {
        alert('Could not decode audio file: ' + err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-[#0f111f] border border-white/10 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="h-14 px-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-indigo-950/50 to-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">AUDIO REACTIVITY STUDIO</h2>
              <p className="text-[11px] text-indigo-300">Synchronize motion, scale, and glow to frequencies</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Visualizer Canvas */}
        <div className="p-4 bg-[#0a0c16] border-b border-white/5 flex flex-col items-center">
          <canvas
            ref={canvasRef}
            width={380}
            height={80}
            className="w-full h-20 rounded-xl border border-white/10 shadow-inner"
          />
          <div className="flex items-center justify-between w-full mt-2 text-[11px] text-slate-400 font-mono">
            <span>BASS (0-150Hz)</span>
            <span>MID (150-2kHz)</span>
            <span>TREBLE (2k-16kHz)</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {/* Preset Synthesizer Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Synthesizer Beats</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'synthwave', name: 'Synthwave', bpm: '115 BPM' },
                { id: 'techno', name: 'Dark Techno', bpm: '130 BPM' },
                { id: 'cyberpulse', name: 'Cyberpulse', bpm: '140 BPM' },
                { id: 'ambient', name: 'Ambient Pad', bpm: '75 BPM' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectPreset(p.id as any)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    preset === p.id
                      ? 'bg-indigo-950/60 border-indigo-500 text-white'
                      : 'bg-slate-900/60 border-white/5 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <div className="text-xs font-bold text-indigo-300">{p.name}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{p.bpm}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Master Play/Stop & Volume */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Master Volume</span>
              <span className="font-mono text-xs text-indigo-400">{Math.round(volume * 100)}%</span>
            </div>
            <div className="flex items-center gap-3">
              <Volume2 className="w-4 h-4 text-slate-400" />
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full accent-indigo-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Upload Custom Audio File */}
          <div className="pt-2 border-t border-white/10">
            <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-white/20 hover:border-indigo-400/50 bg-slate-900/40 text-xs text-slate-300 hover:text-white cursor-pointer transition-colors">
              <Upload className="w-4 h-4 text-indigo-400" />
              <span>Or Upload Custom MP3 / WAV Audio</span>
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Toggle Synth Button */}
          <div className="pt-2">
            <button
              onClick={handleTogglePlay}
              className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                isPlaying
                  ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-950/50'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-950/50'
              }`}
            >
              {isPlaying ? (
                <>
                  <Square className="w-4 h-4 fill-current" />
                  <span>Stop Audio Generator</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Audio Synthesizer</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
