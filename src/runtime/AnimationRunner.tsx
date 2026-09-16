import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { AnimationProject, RenderContext } from '../types/animation';
import { globalAudio } from './audioEngine';

// Expose THREE globally for dynamic animation scripts
(window as any).THREE = THREE;

export interface AnimationRunnerRef {
  getCanvas: () => HTMLCanvasElement | null;
  getCurrentTime: () => number;
  seekTo: (time: number) => void;
  play: () => void;
  pause: () => void;
  stepFrame: (frames: number) => void;
  reset: () => void;
}

interface AnimationRunnerProps {
  project: AnimationProject;
  isPlaying: boolean;
  currentTime: number;
  onTimeUpdate?: (time: number) => void;
  onFpsUpdate?: (fps: number, frameTimeMs: number) => void;
  onError?: (error: string | null) => void;
  aspectRatio?: '16:9' | '9:16' | '1:1' | '4:3' | '21:9';
}

export const AnimationRunner = forwardRef<AnimationRunnerRef, AnimationRunnerProps>(
  ({ project, isPlaying, currentTime, onTimeUpdate, onFpsUpdate, onError, aspectRatio = '16:9' }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const postCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const animInstanceRef = useRef<{ render?: (ctx: RenderContext) => void; cleanup?: () => void } | null>(null);
    const requestRef = useRef<number | null>(null);
    const timeRef = useRef<number>(currentTime);
    const lastFrameTimeRef = useRef<number>(performance.now());
    const frameCountRef = useRef<number>(0);
    const fpsTimerRef = useRef<number>(performance.now());
    const fpsFramesRef = useRef<number>(0);

    const mouseRef = useRef({
      x: 0,
      y: 0,
      isDown: false,
      clickTime: 0,
      lastClickX: 0,
      lastClickY: 0
    });

    const [runtimeError, setRuntimeError] = useState<string | null>(null);

    // Sync timeRef with external currentTime when seeking
    useEffect(() => {
      timeRef.current = currentTime;
    }, [currentTime]);

    // Imperative methods for playback and export
    useImperativeHandle(ref, () => ({
      getCanvas: () => {
        // Return post-processed canvas if active, else base canvas
        return postCanvasRef.current || canvasRef.current;
      },
      getCurrentTime: () => timeRef.current,
      seekTo: (t: number) => {
        timeRef.current = t;
        renderSingleFrame();
      },
      play: () => {},
      pause: () => {},
      stepFrame: (frames: number) => {
        const dt = frames * (1 / (project.fps || 60));
        timeRef.current = Math.max(0, timeRef.current + dt);
        renderSingleFrame();
      },
      reset: () => {
        timeRef.current = 0;
        recompile();
      }
    }));

    // Recompile animation code when project.code or engine changes
    const recompile = () => {
      setRuntimeError(null);
      if (onError) onError(null);

      if (animInstanceRef.current?.cleanup) {
        try {
          animInstanceRef.current.cleanup();
        } catch (e) {}
      }
      animInstanceRef.current = null;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');

      try {
        // Build executable function
        const scriptFactory = new Function(
          'canvas',
          'ctx',
          'THREE',
          `
          ${project.code}
          if (typeof render === 'function') return { render: render };
          if (typeof update === 'function') return { render: update };
          return null;
        `
        );

        const instance = scriptFactory(canvas, ctx, THREE);
        if (instance && typeof instance.render === 'function') {
          animInstanceRef.current = instance;
        } else {
          // If the script just executes commands without returning an object, fallback to checking window
          animInstanceRef.current = {
            render: (context: RenderContext) => {
              if (typeof (window as any).render === 'function') {
                (window as any).render(context);
              }
            }
          };
        }
      } catch (err: any) {
        console.error('Animation Compilation Error:', err);
        const errMsg = err.message || String(err);
        setRuntimeError(errMsg);
        if (onError) onError(errMsg);
      }
    };

    useEffect(() => {
      recompile();
    }, [project.code, project.engine]);

    // Render single frame on seek/pause
    const renderSingleFrame = () => {
      const canvas = canvasRef.current;
      if (!canvas || !animInstanceRef.current?.render) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;
      const ctx = canvas.getContext('2d');
      const gl = canvas.getContext('webgl');

      const paramsValues: Record<string, any> = {};
      Object.entries(project.parameters).forEach(([k, v]) => {
        paramsValues[k] = v.value;
      });

      const audioData = globalAudio.getAudioData();
      const duration = project.duration || 10;
      const progress = duration > 0 ? (timeRef.current % duration) / duration : 0;

      const renderContext: RenderContext = {
        canvas,
        ctx,
        gl,
        width,
        height,
        time: timeRef.current,
        deltaTime: 1 / 60,
        progress,
        frame: frameCountRef.current,
        params: paramsValues,
        audioData,
        mouse: mouseRef.current
      };

      try {
        animInstanceRef.current.render(renderContext);
        applyPostProcessing();
      } catch (e: any) {
        setRuntimeError(e.message || String(e));
        if (onError) onError(e.message || String(e));
      }
    };

    // Apply 2D Post-Processing effects (Bloom, Aberration, Vignette, Scanlines)
    const applyPostProcessing = () => {
      const canvas = canvasRef.current;
      const postCanvas = postCanvasRef.current;
      if (!canvas || !postCanvas) return;

      const postCtx = postCanvas.getContext('2d');
      if (!postCtx) return;

      const { width, height } = postCanvas;
      const post = project.postProcessing;

      postCtx.clearRect(0, 0, width, height);

      // 1. Draw base frame
      postCtx.drawImage(canvas, 0, 0, width, height);

      // 2. Chromatic Aberration
      if (post.chromaticAberration) {
        const offset = post.aberrationAmount || 3;
        postCtx.save();
        postCtx.globalCompositeOperation = 'screen';
        postCtx.drawImage(canvas, -offset, 0, width, height);
        postCtx.drawImage(canvas, offset, 0, width, height);
        postCtx.restore();
      }

      // 3. Bloom (Additive blurred glow)
      if (post.bloom) {
        postCtx.save();
        postCtx.globalCompositeOperation = 'lighter';
        postCtx.filter = `blur(${Math.min(24, post.bloomRadius || 16)}px) brightness(${post.bloomIntensity || 1.4})`;
        postCtx.drawImage(canvas, 0, 0, width, height);
        postCtx.filter = 'none';
        postCtx.restore();
      }

      // 4. CRT Scanlines
      if (post.scanlines) {
        postCtx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        for (let y = 0; y < height; y += 4) {
          postCtx.fillRect(0, y, width, 1.5);
        }
      }

      // 5. Cinematic Vignette
      if (post.vignette) {
        const grad = postCtx.createRadialGradient(
          width / 2, height / 2, Math.min(width, height) * 0.35,
          width / 2, height / 2, Math.min(width, height) * 0.75
        );
        grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        grad.addColorStop(1, `rgba(0, 0, 0, ${post.vignetteDarkness || 0.7})`);

        postCtx.fillStyle = grad;
        postCtx.fillRect(0, 0, width, height);
      }
    };

    // Animation Loop
    useEffect(() => {
      let isSubscribed = true;

      const loop = (now: number) => {
        if (!isSubscribed) return;

        const delta = Math.min(0.1, (now - lastFrameTimeRef.current) / 1000);
        lastFrameTimeRef.current = now;

        // FPS calculation
        fpsFramesRef.current++;
        if (now - fpsTimerRef.current >= 500) {
          const fps = Math.round((fpsFramesRef.current * 1000) / (now - fpsTimerRef.current));
          const frameMs = Number((1000 / (fps || 60)).toFixed(1));
          if (onFpsUpdate) onFpsUpdate(fps, frameMs);
          fpsFramesRef.current = 0;
          fpsTimerRef.current = now;
        }

        if (isPlaying) {
          timeRef.current += delta;
          const duration = project.duration || 10;
          if (duration > 0 && timeRef.current >= duration) {
            timeRef.current = timeRef.current % duration;
          }
          if (onTimeUpdate) {
            onTimeUpdate(timeRef.current);
          }
        }

        const canvas = canvasRef.current;
        if (canvas && animInstanceRef.current?.render) {
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          const width = canvas.width / dpr;
          const height = canvas.height / dpr;
          const ctx = canvas.getContext('2d');
          const gl = canvas.getContext('webgl');

          const paramsValues: Record<string, any> = {};
          Object.entries(project.parameters).forEach(([k, v]) => {
            paramsValues[k] = v.value;
          });

          const audioData = globalAudio.getAudioData();
          const duration = project.duration || 10;
          const progress = duration > 0 ? (timeRef.current % duration) / duration : 0;

          const renderContext: RenderContext = {
            canvas,
            ctx,
            gl,
            width,
            height,
            time: timeRef.current,
            deltaTime: delta,
            progress,
            frame: frameCountRef.current++,
            params: paramsValues,
            audioData,
            mouse: mouseRef.current
          };

          try {
            animInstanceRef.current.render(renderContext);
            applyPostProcessing();
            if (runtimeError) {
              setRuntimeError(null);
              if (onError) onError(null);
            }
          } catch (err: any) {
            console.error('Animation Runtime Error:', err);
            const msg = err.message || String(err);
            setRuntimeError(msg);
            if (onError) onError(msg);
          }
        }

        requestRef.current = requestAnimationFrame(loop);
      };

      requestRef.current = requestAnimationFrame(loop);

      return () => {
        isSubscribed = false;
        if (requestRef.current) {
          cancelAnimationFrame(requestRef.current);
        }
      };
    }, [isPlaying, project.parameters, project.duration, project.postProcessing]);

    // Resize handling
    const updateCanvasDimensions = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      const postCanvas = postCanvasRef.current;
      if (!container || !canvas || !postCanvas) return;

      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      // Compute aspect ratio dimensions to fit container
      let targetW = rect.width;
      let targetH = rect.height;

      const ratioMap: Record<string, number> = {
        '16:9': 16 / 9,
        '9:16': 9 / 16,
        '1:1': 1,
        '4:3': 4 / 3,
        '21:9': 21 / 9
      };

      const desiredRatio = ratioMap[aspectRatio] || 16 / 9;
      const containerRatio = rect.width / rect.height;

      if (containerRatio > desiredRatio) {
        targetH = rect.height;
        targetW = targetH * desiredRatio;
      } else {
        targetW = rect.width;
        targetH = targetW / desiredRatio;
      }

      canvas.width = Math.floor(targetW * dpr);
      canvas.height = Math.floor(targetH * dpr);
      canvas.style.width = `${Math.floor(targetW)}px`;
      canvas.style.height = `${Math.floor(targetH)}px`;

      postCanvas.width = Math.floor(targetW * dpr);
      postCanvas.height = Math.floor(targetH * dpr);
      postCanvas.style.width = `${Math.floor(targetW)}px`;
      postCanvas.style.height = `${Math.floor(targetH)}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);

      const postCtx = postCanvas.getContext('2d');
      if (postCtx) postCtx.scale(dpr, dpr);
    };

    useEffect(() => {
      updateCanvasDimensions();
      const observer = new ResizeObserver(() => {
        updateCanvasDimensions();
      });
      if (containerRef.current) {
        observer.observe(containerRef.current);
      }
      return () => observer.disconnect();
    }, [aspectRatio]);

    // Mouse and touch interaction listeners
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      const canvas = postCanvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseRef.current.x = Math.max(-1, Math.min(1, x));
      mouseRef.current.y = Math.max(-1, Math.min(1, y));
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
      mouseRef.current.isDown = true;
      mouseRef.current.clickTime = timeRef.current;
      mouseRef.current.lastClickX = e.clientX;
      mouseRef.current.lastClickY = e.clientY;
    };

    const handleMouseUp = () => {
      mouseRef.current.isDown = false;
    };

    return (
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="relative w-full h-full flex items-center justify-center overflow-hidden canvas-grid-bg cursor-crosshair"
      >
        {/* Hidden primary render canvas */}
        <canvas
          ref={canvasRef}
          className="absolute opacity-0 pointer-events-none"
        />

        {/* Visible post-processed canvas */}
        <canvas
          ref={postCanvasRef}
          className="shadow-2xl rounded-lg border border-white/10"
        />

        {/* Runtime Error Overlay */}
        {runtimeError && (
          <div className="absolute bottom-4 left-4 right-4 z-40 bg-red-950/90 border border-red-500/50 backdrop-blur-md text-red-200 px-4 py-3 rounded-xl shadow-2xl flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div className="flex-1 text-xs">
              <div className="font-bold text-red-300">Animation Script Error</div>
              <div className="font-mono mt-1 text-red-200/80 break-words">{runtimeError}</div>
            </div>
            <button
              onClick={recompile}
              className="text-xs bg-red-800 hover:bg-red-700 text-white font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    );
  }
);
