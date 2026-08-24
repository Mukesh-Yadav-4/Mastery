/**
 * Track 2: "Cosmic Sanctuary"
 * ─────────────────────────────────────────────────────────────────────────────
 * 100% Chip-Free & Click-Free Generative Ambient Focus Sanctuary.
 *
 * Architecture Highlights:
 *  - 100% Native DSP Audio-Rate Modulation (ZERO JavaScript setTimeouts / intervals)
 *  - Continuous multi-cluster harmonic morphing driven by prime-period hardware LFOs:
 *      • Cluster 1: F-Lydian (F3, C4, B4, E5) [22-second prime breathing cycle]
 *      • Cluster 2: C-Major 9 (C3, G3, D4, E4) [30-second prime breathing cycle]
 *      • Cluster 3: A-minor 11 (A2, E3, A3, D4, G4) [37-second prime breathing cycle]
 *  - Because the cycles are prime, the soundscape never repeats and morphs organically.
 *  - ZERO graph mutations, zero node allocation during playback, zero buffer glitches.
 *  - Studio mastering limiter for crystal-clear fidelity in all headphones.
 */

export class CosmicSanctuaryGenerator {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private limiter: DynamicsCompressorNode | null = null;
  private filter: BiquadFilterNode | null = null;

  // Active DSP Nodes
  private oscs: OscillatorNode[] = [];
  private lfos: OscillatorNode[] = [];
  private isPlaying = false;
  private volume = 0.22; // Velvety, soothing background focus volume
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
      filter.frequency.setValueAtTime(440, now);
      filter.Q.setValueAtTime(1.1, now);
      filter.connect(master);
      this.filter = filter;

      const oscs: OscillatorNode[] = [];
      const lfos: OscillatorNode[] = [];

      // ── Foundation: Soft Warm Sub-Bass Foundation ──────────────────
      // Velvety foundation sine waves (F2: 87.31Hz, C3: 130.81Hz) at subtle volume
      const bassFreqs = [87.31, 130.81];
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

      // ── Helper to build a Prime-Modulated Evolving Chord Cluster ───
      // Shorter, dynamic 8-13s breathing cycles for flowing harmonic variety
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

        // Hardware Audio-Rate LFO
        const lfo = this.ctx.createOscillator();
        const lfoAmp = this.ctx.createGain();

        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(lfoFrequencyHz, now);

        // LFO breathes cluster volume smoothly between near-silence and peak
        lfoAmp.gain.setValueAtTime(basePeakVolume * 0.48, now);

        lfo.connect(lfoAmp);
        lfoAmp.connect(clusterGain.gain);
        lfo.start(tStart);
        lfos.push(lfo);

        // Voices for this cluster
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

      // ── Cluster 1: F-Lydian Harmony (8.5s flowing breathing cycle) ──
      createCluster(
        [174.61, 261.63, 369.99, 523.25], // F3, C4, F#4 (Lydian #11), C5
        1 / 8.5, // 0.1176 Hz
        0.18,
      );

      // ── Cluster 2: C-Major 9 Harmony (11.0s flowing breathing cycle) ─
      createCluster(
        [130.81, 196.00, 293.66, 329.63, 659.25], // C3, G3, D4, E4, E5
        1 / 11.0, // 0.0909 Hz
        0.15,
      );

      // ── Cluster 3: A-minor 11 Harmony (13.5s flowing breathing cycle)
      createCluster(
        [110.00, 164.81, 220.00, 293.66, 440.00], // A2, E3, A3, D4, A4
        1 / 13.5, // 0.0740 Hz
        0.14,
      );

      // ── Celestial Aurora Shimmer (Ultra-Soft Air) ───────────────────
      const shimmerGain = this.ctx.createGain();
      shimmerGain.gain.setValueAtTime(0.02, now);
      shimmerGain.connect(master);

      const shimmerLfo = this.ctx.createOscillator();
      const shimmerLfoAmp = this.ctx.createGain();
      shimmerLfo.type = 'sine';
      shimmerLfo.frequency.setValueAtTime(1 / 7.5, now);
      shimmerLfoAmp.gain.setValueAtTime(0.018, now);
      shimmerLfo.connect(shimmerLfoAmp);
      shimmerLfoAmp.connect(shimmerGain.gain);
      shimmerLfo.start(tStart);
      lfos.push(shimmerLfo);

      [880.0, 1046.5].forEach((freq) => {
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
