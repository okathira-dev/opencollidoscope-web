/** 鍵盤左端（C3）。2 オクターブ + 次の C で C4（MIDI 60）が白鍵中央に来る */
export const KEYBOARD_BASE_MIDI = 48;
export const KEYBOARD_TOP_MIDI = 72;
/** 録音そのままの再生レート（rate 1.0）に対応する MIDI ノート */
export const KEYBOARD_CENTER_MIDI = 60;
/** レイアウト上で C4 が位置する relativeSemitone（白鍵 15 の中央） */
export const KEYBOARD_CENTER_RELATIVE_SEMITONE = 12;
export const OCTAVE_SHIFT_SEMITONES = 12;
export const MIN_KEYBOARD_OCTAVE_OFFSET = -2;
export const MAX_KEYBOARD_OCTAVE_OFFSET = 2;

const WHITE_SEMITONES_PER_OCTAVE = [0, 2, 4, 5, 7, 9, 11] as const;
/**
 * 黒鍵中心を隣接白鍵の境界（whiteIndex + 1）に合わせる。
 * whiteOffset は白鍵インデックス基準（半音均等ではない）。
 * E-F・B-C には黒鍵がないため 3.0 / 7.0 は使わず、F# は 4.0、次オクターブ C# は 8.0 (=7+1) になる。
 */
const BLACK_PATTERN = [
  { semitone: 1, whiteOffset: 1.0 },
  { semitone: 3, whiteOffset: 2.0 },
  { semitone: 6, whiteOffset: 4.0 },
  { semitone: 8, whiteOffset: 5.0 },
  { semitone: 10, whiteOffset: 6.0 },
] as const;

export interface WhiteKeyDef {
  relativeSemitone: number;
  label: string;
  pcKey?: string;
}

export interface BlackKeyDef {
  relativeSemitone: number;
  label: string;
  whiteOffset: number;
  pcKey?: string;
}

function noteLabel(relativeSemitone: number): string {
  const names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  return names[relativeSemitone % 12] ?? "C";
}

export function keyboardTopMidi(octaveCount: number): number {
  return KEYBOARD_BASE_MIDI + octaveCount * OCTAVE_SHIFT_SEMITONES;
}

export function buildKeyboardLayout(octaveCount = 2): {
  whiteKeys: WhiteKeyDef[];
  blackKeys: BlackKeyDef[];
} {
  const whiteKeys: WhiteKeyDef[] = [];
  const blackKeys: BlackKeyDef[] = [];

  for (let octave = 0; octave < octaveCount; octave++) {
    for (const semitone of WHITE_SEMITONES_PER_OCTAVE) {
      whiteKeys.push({
        relativeSemitone: octave * 12 + semitone,
        label: noteLabel(semitone),
      });
    }
    for (const pattern of BLACK_PATTERN) {
      blackKeys.push({
        relativeSemitone: octave * 12 + pattern.semitone,
        label: noteLabel(pattern.semitone),
        whiteOffset: octave * 7 + pattern.whiteOffset,
      });
    }
  }

  whiteKeys.push({
    relativeSemitone: octaveCount * 12,
    label: "C",
  });

  const pcWhiteKeys = ["a", "s", "d", "f", "g", "h", "j", "k"] as const;
  for (let i = 0; i < pcWhiteKeys.length && i < whiteKeys.length; i++) {
    const key = whiteKeys[i];
    if (key) {
      key.pcKey = pcWhiteKeys[i];
    }
  }

  const pcBlackKeys = ["w", "e", "t", "y", "u"] as const;
  for (let i = 0; i < pcBlackKeys.length && i < blackKeys.length; i++) {
    const key = blackKeys[i];
    if (key) {
      key.pcKey = pcBlackKeys[i];
    }
  }

  return { whiteKeys, blackKeys };
}

export function relativeToMidiNote(relativeSemitone: number, octaveOffset: number): number {
  return KEYBOARD_BASE_MIDI + relativeSemitone + octaveOffset * OCTAVE_SHIFT_SEMITONES;
}

export function clampKeyboardOctaveOffset(offset: number): number {
  return Math.min(Math.max(offset, MIN_KEYBOARD_OCTAVE_OFFSET), MAX_KEYBOARD_OCTAVE_OFFSET);
}
