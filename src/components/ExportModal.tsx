import React, { useState } from 'react';
import { 
  X, 
  Film, 
  Image, 
  Archive, 
  FileCode, 
  FileJson, 
  Download, 
  Loader2, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { AnimationProject } from '../types/animation';
import { ExportEngine, ExportProgress } from '../runtime/exportEngine';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: AnimationProject;
  getCanvas: () => HTMLCanvasElement | null;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  project,
  getCanvas,
}) => {
  const [exportType, setExportType] = useState<'video' | 'gif' | 'png_zip' | 'html' | 'json'>('video');
  const [durationSec, setDurationSec] = useState<number>(Math.min(project.duration || 6, 8));
  const [fps, setFps] = useState<number>(60);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [progress, setProgress] = useState<ExportProgress | null>(null);

  if (!isOpen) return null;

  const handleStartExport = async () => {
    const canvas = getCanvas();
    if (!canvas) {
      alert('Canvas stage not ready yet.');
      return;
    }

    setIsExporting(true);
    setProgress({ status: 'recording', progress: 0, message: 'Initializing exporter...' });

    try {
      if (exportType === 'video') {
        const videoBlob = await ExportEngine.exportVideo(
          canvas,
          durationSec,
          fps,
          (p) => setProgress(p)
        );
        ExportEngine.downloadFile(videoBlob, `${project.title.toLowerCase().replace(/\s+/g, '_')}.webm`);
      } else if (exportType === 'gif') {
        const gifBlob = await ExportEngine.exportGif(
          canvas,
          Math.min(durationSec, 4), // max 4s for GIF performance
          20,
          (p) => setProgress(p)
        );
        ExportEngine.downloadFile(gifBlob, `${project.title.toLowerCase().replace(/\s+/g, '_')}.gif`);
      } else if (exportType === 'png_zip') {
        const zipBlob = await ExportEngine.exportPngSequence(
          canvas,
          Math.min(durationSec, 4),
          30,
          (p) => setProgress(p)
        );
        ExportEngine.downloadFile(zipBlob, `${project.title.toLowerCase().replace(/\s+/g, '_')}_frames.zip`);
      } else if (exportType === 'html') {
        const html = ExportEngine.generateStandaloneHtml(project);
        ExportEngine.downloadText(html, `${project.title.toLowerCase().replace(/\s+/g, '_')}.html`, 'text/html');
        setProgress({ status: 'completed', progress: 100, message: 'Standalone HTML bundle generated!' });
      } else if (exportType === 'json') {
        const json = JSON.stringify(project, null, 2);
        ExportEngine.downloadText(json, `${project.title.toLowerCase().replace(/\s+/g, '_')}.anify.json`, 'application/json');
        setProgress({ status: 'completed', progress: 100, message: 'Project JSON downloaded!' });
      }
    } catch (err: any) {
      console.error('Export Error:', err);
      setProgress({ status: 'error', progress: 0, message: err.message || 'Export failed' });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0f111f] border border-white/10 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="h-14 px-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-emerald-950/40 to-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Download className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">EXPORT ANIMATION</h2>
              <p className="text-[11px] text-emerald-300">Render and package to video, GIF, or code</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isExporting}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4">
          {/* Format selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Output Format</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setExportType('video')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                  exportType === 'video'
                    ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-lg shadow-emerald-950/50'
                    : 'bg-slate-900/80 border-white/5 text-slate-400 hover:border-white/20'
                }`}
              >
                <Film className={`w-4 h-4 mt-0.5 ${exportType === 'video' ? 'text-emerald-400' : 'text-slate-400'}`} />
                <div>
                  <div className="text-xs font-bold">WebM / MP4 Video</div>
                  <div className="text-[10px] text-slate-400">High-bitrate 60FPS video</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setExportType('gif')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                  exportType === 'gif'
                    ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-lg shadow-emerald-950/50'
                    : 'bg-slate-900/80 border-white/5 text-slate-400 hover:border-white/20'
                }`}
              >
                <Image className={`w-4 h-4 mt-0.5 ${exportType === 'gif' ? 'text-emerald-400' : 'text-slate-400'}`} />
                <div>
                  <div className="text-xs font-bold">Animated GIF</div>
                  <div className="text-[10px] text-slate-400">Looping animated image</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setExportType('png_zip')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                  exportType === 'png_zip'
                    ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-lg shadow-emerald-950/50'
                    : 'bg-slate-900/80 border-white/5 text-slate-400 hover:border-white/20'
                }`}
              >
                <Archive className={`w-4 h-4 mt-0.5 ${exportType === 'png_zip' ? 'text-emerald-400' : 'text-slate-400'}`} />
                <div>
                  <div className="text-xs font-bold">PNG Frames (ZIP)</div>
                  <div className="text-[10px] text-slate-400">Lossless frame sequence</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setExportType('html')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                  exportType === 'html'
                    ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-lg shadow-emerald-950/50'
                    : 'bg-slate-900/80 border-white/5 text-slate-400 hover:border-white/20'
                }`}
              >
                <FileCode className={`w-4 h-4 mt-0.5 ${exportType === 'html' ? 'text-emerald-400' : 'text-slate-400'}`} />
                <div>
                  <div className="text-xs font-bold">Standalone HTML</div>
                  <div className="text-[10px] text-slate-400">Single file runnable anywhere</div>
                </div>
              </button>
            </div>
          </div>

          {/* Duration & Quality Config for video/gif */}
          {(exportType === 'video' || exportType === 'gif' || exportType === 'png_zip') && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Recording Duration</label>
                <select
                  value={durationSec}
                  onChange={(e) => setDurationSec(Number(e.target.value))}
                  disabled={isExporting}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value={3}>3 Seconds</option>
                  <option value={5}>5 Seconds</option>
                  <option value={8}>8 Seconds</option>
                  <option value={10}>10 Seconds</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Framerate (FPS)</label>
                <select
                  value={fps}
                  onChange={(e) => setFps(Number(e.target.value))}
                  disabled={isExporting || exportType === 'gif'}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer disabled:opacity-50"
                >
                  <option value={30}>30 FPS</option>
                  <option value={60}>60 FPS (Smooth)</option>
                </select>
              </div>
            </div>
          )}

          {/* Progress Indicator */}
          {progress && (
            <div className="p-3 bg-slate-900 rounded-xl border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">{progress.message}</span>
                <span className="font-mono text-emerald-400">{progress.progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-200"
                  style={{ width: `${progress.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Start Export Button */}
          <div className="pt-2">
            <button
              onClick={handleStartExport}
              disabled={isExporting}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Export...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Start Export</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
