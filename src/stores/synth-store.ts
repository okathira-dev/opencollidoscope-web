import { create } from "zustand";

import { midiNoteToRate } from "../domain/audio/index.ts";
import type { CollidoscopeConfig } from "../domain/config/index.ts";
import { GranularSynthesizer } from "../features/synth-engine/granular-synthesizer.ts";
import {
  clampKeyboardOctaveOffset,
  MAX_KEYBOARD_OCTAVE_OFFSET,
  MIN_KEYBOARD_OCTAVE_OFFSET,
} from "../features/synth-engine/keyboard-layout.ts";
import { getAudioStoreState } from "./audio-store.ts";
import { getConfigState, subscribeConfig } from "./config-store.ts";
import { getWaveStoreState, subscribeWaveSelection } from "./wave-store.ts";

interface SynthState {
  isInitialized: boolean;
  grainDurationCoeff: number;
  filterCutoff: number;
  loop: { enabled: boolean };
  activeNotes: number[];
  keyboardOctaveOffset: number;

  initializeSynth: () => Promise<void>;
  noteOn: (midiNote: number) => void;
  noteOff: (midiNote: number) => void;
  setLoopEnabled: (enabled: boolean) => void;
  setGrainDurationCoeff: (coeff: number) => void;
  setFilterCutoff: (value: number) => void;
  shiftKeyboardOctave: (delta: number) => void;
  syncBuffer: (buffer: Float32Array) => void;
  syncSelection: () => void;
  syncConfig: () => void;
}

let synthesizer: GranularSynthesizer | null = null;
let unsubscribeWaveSelection: (() => void) | null = null;
let unsubscribeConfig: (() => void) | null = null;

function configAffectsAudioEngine(config: CollidoscopeConfig, prev: CollidoscopeConfig): boolean {
  return (
    config.audio !== prev.audio ||
    config.granular !== prev.granular ||
    config.envelope !== prev.envelope ||
    config.filter !== prev.filter
  );
}

function configAffectsSelectionBounds(
  config: CollidoscopeConfig,
  prev: CollidoscopeConfig,
): boolean {
  return (
    config.audio.chunkCount !== prev.audio.chunkCount ||
    config.audio.maxSelectionSize !== prev.audio.maxSelectionSize
  );
}

function addActiveNote(notes: number[], midiNote: number): number[] {
  if (notes.includes(midiNote)) {
    return notes;
  }
  return [...notes, midiNote];
}

function removeActiveNote(notes: number[], midiNote: number): number[] {
  return notes.filter((note) => note !== midiNote);
}

const useSynthStoreInternal = create<SynthState>((set, get) => ({
  isInitialized: false,
  grainDurationCoeff: 1.0,
  filterCutoff: 127,
  loop: { enabled: false },
  activeNotes: [],
  keyboardOctaveOffset: 0,

  initializeSynth: async () => {
    const audioContext = getAudioStoreState().audioContext;
    if (!audioContext || synthesizer) {
      return;
    }

    synthesizer = new GranularSynthesizer(audioContext);
    await synthesizer.initialize();
    get().syncConfig();

    synthesizer.setMessageHandler((message) => {
      const audioState = getAudioStoreState();
      const waveStore = getWaveStoreState();

      if (!audioState.recordedBuffer) {
        return;
      }

      if (message.type === "cursorTrigger") {
        if (waveStore.selection.isNull) {
          return;
        }
        // オリジナル準拠: グレイン開始サンプルではなく常に selection.start からスイープ。
        // 進行速度は waveLength/chunkCount 固定のため、再生レート 1.0 (C4) のときのみ
        // バッファ上の読み取り速度と視覚が一致する。
        waveStore.setCursor(message.voiceId, waveStore.selection.start, performance.now());
        waveStore.triggerParticleSpawn();
      } else if (message.type === "cursorEnd") {
        waveStore.removeCursor(message.voiceId);
      }
    });

    const recordedBuffer = getAudioStoreState().recordedBuffer;
    if (recordedBuffer) {
      get().syncBuffer(recordedBuffer);
    }
    get().syncSelection();

    unsubscribeWaveSelection = subscribeWaveSelection(() => {
      getSynthStoreState().syncSelection();
    });
    unsubscribeConfig = subscribeConfig((config, prev) => {
      if (configAffectsSelectionBounds(config, prev)) {
        getWaveStoreState().clampSelectionToConfig();
      }
      if (configAffectsAudioEngine(config, prev)) {
        getSynthStoreState().syncConfig();
      }
    });

    set({ isInitialized: true });
  },

  noteOn: (midiNote) => {
    synthesizer?.noteOn(midiNote);
    set((state) => ({ activeNotes: addActiveNote(state.activeNotes, midiNote) }));
  },

  noteOff: (midiNote) => {
    synthesizer?.noteOff(midiNote);
    set((state) => ({ activeNotes: removeActiveNote(state.activeNotes, midiNote) }));
  },

  setLoopEnabled: (enabled) => {
    synthesizer?.setLooping(enabled);
    set({ loop: { enabled } });
  },

  setGrainDurationCoeff: (coeff) => {
    const config = getConfigState().config;
    const clamped = Math.min(
      Math.max(coeff, config.granular.grainDurationRange.min),
      config.granular.grainDurationRange.max,
    );
    synthesizer?.setGrainDurationCoeff(clamped);
    set({ grainDurationCoeff: clamped });
  },

  setFilterCutoff: (value) => {
    const clamped = Math.max(0, Math.min(127, Math.round(value)));
    synthesizer?.setFilterCutoff(clamped);
    set({ filterCutoff: clamped });
  },

  shiftKeyboardOctave: (delta) => {
    const state = get();
    const nextOffset = clampKeyboardOctaveOffset(state.keyboardOctaveOffset + delta);
    if (nextOffset === state.keyboardOctaveOffset) {
      return;
    }

    for (const midiNote of state.activeNotes) {
      synthesizer?.noteOff(midiNote);
    }
    set({ keyboardOctaveOffset: nextOffset, activeNotes: [] });
  },

  syncBuffer: (buffer) => {
    synthesizer?.setAudioBuffer(buffer);
  },

  syncSelection: () => {
    const waveState = getWaveStoreState();
    const audioState = getAudioStoreState();

    if (waveState.selection.isNull || !audioState.recordedBuffer) {
      return;
    }

    const totalSamples = audioState.recordedBuffer.length;
    const samplesPerChunk = Math.round(totalSamples / waveState.chunkCount);
    const startSample = waveState.selection.start * samplesPerChunk;
    const sizeSamples = waveState.selection.size * samplesPerChunk;

    synthesizer?.setSelection(startSample, sizeSamples);
  },

  syncConfig: () => {
    synthesizer?.updateConfig(getConfigState().config);
    synthesizer?.setGrainDurationCoeff(get().grainDurationCoeff);
    synthesizer?.setFilterCutoff(get().filterCutoff);
    if (get().loop.enabled) {
      synthesizer?.setLooping(true);
    }
    get().syncSelection();
  },
}));

