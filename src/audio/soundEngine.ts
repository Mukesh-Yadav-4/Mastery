import { CosmicAmbienceGenerator } from './ambientSoundscape';
import { CosmicSanctuaryGenerator } from './cosmicSanctuary';
import { SubwooferTwilightGenerator } from './subwooferTwilight';
import { MiceOnOrbitGenerator } from './miceOnOrbit';
import { CyberpunkRainGenerator } from './cyberpunkRain';
import { BinauralOdysseyGenerator } from './binauralOdyssey';

export type AmbientTrackId =
  | 'cyberpunk-rain'
  | 'binaural-odyssey'
  | 'subwoofer-twilight'
  | 'mice-on-orbit'
  | 'cosmic-sanctuary'
  | 'celestial-horizon';

export interface AmbientTrackInfo {
  id: AmbientTrackId;
  name: string;
  shortName: string;
  tag: string;
  icon: string;
  description: string;
}

export const AMBIENT_TRACKS: AmbientTrackInfo[] = [
  {
    id: 'cyberpunk-rain',
    name: 'Cyberpunk Rainy Cafe',
    shortName: 'Rain Lo-Fi',
    tag: 'Rain & Lo-Fi',
    icon: '🌧️',
    description: 'Generative rain on glass with warm Neo-Soul Lo-Fi electric piano',
  },
  {
    id: 'binaural-odyssey',
    name: 'Deep Space Binaural',
    shortName: 'Binaural',
    tag: '432Hz Alpha',
    icon: '🌀',
    description: '10Hz Alpha-Theta binaural beats & sweeping solar wind drone',
  },
  {
    id: 'subwoofer-twilight',
    name: 'Subwoofer Twilight',
    shortName: 'Twilight',
    tag: 'C418 Lullaby',
    icon: '🌲',
    description: 'Nostalgic felt-piano warmth & pillowy bass inspired by C418',
  },
  {
    id: 'mice-on-orbit',
    name: 'Mice on Orbit',
    shortName: 'Mice',
    tag: 'C418 Melodic',
    icon: '🐭',
    description: 'Lyrical music box chords & starry kalimba inspired by C418',
  },
  {
    id: 'cosmic-sanctuary',
    name: 'Cosmic Sanctuary',
    shortName: 'Sanctuary',
    tag: 'Flow State',
    icon: '🪐',
    description: '100% Chip-Free Prime-Modulated Ambient Focus Tapestry',
  },
  {
    id: 'celestial-horizon',
    name: 'Celestial Horizon',
    shortName: 'Horizon',
    tag: 'Symphony',
    icon: '🌅',
    description: '4-Phase Majestic Breathing Chord Swell Symphony',
  },
];

export class SoundEngine {
  private ctx: AudioContext | null = null;
  private lastHoverTime = 0;

  // 6 Generative Ambient Engines
  private celestialHorizon: CosmicAmbienceGenerator;
  private cosmicSanctuary: CosmicSanctuaryGenerator;
  private subwooferTwilight: SubwooferTwilightGenerator;
  private miceOnOrbit: MiceOnOrbitGenerator;
  private cyberpunkRain: CyberpunkRainGenerator;
  private binauralOdyssey: BinauralOdysseyGenerator;

  private activeTrackId: AmbientTrackId = 'cyberpunk-rain';
  private masterVolume: number = 0.5;
  private trackListeners = new Set<(trackId: AmbientTrackId) => void>();
  private ambienceListeners = new Set<(playing: boolean) => void>();
  private volumeListeners = new Set<(volume: number) => void>();

