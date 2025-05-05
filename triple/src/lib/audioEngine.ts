import { AudioContext } from 'standardized-audio-context';

// Default voice settings
const DEFAULT_VOICE_SETTINGS = [
  {
    cutoff: 2000,
    resonance: 8,
    envMod: 0.6,
    decay: 0.3,
    accent: 0.4,
    glide: 0.2,
    delayTime: 0.25,
    delayFeedback: 0.3,
    delayMix: 0.2,
    reverbMix: 0.15
  },
  {
    cutoff: 3000,
    resonance: 6,
    envMod: 0.4,
    decay: 0.2,
    accent: 0.3,
    glide: 0.1,
    delayTime: 0.375,
    delayFeedback: 0.25,
    delayMix: 0.15,
    reverbMix: 0.1
  },
  {
    cutoff: 4000,
    resonance: 4,
    envMod: 0.3,
    decay: 0.15,
    accent: 0.2,
    glide: 0,
    delayTime: 0.5,
    delayFeedback: 0.2,
    delayMix: 0.1,
    reverbMix: 0.05
  }
];

class Voice {
  private context: AudioContext;
  private oscillator: OscillatorNode;
  private filter: BiquadFilterNode;
  private envelope: GainNode;
  private output: GainNode;
  private delay: DelayNode;
  private delayGain: GainNode;
  private delayFeedback: GainNode;
  private convolver: ConvolverNode;
  private reverbGain: GainNode;
  private dryGain: GainNode;
  private waveform: OscillatorType = 'sawtooth';
  private envModAmount: number = 0.5;
  private decayTime: number = 0.3;
  private accentAmount: number = 0;
  private glideTime: number = 0;
  private frequency: number = 440;
  
  constructor(context: AudioContext) {
    this.context = context;
    
    // Create audio nodes
    this.oscillator = context.createOscillator();
    this.filter = context.createBiquadFilter();
    this.envelope = context.createGain();
    this.output = context.createGain();
    
    // Create delay nodes
    this.delay = context.createDelay(2.0);
    this.delayGain = context.createGain();
    this.delayFeedback = context.createGain();
    
    // Create reverb nodes
    this.convolver = context.createConvolver();
    this.reverbGain = context.createGain();
    this.dryGain = context.createGain();
    
    // Set initial parameters
    this.oscillator.type = this.waveform;
    this.filter.type = 'lowpass';
    this.filter.frequency.value = 1000;
    this.filter.Q.value = 10;
    this.envelope.gain.value = 0;
    this.output.gain.value = 0.7;
    
    // Initialize effect parameters
    this.delay.delayTime.value = 0.25;
    this.delayGain.gain.value = 0;
    this.delayFeedback.gain.value = 0.3;
    this.reverbGain.gain.value = 0;
    this.dryGain.gain.value = 1;
    
    // Connect main signal path
    this.oscillator.connect(this.filter);
    this.filter.connect(this.envelope);
    this.envelope.connect(this.dryGain);
    this.dryGain.connect(this.output);
    
    // Connect delay
    this.envelope.connect(this.delay);
    this.delay.connect(this.delayGain);
    this.delayGain.connect(this.output);
    this.delay.connect(this.delayFeedback);
    this.delayFeedback.connect(this.delay);
    
    // Connect reverb
    this.envelope.connect(this.convolver);
    this.convolver.connect(this.reverbGain);
    this.reverbGain.connect(this.output);
    
    // Start oscillator
    this.oscillator.start();

    // Generate and set impulse response for reverb
    this.generateImpulseResponse();
  }

  private async generateImpulseResponse() {
    const duration = 2;
    const decay = 2;
    const sampleRate = this.context.sampleRate;
    const length = sampleRate * duration;
    const impulse = this.context.createBuffer(2, length, sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        const t = i / sampleRate;
        channelData[i] = (Math.random() * 2 - 1) * Math.exp(-t * decay);
      }
    }
    
