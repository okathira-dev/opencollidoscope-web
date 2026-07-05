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

function buildOctaveKeys(octave: number): { whiteKeys: WhiteKeyDef[]; blackKeys: BlackKeyDef[] } {
  const whiteKeys: WhiteKeyDef[] = WHITE_SEMITONES_PER_OCTAVE.map((semitone) => ({
    relativeSemitone: octave * OCTAVE_SHIFT_SEMITONES + semitone,
    label: noteLabel(semitone),
  }));

  const blackKeys: BlackKeyDef[] = BLACK_PATTERN.map((pattern) => ({
    relativeSemitone: octave * OCTAVE_SHIFT_SEMITONES + pattern.semitone,
    label: noteLabel(pattern.semitone),
    whiteOffset: octave * 7 + pattern.whiteOffset,
  }));

  return { whiteKeys, blackKeys };
}

export function buildKeyboardLayout(octaveCount = 2): {
  whiteKeys: WhiteKeyDef[];
  blackKeys: BlackKeyDef[];
} {
  const octaveKeys = Array.from({ length: octaveCount }, (_, octave) => buildOctaveKeys(octave));
  const whiteKeys = octaveKeys.flatMap((keys) => keys.whiteKeys);
  const blackKeys = octaveKeys.flatMap((keys) => keys.blackKeys);

  whiteKeys.push({
    relativeSemitone: octaveCount * OCTAVE_SHIFT_SEMITONES,
    label: "C",
  });

  assignPcKeys(whiteKeys, blackKeys);

  return { whiteKeys, blackKeys };
}

/**
 * Z 行 = 白鍵、A 行 = 黒鍵。C キー = C4（relativeSemitone 12）。
 * A キー = G#3（Z=A3 の左隣の黒鍵）。
 */
const PC_KEY_TO_RELATIVE_SEMITONE: Readonly<Record<string, number>> = {
  z: 9, // A3
  x: 11, // B3
  c: 12, // C4
  v: 14, // D4
  b: 16, // E4
  n: 17, // F4
  m: 19, // G4
  ",": 21, // A4
  ".": 23, // B4
  "/": 24, // C5
  a: 8, // G#3
  s: 10, // A#3
  f: 13, // C#4
  g: 15, // D#4
  j: 18, // F#4
  k: 20, // G#4
  l: 22, // A#4
};

function assignPcKeys(whiteKeys: WhiteKeyDef[], blackKeys: BlackKeyDef[]): void {
  const relativeToPcKey = new Map<number, string>();
  for (const [pcKey, relativeSemitone] of Object.entries(PC_KEY_TO_RELATIVE_SEMITONE)) {
    relativeToPcKey.set(relativeSemitone, pcKey);
  }

  for (const key of whiteKeys) {
    const pcKey = relativeToPcKey.get(key.relativeSemitone);
    if (pcKey) {
      key.pcKey = pcKey;
    }
  }

  for (const key of blackKeys) {
    const pcKey = relativeToPcKey.get(key.relativeSemitone);
    if (pcKey) {
      key.pcKey = pcKey;
    }
  }
}

export function pcKeyToRelativeSemitone(pcKey: string): number | undefined {
  return PC_KEY_TO_RELATIVE_SEMITONE[pcKey.toLowerCase()];
}

export function relativeToMidiNote(relativeSemitone: number, octaveOffset: number): number {
  return KEYBOARD_BASE_MIDI + relativeSemitone + octaveOffset * OCTAVE_SHIFT_SEMITONES;
}

export function clampKeyboardOctaveOffset(offset: number): number {
  return Math.min(Math.max(offset, MIN_KEYBOARD_OCTAVE_OFFSET), MAX_KEYBOARD_OCTAVE_OFFSET);
}
