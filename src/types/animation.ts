export type EngineType = 'canvas2d' | 'webgl-three' | 'shader-glsl' | 'vector-svg';

export type AspectRatioType = '16:9' | '9:16' | '1:1' | '4:3' | '21:9';

export type EasingFunction = 
  | 'linear' 
  | 'easeInOutQuad' 
  | 'easeOutCubic' 
  | 'easeInOutSine' 
  | 'easeInOutExpo' 
  | 'elasticOut' 
  | 'bounceOut';

export interface Keyframe {
  id: string;
  time: number; // in seconds
  value: number;
  easing?: EasingFunction;
}

export interface KeyframeTrack {
  id: string;
  name: string;
  targetProperty: string;
  defaultValue: number;
  min: number;
  max: number;
  step?: number;
  keyframes: Keyframe[];
}

export interface AnimationParameter {
  id: string;
  label: string;
  type: 'number' | 'color' | 'boolean' | 'select';
  value: any;
  min?: number;
  max?: number;
  step?: number;
  options?: { label: string; value: string }[];
  category?: 'physics' | 'visual' | 'camera' | 'colors';
}

export interface PostProcessingConfig {
  bloom: boolean;
  bloomIntensity: number;
  bloomRadius: number;
  chromaticAberration: boolean;
  aberrationAmount: number;
  motionBlur: boolean;
  motionBlurDecay: number;
  vignette: boolean;
  vignetteDarkness: number;
  scanlines: boolean;
  grain: boolean;
  grainIntensity: number;
}

export interface AudioConfig {
  enabled: boolean;
  synthPreset: 'synthwave' | 'ambient' | 'techno' | 'cyberpulse' | 'none';
  volume: number;
  reactivitySensitivity: number; // 0 to 2
  bassImpact: number;
  trebleImpact: number;
}

export interface AnimationProject {
  id: string;
  title: string;
  prompt: string;
  description: string;
  engine: EngineType;
  code: string;
  duration: number; // in seconds
  fps: number; // default 60
  aspectRatio: AspectRatioType;
  resolution: { width: number; height: number };
  parameters: Record<string, AnimationParameter>;
  keyframeTracks: KeyframeTrack[];
  postProcessing: PostProcessingConfig;
  audio: AudioConfig;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface RenderContext {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D | null;
  gl: WebGLRenderingContext | null;
  threeScene?: any;
  threeCamera?: any;
  threeRenderer?: any;
  width: number;
  height: number;
  time: number; // elapsed time in seconds
  deltaTime: number; // frame delta in seconds
  progress: number; // 0.0 to 1.0 based on duration
  frame: number; // current frame count
  params: Record<string, any>;
  audioData: {
    bass: number; // 0 to 1
    mid: number;
    treble: number;
    volume: number;
    waveform: Float32Array;
    frequency: Uint8Array;
  };
  mouse: {
    x: number; // normalized -1 to 1
    y: number; // normalized -1 to 1
    isDown: boolean;
    clickTime: number;
    lastClickX: number;
    lastClickY: number;
  };
}

export interface PresetAnimation {
  id: string;
  title: string;
  prompt: string;
  description: string;
  category: 'Cosmic & Physics' | '3D & Shaders' | 'Motion Graphics' | 'Cyber & HUD' | 'Organic & Nature' | 'Math & Fractals';
  engine: EngineType;
  badge: string;
  code: string;
  duration: number;
  parameters: Record<string, AnimationParameter>;
  tags: string[];
  postProcessing?: Partial<PostProcessingConfig>;
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  suggestedAction?: {
    type: 'apply_code' | 'apply_params' | 'switch_preset';
    data: any;
    label: string;
  };
}
