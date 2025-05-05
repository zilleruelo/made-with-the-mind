import React, { useEffect, useState } from 'react';
import { AudioWaveform as Waveform } from 'lucide-react';
import Knob from './Knob';

interface VoicePanelProps {
  index: number;
  onParameterChange: (param: string, value: number) => void;
  onTest?: () => void;
}

const VoicePanel: React.FC<VoicePanelProps> = ({ index, onParameterChange, onTest }) => {
  // Initialize state with default values based on voice index
  const defaultSettings = [
    {
      cutoff: 2000, resonance: 8, envMod: 0.6, decay: 0.3, accent: 0.4, glide: 0.2,
      delayTime: 0.25, delayFeedback: 0.3, delayMix: 0.2, reverbMix: 0.15
    },
    {
      cutoff: 3000, resonance: 6, envMod: 0.4, decay: 0.2, accent: 0.3, glide: 0.1,
      delayTime: 0.375, delayFeedback: 0.25, delayMix: 0.15, reverbMix: 0.1
    },
    {
      cutoff: 4000, resonance: 4, envMod: 0.3, decay: 0.15, accent: 0.2, glide: 0,
      delayTime: 0.5, delayFeedback: 0.2, delayMix: 0.1, reverbMix: 0.05
    }
  ][index];

  const [cutoff, setCutoff] = useState(defaultSettings.cutoff);
  const [resonance, setResonance] = useState(defaultSettings.resonance);
  const [envMod, setEnvMod] = useState(defaultSettings.envMod);
  const [decay, setDecay] = useState(defaultSettings.decay);
  const [accent, setAccent] = useState(defaultSettings.accent);
  const [glide, setGlide] = useState(defaultSettings.glide);
  const [delayTime, setDelayTime] = useState(defaultSettings.delayTime);
  const [delayFeedback, setDelayFeedback] = useState(defaultSettings.delayFeedback);
  const [delayMix, setDelayMix] = useState(defaultSettings.delayMix);
  const [reverbMix, setReverbMix] = useState(defaultSettings.reverbMix);

  // Update audio engine whenever a parameter changes
  const handleParameterChange = (param: string, value: number) => {
    switch (param) {
      case 'cutoff':
        setCutoff(value);
        break;
      case 'resonance':
        setResonance(value);
        break;
      case 'envMod':
        setEnvMod(value);
        break;
      case 'decay':
        setDecay(value);
        break;
      case 'accent':
        setAccent(value);
        break;
      case 'glide':
        setGlide(value);
        break;
      case 'delayTime':
        setDelayTime(value);
        break;
      case 'delayFeedback':
        setDelayFeedback(value);
        break;
      case 'delayMix':
        setDelayMix(value);
        break;
      case 'reverbMix':
        setReverbMix(value);
        break;
    }
    onParameterChange(param, value);
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Voice {index + 1}</h3>
        <button 
          className="p-2 rounded-full hover:bg-gray-800"
          onClick={onTest}
        >
          <Waveform className="w-6 h-6 text-white" />
        </button>
      </div>
      
      <div className="space-y-8">
        {/* Synthesis Controls */}
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-4">Synthesis</h4>
          <div className="grid grid-cols-3 gap-6">
            <Knob
              value={cutoff}
              min={20}
              max={20000}
              onChange={(value) => handleParameterChange('cutoff', value)}
              label="Cutoff"
            />
            <Knob
              value={resonance}
              min={0}
              max={30}
              onChange={(value) => handleParameterChange('resonance', value)}
              label="Resonance"
            />
            <Knob
              value={envMod}
              min={0}
              max={1}
              onChange={(value) => handleParameterChange('envMod', value)}
              label="Env Mod"
            />
            <Knob
              value={decay}
              min={0}
              max={1}
              onChange={(value) => handleParameterChange('decay', value)}
              label="Decay"
            />
            <Knob
              value={accent}
              min={0}
              max={1}
              onChange={(value) => handleParameterChange('accent', value)}
              label="Accent"
            />
            <Knob
              value={glide}
              min={0}
              max={1}
              onChange={(value) => handleParameterChange('glide', value)}
              label="Glide"
            />
          </div>
        </div>

        {/* Delay Controls */}
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-4">Delay</h4>
          <div className="grid grid-cols-3 gap-6">
            <Knob
              value={delayTime}
              min={0}
              max={1}
              onChange={(value) => handleParameterChange('delayTime', value)}
              label="Time"
            />
            <Knob
              value={delayFeedback}
              min={0}
              max={0.9}
              onChange={(value) => handleParameterChange('delayFeedback', value)}
              label="Feedback"
            />
            <Knob
              value={delayMix}
              min={0}
              max={1}
              onChange={(value) => handleParameterChange('delayMix', value)}
              label="Mix"
            />
          </div>
        </div>

        {/* Reverb Controls */}
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-4">Reverb</h4>
          <div className="grid grid-cols-1 gap-6">
            <Knob
              value={reverbMix}
              min={0}
              max={1}
              onChange={(value) => handleParameterChange('reverbMix', value)}
              label="Mix"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoicePanel;