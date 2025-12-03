// Simple audio manager using Web Audio API for SFX and HTML5 Audio for music

class SoundManager {
  private ctx: AudioContext | null = null;
  private music: HTMLAudioElement | null = null;
  private musicVolume: number = 0.5;
  private sfxVolume: number = 0.5;
  private initialized: boolean = false;

  constructor() {
    // Music track: Relaxing Lo-Fi / Ambient track suitable for long gameplay
    // Source: Pixabay (Royalty Free) - "Lofi Study" style
    this.music = new Audio('https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3'); 
    this.music.loop = true;
  }

  init() {
    if (this.initialized) return;
    
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContext();
      }
      this.initialized = true;
      this.updateMusicVolume();
    } catch (e) {
      console.error("Web Audio API not supported", e);
    }
  }

  setMusicVolume(vol: number) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    this.updateMusicVolume();
  }

  setSfxVolume(vol: number) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
  }

  private updateMusicVolume() {
    if (this.music) {
      this.music.volume = this.musicVolume;
    }
  }

  playMusic() {
    if (this.music) {
      // Browsers require user interaction before playing audio. 
      // This should be called after a click.
      this.music.play().catch(e => console.log("Auto-play prevented until interaction", e));
    }
  }

  pauseMusic() {
    if (this.music) {
      this.music.pause();
    }
  }

  // Synthesize a "Pop" sound for clicks
  playClickSound() {
    if (!this.ctx || this.sfxVolume <= 0) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    // Softer pop sound
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(this.sfxVolume * 0.4, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  // Synthesize a "Cha-ching" / Purchase sound
  playBuySound() {
    if (!this.ctx || this.sfxVolume <= 0) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.type = 'triangle';
    osc2.type = 'sine';

    // Softer coin sound
    osc1.frequency.setValueAtTime(800, t);
    osc1.frequency.setValueAtTime(1200, t + 0.1);
    
    osc2.frequency.setValueAtTime(1200, t);
    osc2.frequency.setValueAtTime(1800, t + 0.1);

    gain.gain.setValueAtTime(this.sfxVolume * 0.2, t);
    gain.gain.linearRampToValueAtTime(0, t + 0.3);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.3);
    osc2.stop(t + 0.3);
  }
}

export const soundManager = new SoundManager();