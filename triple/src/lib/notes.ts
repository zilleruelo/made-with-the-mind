// Note definitions with MIDI numbers
export const NOTES = [
  { name: 'C', octaves: [36, 48, 60, 72, 84] },
  { name: 'C#', octaves: [37, 49, 61, 73, 85] },
  { name: 'D', octaves: [38, 50, 62, 74, 86] },
  { name: 'D#', octaves: [39, 51, 63, 75, 87] },
  { name: 'E', octaves: [40, 52, 64, 76, 88] },
  { name: 'F', octaves: [41, 53, 65, 77, 89] },
  { name: 'F#', octaves: [42, 54, 66, 78, 90] },
  { name: 'G', octaves: [43, 55, 67, 79, 91] },
  { name: 'G#', octaves: [44, 56, 68, 80, 92] },
  { name: 'A', octaves: [45, 57, 69, 81, 93] },
  { name: 'A#', octaves: [46, 58, 70, 82, 94] },
  { name: 'B', octaves: [47, 59, 71, 83, 95] },
];

export function getNoteNameFromMidi(midiNote: number): string {
  for (const note of NOTES) {
    if (note.octaves.includes(midiNote)) {
      const octave = Math.floor(midiNote / 12) - 2;
      return `${note.name}${octave}`;
    }
  }
  return 'Unknown';
}