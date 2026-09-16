import { EasingFunction } from '../types/animation';

export function interpolate(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

export const easingFunctions: Record<EasingFunction, (t: number) => number> = {
  linear: (t) => t,
  easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),
  easeInOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
  easeInOutExpo: (t) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    return t < 0.5
      ? Math.pow(2, 20 * t - 10) / 2
      : (2 - Math.pow(2, -20 * t + 10)) / 2;
  },
  elasticOut: (t) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
  bounceOut: (t) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  }
};

export function evaluateTrack(trackKeyframes: { time: number; value: number; easing?: EasingFunction }[], currentTime: number, defaultValue: number): number {
  if (!trackKeyframes || trackKeyframes.length === 0) return defaultValue;
  if (trackKeyframes.length === 1) return trackKeyframes[0].value;

  const sorted = [...trackKeyframes].sort((a, b) => a.time - b.time);
  if (currentTime <= sorted[0].time) return sorted[0].value;
  if (currentTime >= sorted[sorted.length - 1].time) return sorted[sorted.length - 1].value;

  for (let i = 0; i < sorted.length - 1; i++) {
    const k1 = sorted[i];
    const k2 = sorted[i + 1];
    if (currentTime >= k1.time && currentTime <= k2.time) {
      const span = k2.time - k1.time;
      const progress = span === 0 ? 0 : (currentTime - k1.time) / span;
      const easingFn = easingFunctions[k2.easing || 'easeInOutQuad'] || easingFunctions.easeInOutQuad;
      const easedT = easingFn(progress);
      return interpolate(k1.value, k2.value, easedT);
    }
  }

  return defaultValue;
}
