import JSZip from 'jszip';
import { SimpleGifEncoder } from '../utils/gifEncoder';
import { AnimationProject } from '../types/animation';
import { generateBlenderPythonScript } from './blenderExporter';

export interface ExportProgress {
  status: 'recording' | 'encoding' | 'zipping' | 'completed' | 'error';
  progress: number; // 0 to 100
  message: string;
}

export class ExportEngine {
  /**
   * Export canvas stream as WebM video file
   */
  public static async exportVideo(
    canvas: HTMLCanvasElement,
    durationSec: number = 5,
    fps: number = 60,
    onProgress?: (p: ExportProgress) => void
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        const stream = canvas.captureStream(fps);
        let mimeType = 'video/webm;codecs=vp9';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'video/mp4';
          }
        }

        const recorder = new MediaRecorder(stream, {
          mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : undefined,
          videoBitsPerSecond: 8000000, // 8 Mbps high quality
        });

        const chunks: Blob[] = [];
        const startTime = Date.now();
        const totalMs = durationSec * 1000;

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunks.push(e.data);
        };

        const progressInterval = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const pct = Math.min(99, Math.round((elapsed / totalMs) * 100));
          if (onProgress) {
            onProgress({
              status: 'recording',
              progress: pct,
              message: `Recording video: ${pct}% (${(elapsed / 1000).toFixed(1)}s / ${durationSec}s)`,
            });
          }
        }, 100);

        recorder.onstop = () => {
          clearInterval(progressInterval);
          if (onProgress) {
            onProgress({
              status: 'encoding',
              progress: 99,
              message: 'Finalizing video file...',
            });
          }
          const blob = new Blob(chunks, { type: chunks[0]?.type || 'video/webm' });
          if (onProgress) {
            onProgress({
              status: 'completed',
              progress: 100,
              message: 'Video export complete!',
            });
          }
          resolve(blob);
        };

        recorder.start();

        setTimeout(() => {
          if (recorder.state === 'recording') {
            recorder.stop();
          }
        }, totalMs);
      } catch (err: any) {
        if (onProgress) {
          onProgress({
            status: 'error',
            progress: 0,
            message: `Video export error: ${err.message || err}`,
          });
        }
        reject(err);
      }
    });
  }

  /**
   * Export animation as an animated GIF
   */
  public static async exportGif(
    canvas: HTMLCanvasElement,
    durationSec: number = 3,
    targetFps: number = 20,
    onProgress?: (p: ExportProgress) => void
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        const totalFrames = Math.floor(durationSec * targetFps);
        const delayMs = Math.round(1000 / targetFps);

        // Render at a reasonable resolution for GIF performance
        const gifWidth = Math.min(canvas.width, 640);
        const gifHeight = Math.round((canvas.height / canvas.width) * gifWidth);
        const encoder = new SimpleGifEncoder(gifWidth, gifHeight);

        // Helper canvas for resizing
        const helperCanvas = document.createElement('canvas');
        helperCanvas.width = gifWidth;
        helperCanvas.height = gifHeight;
        const helperCtx = helperCanvas.getContext('2d', { willReadFrequently: true });

        if (!helperCtx) {
          throw new Error('Failed to create helper 2D context for GIF export');
        }

        let captured = 0;
        const captureInterval = setInterval(() => {
          try {
            helperCtx.clearRect(0, 0, gifWidth, gifHeight);
            helperCtx.drawImage(canvas, 0, 0, gifWidth, gifHeight);
            const imgData = helperCtx.getImageData(0, 0, gifWidth, gifHeight);
            encoder.addFrame(imgData, delayMs);
            captured++;

            const pct = Math.round((captured / totalFrames) * 80);
            if (onProgress) {
              onProgress({
                status: 'recording',
                progress: pct,
                message: `Capturing frames: ${captured}/${totalFrames} (${pct}%)`,
              });
            }

            if (captured >= totalFrames) {
              clearInterval(captureInterval);
              if (onProgress) {
                onProgress({
                  status: 'encoding',
                  progress: 85,
                  message: 'Encoding GIF with color quantization & LZW compression...',
                });
              }

              setTimeout(() => {
                const blob = encoder.render();
                if (onProgress) {
                  onProgress({
                    status: 'completed',
                    progress: 100,
                    message: 'GIF export complete!',
                  });
                }
                resolve(blob);
              }, 50);
            }
          } catch (e) {
            clearInterval(captureInterval);
            reject(e);
          }
        }, delayMs);
      } catch (err: any) {
        if (onProgress) {
          onProgress({
            status: 'error',
            progress: 0,
            message: `GIF export error: ${err.message || err}`,
          });
        }
        reject(err);
      }
    });
  }

  /**
   * Export frame-by-frame PNG sequence bundled in a ZIP
   */
  public static async exportPngSequence(
    canvas: HTMLCanvasElement,
    durationSec: number = 3,
    targetFps: number = 30,
    onProgress?: (p: ExportProgress) => void
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        const zip = new JSZip();
        const totalFrames = Math.floor(durationSec * targetFps);
        const delayMs = Math.round(1000 / targetFps);

        let captured = 0;
        const interval = setInterval(() => {
          canvas.toBlob((blob) => {
            if (blob) {
              const frameNum = String(captured + 1).padStart(4, '0');
              zip.file(`frame_${frameNum}.png`, blob);
            }
            captured++;

            const pct = Math.round((captured / totalFrames) * 75);
            if (onProgress) {
              onProgress({
                status: 'recording',
                progress: pct,
                message: `Capturing PNG frame ${captured}/${totalFrames}...`,
              });
            }

            if (captured >= totalFrames) {
              clearInterval(interval);
              if (onProgress) {
                onProgress({
                  status: 'zipping',
                  progress: 80,
                  message: 'Compressing PNG frames into ZIP archive...',
                });
              }

              zip.generateAsync({ type: 'blob' }, (metadata) => {
                const pct = 80 + Math.round(metadata.percent * 0.2);
                if (onProgress) {
                  onProgress({
                    status: 'zipping',
                    progress: pct,
                    message: `Zipping: ${pct}%`,
                  });
                }
              }).then((zipBlob) => {
                if (onProgress) {
                  onProgress({
                    status: 'completed',
                    progress: 100,
                    message: 'PNG Sequence ZIP ready!',
                  });
                }
                resolve(zipBlob);
              }).catch(reject);
            }
          }, 'image/png');
        }, delayMs);
      } catch (err: any) {
        if (onProgress) {
          onProgress({
            status: 'error',
            progress: 0,
            message: `PNG Sequence error: ${err.message || err}`,
          });
        }
        reject(err);
      }
    });
  }

  /**
   * Generate a standalone single-file HTML bundle
   * Opens in any browser with interactive mouse controls and zero server dependencies
   */
  public static generateStandaloneHtml(project: AnimationProject): string {
    const serializedParams = JSON.stringify(
      Object.entries(project.parameters).reduce((acc, [k, v]) => {
        acc[k] = v.value;
        return acc;
      }, {} as Record<string, any>),
      null,
      2
    );

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project.title} — Created with Anify AI</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body, html { width: 100%; height: 100%; overflow: hidden; background: #07080d; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    canvas { display: block; width: 100%; height: 100%; touch-action: none; }
    #ui-overlay {
      position: absolute;
      top: 16px;
      left: 16px;
      color: rgba(255, 255, 255, 0.9);
      background: rgba(17, 19, 28, 0.75);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 12px 18px;
      border-radius: 12px;
      font-size: 13px;
      pointer-events: auto;
      user-select: none;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      transition: opacity 0.3s;
    }
    #ui-overlay:hover { opacity: 1; }
    h1 { font-size: 15px; font-weight: 700; color: #38bdf8; margin-bottom: 4px; letter-spacing: -0.02em; }
    p { font-size: 12px; color: #94a3b8; }
    .badge {
      display: inline-block;
      margin-top: 6px;
      font-size: 10px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 999px;
      background: rgba(56, 189, 248, 0.15);
      color: #38bdf8;
      border: 1px solid rgba(56, 189, 248, 0.3);
    }
  </style>
  ${project.engine === 'webgl-three' ? '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>' : ''}
</head>
<body>
  <div id="ui-overlay">
    <h1>${project.title}</h1>
    <p>${project.prompt || project.description}</p>
    <div class="badge">Created with Anify AI • ${project.engine}</div>
  </div>
  <canvas id="stage"></canvas>

  <script>
    (function() {
      const canvas = document.getElementById('stage');
      const ctx = canvas.getContext('2d');
      const params = ${serializedParams};
      const duration = ${project.duration};

      let width = window.innerWidth;
      let height = window.innerHeight;
      let startTime = performance.now();
      let lastTime = startTime;
      let frame = 0;

      const mouse = {
        x: 0,
        y: 0,
        isDown: false,
        clickTime: 0,
        lastClickX: 0,
        lastClickY: 0
      };

      const audioData = {
        bass: 0.2,
        mid: 0.2,
        treble: 0.2,
        volume: 0.2,
        waveform: new Float32Array(128),
        frequency: new Uint8Array(64)
      };

      function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        if (ctx) ctx.scale(dpr, dpr);
      }

      window.addEventListener('resize', resize);
      resize();

      window.addEventListener('mousemove', (e) => {
        mouse.x = (e.clientX / width) * 2 - 1;
        mouse.y = -(e.clientY / height) * 2 + 1;
      });
      window.addEventListener('mousedown', (e) => {
        mouse.isDown = true;
        mouse.clickTime = (performance.now() - startTime) / 1000;
        mouse.lastClickX = e.clientX;
        mouse.lastClickY = e.clientY;
      });
      window.addEventListener('mouseup', () => { mouse.isDown = false; });
      window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
          mouse.x = (e.touches[0].clientX / width) * 2 - 1;
          mouse.y = -(e.touches[0].clientY / height) * 2 + 1;
        }
      });

      // User Animation Code
      let cleanup = null;
      let updateFn = null;

      try {
        const animationFactory = new Function('canvas', 'ctx', 'THREE', \`
          \${${JSON.stringify(project.code)}}
          if (typeof render === 'function') return { render: render };
          if (typeof update === 'function') return { render: update };
          return null;
        \`);

        const instance = animationFactory(canvas, ctx, window.THREE);
        if (instance && instance.render) {
          updateFn = instance.render;
        }
      } catch (err) {
        console.error('Failed to initialize animation:', err);
      }

      function loop(now) {
        requestAnimationFrame(loop);
        const time = (now - startTime) / 1000;
        const deltaTime = Math.min(0.1, (now - lastTime) / 1000);
        lastTime = now;
        frame++;

        const progress = duration > 0 ? (time % duration) / duration : (time % 10) / 10;

        const renderContext = {
          canvas,
          ctx,
          gl: null,
          width,
          height,
          time,
          deltaTime,
          progress,
          frame,
          params,
          audioData,
          mouse
        };

        if (updateFn) {
          try {
            updateFn(renderContext);
          } catch (e) {
            console.error(e);
          }
        }
      }

      requestAnimationFrame(loop);
    })();
  </script>
</body>
</html>`;
  }

  /**
   * Export Blender Python integration script
   */
  public static exportBlenderScript(project: AnimationProject): string {
    return generateBlenderPythonScript(project);
  }

  public static downloadFile(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  public static downloadText(text: string, filename: string, mimeType: string = 'text/plain') {
    const blob = new Blob([text], { type: mimeType });
    this.downloadFile(blob, filename);
  }
}
