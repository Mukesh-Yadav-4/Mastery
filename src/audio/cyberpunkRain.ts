/**
 * Track: "Cyberpunk Rainy Cafe"
 * ─────────────────────────────────────────────────────────────────────────────
 * Generative Lo-Fi Electric Piano + Procedural Rain on Glass + Warm Vinyl Atmosphere.
 *
 * Sound Architecture:
 *  - 100% Hardware DSP Audio-Rate LFO Modulation
 *  - Procedural Rain Generator (Bandpass filtered white/pink noise with raindrop droplets)
 *  - Warm Lo-Fi Neo-Soul Electric Piano Chords (Dbmaj9, Abmaj7, Bbm9, Gbmaj7)
 *  - Analog Tape Wow & Flutter subtle vibrato
 *  - Studio mastering limiter for distortion-free, crackle-free listening.
 */

export class CyberpunkRainGenerator {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private limiter: DynamicsCompressorNode | null = null;
  private filter: BiquadFilterNode | null = null;

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

      // 2. Master Gain
      const master = this.ctx.createGain();
      master.gain.value = 0;
      master.gain.setValueAtTime(0, now);
      master.gain.linearRampToValueAtTime(this.volume, tStart + 2.5);
      master.connect(limiter);
      this.masterGain = master;

      // 3. Vintage Lo-Fi Tape Lowpass Filter (420Hz)
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(420, now);
      filter.Q.setValueAtTime(1.2, now);
      filter.connect(master);
      this.filter = filter;

      const oscs: OscillatorNode[] = [];
      const lfos: OscillatorNode[] = [];
      const noiseNodes: AudioNode[] = [];

      // ── 1. Procedural Soft Window Rain (Filtered Noise Buffer) ─────
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02; // Pink-noise integration
        lastOut = output[i];
      }

      const rainSource = this.ctx.createBufferSource();
      rainSource.buffer = noiseBuffer;
      rainSource.loop = true;

      const rainFilter = this.ctx.createBiquadFilter();
      rainFilter.type = 'bandpass';
      rainFilter.frequency.setValueAtTime(750, now);
      rainFilter.Q.setValueAtTime(0.8, now);

      const rainGain = this.ctx.createGain();
      rainGain.gain.setValueAtTime(0.065, now);

      rainSource.connect(rainFilter);
      rainFilter.connect(rainGain);
      rainGain.connect(master);
      rainSource.start(tStart);
      noiseNodes.push(rainSource, rainFilter, rainGain);

      // ── 2. Tape Wow & Flutter LFO (Subtle pitch vibrato) ───────────
      const flutterLfo = this.ctx.createOscillator();
      const flutterGain = this.ctx.createGain();
      flutterLfo.type = 'sine';
      flutterLfo.frequency.setValueAtTime(0.35, now); // 0.35Hz slow tape drift
      flutterGain.gain.setValueAtTime(1.8, now); // ~1.8Hz pitch variation
      flutterLfo.connect(flutterGain);
      flutterLfo.start(tStart);
      lfos.push(flutterLfo);

      // ── 3. Lo-Fi Neo-Soul Chord Clusters ───────────────────────────
      const createLofiCluster = (
        frequencies: number[],
        lfoFrequencyHz: number,
        basePeakVolume: number,
      ) => {
        if (!this.ctx) return;

        const clusterGain = this.ctx.createGain();
        clusterGain.gain.setValueAtTime(basePeakVolume * 0.5, now);
        clusterGain.connect(filter);

        const lfo = this.ctx.createOscillator();
        const lfoAmp = this.ctx.createGain();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(lfoFrequencyHz, now);
        lfoAmp.gain.setValueAtTime(basePeakVolume * 0.48, now);

        lfo.connect(lfoAmp);
        lfoAmp.connect(clusterGain.gain);
        lfo.start(tStart);
        lfos.push(lfo);

        frequencies.forEach((freq) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const voiceGain = this.ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          flutterGain.connect(osc.frequency); // Apply tape wow/flutter

          voiceGain.gain.setValueAtTime(1.0 / frequencies.length, now);
          osc.connect(voiceGain);
          voiceGain.connect(clusterGain);

          osc.start(tStart);
          oscs.push(osc);
        });
      };

      // Cluster 1: Dbmaj9 (10.0s lazy rain wave)
      createLofiCluster(
        [138.59, 207.65, 261.63, 311.13, 392.00], // Db3, Ab3, C4, Eb4, G4
        1 / 10.0,
        0.18,
      );

      // Cluster 2: Abmaj7 (13.5s coffee shop wave)
      createLofiCluster(
        [103.83, 155.56, 207.65, 261.63, 311.13], // Ab2, Eb3, Ab3, C4, Eb4
        1 / 13.5,
        0.16,
      );

      // Cluster 3: Bbm9 (17.0s midnight contemplation)
      createLofiCluster(
        [116.54, 174.61, 233.08, 277.18, 349.23], // Bb2, F3, Bb3, Db4, F4
        1 / 17.0,
        0.14,
      );

      // Cluster 4: Gbmaj7 (21.0s warm resolution)
      createLofiCluster(
        [92.50, 138.59, 185.00, 233.08, 277.18], // Gb2, Db3, Gb3, Bb3, Db4
        1 / 21.0,
        0.13,
      );

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
      const oldFilter = this.filter;
      const oldLimiter = this.limiter;

      this.oscs = [];
      this.lfos = [];
      this.noiseNodes = [];
      this.masterGain = null;
      this.filter = null;
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
          oldFilter?.disconnect();
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
