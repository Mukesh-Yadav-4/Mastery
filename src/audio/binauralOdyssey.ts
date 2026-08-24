/**
 * Track: "Deep Space Binaural Odyssey"
 * ─────────────────────────────────────────────────────────────────────────────
 * Cinematic 432Hz / 10Hz Alpha-Theta Binaural Beat Meditation & Solar Wind Drone.
 *
 * Sound Architecture:
 *  - Real-time Stereo Binaural Beat Engine (Left: 108Hz, Right: 118Hz -> 10Hz Alpha/Theta wave)
 *  - 432Hz Harmonic Overtone Layer (Left: 216Hz, Right: 226Hz -> 10Hz wave)
 *  - Procedural Deep Space Solar Wind (Slow sweeping resonant bandpass filtered pink noise)
 *  - Hypnotic, monumental, zero-distraction flow state.
 */

export class BinauralOdysseyGenerator {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private limiter: DynamicsCompressorNode | null = null;

  private oscs: OscillatorNode[] = [];
  private lfos: OscillatorNode[] = [];
  private noiseNodes: AudioNode[] = [];
  private isPlaying = false;
  private volume = 0.22;
  private listeners = new Set<(playing: boolean) => void>();

  constructor(getAudioContext: () => AudioContext | null) {
    this.getContext = getAudioContext;
  }

  private getContext: () => AudioContext | null;

  public start() {
    try {
      this.ctx = this.getContext();
      if (!this.ctx || this.isPlaying) return;

      const now = this.ctx.currentTime;
      const tStart = now + 0.08;

      // 1. Studio Limiter
      const limiter = this.ctx.createDynamicsCompressor();
      limiter.threshold.setValueAtTime(-14, now);
      limiter.knee.setValueAtTime(10, now);
      limiter.ratio.setValueAtTime(12, now);
      limiter.attack.setValueAtTime(0.003, now);
      limiter.release.setValueAtTime(0.25, now);
      limiter.connect(this.ctx.destination);
      this.limiter = limiter;

      // 2. Master Output Gain
      const master = this.ctx.createGain();
      master.gain.value = 0;
      master.gain.setValueAtTime(0, now);
      master.gain.linearRampToValueAtTime(this.volume, tStart + 2.5);
      master.connect(limiter);
      this.masterGain = master;

      const oscs: OscillatorNode[] = [];
      const lfos: OscillatorNode[] = [];
      const noiseNodes: AudioNode[] = [];

      // ── 1. Stereo Binaural Beat Engine (Alpha Flow: 10Hz Delta) ────
      const createBinauralPair = (
        baseFreq: number,
        beatOffsetHz: number,
        gainVal: number,
      ) => {
        if (!this.ctx) return;

        // Left Channel
        const oscL = this.ctx.createOscillator();
        const pannerL = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
        const gainL = this.ctx.createGain();

        oscL.type = 'sine';
        oscL.frequency.setValueAtTime(baseFreq, now);
        gainL.gain.setValueAtTime(gainVal, now);

        oscL.connect(gainL);
        if (pannerL) {
          pannerL.pan.setValueAtTime(-1.0, now);
          gainL.connect(pannerL);
          pannerL.connect(master);
        } else {
          gainL.connect(master);
        }

        oscL.start(tStart);
        oscs.push(oscL);

        // Right Channel
        const oscR = this.ctx.createOscillator();
        const pannerR = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
        const gainR = this.ctx.createGain();

        oscR.type = 'sine';
        oscR.frequency.setValueAtTime(baseFreq + beatOffsetHz, now);
        gainR.gain.setValueAtTime(gainVal, now);

        oscR.connect(gainR);
        if (pannerR) {
          pannerR.pan.setValueAtTime(1.0, now);
          gainR.connect(pannerR);
          pannerR.connect(master);
        } else {
          gainR.connect(master);
        }

        oscR.start(tStart);
        oscs.push(oscR);
      };

      // Layer A: 108Hz / 118Hz (10Hz Alpha Wave)
      createBinauralPair(108.0, 10.0, 0.18);

      // Layer B: 216Hz / 226Hz (432Hz Sub-Harmonic Octave)
      createBinauralPair(216.0, 10.0, 0.12);

      // Layer C: Deep Abyssal 54Hz Sub Drone (Centered)
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(54.0, now);
      subGain.gain.setValueAtTime(0.12, now);
      subOsc.connect(subGain);
      subGain.connect(master);
      subOsc.start(tStart);
      oscs.push(subOsc);

      // ── 2. Procedural Solar Wind & Resonant Nebula Breath ──────────
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
      }

      const windSource = this.ctx.createBufferSource();
      windSource.buffer = noiseBuffer;
      windSource.loop = true;

      const windFilter = this.ctx.createBiquadFilter();
      windFilter.type = 'bandpass';
      windFilter.frequency.setValueAtTime(320, now);
      windFilter.Q.setValueAtTime(2.5, now);

      // LFO slowly sweeping the solar wind frequency across 180Hz - 600Hz
      const windLfo = this.ctx.createOscillator();
      const windLfoAmp = this.ctx.createGain();
      windLfo.type = 'sine';
      windLfo.frequency.setValueAtTime(0.04, now); // ~25s slow cosmic sweep
      windLfoAmp.gain.setValueAtTime(180, now);

      windLfo.connect(windLfoAmp);
      windLfoAmp.connect(windFilter.frequency);
      windLfo.start(tStart);
      lfos.push(windLfo);

      const windGain = this.ctx.createGain();
      windGain.gain.setValueAtTime(0.07, now);

      windSource.connect(windFilter);
      windFilter.connect(windGain);
      windGain.connect(master);
      windSource.start(tStart);
      noiseNodes.push(windSource, windFilter, windGain);

      this.oscs = oscs;
      this.lfos = lfos;
      this.noiseNodes = noiseNodes;
      this.isPlaying = true;
      this.notify(true);
    } catch {
      // Graceful fallback
    }
  }

  public stop() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    this.notify(false);

    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.12);

      const oldOscs = [...this.oscs];
      const oldLfos = [...this.lfos];
      const oldNoise = [...this.noiseNodes];
      const oldMaster = this.masterGain;
      const oldLimiter = this.limiter;

      this.oscs = [];
      this.lfos = [];
      this.noiseNodes = [];
      this.masterGain = null;
      this.limiter = null;

      setTimeout(() => {
        oldOscs.forEach((osc) => {
          try {
            osc.stop();
            osc.disconnect();
          } catch {}
        });
        oldLfos.forEach((lfo) => {
          try {
            lfo.stop();
            lfo.disconnect();
          } catch {}
        });
        oldNoise.forEach((node) => {
          try {
            if ('stop' in node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
              (node as AudioScheduledSourceNode).stop();
            }
            node.disconnect();
          } catch {}
        });
        try {
          oldMaster?.disconnect();
          oldLimiter?.disconnect();
        } catch {}
      }, 150);
    } catch {
      this.isPlaying = false;
      this.notify(false);
    }
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0.05, Math.min(1.0, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.linearRampToValueAtTime(
        this.volume,
        this.ctx.currentTime + 0.1,
      );
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public subscribe(listener: (playing: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(playing: boolean) {
    this.listeners.forEach((fn) => fn(playing));
  }
}
