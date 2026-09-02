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
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, t);
    osc.frequency.exponentialRampToValueAtTime(150, t + 0.05);
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.06);
  }

  playMinesGem(step: number = 1) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    // Rising crystal bell harmonic
    const baseFreq = Math.min(1200, 520 + step * 40);
    [baseFreq, baseFreq * 1.5, baseFreq * 2].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.02);
      gain.gain.setValueAtTime(0.06 / (idx + 1), t + idx * 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25 + idx * 0.05);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(t + idx * 0.02);
      osc.stop(t + 0.35);
    });
  }

  playMinesBomb() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    // Low bass punch + noise explosion
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.4);
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.5);
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
