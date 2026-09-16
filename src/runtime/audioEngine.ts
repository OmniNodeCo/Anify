// Web Audio API procedural synthesizer & real-time FFT frequency analyzer

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying: boolean = false;
  private intervalId: any = null;
  private customSource: AudioBufferSourceNode | null = null;
  private dataArray: Uint8Array = new Uint8Array(64);
  private waveArray: Float32Array = new Float32Array(128);

  public init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    this.ctx = new AudioCtx();
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 128;
    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.value = 0.5;

    this.gainNode.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.waveArray = new Float32Array(this.analyser.fftSize);
  }

  public setVolume(val: number) {
    if (this.gainNode) {
      this.gainNode.gain.value = Math.max(0, Math.min(1, val));
    }
  }

  public startPreset(preset: 'synthwave' | 'ambient' | 'techno' | 'cyberpulse') {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.stop();
    this.isPlaying = true;

    let beat = 0;
    const bpm = preset === 'techno' ? 130 : preset === 'synthwave' ? 115 : preset === 'cyberpulse' ? 140 : 75;
    const beatInterval = (60 / bpm / 4) * 1000;

    const notesSynthwave = [110, 130.81, 146.83, 164.81, 196, 220, 261.63];
    const notesAmbient = [220, 277.18, 329.63, 440, 554.37, 659.25];
    const notesCyber = [65.41, 77.78, 87.31, 98.0, 110.0, 130.81];

    this.intervalId = setInterval(() => {
      if (!this.isPlaying || !this.ctx || !this.gainNode) return;
      const t = this.ctx.currentTime;

      // Bass drum on 1st & 9th 16th notes
      if (preset !== 'ambient' && (beat % 4 === 0)) {
        this.triggerKick(t);
      }

      // Snare / clap on beat 4 and 12
      if (preset !== 'ambient' && (beat % 8 === 4)) {
        this.triggerSnare(t);
      }

      // Hi-hat on every off-beat
      if (preset !== 'ambient' && (beat % 2 === 1)) {
        this.triggerHat(t);
      }

      // Melodic arpeggio / synth chord
      if (beat % 2 === 0) {
        const pool = preset === 'synthwave' ? notesSynthwave : preset === 'ambient' ? notesAmbient : notesCyber;
        const note = pool[(beat / 2) % pool.length];
        this.triggerSynth(t, note, preset === 'ambient' ? 1.2 : 0.25);
      }

      beat = (beat + 1) % 64;
    }, beatInterval);
  }

  public stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.customSource) {
      try {
        this.customSource.stop();
      } catch (e) {}
      this.customSource = null;
    }
  }

  public loadAudioFile(file: File): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        this.init();
        if (!this.ctx || !this.gainNode) return reject('No audio context');
        if (this.ctx.state === 'suspended') await this.ctx.resume();
        const arrayBuffer = await file.arrayBuffer();
        const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
        this.stop();
        this.isPlaying = true;

        const src = this.ctx.createBufferSource();
        src.buffer = audioBuffer;
        src.loop = true;
        src.connect(this.gainNode);
        src.start(0);
        this.customSource = src;
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  private triggerKick(t: number) {
    if (!this.ctx || !this.gainNode) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(0.01, t + 0.35);
    g.gain.setValueAtTime(0.8, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    osc.connect(g);
    g.connect(this.gainNode);
    osc.start(t);
    osc.stop(t + 0.35);
  }

  private triggerSnare(t: number) {
    if (!this.ctx || !this.gainNode) return;
    // White noise buffer
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.4, t);
    g.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
    noise.connect(filter);
    filter.connect(g);
    g.connect(this.gainNode);
    noise.start(t);
  }

  private triggerHat(t: number) {
    if (!this.ctx || !this.gainNode) return;
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(8000, t);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.15, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    osc.connect(g);
    g.connect(this.gainNode);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  private triggerSynth(t: number, freq: number, duration: number) {
    if (!this.ctx || !this.gainNode) return;
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, t);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 3, t);
    filter.frequency.exponentialRampToValueAtTime(freq * 0.8, t + duration);

    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.2, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(filter);
    filter.connect(g);
    g.connect(this.gainNode);
    osc.start(t);
    osc.stop(t + duration);
  }

  public getAudioData(): {
    bass: number;
    mid: number;
    treble: number;
    volume: number;
    waveform: Float32Array;
    frequency: Uint8Array;
  } {
    if (!this.analyser || !this.isPlaying) {
      return {
        bass: 0,
        mid: 0,
        treble: 0,
        volume: 0,
        waveform: this.waveArray,
        frequency: this.dataArray,
      };
    }

    this.analyser.getByteFrequencyData(this.dataArray as any);
    this.analyser.getFloatTimeDomainData(this.waveArray as any);

    const len = this.dataArray.length;
    let bSum = 0;
    let mSum = 0;
    let tSum = 0;

    const bCount = Math.floor(len * 0.15);
    const mCount = Math.floor(len * 0.5);

    for (let i = 0; i < len; i++) {
      const v = this.dataArray[i] / 255;
      if (i < bCount) bSum += v;
      else if (i < mCount) mSum += v;
      else tSum += v;
    }

    const bass = bCount > 0 ? bSum / bCount : 0;
    const mid = mCount - bCount > 0 ? mSum / (mCount - bCount) : 0;
    const treble = len - mCount > 0 ? tSum / (len - mCount) : 0;
    const volume = (bass * 0.5 + mid * 0.3 + treble * 0.2);

    return {
      bass: Math.min(1, bass * 1.5),
      mid: Math.min(1, mid * 1.4),
      treble: Math.min(1, treble * 1.3),
      volume: Math.min(1, volume * 1.5),
      waveform: this.waveArray,
      frequency: this.dataArray,
    };
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const globalAudio = new AudioEngine();
