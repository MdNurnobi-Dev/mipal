class AudioSystem {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  public isMuted = false;
  private bgmInterval: any = null;

  // Real Audio Elements (Will play if user uploads these files to /public)
  private realBgm = new Audio('/bgm.mp3');
  private realMegaWin = new Audio('/mega-win.mp3');
  private realSuperWin = new Audio('/super-win.mp3');
  private realWin = new Audio('/win.mp3');

  constructor() {
    this.realBgm.loop = true;
    this.realBgm.volume = 0.3;
    this.realMegaWin.volume = 1.0;
    this.realSuperWin.volume = 1.0;
    this.realWin.volume = 0.8;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.value = 0.15;
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopBGM();
      window.speechSynthesis.cancel();
    } else {
      this.playBGM();
    }
    return this.isMuted;
  }

  playBGM() {
    if (this.isMuted) return;
    
    // Try playing real mp3 first (if uploaded)
    this.realBgm.play().catch(() => {
      // If file not found, fallback to upgraded synthetic BGM
      this.playSynthBGM();
    });
  }

  playSynthBGM() {
    this.init();
    if (this.bgmInterval) return;

    // Upbeat Casino Slot Loop (Pentatonic scale for Asian vibe)
    let step = 0;
    const bass = [130.81, 130.81, 174.61, 196.00]; // C3, C3, F3, G3
    const melody = [523.25, 587.33, 659.25, 783.99, 987.77, 1046.50]; // C5 to C6

    this.bgmInterval = setInterval(() => {
      if (!this.ctx || !this.masterGain || this.isMuted) return;
      const t = this.ctx.currentTime;
      
      // Bass pulse
      if (step % 2 === 0) {
        const bOsc = this.ctx.createOscillator();
        const bGain = this.ctx.createGain();
        bOsc.type = 'triangle';
        bOsc.frequency.setValueAtTime(bass[(step/2) % bass.length], t);
        bGain.gain.setValueAtTime(0, t);
        bGain.gain.linearRampToValueAtTime(0.15, t + 0.05);
        bGain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
        bOsc.connect(bGain);
        bGain.connect(this.masterGain);
        bOsc.start(t);
        bOsc.stop(t + 0.2);
      }

      // Melody arpeggio
      const mOsc = this.ctx.createOscillator();
      const mGain = this.ctx.createGain();
      mOsc.type = 'sine';
      mOsc.frequency.setValueAtTime(melody[Math.floor(Math.random() * melody.length)], t);
      mGain.gain.setValueAtTime(0, t);
      mGain.gain.linearRampToValueAtTime(0.05, t + 0.02);
      mGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      mOsc.connect(mGain);
      mGain.connect(this.masterGain);
      mOsc.start(t);
      mOsc.stop(t + 0.15);
      
      step++;
    }, 250); // Faster tempo for excitement
  }

  stopBGM() {
    this.realBgm.pause();
    this.realBgm.currentTime = 0;
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  stopAllSounds() {
    this.stopBGM();
    try {
      this.realMegaWin.pause();
      this.realMegaWin.currentTime = 0;
      this.realSuperWin.pause();
      this.realSuperWin.currentTime = 0;
      this.realWin.pause();
      this.realWin.currentTime = 0;
    } catch {
      // Ignore audio element errors
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  playSpin(isTurbo: boolean = false) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;
    
    let t = this.ctx.currentTime;
    const count = isTurbo ? 6 : 12;
    const interval = isTurbo ? 0.02 : 0.04;
    for (let i = 0; i < count; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square'; // More mechanical
      osc.frequency.setValueAtTime(600 + (Math.random() * 200), t + (i * interval));
      
      gain.gain.setValueAtTime(0, t + (i * interval));
      gain.gain.linearRampToValueAtTime(0.02, t + (i * interval) + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, t + (i * interval) + 0.03);
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      
      osc.start(t + (i * interval));
      osc.stop(t + (i * interval) + 0.04);
    }
  }

  playWin(amount: number) {
    // Win music and voice announcements are temporarily disabled as requested
    return;
  }

  playMinesTile() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    
    // Subtle, crisp UI "tick"
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.03);
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  playMinesGem(step: number = 1) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    
    // Pleasant, soft chime that goes up in pitch
    const baseFreq = Math.min(1500, 600 + step * 50);
    const harmonics = [1, 1.5, 2.5]; 
    
    harmonics.forEach((h, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * h, t);
      
      // Softer volume, slightly longer decay
      gain.gain.setValueAtTime(0.08 / (idx + 1), t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4 + (idx * 0.1));
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.6);
    });
  }

  playMinesBomb() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    
    // Alert / Explosion: low distorted thud
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square'; // harsher waveform
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(20, t + 0.3);
    
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    
    // Add a secondary oscillator for discordant alert feel
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(300, t);
    osc2.frequency.exponentialRampToValueAtTime(40, t + 0.3);
    
    gain2.gain.setValueAtTime(0.2, t);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc2.connect(gain2);
    gain2.connect(this.masterGain);
    
    osc.start(t);
    osc.stop(t + 0.4);
    osc2.start(t);
    osc2.stop(t + 0.4);
  }

  playMinesCashout() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.07);
      gain.gain.setValueAtTime(0.12, t + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.07 + 0.25);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(t + idx * 0.07);
      osc.stop(t + idx * 0.07 + 0.3);
    });
  }

  playFlyXCountdown() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, t);
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.09);
  }

  playFlyXTakeoff() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(640, t + 0.4);
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.5);
  }

  playFlyXCrash() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.35);
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.45);
  }

  playFlyXCashout() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const notes = [659.25, 830.61, 987.77, 1318.51]; // E5, G#5, B5, E6
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.05);
      gain.gain.setValueAtTime(0.14, t + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.05 + 0.3);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(t + idx * 0.05);
      osc.stop(t + idx * 0.05 + 0.35);
    });
  }

  playSpacemanLiftoff() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(660, t + 0.5);
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.6);
  }

  playSpacemanCashout() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.06);
      gain.gain.setValueAtTime(0.16, t + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.06 + 0.35);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(t + idx * 0.06);
      osc.stop(t + idx * 0.06 + 0.4);
    });
  }

  playSpacemanCashout50() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25]; // A4, C#5, E5
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.07);
      gain.gain.setValueAtTime(0.15, t + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.07 + 0.3);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(t + idx * 0.07);
      osc.stop(t + idx * 0.07 + 0.35);
    });
  }

  playSpacemanCrash() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(240, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.45);
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.55);
  }

  // ==========================================
  // WILD BOUNTY SHOWDOWN SOUND EFFECTS (WESTERN)
  // ==========================================
  playWildBountyGunshot() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;

    // High snap
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.15);
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.22);

    // Deep sub bass blast
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sawtooth';
    subOsc.frequency.setValueAtTime(140, t);
    subOsc.frequency.exponentialRampToValueAtTime(25, t + 0.35);
    subGain.gain.setValueAtTime(0.3, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);
    subOsc.connect(subGain);
    subGain.connect(this.masterGain);
    subOsc.start(t);
    subOsc.stop(t + 0.4);
  }

  playWildBountyRevolverSpin() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const clicks = 8;
    for (let i = 0; i < clicks; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(1200 + Math.random() * 400, t + i * 0.035);
      gain.gain.setValueAtTime(0.06, t + i * 0.035);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.035 + 0.02);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t + i * 0.035);
      osc.stop(t + i * 0.035 + 0.025);
    }
  }

  playWildBountyCascade() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.04);
      gain.gain.setValueAtTime(0.12, t + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.04 + 0.22);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(t + idx * 0.04);
      osc.stop(t + idx * 0.04 + 0.25);
    });
  }

  playWildBountyMultiplierLevelUp(multiplier: number) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const base = Math.min(1400, 440 + Math.log2(multiplier || 1) * 120);
    const chords = [base, base * 1.25, base * 1.5, base * 2];
    chords.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.05);
      gain.gain.setValueAtTime(0.15, t + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.05 + 0.35);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(t + idx * 0.05);
      osc.stop(t + idx * 0.05 + 0.4);
    });
  }

  playWildBountyScatter() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const bells = [880, 1174.66, 1479.98, 1760]; // A5, D6, F#6, A6
    bells.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.08);
      gain.gain.setValueAtTime(0.18, t + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.5);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(t + idx * 0.08);
      osc.stop(t + idx * 0.08 + 0.55);
    });
  }

  synthSpeak(text: string) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = 1;
    utterance.rate = 0.9; // Slightly slower for announcer effect
    utterance.pitch = 1.0; 
    
    const voices = window.speechSynthesis.getVoices();
    // Look for high quality natural voices, avoiding standard robotic ones
    const naturalVoice = voices.find(v => 
      v.name.includes('Google US English') || 
      v.name.includes('Samantha') || // Mac high quality
      v.name.includes('Daniel') ||   // Mac high quality UK
      v.name.includes('Microsoft Zira') || // Windows high quality
      v.name.includes('Natural')
    );
    
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }
    window.speechSynthesis.speak(utterance);
  }
}

export const audioSystem = new AudioSystem();
