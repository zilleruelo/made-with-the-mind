import React, { useEffect, useRef, useState } from 'react';
import TB303Engine from './lib/audioEngine';
import VoicePanel from './components/VoicePanel';
import Sequencer from './components/Sequencer';
import { Sequencer as SequencerEngine, type Pattern } from './lib/sequencer';

function App() {
  const engineRef = useRef<TB303Engine | null>(null);
  const sequencerRef = useRef<SequencerEngine | null>(null);
  const [darkMode, setDarkMode] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [tempo, setTempo] = useState(120);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [audioInitialized, setAudioInitialized] = useState(false);

  useEffect(() => {
    // Initialize audio engine
    engineRef.current = new TB303Engine();
    sequencerRef.current = new SequencerEngine();

    const sequencer = sequencerRef.current;
    
    // Initialize patterns
    setPatterns(Array(3).fill(null).map(() => sequencer.getPattern(0)));

    // Set up sequencer event handlers
    sequencer.on('step', async (voiceIndex: number, step: any) => {
      const voice = engineRef.current?.getVoice(voiceIndex);
      if (voice && step.active) {
        // Ensure audio is initialized before playing
        if (!engineRef.current?.isInitialized()) {
          await engineRef.current?.initialize();
          setAudioInitialized(true);
        }
        voice.noteOn(step.note, step.accent ? 1 : 0.7);
      }
    });

    sequencer.on('stepChange', (step: number) => {
      setCurrentStep(step);
    });

    // Add click handler to initialize audio
    const initializeAudio = async () => {
      if (!engineRef.current?.isInitialized()) {
        await engineRef.current?.initialize();
        setAudioInitialized(true);
      }
    };
    document.addEventListener('click', initializeAudio, { once: true });

    return () => {
      sequencer.removeAllListeners();
      document.removeEventListener('click', initializeAudio);
    };
  }, []);

  const handleParameterChange = (voiceIndex: number, param: string, value: number) => {
    console.log(`Voice ${voiceIndex} - ${param}: ${value}`); // Debug log
    const voice = engineRef.current?.getVoice(voiceIndex);
    if (!voice) {
      console.warn(`Voice ${voiceIndex} not found`);
      return;
    }

    try {
      switch (param) {
        case 'cutoff':
          voice.setCutoff(value);
          break;
        case 'resonance':
          voice.setResonance(value);
          break;
        case 'envMod':
          voice.setEnvMod(value);
          break;
        case 'decay':
          voice.setDecay(value);
          break;
        case 'accent':
          voice.setAccent(value);
          break;
        case 'glide':
          voice.setGlide(value);
          break;
        case 'delayTime':
          voice.setDelayTime(value);
          break;
        case 'delayFeedback':
          voice.setDelayFeedback(value);
          break;
        case 'delayMix':
          voice.setDelayMix(value);
          break;
        case 'reverbMix':
          voice.setReverbMix(value);
          break;
        default:
          console.warn(`Unknown parameter: ${param}`);
      }
    } catch (error) {
      console.error(`Error setting parameter ${param}:`, error);
    }
  };

  const handlePlayPause = async () => {
    if (!sequencerRef.current) return;
    
    // Initialize audio context if needed
    if (!engineRef.current?.isInitialized()) {
      await engineRef.current?.initialize();
      setAudioInitialized(true);
    }
    
    if (isPlaying) {
      sequencerRef.current.stop();
    } else {
      sequencerRef.current.start();
    }
    setIsPlaying(!isPlaying);
  };

  const handlePatternChange = (voiceIndex: number, pattern: Pattern) => {
    if (!sequencerRef.current) return;
    sequencerRef.current.setPattern(voiceIndex, pattern);
    setPatterns((prev) => {
      const newPatterns = [...prev];
      newPatterns[voiceIndex] = pattern;
      return newPatterns;
    });
  };

  const handleTempoChange = (newTempo: number) => {
    if (!sequencerRef.current) return;
    sequencerRef.current.setTempo(newTempo);
    setTempo(newTempo);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            TB-303 Triple Synth
          </h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`px-4 py-2 rounded-lg ${
              darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
            }`}
          >
            Toggle Theme
          </button>
        </header>

        {!audioInitialized && (
          <div className="mb-4 p-4 bg-yellow-100 text-yellow-800 rounded-lg">
            Click anywhere or press play to start audio
          </div>
        )}

        <div className="mb-8">
          <Sequencer
            patterns={patterns}
            currentStep={currentStep}
            isPlaying={isPlaying}
            tempo={tempo}
            onPatternChange={handlePatternChange}
            onTempoChange={handleTempoChange}
            onPlayPause={handlePlayPause}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[0, 1, 2].map((index) => (
            <VoicePanel
              key={index}
              index={index}
              onParameterChange={(param, value) => handleParameterChange(index, param, value)}
            />
          ))}
        </div>

        <div className="mt-8 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-white mb-4">Master Mix</h2>
          <div className="grid grid-cols-3 gap-6">
            {[0, 1, 2].map((index) => (
              <div key={index} className="flex flex-col items-center">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  defaultValue="0.7"
                  className="w-full"
                  onChange={(e) => {
                    const voice = engineRef.current?.getVoice(index);
                    voice?.setVolume(parseFloat(e.target.value));
                  }}
                />
                <span className="text-white mt-2">Voice {index + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;