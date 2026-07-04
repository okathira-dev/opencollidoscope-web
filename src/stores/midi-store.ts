import { create } from "zustand";

import { MidiManager } from "../domain/midi/index.ts";
import { getAudioStoreState } from "./audio-store.ts";
import { getConfigState, subscribeConfig } from "./config-store.ts";
import { getSynthStoreState } from "./synth-store.ts";
import { getWaveStoreState } from "./wave-store.ts";

interface MidiState {
  isSupported: boolean;
  isInitialized: boolean;
  error: string | null;
  inputDevices: { id: string; name: string; manufacturer: string }[];
  initializeMidi: () => Promise<void>;
  disposeMidi: () => void;
}

let midiManager: MidiManager | null = null;
let unsubscribeConfigForMidi: (() => void) | null = null;

function createMidiActions() {
  return {
    noteOn: (midiNote: number) => {
      getSynthStoreState().noteOn(midiNote);
    },
    noteOff: (midiNote: number) => {
      getSynthStoreState().noteOff(midiNote);
    },
    setSelectionStart: (start: number) => {
      const waveState = getWaveStoreState();
      if (waveState.selection.isNull) {
        return;
      }
      waveState.setSelection(start, waveState.selection.size);
      getSynthStoreState().syncSelection();
    },
    setSelectionSize: (size: number) => {
      const waveState = getWaveStoreState();
      if (waveState.selection.isNull) {
        return;
      }
      waveState.setSelection(waveState.selection.start, size);
      getSynthStoreState().syncSelection();
    },
    setGrainDurationCoeff: (coeff: number) => {
      getSynthStoreState().setGrainDurationCoeff(coeff);
    },
    setLoopEnabled: (enabled: boolean) => {
      getSynthStoreState().setLoopEnabled(enabled);
    },
    triggerRecord: () => {
      void getAudioStoreState().startRecording();
    },
    setFilterCutoff: (value: number) => {
      getSynthStoreState().setFilterCutoff(value);
    },
  };
}

const useMidiStoreInternal = create<MidiState>((set) => ({
  isSupported: MidiManager.isSupported(),
  isInitialized: false,
  error: null,
  inputDevices: [],
  initializeMidi: async () => {
    if (!MidiManager.isSupported()) {
      set({ error: "Web MIDI API はこのブラウザで利用できません" });
      return;
    }

    if (midiManager) {
      return;
    }

    try {
      const config = getConfigState().config;
      midiManager = new MidiManager(config);
      midiManager.setWaveChannel(0);
      midiManager.setActions(createMidiActions());
      midiManager.setOnDevicesChanged((devices) => {
        set({ inputDevices: devices });
      });

      unsubscribeConfigForMidi = subscribeConfig((nextConfig) => {
        midiManager?.setConfig(nextConfig);
      });

      const devices = await midiManager.initialize();
      set({ isInitialized: true, error: null, inputDevices: devices });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "MIDI の初期化に失敗しました",
        isInitialized: false,
      });
    }
  },
  disposeMidi: () => {
    unsubscribeConfigForMidi?.();
    unsubscribeConfigForMidi = null;
    midiManager?.dispose();
    midiManager = null;
    set({ isInitialized: false, inputDevices: [] });
  },
}));

export function useMidiSupported(): boolean {
  return useMidiStoreInternal((state) => state.isSupported);
}

export function useMidiInitialized(): boolean {
  return useMidiStoreInternal((state) => state.isInitialized);
}

export function useMidiError(): string | null {
  return useMidiStoreInternal((state) => state.error);
}

export function useMidiInputDevices() {
  return useMidiStoreInternal((state) => state.inputDevices);
}

export function useInitializeMidi() {
  return useMidiStoreInternal((state) => state.initializeMidi);
}

export function useDisposeMidi() {
  return useMidiStoreInternal((state) => state.disposeMidi);
}
