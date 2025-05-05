import React from 'react';
import { NOTES } from '../lib/notes';

interface NoteSelectorProps {
  value: number;
  onChange: (note: number) => void;
  onClose: () => void;
}

const NoteSelector: React.FC<NoteSelectorProps> = ({ value, onChange, onClose }) => {
  const currentOctave = Math.floor(value / 12) - 2;

  return (
    <div 
      className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-gray-800 rounded-lg shadow-xl border border-gray-700"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="grid grid-cols-12 gap-1 mb-2">
        {NOTES.map((note, i) => (
          <button
            key={i}
            className={`w-6 h-12 text-xs font-medium rounded ${
              note.name.includes('#') 
                ? 'bg-gray-900 text-white hover:bg-gray-700'
                : 'bg-white text-gray-900 hover:bg-gray-200'
            }`}
            onClick={() => onChange(note.octaves[2])} // Default to middle octave
          >
            {note.name}
          </button>
        ))}
      </div>
      <div className="flex justify-center gap-2">
        {[-2, -1, 0, 1, 2].map((octaveOffset) => (
          <button
            key={octaveOffset}
            className={`px-2 py-1 rounded text-xs ${
              currentOctave === octaveOffset + 4
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            onClick={() => {
              const noteInOctave = value % 12;
              const newNote = noteInOctave + ((octaveOffset + 4) * 12);
              onChange(newNote);
            }}
          >
            {octaveOffset + 4}
          </button>
        ))}
      </div>
    </div>
  );
};

export default NoteSelector;