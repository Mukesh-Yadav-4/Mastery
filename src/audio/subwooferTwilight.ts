/**
 * Track 3: "Subwoofer Twilight" — Inspired by C418 (Subwoofer Lullaby / Sweden)
 * ─────────────────────────────────────────────────────────────────────────────
 * Nostalgic, tender, felt-warm ambient lullaby for deep, peaceful focus.
 *
 * Sound Architecture:
 *  - 100% Hardware DSP Audio-Rate LFO Modulation (Zero JavaScript setTimeouts)
 *  - Deep pillowy sub-bass blanket (C418 signature "subwoofer" warmth)
 *  - 4 Nostalgic Felt Chord Clusters (Fmaj7 add9, Cmaj9, Dm11, Bbmaj7 #11)
 *  - Gentle acoustic raindrop bell drops (high pentatonic crystal drops)
 *  - Warm vintage 380Hz lowpass filter + studio dynamics compressor limiter.
 */

export class SubwooferTwilightGenerator {
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

      // 3. Warm C418 Felt Lowpass Filter (380Hz - cozy, nostalgic, mellow)
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(380, now);
      filter.Q.setValueAtTime(1.0, now);
      filter.connect(master);
      this.filter = filter;

      const oscs: OscillatorNode[] = [];
      const lfos: OscillatorNode[] = [];

      // ── The Iconic C418 "Subwoofer" Heartbeat Bass ────────────────
      // Warm, pillowy low sine waves (F2: 87.31Hz, C2: 65.41Hz)
      const bassFreqs = [87.31, 65.41];
      bassFreqs.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(idx === 0 ? 0.11 : 0.08, now);
        osc.connect(gain);
        gain.connect(filter);

        osc.start(tStart);
        oscs.push(osc);
      });

      // ── Helper for Felt Piano Chord Clusters ───────────────────────
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

      // ── Cluster 1: Fmaj7(add9) (10.0s gentle nostalgic wave) ──────
      createCluster(
        [174.61, 261.63, 329.63, 392.00, 440.00], // F3, C4, E4, G4, A4
        1 / 10.0, // 0.1000 Hz
        0.18,
      );

      // ── Cluster 2: Cmaj9 (13.5s warm home wave) ────────────────────
      createCluster(
        [130.81, 196.00, 293.66, 329.63, 493.88], // C3, G3, D4, E4, B4
        1 / 13.5, // 0.0740 Hz
        0.16,
      );

      // ── Cluster 3: Dm11 (17.0s contemplative wave) ─────────────────
      createCluster(
        [146.83, 220.00, 261.63, 349.23, 392.00], // D3, A3, C4, F4, G4
        1 / 17.0, // 0.0588 Hz
        0.14,
      );

      // ── Cluster 4: Bbmaj7(#11) (21.0s twilight resolution wave) ────
      createCluster(
        [116.54, 174.61, 220.00, 293.66, 329.63], // Bb2, F3, A3, D4, E4
        1 / 21.0, // 0.0476 Hz
        0.13,
      );

      // ── C418 Felt Raindrop Bells (Gentle High Acoustic Drops) ──────
      const raindropGain = this.ctx.createGain();
      raindropGain.gain.setValueAtTime(0.022, now);
      raindropGain.connect(master);

      const dropLfo = this.ctx.createOscillator();
      const dropLfoAmp = this.ctx.createGain();
      dropLfo.type = 'sine';
      dropLfo.frequency.setValueAtTime(1 / 7.8, now);
      dropLfoAmp.gain.setValueAtTime(0.02, now);
      dropLfo.connect(dropLfoAmp);
      dropLfoAmp.connect(raindropGain.gain);
      dropLfo.start(tStart);
      lfos.push(dropLfo);

      // High pentatonic raindrop frequencies
      [659.25, 783.99, 880.00, 1046.50, 1174.66].forEach((freq) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        osc.connect(raindropGain);
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
