/**
 * Track 4: "Mice on Orbit" — Inspired by C418 (Mice on Venus / Wet Hands)
 * ─────────────────────────────────────────────────────────────────────────────
 * Lyrical, tender, floating music box ambient lullaby for deep reflection & flow.
 *
 * Sound Architecture:
 *  - 100% Hardware DSP Audio-Rate LFO Modulation (Zero JavaScript setTimeouts)
 *  - Mellotron-style soft flute/sine chord pads (Gmaj7, Em9, Cmaj9, D6/9)
 *  - Sparkling acoustic kalimba / music box high drops (B5, D6, E6, G6)
 *  - Velvet 360Hz analog tape filter + studio mastering dynamics compressor.
 */

export class MiceOnOrbitGenerator {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private limiter: DynamicsCompressorNode | null = null;
  private filter: BiquadFilterNode | null = null;

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

      // 3. Mellotron Analog Tape Filter (360Hz - warm, round, whimsical)
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(360, now);
      filter.Q.setValueAtTime(1.1, now);
      filter.connect(master);
      this.filter = filter;

      const oscs: OscillatorNode[] = [];
      const lfos: OscillatorNode[] = [];

      // ── Foundation: Soft Low Woodwind/Bass Foundation ─────────────
      // Gentle sine foundation (G2: 98.00Hz, D3: 146.83Hz)
      const bassFreqs = [98.0, 146.83];
      bassFreqs.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(idx === 0 ? 0.10 : 0.07, now);
        osc.connect(gain);
        gain.connect(filter);

        osc.start(tStart);
        oscs.push(osc);
      });

      // ── Helper for Soft Lyrical Mellotron Flute Clusters ──────────
      const createCluster = (
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

          voiceGain.gain.setValueAtTime(1.0 / frequencies.length, now);
          osc.connect(voiceGain);
          voiceGain.connect(clusterGain);

          osc.start(tStart);
          oscs.push(osc);
        });
      };

      // ── Cluster 1: Gmaj7 (8.0s wondrous floating wave) ────────────
      createCluster(
        [196.00, 246.94, 293.66, 369.99, 493.88], // G3, B3, D4, F#4, B4
        1 / 8.0, // 0.1250 Hz
        0.18,
      );

      // ── Cluster 2: Em9 (10.5s tender nostalgic wave) ──────────────
      createCluster(
        [164.81, 196.00, 246.94, 293.66, 369.99], // E3, G3, B3, D4, F#4
        1 / 10.5, // 0.0952 Hz
        0.16,
      );

      // ── Cluster 3: Cmaj9 (13.0s starry reflection wave) ───────────
      createCluster(
        [130.81, 164.81, 196.00, 246.94, 293.66], // C3, E3, G3, B3, D4
        1 / 13.0, // 0.0769 Hz
        0.14,
      );

      // ── Cluster 4: D6/9 (15.5s gentle horizon resolution wave) ────
      createCluster(
        [146.83, 185.00, 220.00, 246.94, 329.63], // D3, F#3, A3, B3, E4
        1 / 15.5, // 0.0645 Hz
        0.13,
      );

      // ── C418 Kalimba / Music Box Shimmer ──────────────────────────
      const kalimbaGain = this.ctx.createGain();
      kalimbaGain.gain.setValueAtTime(0.02, now);
      kalimbaGain.connect(master);

      const kalimbaLfo = this.ctx.createOscillator();
      const kalimbaLfoAmp = this.ctx.createGain();
      kalimbaLfo.type = 'sine';
      kalimbaLfo.frequency.setValueAtTime(1 / 6.8, now);
      kalimbaLfoAmp.gain.setValueAtTime(0.018, now);
      kalimbaLfo.connect(kalimbaLfoAmp);
      kalimbaLfoAmp.connect(kalimbaGain.gain);
      kalimbaLfo.start(tStart);
      lfos.push(kalimbaLfo);

      // Delicate high register kalimba tones
      [783.99, 987.77, 1174.66, 1318.51, 1567.98].forEach((freq) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        osc.connect(kalimbaGain);
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
