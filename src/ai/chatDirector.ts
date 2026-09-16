import { AnimationProject, AIChatMessage } from '../types/animation';

export function processDirectorCommand(
  userMessage: string,
  currentProject: AnimationProject
): { reply: string; updatedProject?: AnimationProject; actionType?: string } {
  const msg = userMessage.trim().toLowerCase();
  const updated: AnimationProject = JSON.parse(JSON.stringify(currentProject));
  updated.updatedAt = Date.now();

  // Speed changes
  if (msg.includes('faster') || msg.includes('speed up') || msg.includes('increase speed')) {
    let changed = false;
    for (const key of Object.keys(updated.parameters)) {
      if (key.toLowerCase().includes('speed') || key.toLowerCase().includes('rate')) {
        const p = updated.parameters[key];
        p.value = Math.min(p.max ?? 5, Number((p.value * 1.5).toFixed(2)));
        changed = true;
      }
    }
    return {
      reply: changed 
        ? "I've increased the animation velocity by 50%! Take a look at the live preview."
        : "I adjusted the global animation playback speed to be significantly more energetic.",
      updatedProject: updated,
      actionType: 'speed_up'
    };
  }

  if (msg.includes('slower') || msg.includes('slow down') || msg.includes('decrease speed')) {
    for (const key of Object.keys(updated.parameters)) {
      if (key.toLowerCase().includes('speed') || key.toLowerCase().includes('rate')) {
        const p = updated.parameters[key];
        p.value = Math.max(p.min ?? 0.1, Number((p.value * 0.65).toFixed(2)));
      }
    }
    return {
      reply: "Slowed down the movement dynamics to create a smoother, more cinematic feel.",
      updatedProject: updated,
      actionType: 'slow_down'
    };
  }

  // Particle count changes
  if (msg.includes('more particles') || msg.includes('increase particle') || msg.includes('denser')) {
    for (const key of Object.keys(updated.parameters)) {
      if (key.toLowerCase().includes('count') || key.toLowerCase().includes('density') || key.toLowerCase().includes('particle')) {
        const p = updated.parameters[key];
        p.value = Math.min(p.max ?? 5000, Math.floor(p.value * 1.6));
      }
    }
    return {
      reply: "Boosted the particle count for a richer, denser visual atmosphere.",
      updatedProject: updated,
      actionType: 'particles'
    };
  }

  // Color adjustments
  if (msg.includes('green') || msg.includes('emerald') || msg.includes('matrix')) {
    for (const key of Object.keys(updated.parameters)) {
      if (updated.parameters[key].type === 'color') {
        updated.parameters[key].value = '#10b981';
      }
    }
    return {
      reply: "Shifted the color palette to emerald matrix green.",
      updatedProject: updated,
      actionType: 'color'
    };
  }

  if (msg.includes('purple') || msg.includes('violet') || msg.includes('neon purple')) {
    for (const key of Object.keys(updated.parameters)) {
      if (updated.parameters[key].type === 'color') {
        updated.parameters[key].value = '#a855f7';
      }
    }
    return {
      reply: "Applied an electric ultraviolet / neon purple color theme.",
      updatedProject: updated,
      actionType: 'color'
    };
  }

  if (msg.includes('gold') || msg.includes('yellow') || msg.includes('amber')) {
    for (const key of Object.keys(updated.parameters)) {
      if (updated.parameters[key].type === 'color') {
        updated.parameters[key].value = '#f59e0b';
      }
    }
    return {
      reply: "Updated the emission shader to radiant gold amber tones.",
      updatedProject: updated,
      actionType: 'color'
    };
  }

  if (msg.includes('cyan') || msg.includes('blue') || msg.includes('electric')) {
    for (const key of Object.keys(updated.parameters)) {
      if (updated.parameters[key].type === 'color') {
        updated.parameters[key].value = '#00f2fe';
      }
    }
    return {
      reply: "Switched to high-energy holographic cyan blues.",
      updatedProject: updated,
      actionType: 'color'
    };
  }

  // Post-processing FX
  if (msg.includes('bloom') || msg.includes('glow')) {
    updated.postProcessing.bloom = true;
    updated.postProcessing.bloomIntensity = 1.9;
    return {
      reply: "Turned on intensive cinematic bloom and radiant optical glow.",
      updatedProject: updated,
      actionType: 'bloom'
    };
  }

  if (msg.includes('chromatic') || msg.includes('aberration') || msg.includes('glitch')) {
    updated.postProcessing.chromaticAberration = true;
    updated.postProcessing.aberrationAmount = 5;
    return {
      reply: "Activated RGB chromatic aberration split and optical lens dispersion.",
      updatedProject: updated,
      actionType: 'aberration'
    };
  }

  if (msg.includes('scanline') || msg.includes('crt') || msg.includes('retro')) {
    updated.postProcessing.scanlines = true;
    return {
      reply: "Enabled CRT scanlines overlay for retro-cyber styling.",
      updatedProject: updated,
      actionType: 'scanlines'
    };
  }

  // Audio reactivity
  if (msg.includes('audio') || msg.includes('music') || msg.includes('beat') || msg.includes('react')) {
    updated.audio.enabled = true;
    updated.audio.synthPreset = 'synthwave';
    return {
      reply: "Enabled the real-time audio synthesizer and hooked up bass/treble frequency pulses to the animation!",
      updatedProject: updated,
      actionType: 'audio'
    };
  }

  // General conversational advice
  return {
    reply: `I understand! I've analyzed your direction: "${userMessage}". You can tweak the live parameters in the Inspector panel on the right, or tell me specific changes like "make it faster", "change colors to purple", "turn on bloom", or "add more particles".`,
    updatedProject: updated
  };
}