export function useIsSynthInitialized(): boolean {
  return useSynthStoreInternal((state) => state.isInitialized);
}

export function useGrainDurationCoeff(): number {
  return useSynthStoreInternal((state) => state.grainDurationCoeff);
}

export function useLoopEnabled(): boolean {
  return useSynthStoreInternal((state) => state.loop.enabled);
}

export function useFilterCutoff(): number {
  return useSynthStoreInternal((state) => state.filterCutoff);
}

export function useActiveNotes(): number[] {
  return useSynthStoreInternal((state) => state.activeNotes);
}

export function useInitializeSynth() {
  return useSynthStoreInternal((state) => state.initializeSynth);
}

export function useNoteOn() {
  return useSynthStoreInternal((state) => state.noteOn);
}

export function useNoteOff() {
  return useSynthStoreInternal((state) => state.noteOff);
}

export function useSetLoopEnabled() {
  return useSynthStoreInternal((state) => state.setLoopEnabled);
}

export function useSetGrainDurationCoeff() {
  return useSynthStoreInternal((state) => state.setGrainDurationCoeff);
}

export function useSetFilterCutoff() {
  return useSynthStoreInternal((state) => state.setFilterCutoff);
}

export function useKeyboardOctaveOffset(): number {
  return useSynthStoreInternal((state) => state.keyboardOctaveOffset);
}

export function useShiftKeyboardOctave() {
  return useSynthStoreInternal((state) => state.shiftKeyboardOctave);
}

export function useCanShiftKeyboardOctaveUp(): boolean {
  return useSynthStoreInternal((state) => state.keyboardOctaveOffset < MAX_KEYBOARD_OCTAVE_OFFSET);
}

export function useCanShiftKeyboardOctaveDown(): boolean {
  return useSynthStoreInternal((state) => state.keyboardOctaveOffset > MIN_KEYBOARD_OCTAVE_OFFSET);
}

export function useSyncSynthBuffer() {
  return useSynthStoreInternal((state) => state.syncBuffer);
}

export function useSyncSynthSelection() {
  return useSynthStoreInternal((state) => state.syncSelection);
}

export function useSyncSynthConfig() {
  return useSynthStoreInternal((state) => state.syncConfig);
}

export function useAnalyserNode(): AnalyserNode | null {
  const isInitialized = useIsSynthInitialized();
  return isInitialized ? (synthesizer?.getAnalyserNode() ?? null) : null;
}

export function getSynthStoreState(): SynthState {
  return useSynthStoreInternal.getState();
}

export function midiNoteToPlaybackRate(midiNote: number): number {
  return midiNoteToRate(midiNote);
}

export function disposeSynth(): void {
  unsubscribeWaveSelection?.();
  unsubscribeConfig?.();
  unsubscribeWaveSelection = null;
  unsubscribeConfig = null;
  synthesizer?.dispose();
  synthesizer = null;
  useSynthStoreInternal.setState({
    isInitialized: false,
    activeNotes: [],
    loop: { enabled: false },
    filterCutoff: 127,
    keyboardOctaveOffset: 0,
  });
}