    this.convolver.buffer = impulse;
  }
  
  setWaveform(type: OscillatorType) {
    this.waveform = type;
    this.oscillator.type = type;
  }
  
  setCutoff(value: number) {
    this.filter.frequency.setValueAtTime(value, this.context.currentTime);
  }
  
  setResonance(value: number) {
    this.filter.Q.setValueAtTime(value, this.context.currentTime);
  }
  
  setEnvMod(value: number) {
    this.envModAmount = value;
  }
  
  setDecay(value: number) {
    this.decayTime = value * 2;
  }
  
  setAccent(value: number) {
    this.accentAmount = value;
  }
  
  setGlide(value: number) {
    this.glideTime = value;
  }
  
  setVolume(value: number) {
    this.output.gain.setValueAtTime(value, this.context.currentTime);
  }

  setDelayTime(value: number) {
    this.delay.delayTime.setValueAtTime(value, this.context.currentTime);
  }

  setDelayFeedback(value: number) {
    this.delayFeedback.gain.setValueAtTime(value, this.context.currentTime);
  }

  setDelayMix(value: number) {
    this.delayGain.gain.setValueAtTime(value, this.context.currentTime);
  }

  setReverbMix(value: number) {
    const now = this.context.currentTime;
    this.reverbGain.gain.setValueAtTime(value, now);
    this.dryGain.gain.setValueAtTime(1 - value * 0.5, now);
  }
  
  setFrequency(freq: number, immediate: boolean = false) {
    const now = this.context.currentTime;
    if (immediate || this.glideTime === 0) {
      this.oscillator.frequency.setValueAtTime(freq, now);
    } else {
      this.oscillator.frequency.linearRampToValueAtTime(
        freq,
        now + this.glideTime
      );
    }
    this.frequency = freq;
  }
  
  triggerEnvelope(velocity: number = 1) {
    const now = this.context.currentTime;
    const baseVelocity = velocity * (1 + this.accentAmount);
    const envAmount = this.envModAmount * 5000;
    const baseCutoff = this.filter.frequency.value;
    
    // Reset envelope
    this.envelope.gain.cancelScheduledValues(now);
    this.filter.frequency.cancelScheduledValues(now);
    
    // Amplitude envelope
    this.envelope.gain.setValueAtTime(0, now);
    this.envelope.gain.linearRampToValueAtTime(baseVelocity, now + 0.01);
    this.envelope.gain.exponentialRampToValueAtTime(0.001, now + this.decayTime);
    
    // Filter envelope
    this.filter.frequency.setValueAtTime(baseCutoff + envAmount, now);
    this.filter.frequency.exponentialRampToValueAtTime(
      baseCutoff,
      now + this.decayTime * 0.8
    );
  }
  
  noteOn(note: number, velocity: number = 1) {
    const freq = 440 * Math.pow(2, (note - 69) / 12);
    this.setFrequency(freq);
    this.triggerEnvelope(velocity);
  }
  
  noteOff() {
    const now = this.context.currentTime;
    this.envelope.gain.cancelScheduledValues(now);
    this.envelope.gain.setValueAtTime(this.envelope.gain.value, now);
    this.envelope.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
  }
  
  connect(destination: AudioNode) {
    this.output.connect(destination);
  }
  
  disconnect() {
    this.output.disconnect();
  }
}

export class TB303Engine {
  private context: AudioContext;
  private voices: Voice[];
  private master: GainNode;
  private initialized: boolean = false;
  
  constructor() {
    this.context = new AudioContext();
    this.master = this.context.createGain();
    this.master.connect(this.context.destination);
    
    // Create three voices with default settings
    this.voices = Array(3).fill(null).map((_, index) => {
      const voice = new Voice(this.context);
      voice.connect(this.master);
      
      // Apply default settings
      const settings = DEFAULT_VOICE_SETTINGS[index];
      voice.setCutoff(settings.cutoff);
      voice.setResonance(settings.resonance);
      voice.setEnvMod(settings.envMod);
      voice.setDecay(settings.decay);
      voice.setAccent(settings.accent);
      voice.setGlide(settings.glide);
      voice.setDelayTime(settings.delayTime);
      voice.setDelayFeedback(settings.delayFeedback);
      voice.setDelayMix(settings.delayMix);
      voice.setReverbMix(settings.reverbMix);
      voice.setVolume(0.7);
      
      return voice;
    });
  }
  
  async initialize() {
    if (this.initialized) return;
    
    try {
      // Resume audio context
      if (this.context.state !== 'running') {
        await this.context.resume();
      }
      this.initialized = true;
      console.log('Audio context initialized successfully');
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  }
  
  getVoice(index: number): Voice | undefined {
    return this.voices[index];
  }
  
  setMasterVolume(value: number) {
    this.master.gain.setValueAtTime(value, this.context.currentTime);
  }

  isInitialized() {
    return this.initialized;
  }
}

export default TB303Engine;