/**
 * App.tsx - OpenCollidoscope React Application
 * Web implementation of the OpenCollidoscope granular synthesizer
 * Based on the original by Ben Bengler and Fiore Martin (Queen Mary University of London)
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { PianoKeyboard } from './components/PianoKeyboard';
import { WaveformDisplay } from './components/WaveformDisplay';
import { Oscilloscope } from './components/Oscilloscope';
import { GranularSynth } from './audio/GranularSynth';
import { AudioRecorder } from './audio/AudioRecorder';
import { MIDIHandler } from './audio/MIDIHandler';
import { useAudioContext } from './hooks/useAudioContext';
import { useKeyboardInput } from './hooks/useKeyboardInput';
import { AppState } from './types/ui';
import { AUDIO_CONSTANTS, MIDI_CC } from './types/audio';
import './App.css';

const OpenCollidoscopeApp: React.FC = () => {
  const { audioContext, isStarted, error, startAudio } = useAudioContext();
  
  // Core audio components
  const [granularSynth, setGranularSynth] = useState<GranularSynth | null>(null);
  const [audioRecorder, setAudioRecorder] = useState<AudioRecorder | null>(null);
  const [midiHandler, setMidiHandler] = useState<MIDIHandler | null>(null);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
  
  // App state
  const [appState, setAppState] = useState<AppState>({
    isAudioStarted: false,
    isRecording: false,
    isLooping: false,
    audioContext: null,
    recordedBuffer: null,
    granularParams: {
      selectionStart: 0,
      selectionSize: 64,
      grainDurationCoeff: 1.0,
      filterCutoff: 127,
      masterVolume: 0.7,
    },
    pressedKeys: new Set(),
    error: null,
  });

  // Calculate MIDI note ratio for pitch (from original implementation)
  const calculateMidiNoteRatio = useCallback((midiNote: number): number => {
    const chromaticRatios = [
      1, 1.0594630943591, 1.1224620483089, 1.1892071150019,
      1.2599210498937, 1.3348398541685, 1.4142135623711, 1.4983070768743,
      1.5874010519653, 1.6817928305039, 1.7817974362766, 1.8877486253586
    ];
    
    const distanceFromCenter = midiNote - AUDIO_CONSTANTS.MIDI_NOTE_CENTER;
    
    if (distanceFromCenter < 0) {
      const diffAmount = -distanceFromCenter;
      const octaves = Math.floor(diffAmount / 12);
      const intervals = diffAmount % 12;
      return Math.pow(0.5, octaves) / chromaticRatios[intervals];
    } else {
      const octaves = Math.floor(distanceFromCenter / 12);
      const intervals = distanceFromCenter % 12;
      return Math.pow(2, octaves) * chromaticRatios[intervals];
    }
  }, []);

  // Audio initialization
  const initializeAudioComponents = useCallback(async () => {
    if (!audioContext) return;

    try {
      // Create granular synth
      const synth = new GranularSynth(audioContext);
      setGranularSynth(synth);

      // Create audio recorder
      const recorder = new AudioRecorder(audioContext);
      setAudioRecorder(recorder);

      // Create MIDI handler
      const midi = new MIDIHandler();
      setMidiHandler(midi);

      // Create analyser for oscilloscope
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 1024;
      setAnalyserNode(analyser);

      // Connect audio graph
      synth.connect(audioContext.destination);
      synth.connect(analyser);

      // Setup MIDI event handlers
      midi.onNoteOn = (note, velocity) => handleNoteOn(note, velocity);
      midi.onNoteOff = (note) => handleNoteOff(note);
      midi.onControlChange = (controller, value) => handleControlChange(controller, value);
      midi.onPitchBend = (value) => handlePitchBend(value);

      setAppState(prev => ({
        ...prev,
        isAudioStarted: true,
        audioContext,
        error: null,
      }));

      console.log('Audio components initialized successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setAppState(prev => ({ ...prev, error: errorMessage }));
      console.error('Failed to initialize audio components:', err);
    }
  }, [audioContext]);

  // Initialize audio components when context is ready
  useEffect(() => {
    if (isStarted && audioContext) {
      initializeAudioComponents();
    }
  }, [isStarted, audioContext, initializeAudioComponents]);

  // Note event handlers
  const handleNoteOn = useCallback((midiNote: number, velocity: number = 0.8) => {
    if (!granularSynth || !appState.recordedBuffer) return;
    
    const rate = calculateMidiNoteRatio(midiNote);
    granularSynth.noteOn(rate, velocity);
    
    setAppState(prev => ({
      ...prev,
      pressedKeys: new Set(prev.pressedKeys).add(midiNote)
    }));
  }, [granularSynth, appState.recordedBuffer, calculateMidiNoteRatio]);

  const handleNoteOff = useCallback((midiNote: number) => {
    if (!granularSynth) return;
    
    granularSynth.noteOff();
    
    setAppState(prev => {
      const newPressedKeys = new Set(prev.pressedKeys);
      newPressedKeys.delete(midiNote);
      return { ...prev, pressedKeys: newPressedKeys };
    });
  }, [granularSynth]);

  // Control change handlers (MIDI mapping)
  const handleControlChange = useCallback((controller: number, value: number) => {
    switch (controller) {
      case MIDI_CC.SELECTION_SIZE:
        const selectionSize = Math.floor((value / 127) * AUDIO_CONSTANTS.MAX_SELECTION_CHUNKS) + 1;
        setAppState(prev => ({
          ...prev,
          granularParams: { ...prev.granularParams, selectionSize }
        }));
        break;
      case MIDI_CC.GRAIN_DURATION:
        const grainDurationCoeff = 1 + (value / 127) * 7; // 1-8 range
        setAppState(prev => ({
          ...prev,
          granularParams: { ...prev.granularParams, grainDurationCoeff }
        }));
        break;
      case MIDI_CC.LOOP_TOGGLE:
        const isLooping = value > 0;
        setAppState(prev => ({ ...prev, isLooping }));
        if (granularSynth) {
          isLooping ? granularSynth.loopOn() : granularSynth.loopOff();
        }
        break;
      case MIDI_CC.RECORD_TRIGGER:
        if (value > 0) toggleRecording();
        break;
      case MIDI_CC.FILTER_CUTOFF:
        setAppState(prev => ({
          ...prev,
          granularParams: { ...prev.granularParams, filterCutoff: value }
        }));
        break;
    }
    updateGranularParameters();
  }, [granularSynth]);

  const handlePitchBend = useCallback((value: number) => {
    const normalizedValue = (value - 8192) / 8192; // -1 to 1
    const maxPosition = AUDIO_CONSTANTS.DEFAULT_CHUNKS - appState.granularParams.selectionSize;
    const selectionStart = Math.max(0, Math.min(maxPosition, 
      Math.floor((normalizedValue + 1) * maxPosition / 2)));
    
    setAppState(prev => ({
      ...prev,
      granularParams: { ...prev.granularParams, selectionStart }
    }));
    updateGranularParameters();
  }, [appState.granularParams.selectionSize]);

  // Recording handlers
  const toggleRecording = useCallback(async () => {
    if (!audioRecorder) return;

    if (appState.isRecording) {
      try {
        const recordedBuffer = await audioRecorder.stopRecording();
        
        if (granularSynth) {
          granularSynth.setBuffer(recordedBuffer);
        }
        
        setAppState(prev => ({
          ...prev,
          isRecording: false,
          recordedBuffer,
        }));
        
        console.log('Recording completed:', recordedBuffer.duration, 'seconds');
      } catch (err) {
        console.error('Failed to stop recording:', err);
      }
    } else {
      try {
        await audioRecorder.startRecording();
        setAppState(prev => ({ ...prev, isRecording: true }));
        console.log('Recording started');
      } catch (err) {
        console.error('Failed to start recording:', err);
      }
    }
  }, [audioRecorder, appState.isRecording, granularSynth]);

  const toggleLoop = useCallback(() => {
    const newLooping = !appState.isLooping;
    setAppState(prev => ({ ...prev, isLooping: newLooping }));
    
    if (granularSynth) {
      newLooping ? granularSynth.loopOn() : granularSynth.loopOff();
    }
  }, [appState.isLooping, granularSynth]);

  // Parameter updates
  const updateGranularParameters = useCallback(() => {
    if (!granularSynth) return;
    
    const { selectionStart, selectionSize, grainDurationCoeff, filterCutoff, masterVolume } = appState.granularParams;
    
    granularSynth.setSelection(selectionStart, selectionSize);
    granularSynth.setGrainDurationCoeff(grainDurationCoeff);
    granularSynth.setFilterCutoff(filterCutoff);
    granularSynth.setMasterVolume(masterVolume);
  }, [granularSynth, appState.granularParams]);

  // Selection change handler
  const handleSelectionChange = useCallback((start: number, size: number) => {
    setAppState(prev => ({
      ...prev,
      granularParams: { ...prev.granularParams, selectionStart: start, selectionSize: size }
    }));
    updateGranularParameters();
  }, [updateGranularParameters]);

  // Parameter change handlers
  const handleParameterChange = useCallback((parameter: string, value: number) => {
    setAppState(prev => ({
      ...prev,
      granularParams: { ...prev.granularParams, [parameter]: value }
    }));
    updateGranularParameters();
  }, [updateGranularParameters]);

  // Keyboard input setup
  useKeyboardInput({
    onNotePress: handleNoteOn,
    onNoteRelease: handleNoteOff,
    onToggleLoop: toggleLoop,
    onToggleRecord: toggleRecording,
    enabled: appState.isAudioStarted,
  });

  // File upload handler
  const handleFileUpload = useCallback(async (files: FileList) => {
    if (!audioContext || files.length === 0) return;

    const file = files[0];
    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      if (granularSynth) {
        granularSynth.setBuffer(audioBuffer);
      }
      
      setAppState(prev => ({ ...prev, recordedBuffer: audioBuffer }));
      console.log('File loaded:', audioBuffer.duration, 'seconds');
    } catch (err) {
      console.error('Failed to load audio file:', err);
    }
  }, [audioContext, granularSynth]);

  return (
    <div className="opencollidoscope-app">
      <header className="app-header">
        <h1>OpenCollidoscope</h1>
        <p>Interactive Granular Synthesizer</p>
        
        {!isStarted && (
          <button 
            className="start-audio-btn"
            onClick={startAudio}
          >
            Start Audio System
          </button>
        )}
        
        {error && (
          <div className="error-message">
            Error: {error}
          </div>
        )}
      </header>

      {appState.isAudioStarted && (
        <main className="app-content">
          {/* Audio Controls */}
          <section className="audio-controls">
            <button 
              className={`control-btn ${appState.isRecording ? 'recording' : ''}`}
              onClick={toggleRecording}
            >
              {appState.isRecording ? 'Stop Recording' : 'Record'}
            </button>
            
            <button 
              className={`control-btn ${appState.isLooping ? 'active' : ''}`}
              onClick={toggleLoop}
            >
              Loop
            </button>
            
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              style={{ marginLeft: '1rem' }}
            />
          </section>

          {/* Granular Controls */}
          <section className="granular-controls">
            <div className="control-group">
              <label>Selection Size: {appState.granularParams.selectionSize}</label>
              <input
                type="range"
                min="1"
                max={AUDIO_CONSTANTS.MAX_SELECTION_CHUNKS}
                value={appState.granularParams.selectionSize}
                onChange={(e) => handleParameterChange('selectionSize', parseInt(e.target.value))}
              />
            </div>
            
            <div className="control-group">
              <label>Grain Duration: {appState.granularParams.grainDurationCoeff.toFixed(1)}</label>
              <input
                type="range"
                min="1"
                max="8"
                step="0.1"
                value={appState.granularParams.grainDurationCoeff}
                onChange={(e) => handleParameterChange('grainDurationCoeff', parseFloat(e.target.value))}
              />
            </div>
            
            <div className="control-group">
              <label>Filter Cutoff: {appState.granularParams.filterCutoff}</label>
              <input
                type="range"
                min="0"
                max="127"
                value={appState.granularParams.filterCutoff}
                onChange={(e) => handleParameterChange('filterCutoff', parseInt(e.target.value))}
              />
            </div>
            
            <div className="control-group">
              <label>Master Volume: {appState.granularParams.masterVolume.toFixed(1)}</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={appState.granularParams.masterVolume}
                onChange={(e) => handleParameterChange('masterVolume', parseFloat(e.target.value))}
              />
            </div>
          </section>

          {/* Waveform Display */}
          <section className="waveform-section">
            <WaveformDisplay
              buffer={appState.recordedBuffer}
              selection={{ 
                start: appState.granularParams.selectionStart, 
                size: appState.granularParams.selectionSize 
              }}
              onSelectionChange={handleSelectionChange}
            />
          </section>

          {/* Oscilloscope */}
          <section className="oscilloscope-section">
            <Oscilloscope
              analyserNode={analyserNode}
            />
          </section>

          {/* Piano Keyboard */}
          <section className="keyboard-section">
            <PianoKeyboard
              onNotePress={handleNoteOn}
              onNoteRelease={handleNoteOff}
              pressedKeys={appState.pressedKeys}
            />
          </section>

          {/* Status */}
          <section className="status-section">
            <div className="status-info">
              <span>Audio: {appState.isAudioStarted ? 'Started' : 'Stopped'}</span>
              <span>Recording: {appState.isRecording ? 'Active' : 'Inactive'}</span>
              <span>Loop: {appState.isLooping ? 'On' : 'Off'}</span>
              {appState.recordedBuffer && (
                <span>Buffer: {appState.recordedBuffer.duration.toFixed(2)}s</span>
              )}
              {granularSynth && (
                <span>Active Grains: {granularSynth.getActiveGrainCount()}</span>
              )}
            </div>
          </section>
        </main>
      )}
    </div>
  );
};

export default OpenCollidoscopeApp;