  constructor() {
    this.celestialHorizon = new CosmicAmbienceGenerator(() => this.getCtx());
    this.cosmicSanctuary = new CosmicSanctuaryGenerator(() => this.getCtx());
    this.subwooferTwilight = new SubwooferTwilightGenerator(() => this.getCtx());
    this.miceOnOrbit = new MiceOnOrbitGenerator(() => this.getCtx());
    this.cyberpunkRain = new CyberpunkRainGenerator(() => this.getCtx());
    this.binauralOdyssey = new BinauralOdysseyGenerator(() => this.getCtx());

    if (typeof window !== 'undefined') {
      try {
        const storedVol = localStorage.getItem('mastery_ambient_volume');
        if (storedVol !== null) {
          const parsed = parseFloat(storedVol);
          if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
            this.masterVolume = parsed;
            this.setAmbienceVolume(parsed);
          }
        }
      } catch {}
    }
  }

  private getCtx(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // ── 1. Subtle Bassy Gravity Buzz on Node Hover ─────────────────
  playOrbHover(_noteIndex = 0, enabled = true) {
    if (!enabled) return;
    const nowMs = performance.now();
    if (nowMs - this.lastHoverTime < 130) return;
    this.lastHoverTime = nowMs;

    try {
      const ctx = this.getCtx();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(75, now);
      osc.frequency.exponentialRampToValueAtTime(58, now + 0.08);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // Graceful fallback
    }
  }

  // ── 2. Rich Resonant Celestial Orb Select ──────────────────────
  playOrbSelect(noteIndex = 0, enabled = true) {
    if (!enabled) return;
    try {
      const ctx = this.getCtx();
      if (!ctx) return;

      const now = ctx.currentTime;
      const chordRoots = [
        [392.0, 493.88, 587.33, 739.99],
        [440.0, 554.37, 659.25, 830.61],
        [523.25, 659.25, 783.99, 987.77],
        [587.33, 739.99, 880.0, 1108.73],
        [349.23, 440.0, 523.25, 659.25],
      ];

      const chord = chordRoots[noteIndex % chordRoots.length];

      chord.forEach((freq, idx) => {
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + idx * 0.035;

        osc.type = idx === 0 ? 'sine' : idx === 3 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.998, startTime + 1.2);

        const vol = idx === 0 ? 0.26 : 0.16;
        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.linearRampToValueAtTime(vol, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 1.2);
      });
    } catch {
      // Graceful fallback
    }
  }

  // ── 3. Focus Chamber Ignite ────────────────────────────────────
  playStart(enabled = true) {
    if (!enabled) return;
    try {
      const ctx = this.getCtx();
      if (!ctx) return;

      const now = ctx.currentTime;

      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(120, now);
      subOsc.frequency.exponentialRampToValueAtTime(440, now + 0.4);

      subGain.gain.setValueAtTime(0.0001, now);
      subGain.gain.linearRampToValueAtTime(0.32, now + 0.15);
      subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

      subOsc.connect(subGain);
      subGain.connect(ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + 0.5);

      const notes = [440, 659.25, 880, 1318.51];
      notes.forEach((freq, idx) => {
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + 0.15 + idx * 0.06;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.linearRampToValueAtTime(0.22, startTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.9);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.9);
      });
    } catch {
      // Graceful fallback
    }
  }

  // ── 4. Subtle & Soothing Zen Session Complete Chime ─────────────
  playChime(enabled = true) {
    if (!enabled) return;
    try {
      const ctx = this.getCtx();
      if (!ctx) return;

      const now = ctx.currentTime;
      // Soft, peaceful pure sine harmonics (C4 + G4 + C5 serene resonant bowl)
      const harmonics = [
        { freq: 261.63, gain: 0.07, decay: 2.2 }, // C4 warm body
        { freq: 392.00, gain: 0.05, decay: 2.0 }, // G4 serene fifth
        { freq: 523.25, gain: 0.03, decay: 1.8 }, // C5 gentle clarity
      ];

      harmonics.forEach(({ freq, gain: maxGain, decay }) => {
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.998, now + decay);

        // Soft 50ms linear fade-in to prevent sharp clicks, silky exponential decay
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(maxGain, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + decay);
      });
    } catch {
      // Graceful fallback
    }
  }

  // ── 5. Fanfare for Milestones ──────────────────────────────────
  playFanfare(enabled = true) {
    if (!enabled) return;
    try {
      const ctx = this.getCtx();
      if (!ctx) return;

      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
      notes.forEach((freq, idx) => {
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + idx * 0.1;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.linearRampToValueAtTime(0.28, startTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 1.2);
      });
    } catch {
      // Graceful fallback
    }
  }

  // ── 6. Core Energy Gather Swell ────────────────────────────────
  playCoreCharge(enabled = true) {
    if (!enabled) return;
    try {
      const ctx = this.getCtx();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(110.0, now);
      osc.frequency.exponentialRampToValueAtTime(330.0, now + 0.85);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.45);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.9);
    } catch {
      // Graceful fallback
    }
  }

  // ── 7. Distinct Plasma Surge ───────────────────────────────────
  playEnergySurge(enabled = true) {
    if (!enabled) return;
    try {
      const ctx = this.getCtx();
      if (!ctx) return;

      const now = ctx.currentTime;
      const notes = [261.63, 392.0, 523.25, 659.25];
      notes.forEach((freq, idx) => {
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + idx * 0.12;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.12, startTime + 0.85);

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.linearRampToValueAtTime(0.24, startTime + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.9);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.9);
      });
    } catch {
      // Graceful fallback
    }
  }

  // ── 8. Skill Absorption Bloom ──────────────────────────────────
  playSkillAbsorption(enabled = true) {
    if (!enabled) return;
    try {
      const ctx = this.getCtx();
      if (!ctx) return;

      const now = ctx.currentTime;
      const notes = [329.63, 440.0, 659.25, 880.0, 1108.73];
      notes.forEach((freq, idx) => {
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + idx * 0.08;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.linearRampToValueAtTime(0.28, startTime + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 1.8);
      });
    } catch {
      // Graceful fallback
    }
  }

  // ── 9. Horizon Crossing Shimmer ────────────────────────────────
  playHorizonCross(enabled = true) {
    if (!enabled) return;
    try {
      const ctx = this.getCtx();
      if (!ctx) return;

      const now = ctx.currentTime;
      const chord = [369.99, 466.16, 554.37, 739.99, 830.61, 1108.73];
      chord.forEach((freq, idx) => {
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + idx * 0.07;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.01, startTime + 2.4);

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.linearRampToValueAtTime(0.3, startTime + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 2.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 2.6);
      });
    } catch {
      // Graceful fallback
    }
  }

  // ── 9b. Subtle & Soothing Zen Level Up Chime ────────────────────
  playLevelUp(enabled = true) {
    if (!enabled) return;
    try {
      const ctx = this.getCtx();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Soft Dual Sine Droplets (Peaceful D5 -> A5 perfect fifth)
      const notes = [
        { freq: 587.33, offset: 0.0, gain: 0.08, decay: 1.5 },   // D5
        { freq: 880.00, offset: 0.07, gain: 0.06, decay: 1.8 },  // A5
      ];

      notes.forEach(({ freq, offset, gain: maxGain, decay }) => {
        if (!ctx) return;
        const noteStart = now + offset;

        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteStart);

        // Gentle, soft linear attack to avoid any clicks, followed by silky exponential decay
        gainNode.gain.setValueAtTime(0.0001, noteStart);
        gainNode.gain.linearRampToValueAtTime(maxGain, noteStart + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, noteStart + decay);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(noteStart);
        osc.stop(noteStart + decay);
      });
    } catch {
      // Graceful fallback
    }
  }

  // ── 10. Cosmic Ambience Engine & Track Management ─────────────
  private getActiveGenerator() {
    switch (this.activeTrackId) {
      case 'cyberpunk-rain':
        return this.cyberpunkRain;
      case 'binaural-odyssey':
        return this.binauralOdyssey;
      case 'subwoofer-twilight':
        return this.subwooferTwilight;
      case 'mice-on-orbit':
        return this.miceOnOrbit;
      case 'cosmic-sanctuary':
        return this.cosmicSanctuary;
      case 'celestial-horizon':
      default:
        return this.celestialHorizon;
    }
  }

  startAmbience() {
    this.stopAmbience();
    this.getActiveGenerator().start();
    this.notifyAmbienceListeners(true);
  }

  stopAmbience() {
    this.celestialHorizon.stop();
    this.cosmicSanctuary.stop();
    this.subwooferTwilight.stop();
    this.miceOnOrbit.stop();
    this.cyberpunkRain.stop();
    this.binauralOdyssey.stop();
    this.notifyAmbienceListeners(false);
  }

  toggleAmbience(): boolean {
    if (this.getIsAmbienceActive()) {
      this.stopAmbience();
      return false;
    } else {
      this.startAmbience();
      return true;
    }
  }

  getIsAmbienceActive(): boolean {
    return (
      this.celestialHorizon.getIsPlaying() ||
      this.cosmicSanctuary.getIsPlaying() ||
      this.subwooferTwilight.getIsPlaying() ||
      this.miceOnOrbit.getIsPlaying() ||
      this.cyberpunkRain.getIsPlaying() ||
      this.binauralOdyssey.getIsPlaying()
    );
  }

  getActiveTrackId(): AmbientTrackId {
    return this.activeTrackId;
  }

  setTrack(trackId: AmbientTrackId) {
    if (this.activeTrackId === trackId) return;

    const wasPlaying = this.getIsAmbienceActive();
    this.stopAmbience();

    this.activeTrackId = trackId;
    this.notifyTrackListeners(trackId);

    if (wasPlaying) {
      setTimeout(() => {
        this.startAmbience();
      }, 50);
    }
  }

  setAmbienceVolume(vol: number) {
    const clamped = Math.max(0, Math.min(1, vol));
    this.masterVolume = clamped;
    this.celestialHorizon.setVolume(clamped);
    this.cosmicSanctuary.setVolume(clamped);
    this.subwooferTwilight.setVolume(clamped);
    this.miceOnOrbit.setVolume(clamped);
    this.cyberpunkRain.setVolume(clamped);
    this.binauralOdyssey.setVolume(clamped);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('mastery_ambient_volume', clamped.toString());
      } catch {}
    }

    this.notifyVolumeListeners(clamped);
  }

  getAmbienceVolume(): number {
    return this.masterVolume;
  }

  nextTrack(): AmbientTrackId {
    const currentIndex = AMBIENT_TRACKS.findIndex(
      (t) => t.id === this.activeTrackId,
    );
    const nextIdx = (currentIndex + 1) % AMBIENT_TRACKS.length;
    const nextId = AMBIENT_TRACKS[nextIdx].id;
    this.setTrack(nextId);
    return nextId;
  }

  prevTrack(): AmbientTrackId {
    const currentIndex = AMBIENT_TRACKS.findIndex(
      (t) => t.id === this.activeTrackId,
    );
    const prevIdx =
      (currentIndex - 1 + AMBIENT_TRACKS.length) % AMBIENT_TRACKS.length;
    const prevId = AMBIENT_TRACKS[prevIdx].id;
    this.setTrack(prevId);
    return prevId;
  }

  subscribeAmbience(listener: (playing: boolean) => void): () => void {
    this.ambienceListeners.add(listener);
    return () => {
      this.ambienceListeners.delete(listener);
    };
  }

  subscribeTrack(listener: (trackId: AmbientTrackId) => void): () => void {
    this.trackListeners.add(listener);
    return () => {
      this.trackListeners.delete(listener);
    };
  }

  subscribeVolume(listener: (volume: number) => void): () => void {
    this.volumeListeners.add(listener);
    return () => {
      this.volumeListeners.delete(listener);
    };
  }

  private notifyAmbienceListeners(playing: boolean) {
    this.ambienceListeners.forEach((fn) => fn(playing));
  }

  private notifyTrackListeners(trackId: AmbientTrackId) {
    this.trackListeners.forEach((fn) => fn(trackId));
  }

  private notifyVolumeListeners(volume: number) {
    this.volumeListeners.forEach((fn) => fn(volume));
  }
}

export const soundEngine = new SoundEngine();
