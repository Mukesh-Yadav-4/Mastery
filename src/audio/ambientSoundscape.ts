/**
 * Track 1: "Celestial Horizon" — Hardware DSP Edition
 * ─────────────────────────────────────────────────────────────────────────────
 * 100% Chip-Free & Click-Free Generative Ambient Focus Symphony.
 *
 * Architecture:
 *  - 100% Native DSP Audio-Rate LFO Modulation (Zero JavaScript setTimeouts / intervals)
 *  - 4 Dedicated Harmonic Chord Clusters (Dmaj9, Gmaj7, Bm9, Asus2)
 *  - Continuous multi-cycle breathing driven directly on the real-time audio thread:
 *      • Cluster 1: Dmaj9 (D3, A3, C#4, E4, F#4) [9.0s cycle]
 *      • Cluster 2: Gmaj7 (G3, B3, D4, F#4, A4) [11.5s cycle]
 *      • Cluster 3: Bm9 (B2, F#3, A3, C#4, D4) [14.0s cycle]
 *      • Cluster 4: Asus2 (A2, E3, A3, B3, E4) [16.5s cycle]
 *  - Crystalline Stardust Shimmer (D5, F#5, A5, C#6) with 6.5s gentle breathing
 *  - Studio mastering limiter for 100% distortion-free, click-free audio in all earphones.
 */

export class CosmicAmbienceGenerator {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private limiter: DynamicsCompressorNode | null = null;
  private filter: BiquadFilterNode | null = null;

  // Active DSP Nodes
  private oscs: OscillatorNode[] = [];
  private lfos: OscillatorNode[] = [];
  private isPlaying = false;
  private volume = 0.22; // Velvety, non-fatiguing focus volume
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

      // 1. Studio-Grade Mastering Limiter / Soft Compressor
      const limiter = this.ctx.createDynamicsCompressor();
      limiter.threshold.setValueAtTime(-14, now);
      limiter.knee.setValueAtTime(10, now);
      limiter.ratio.setValueAtTime(12, now);
      limiter.attack.setValueAtTime(0.003, now);
      limiter.release.setValueAtTime(0.25, now);
      limiter.connect(this.ctx.destination);
      this.limiter = limiter;

      // 2. Master Output Gain with smooth 2.5s fade-in
      const master = this.ctx.createGain();
      master.gain.value = 0;
      master.gain.setValueAtTime(0, now);
      master.gain.linearRampToValueAtTime(this.volume, tStart + 2.5);
      master.connect(limiter);
      this.masterGain = master;

      // 3. Velvet Analog Lowpass Filter (Warm, pillowy, non-fatiguing focus tone)
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(460, now);
      filter.Q.setValueAtTime(1.1, now);
      filter.connect(master);
      this.filter = filter;

      const oscs: OscillatorNode[] = [];
      const lfos: OscillatorNode[] = [];

      // ── Foundation: Soft Warm Sub-Bass Foundation ──────────────────
      // Velvety foundation sine waves (D2: 73.42Hz, A2: 110.00Hz) at subtle volume
      const bassFreqs = [73.42, 110.00];
      bassFreqs.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(idx === 0 ? 0.09 : 0.06, now);
        osc.connect(gain);
        gain.connect(filter);

        osc.start(tStart);
        oscs.push(osc);
      });

      // ── Helper to build a Prime-Modulated Evolving Chord Cluster ───
      const createCluster = (
        frequencies: number[],
        lfoFrequencyHz: number,
        basePeakVolume: number,
      ) => {
        if (!this.ctx) return;

        // Cluster Sub-Master Gain
        const clusterGain = this.ctx.createGain();
        clusterGain.gain.setValueAtTime(basePeakVolume * 0.5, now);
        clusterGain.connect(filter);

        // Hardware Audio-Rate LFO running on real-time DSP thread
        const lfo = this.ctx.createOscillator();
        const lfoAmp = this.ctx.createGain();

        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(lfoFrequencyHz, now);

        lfoAmp.gain.setValueAtTime(basePeakVolume * 0.48, now);

        lfo.connect(lfoAmp);
        lfoAmp.connect(clusterGain.gain);
        lfo.start(tStart);
        lfos.push(lfo);

        // Sine voices for this chord
        frequencies.forEach((freq) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const voiceGain = this.ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);

          voiceGain.gain.setValueAtTime(1.0 / frequencies.length, now);
          osc.connect(voiceGain);
          voiceGain.connect(clusterGain);

          osc.start(tStart);
          oscs.push(osc);
        });
      };

      // ── Cluster 1: Dmaj9 Harmony (9.0s flowing breathing cycle) ────
      createCluster(
        [146.83, 220.00, 277.18, 329.63, 369.99], // D3, A3, C#4, E4, F#4
        1 / 9.0, // 0.1111 Hz
        0.18,
      );

      // ── Cluster 2: Gmaj7 Harmony (11.5s flowing breathing cycle) ───
      createCluster(
        [196.00, 246.94, 293.66, 369.99, 440.00], // G3, B3, D4, F#4, A4
        1 / 11.5, // 0.0869 Hz
        0.16,
      );

      // ── Cluster 3: Bm9 Harmony (14.0s flowing breathing cycle) ─────
      createCluster(
        [123.47, 185.00, 220.00, 277.18, 293.66], // B2, F#3, A3, C#4, D4
        1 / 14.0, // 0.0714 Hz
        0.14,
      );

      // ── Cluster 4: Asus2 Harmony (16.5s flowing breathing cycle) ───
      createCluster(
        [110.00, 164.81, 220.00, 246.94, 329.63], // A2, E3, A3, B3, E4
        1 / 16.5, // 0.0606 Hz
        0.13,
      );

      // ── Celestial Stardust Shimmer (Ultra-Soft Air) ────────────────
      const shimmerGain = this.ctx.createGain();
      shimmerGain.gain.setValueAtTime(0.02, now);
      shimmerGain.connect(master);

      const shimmerLfo = this.ctx.createOscillator();
      const shimmerLfoAmp = this.ctx.createGain();
      shimmerLfo.type = 'sine';
      shimmerLfo.frequency.setValueAtTime(1 / 6.5, now);
      shimmerLfoAmp.gain.setValueAtTime(0.018, now);
      shimmerLfo.connect(shimmerLfoAmp);
      shimmerLfoAmp.connect(shimmerGain.gain);
      shimmerLfo.start(tStart);
      lfos.push(shimmerLfo);

      [587.33, 739.99, 880.00, 1108.73].forEach((freq) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        osc.connect(shimmerGain);
        osc.start(tStart);
        oscs.push(osc);
      });

      this.oscs = oscs;
      this.lfos = lfos;
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
      const oldMaster = this.masterGain;
      const oldFilter = this.filter;
      const oldLimiter = this.limiter;

      this.oscs = [];
      this.lfos = [];
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
