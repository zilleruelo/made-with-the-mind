import React, { useState } from 'react';
import { Play, Square, Settings, ChevronUp, ChevronDown } from 'lucide-react';
import type { Step, Pattern } from '../lib/sequencer';
import { getNoteNameFromMidi } from '../lib/notes';
import NoteSelector from './NoteSelector';
import Knob from './Knob';

interface SequencerProps {
  patterns: Pattern[];
  currentStep: number;
  isPlaying: boolean;
  tempo: number;
  onPatternChange: (voiceIndex: number, pattern: Pattern) => void;
  onTempoChange: (tempo: number) => void;
  onPlayPause: () => void;
}

const Sequencer: React.FC<SequencerProps> = ({
  patterns,
  currentStep,
  isPlaying,
  tempo,
  onPatternChange,
  onTempoChange,
  onPlayPause,
}) => {
  const [activeNoteSelector, setActiveNoteSelector] = useState<{ voice: number; step: number } | null>(null);
  const [octaveOffsets, setOctaveOffsets] = useState<number[]>([0, 0, 0]);

  const toggleStep = (voiceIndex: number, stepIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const pattern = patterns[voiceIndex];
    const newPattern = {
      ...pattern,
      steps: pattern.steps.map((step, i) => 
        i === stepIndex 
          ? { ...step, active: !step.active }
          : step
      )
    };
    onPatternChange(voiceIndex, newPattern);
  };

  const toggleAccent = (voiceIndex: number, stepIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const pattern = patterns[voiceIndex];
    const newPattern = {
      ...pattern,
      steps: pattern.steps.map((step, i) => 
        i === stepIndex 
          ? { ...step, accent: !step.accent }
          : step
      )
    };
    onPatternChange(voiceIndex, newPattern);
  };

  const toggleSlide = (voiceIndex: number, stepIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const pattern = patterns[voiceIndex];
    const newPattern = {
      ...pattern,
      steps: pattern.steps.map((step, i) => 
        i === stepIndex 
          ? { ...step, slide: !step.slide }
          : step
      )
    };
    onPatternChange(voiceIndex, newPattern);
  };

  const handleNoteChange = (voiceIndex: number, stepIndex: number, note: number) => {
    const pattern = patterns[voiceIndex];
    const newPattern = {
      ...pattern,
      steps: pattern.steps.map((step, i) => 
        i === stepIndex 
          ? { ...step, note }
          : step
      )
    };
    onPatternChange(voiceIndex, newPattern);
    setActiveNoteSelector(null);
  };

  const handleStepClick = (e: React.MouseEvent, voiceIndex: number, stepIndex: number, step: Step) => {
    if (e.button === 2 || e.ctrlKey || e.metaKey) {
      e.preventDefault();
      e.stopPropagation();
      if (step.active) {
        setActiveNoteSelector({ voice: voiceIndex, step: stepIndex });
      }
    } else {
      toggleStep(voiceIndex, stepIndex, e);
    }
  };

  const handleOctaveChange = (voiceIndex: number, delta: number) => {
    const newOffset = Math.max(-4, Math.min(4, octaveOffsets[voiceIndex] + delta));
    const newOffsets = [...octaveOffsets];
    newOffsets[voiceIndex] = newOffset;
    setOctaveOffsets(newOffsets);

    // Transpose all notes in the pattern
    const pattern = patterns[voiceIndex];
    const newPattern = {
      ...pattern,
      steps: pattern.steps.map(step => ({
        ...step,
        note: step.note + ((newOffset - octaveOffsets[voiceIndex]) * 12)
      }))
    };
    onPatternChange(voiceIndex, newPattern);
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg" onClick={() => setActiveNoteSelector(null)}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-6">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlayPause();
            }}
            className="p-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isPlaying ? <Square size={20} /> : <Play size={20} />}
          </button>
          <div className="flex items-center gap-4">
            <Knob
              value={tempo}
              min={10}
              max={300}
              onChange={onTempoChange}
              label="BPM"
            />
          </div>
        </div>
        <button className="p-2 rounded-full hover:bg-gray-700 text-white">
          <Settings size={20} />
        </button>
      </div>

      {patterns.map((pattern, voiceIndex) => (
        <div key={voiceIndex} className="mb-8 last:mb-0">
          <div className="flex items-center gap-4 mb-2">
            <span className="text-white text-sm">Voice {voiceIndex + 1}</span>
            <div className="flex items-center gap-2 bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => handleOctaveChange(voiceIndex, -1)}
                className="p-1 hover:bg-gray-600 rounded text-gray-300 disabled:opacity-50"
                disabled={octaveOffsets[voiceIndex] <= -4}
              >
                <ChevronDown size={16} />
              </button>
              <span className="text-white text-sm w-8 text-center">
                {octaveOffsets[voiceIndex] > 0 ? '+' : ''}{octaveOffsets[voiceIndex]}
              </span>
              <button
                onClick={() => handleOctaveChange(voiceIndex, 1)}
                className="p-1 hover:bg-gray-600 rounded text-gray-300 disabled:opacity-50"
                disabled={octaveOffsets[voiceIndex] >= 4}
              >
                <ChevronUp size={16} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-16 gap-1">
            {pattern.steps.map((step, stepIndex) => (
              <div
                key={stepIndex}
                className={`relative ${
                  currentStep === stepIndex ? 'border-2 border-indigo-500' : ''
                }`}
              >
                <button
                  onClick={(e) => handleStepClick(e, voiceIndex, stepIndex, step)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    if (step.active) {
                      setActiveNoteSelector({ voice: voiceIndex, step: stepIndex });
                    }
                  }}
                  className={`w-full aspect-square rounded ${
                    step.active
                      ? 'bg-indigo-600 hover:bg-indigo-700'
                      : 'bg-gray-700 hover:bg-gray-600'
                  } relative`}
                >
                  {step.active && (
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white/80 pointer-events-none">
                      {getNoteNameFromMidi(step.note)}
                    </span>
                  )}
                </button>

                {step.active && (
                  <div className="absolute -bottom-6 left-0 right-0 flex justify-center gap-1">
                    <button
                      onClick={(e) => toggleAccent(voiceIndex, stepIndex, e)}
                      className={`w-2 h-2 rounded-full ${
                        step.accent ? 'bg-yellow-500' : 'bg-gray-600'
                      }`}
                    />
                    <button
                      onClick={(e) => toggleSlide(voiceIndex, stepIndex, e)}
                      className={`w-2 h-2 rounded-full ${
                        step.slide ? 'bg-blue-500' : 'bg-gray-600'
                      }`}
                    />
                  </div>
                )}

                {activeNoteSelector?.voice === voiceIndex && 
                 activeNoteSelector?.step === stepIndex && (
                  <NoteSelector
                    value={step.note}
                    onChange={(note) => handleNoteChange(voiceIndex, stepIndex, note)}
                    onClose={() => setActiveNoteSelector(null)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Sequencer;