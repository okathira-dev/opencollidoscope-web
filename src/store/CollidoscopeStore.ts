/**
 * Collidoscope Store based on the original application architecture
 * Uses Zustand for state management with immutable patterns
 */

import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { NUM_WAVES, WAVE_LENGTH_SECONDS } from "../constants/config";
import { getAudioEngine } from "../engine/AudioEngine";
import {
  createEmptyWave,
  resetWave,
  setWaveChunk,
  updateWaveSelection,
  setCursorPosition,
  removeCursor,
  cleanupExpiredCursors,
} from "../models/Wave";
import { getMessageSystem } from "../systems/MessageSystem";
import { getVisualEffectsSystem } from "../systems/ParticleSystem";
import { Command } from "../types";

import type {
  CollidoscopeState,
  WaveData,
  WaveIndex,
  RecordWaveMessage,
  CursorTriggerMessage,
} from "../types";

interface CollidoscopeStore extends CollidoscopeState {
  // Actions
  initialize: () => Promise<void>;
  record: (waveIndex: WaveIndex) => Promise<void>;
  noteOn: (waveIndex: WaveIndex, midiNote: number) => void;
  noteOff: (waveIndex: WaveIndex) => void;
  setLoop: (waveIndex: WaveIndex, loop: boolean) => void;
  setSelectionStart: (waveIndex: WaveIndex, start: number) => void;
  setSelectionSize: (waveIndex: WaveIndex, size: number) => void;
  setGrainDurationCoeff: (waveIndex: WaveIndex, coeff: number) => void;
  setFilterCutoff: (waveIndex: WaveIndex, cutoff: number) => void;
  setActiveWave: (waveIndex: WaveIndex) => void;
  toggleFullScreen: () => void;

  // Keyboard controls (based on original)
  handleKeyDown: (key: string) => void;

  // Message handlers
  handleRecordWaveMessage: (message: RecordWaveMessage) => void;
  handleCursorTriggerMessage: (message: CursorTriggerMessage) => void;

  // Internal methods
  processMessages: () => void;
  updateWave: (
    waveIndex: WaveIndex,
    updater: (wave: WaveData) => WaveData,
  ) => void;
  cleanup: () => void;
}

