import { EventEmitter } from './eventEmitter';

export interface Step {
  note: number;
  accent: boolean;
  slide: boolean;
  active: boolean;
}

export interface Pattern {
  steps: Step[];
  length: number;
}

// Default pattern with a basic acid sequence
const DEFAULT_PATTERN: Pattern = {
  steps: [
    { note: 36, accent: true, slide: false, active: true },   // C2
    { note: 48, accent: false, slide: true, active: true },   // C3
    { note: 43, accent: true, slide: false, active: true },   // G2
    { note: 41, accent: false, slide: false, active: true },  // F2
    { note: 36, accent: true, slide: false, active: true },   // C2
    { note: 48, accent: false, slide: true, active: true },   // C3
    { note: 43, accent: false, slide: false, active: true },  // G2
    { note: 41, accent: true, slide: false, active: true },   // F2
    { note: 36, accent: false, slide: false, active: true },  // C2
    { note: 48, accent: true, slide: true, active: true },    // C3
    { note: 43, accent: false, slide: false, active: true },  // G2
    { note: 41, accent: false, slide: false, active: true },  // F2
    { note: 36, accent: true, slide: false, active: true },   // C2
    { note: 48, accent: false, slide: true, active: true },   // C3
    { note: 43, accent: true, slide: false, active: true },   // G2
    { note: 41, accent: false, slide: false, active: true },  // F2
  ],
  length: 16
};

export class Sequencer extends EventEmitter {
  private patterns: Pattern[];
  private currentStep: number = 0;
  private isPlaying: boolean = false;
  private tempo: number = 120;
  private interval: number | null = null;
  private lastStepTime: number = 0;

  constructor() {
    super();
    // Initialize three patterns with variations of the default pattern
    this.patterns = Array(3).fill(null).map((_, i) => {
      const pattern = { ...DEFAULT_PATTERN, steps: [...DEFAULT_PATTERN.steps] };
      // Transpose second voice up an octave
      if (i === 1) {
        pattern.steps = pattern.steps.map(step => ({
          ...step,
          note: step.note + 12
        }));
      }
      // Transpose third voice up two octaves
      if (i === 2) {
        pattern.steps = pattern.steps.map(step => ({
          ...step,
          note: step.note + 24
        }));
      }
      return pattern;
    });
  }

  setPattern(voiceIndex: number, pattern: Pattern) {
    this.patterns[voiceIndex] = pattern;
  }

  getPattern(voiceIndex: number): Pattern {
    return this.patterns[voiceIndex];
  }

  setTempo(bpm: number) {
    this.tempo = Math.max(10, Math.min(300, bpm));
    if (this.isPlaying) {
      this.restart();
    }
  }

  start() {
    if (this.isPlaying) return;
    
    this.isPlaying = true;
    this.lastStepTime = performance.now();
    this.scheduleNextStep();
  }

  stop() {
    this.isPlaying = false;
    if (this.interval !== null) {
      clearTimeout(this.interval);
      this.interval = null;
    }
    this.currentStep = 0;
    this.emit('stop');
  }

  private restart() {
    this.stop();
    this.start();
  }

  private scheduleNextStep() {
    if (!this.isPlaying) return;

    const stepDuration = (60 * 1000) / (this.tempo * 4); // 16th notes
    const now = performance.now();
    const nextStepTime = this.lastStepTime + stepDuration;
    const delay = Math.max(0, nextStepTime - now);

    this.interval = window.setTimeout(() => {
      this.lastStepTime = nextStepTime;
      this.processStep();
      this.scheduleNextStep();
    }, delay);
  }

  private processStep() {
    // Trigger notes for each voice
    this.patterns.forEach((pattern, voiceIndex) => {
      const step = pattern.steps[this.currentStep % pattern.length];
      if (step.active) {
        this.emit('step', voiceIndex, step);
      }
    });

    // Advance to next step
    this.currentStep = (this.currentStep + 1) % 16;
    this.emit('stepChange', this.currentStep);
  }
}