export const useCollidoscopeStore = create<CollidoscopeStore>()(
  subscribeWithSelector(
    immer((set, get) => ({
      // Initial state
      waves: Array.from({ length: NUM_WAVES }, () => createEmptyWave()),
      audioEngine: {
        sampleRate: 48000,
        isRecording: false,
        audioBuffer: null,
      },
      granularParams: {
        selectionStart: 0,
        selectionSize: 30,
        grainDurationCoeff: 1.0,
        filterCutoff: 22050,
        loop: false,
      },
      isFullScreen: false,
      activeWaveIndex: 0,

      // Initialize the system
      initialize: async () => {
        try {
          const audioEngine = getAudioEngine();
          const messageSystem = getMessageSystem();
          const visualEffects = getVisualEffectsSystem();

          // Initialize audio engine
          await audioEngine.initialize();

          // Subscribe to messages
          messageSystem.subscribeToRecordWave((message: RecordWaveMessage) => {
            get().handleRecordWaveMessage(message);
          });

          messageSystem.subscribeToCursorTrigger(
            (message: CursorTriggerMessage) => {
              get().handleCursorTriggerMessage(message);
            },
          );

          // Start message processing
          messageSystem.start();
          visualEffects.start();

          // Update audio engine state
          set((state) => ({
            ...state,
            audioEngine: {
              ...state.audioEngine,
              sampleRate: audioEngine.getSampleRate(),
            },
          }));

          console.log("Collidoscope initialized successfully");
        } catch (error) {
          console.error("Failed to initialize Collidoscope:", error);
          throw error;
        }
      },

      // Record audio
      record: async (waveIndex: WaveIndex) => {
        if (waveIndex >= NUM_WAVES) return;

        try {
          const audioEngine = getAudioEngine();

          set((state) => {
            state.audioEngine.isRecording = true;
            const currentWave = state.waves[waveIndex];
            if (currentWave) {
              state.waves[waveIndex] = resetWave(currentWave as WaveData, true);
            }
          });

          await audioEngine.record(waveIndex);

          // Recording will stop automatically after WAVE_LENGTH_SECONDS
          setTimeout(() => {
            set((state) => {
              state.audioEngine.isRecording = false;
            });
          }, WAVE_LENGTH_SECONDS * 1000);
        } catch (error) {
          console.error("Failed to record:", error);
          set((state) => {
            state.audioEngine.isRecording = false;
          });
        }
      },

      // Note on
      noteOn: (waveIndex: WaveIndex, midiNote: number) => {
        if (waveIndex >= NUM_WAVES) return;

        const audioEngine = getAudioEngine();
        const state = get();
        const wave = state.waves[waveIndex];

        if (!wave || wave.selection.isNull) return;

        // Update audio engine parameters
        audioEngine.setSelectionStart(waveIndex, wave.selection.start);
        audioEngine.setSelectionSize(waveIndex, wave.selection.size);
        audioEngine.setGrainDurationCoeff(
          waveIndex,
          wave.selection.particleSpread,
        );
        audioEngine.setFilterCutoff(
          waveIndex,
          state.granularParams.filterCutoff,
        );

        // Play note
        audioEngine.noteOn(waveIndex, midiNote);
      },

      // Note off
      noteOff: (waveIndex: WaveIndex) => {
        if (waveIndex >= NUM_WAVES) return;

        const audioEngine = getAudioEngine();
        audioEngine.noteOff(waveIndex);
      },

      // Set loop
      setLoop: (waveIndex: WaveIndex, loop: boolean) => {
        if (waveIndex >= NUM_WAVES) return;

        const audioEngine = getAudioEngine();

        if (loop) {
          audioEngine.loopOn(waveIndex);
        } else {
          audioEngine.loopOff(waveIndex);
        }

        set((state) => {
          state.granularParams.loop = loop;
        });
      },

      // Set selection start
      setSelectionStart: (waveIndex: WaveIndex, start: number) => {
        if (waveIndex >= NUM_WAVES) return;

        set((state) => {
          const currentWave = state.waves[waveIndex];
          if (currentWave) {
            state.waves[waveIndex] = updateWaveSelection(
              currentWave as WaveData,
              {
                start,
              },
            );
            state.granularParams.selectionStart = start;
          }
        });
      },

      // Set selection size
      setSelectionSize: (waveIndex: WaveIndex, size: number) => {
        if (waveIndex >= NUM_WAVES) return;

        set((state) => {
          const currentWave = state.waves[waveIndex];
          if (currentWave) {
            state.waves[waveIndex] = updateWaveSelection(
              currentWave as WaveData,
              {
                size,
              },
            );
            state.granularParams.selectionSize = size;
          }
        });
      },

      // Set grain duration coefficient
      setGrainDurationCoeff: (waveIndex: WaveIndex, coeff: number) => {
        if (waveIndex >= NUM_WAVES) return;

        set((state) => {
          const currentWave = state.waves[waveIndex];
          if (currentWave) {
            state.waves[waveIndex] = updateWaveSelection(
              currentWave as WaveData,
              {
                particleSpread: coeff,
              },
            );
            state.granularParams.grainDurationCoeff = coeff;
          }
        });
      },

      // Set filter cutoff
      setFilterCutoff: (waveIndex: WaveIndex, cutoff: number) => {
        if (waveIndex >= NUM_WAVES) return;

        set((state) => {
          state.granularParams.filterCutoff = cutoff;
        });
      },

      // Set active wave
      setActiveWave: (waveIndex: WaveIndex) => {
        if (waveIndex >= NUM_WAVES) return;

        set((state) => {
          state.activeWaveIndex = waveIndex;
        });
      },

      // Toggle fullscreen
      toggleFullScreen: () => {
        set((state) => {
          state.isFullScreen = !state.isFullScreen;
        });

        // Handle actual fullscreen API
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen?.();
        } else {
          document.exitFullscreen?.();
        }
      },

      // Handle keyboard controls (based on original CollidoscopeApp.cpp)
      handleKeyDown: (key: string) => {
        const state = get();
        const waveIndex = state.activeWaveIndex;
        const wave = state.waves[waveIndex];

        if (!wave) return;

        switch (key.toLowerCase()) {
          case "r":
            get().record(waveIndex);
            break;

          case "w":
            if (!wave.selection.isNull) {
              get().setSelectionSize(waveIndex, wave.selection.size + 1);
            }
            break;

          case "s":
            if (!wave.selection.isNull && wave.selection.size > 1) {
              get().setSelectionSize(waveIndex, wave.selection.size - 1);
            }
            break;

          case "d":
            if (!wave.selection.isNull) {
              get().setSelectionStart(waveIndex, wave.selection.start + 1);
            }
            break;

          case "a":
            if (!wave.selection.isNull && wave.selection.start > 0) {
              get().setSelectionStart(waveIndex, wave.selection.start - 1);
            }
            break;

          case "f":
            get().toggleFullScreen();
            break;

          case " ":
            get().setLoop(waveIndex, !state.granularParams.loop);
            break;

          case "9":
            if (!wave.selection.isNull && wave.selection.particleSpread > 1) {
              get().setGrainDurationCoeff(
                waveIndex,
                wave.selection.particleSpread - 1,
              );
            }
            break;

          case "0":
            if (!wave.selection.isNull && wave.selection.particleSpread < 8) {
              get().setGrainDurationCoeff(
                waveIndex,
                wave.selection.particleSpread + 1,
              );
            }
            break;

          default:
            // Handle piano keys (a-z mapping to MIDI notes)
            if (key.length === 1 && key.match(/[a-z]/)) {
              const midiNote = 60 + key.charCodeAt(0) - 97; // Map a-z to MIDI notes starting from C4
              get().noteOn(waveIndex, midiNote);
            }
            break;
        }
      },

      // Process messages from audio engine
      processMessages: () => {
        // This will be called by the message system
        // Cleanup expired cursors
        set((state) => {
          state.waves.forEach((wave: WaveData, index: number) => {
            if (wave) {
              state.waves[index] = cleanupExpiredCursors(wave);
            }
          });
        });
      },

      // Handle record wave messages
      handleRecordWaveMessage: (message: RecordWaveMessage) => {
        const { cmd, index, arg1, arg2 } = message;

        switch (cmd) {
          case Command.WAVE_CHUNK:
            set((state) => {
              if (index >= 0 && index < NUM_WAVES) {
                const currentWave = state.waves[index];
                if (currentWave) {
                  state.waves[index] = setWaveChunk(
                    currentWave as WaveData,
                    index,
                    arg1,
                    arg2,
                  );
                }
              }
            });
            break;

          case Command.WAVE_START:
            set((state) => {
              if (index >= 0 && index < NUM_WAVES) {
                const currentWave = state.waves[index];
                if (currentWave) {
                  state.waves[index] = resetWave(currentWave as WaveData, true);
                }
              }
            });
            break;

          default:
            break;
        }
      },

      // Handle cursor trigger messages
      handleCursorTriggerMessage: (message: CursorTriggerMessage) => {
        const { cmd, synthID } = message;
        const waveIndex = get().activeWaveIndex;

        switch (cmd) {
          case Command.TRIGGER_UPDATE:
            // Add cursor at current position
            set((state) => {
              const currentWave = state.waves[waveIndex];
              if (currentWave) {
                const position =
                  Math.floor(Math.random() * currentWave.selection.size) +
                  currentWave.selection.start;
                state.waves[waveIndex] = setCursorPosition(
                  currentWave as WaveData,
                  synthID,
                  position,
                );
              }
            });
            break;

          case Command.TRIGGER_END:
            // Remove cursor
            set((state) => {
              const currentWave = state.waves[waveIndex];
              if (currentWave) {
                state.waves[waveIndex] = removeCursor(
                  currentWave as WaveData,
                  synthID,
                );
              }
            });
            break;

          default:
            break;
        }
      },

      // Update wave helper
      updateWave: (
        waveIndex: WaveIndex,
        updater: (wave: WaveData) => WaveData,
      ) => {
        if (waveIndex >= NUM_WAVES) return;

        set((state) => {
          const currentWave = state.waves[waveIndex];
          if (currentWave) {
            state.waves[waveIndex] = updater(currentWave as WaveData);
          }
        });
      },

      // Cleanup
      cleanup: () => {
        const audioEngine = getAudioEngine();
        const messageSystem = getMessageSystem();
        const visualEffects = getVisualEffectsSystem();

        audioEngine.disconnect();
        messageSystem.clear();
        visualEffects.stop();
      },
    })),
  ),
);

// Add these methods to the store interface
declare module "zustand" {
  interface StoreApi<T> {
    handleRecordWaveMessage: (message: RecordWaveMessage) => void;
    handleCursorTriggerMessage: (message: CursorTriggerMessage) => void;
  }
}

// Selector hooks for performance
export const useWaves = () => useCollidoscopeStore((state) => state.waves);
export const useActiveWave = () =>
  useCollidoscopeStore((state) => state.waves[state.activeWaveIndex]);
export const useActiveWaveIndex = () =>
  useCollidoscopeStore((state) => state.activeWaveIndex);
export const useAudioEngineState = () =>
  useCollidoscopeStore((state) => state.audioEngine);
export const useGranularParams = () =>
  useCollidoscopeStore((state) => state.granularParams);
export const useIsFullScreen = () =>
  useCollidoscopeStore((state) => state.isFullScreen);
export const useIsInitialized = () =>
  useCollidoscopeStore((state) => state.audioEngine.sampleRate > 0);

// Action hooks
export const useCollidoscopeActions = () => {
  const store = useCollidoscopeStore();
  return {
    initialize: store.initialize,
    record: store.record,
    noteOn: store.noteOn,
    noteOff: store.noteOff,
    setLoop: store.setLoop,
    setSelectionStart: store.setSelectionStart,
    setSelectionSize: store.setSelectionSize,
    setGrainDurationCoeff: store.setGrainDurationCoeff,
    setFilterCutoff: store.setFilterCutoff,
    setActiveWave: store.setActiveWave,
    toggleFullScreen: store.toggleFullScreen,
    handleKeyDown: store.handleKeyDown,
    cleanup: store.cleanup,
  };
};
