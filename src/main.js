/**
 * OpenCollidoscope Web - Main Application
 * Web implementation of the OpenCollidoscope granular synthesizer
 * Based on the original by Ben Bengler and Fiore Martin (Queen Mary University of London)
 */

import { GranularSynth } from './audio/GranularSynth.js';
import { PianoKeyboard } from './ui/PianoKeyboard.js';
import { WaveformDisplay } from './ui/WaveformDisplay.js';
import { Oscilloscope } from './ui/Oscilloscope.js';
import { AudioRecorder } from './audio/AudioRecorder.js';
import { MIDIHandler } from './audio/MIDIHandler.js';

class OpenCollidoscopeApp {
    constructor() {
        this.audioContext = null;
        this.granularSynth = null;
        this.pianoKeyboard = null;
        this.waveformDisplay = null;
        this.oscilloscope = null;
        this.audioRecorder = null;
        this.midiHandler = null;
        
        this.isAudioStarted = false;
        this.isRecording = false;
        this.isLooping = false;
        
        // Audio buffers
        this.recordedBuffer = null;
        this.sampleBuffers = [];
        
        // Selection parameters (matching original)
        this.selectionStart = 0;
        this.selectionSize = 64; // Default selection size (0-127 MIDI range)
        this.numChunks = 150; // Default number of chunks (from original)
        this.maxSelectionChunks = 127;
        
        // Granular parameters
        this.grainDurationCoeff = 1.0;
        this.filterCutoff = 127;
        this.masterVolume = 0.7;
        
        this.initializeUI();
    }

    async initializeUI() {
        // Initialize audio system
        this.setupAudioControls();
        
        // Initialize UI components
        this.pianoKeyboard = new PianoKeyboard(document.getElementById('piano-keyboard'));
        this.pianoKeyboard.onNotePress = (midiNote, velocity) => this.handleNoteOn(midiNote, velocity);
        this.pianoKeyboard.onNoteRelease = (midiNote) => this.handleNoteOff(midiNote);
        
        this.waveformDisplay = new WaveformDisplay(document.getElementById('wave-display'));
        this.waveformDisplay.onSelectionChange = (start, size) => this.handleSelectionChange(start, size);
        
        this.oscilloscope = new Oscilloscope(document.getElementById('oscilloscope'));
        
        // Setup controls
        this.setupGranularControls();
        this.setupSelectionControls();
        this.setupSampleControls();
        this.setupKeyboardControls();
        this.setupInfoModal();
        
        // Update status
        this.updateStatus();
        
        console.log('OpenCollidoscope Web initialized');
    }

    setupAudioControls() {
        const startAudioBtn = document.getElementById('start-audio');
        const recordToggleBtn = document.getElementById('record-toggle');
        const loopToggleBtn = document.getElementById('loop-toggle');

        startAudioBtn.addEventListener('click', () => this.startAudio());
        recordToggleBtn.addEventListener('click', () => this.toggleRecording());
        loopToggleBtn.addEventListener('click', () => this.toggleLoop());
    }

    async startAudio() {
        try {
            // Initialize Web Audio Context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            // Initialize audio components
            this.granularSynth = new GranularSynth(this.audioContext);
            this.audioRecorder = new AudioRecorder(this.audioContext);
            this.midiHandler = new MIDIHandler();
            
            // Connect MIDI events
            this.midiHandler.onNoteOn = (note, velocity, channel) => this.handleNoteOn(note, velocity);
            this.midiHandler.onNoteOff = (note, channel) => this.handleNoteOff(note);
            this.midiHandler.onControlChange = (controller, value, channel) => this.handleControlChange(controller, value);
            this.midiHandler.onPitchBend = (value, channel) => this.handlePitchBend(value);
            
            // Connect audio graph
            await this.connectAudioGraph();
            
            // Start animation loops
            this.startAnimationLoop();
            
            this.isAudioStarted = true;
            this.updateStatus();
            
            console.log('Audio system started successfully');
            
        } catch (error) {
            console.error('Failed to start audio:', error);
            alert('Failed to start audio system. Please check your browser permissions.');
        }
    }

    async connectAudioGraph() {
        // Connect granular synth to output
        this.granularSynth.connect(this.audioContext.destination);
        
        // Setup analyzer for oscilloscope
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 1024;
        this.granularSynth.connect(this.analyser);
        
        // Initialize with default parameters
        this.updateGranularParameters();
    }

    startAnimationLoop() {
        const animate = () => {
            if (this.oscilloscope && this.analyser) {
                const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
                this.analyser.getByteTimeDomainData(dataArray);
                this.oscilloscope.draw(dataArray);
            }
            
            if (this.waveformDisplay && this.recordedBuffer) {
                this.waveformDisplay.setSelection(this.selectionStart, this.selectionSize);
            }
            
            requestAnimationFrame(animate);
        };
        animate();
    }

    setupGranularControls() {
        // Selection Size Control (CC 1)
        const grainSizeSlider = document.getElementById('grain-size');
        const grainSizeDisplay = grainSizeSlider.nextElementSibling;
        
        grainSizeSlider.addEventListener('input', (e) => {
            this.selectionSize = parseInt(e.target.value);
            grainSizeDisplay.textContent = this.selectionSize;
            this.updateGranularParameters();
        });

        // Grain Duration Coefficient Control (CC 2)
        const grainDurationSlider = document.getElementById('grain-duration');
        const grainDurationDisplay = grainDurationSlider.nextElementSibling;
        
        grainDurationSlider.addEventListener('input', (e) => {
            this.grainDurationCoeff = parseFloat(e.target.value);
            grainDurationDisplay.textContent = this.grainDurationCoeff.toFixed(1);
            this.updateGranularParameters();
        });

        // Filter Cutoff Control (CC 7)
        const filterCutoffSlider = document.getElementById('filter-cutoff');
        const filterCutoffDisplay = filterCutoffSlider.nextElementSibling;
        
        filterCutoffSlider.addEventListener('input', (e) => {
            this.filterCutoff = parseInt(e.target.value);
            filterCutoffDisplay.textContent = this.filterCutoff;
            this.updateGranularParameters();
        });

        // Master Volume Control
        const masterVolumeSlider = document.getElementById('master-volume');
        const masterVolumeDisplay = masterVolumeSlider.nextElementSibling;
        
        masterVolumeSlider.addEventListener('input', (e) => {
            this.masterVolume = parseFloat(e.target.value);
            masterVolumeDisplay.textContent = this.masterVolume.toFixed(1);
            if (this.granularSynth) {
                this.granularSynth.setMasterVolume(this.masterVolume);
            }
        });
    }

    setupSelectionControls() {
        const selectionLeft = document.getElementById('selection-left');
        const selectionRight = document.getElementById('selection-right');
        const selectionSmaller = document.getElementById('selection-smaller');
        const selectionLarger = document.getElementById('selection-larger');
        const selectionInfo = document.getElementById('selection-info');

        selectionLeft.addEventListener('click', () => {
            if (this.selectionStart > 0) {
                this.selectionStart--;
                this.updateSelection();
            }
        });

        selectionRight.addEventListener('click', () => {
            if (this.selectionStart < this.numChunks - this.selectionSize) {
                this.selectionStart++;
                this.updateSelection();
            }
        });

        selectionSmaller.addEventListener('click', () => {
            if (this.selectionSize > 1) {
                this.selectionSize--;
                this.updateSelection();
            }
        });

        selectionLarger.addEventListener('click', () => {
            if (this.selectionSize < this.maxSelectionChunks) {
                this.selectionSize++;
                this.updateSelection();
            }
        });
    }

    setupSampleControls() {
        const sampleUpload = document.getElementById('sample-upload');
        const clearSamples = document.getElementById('clear-samples');

        sampleUpload.addEventListener('change', (e) => this.loadSampleFiles(e.target.files));
        clearSamples.addEventListener('click', () => this.clearAllSamples());
    }

    setupKeyboardControls() {
        // Map computer keyboard to piano keys (matching original)
        const keyMappings = {
            'KeyA': 60, // C4
            'KeyW': 61, // C#4
            'KeyS': 62, // D4
            'KeyE': 63, // D#4
            'KeyD': 64, // E4
            'KeyF': 65, // F4
            'KeyT': 66, // F#4
            'KeyG': 67, // G4
            'KeyY': 68, // G#4
            'KeyH': 69, // A4
            'KeyU': 70, // A#4
            'KeyJ': 71, // B4
            'KeyK': 72, // C5
            'KeyO': 73, // C#5
            'KeyL': 74, // D5
            'KeyP': 75  // D#5
        };

        const pressedKeys = new Set();

        document.addEventListener('keydown', (e) => {
            if (e.repeat || !keyMappings[e.code]) return;
            
            // Handle special keys (matching original behavior)
            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    this.toggleLoop();
                    return;
                case 'KeyR':
                    this.toggleRecording();
                    return;
                case 'KeyF':
                    this.toggleFullscreen();
                    return;
            }

            const midiNote = keyMappings[e.code];
            if (midiNote && !pressedKeys.has(e.code)) {
                pressedKeys.add(e.code);
                this.handleNoteOn(midiNote, 0.8);
                this.pianoKeyboard.setKeyPressed(midiNote, true);
            }
        });

        document.addEventListener('keyup', (e) => {
            const midiNote = keyMappings[e.code];
            if (midiNote && pressedKeys.has(e.code)) {
                pressedKeys.delete(e.code);
                this.handleNoteOff(midiNote);
                this.pianoKeyboard.setKeyPressed(midiNote, false);
            }
        });
    }

    setupInfoModal() {
        const infoButton = document.getElementById('info-button');
        const infoModal = document.getElementById('info-modal');
        const closeBtn = infoModal.querySelector('.close');

        infoButton.addEventListener('click', () => {
            infoModal.style.display = 'block';
        });

        closeBtn.addEventListener('click', () => {
            infoModal.style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            if (e.target === infoModal) {
                infoModal.style.display = 'none';
            }
        });
    }

    // Audio Event Handlers
    handleNoteOn(midiNote, velocity = 0.8) {
        if (!this.granularSynth || !this.recordedBuffer) return;
        
        const rate = this.calculateMidiNoteRatio(midiNote);
        this.granularSynth.noteOn(rate, velocity);
        this.pianoKeyboard.setKeyPressed(midiNote, true);
        
        // Visual feedback
        setTimeout(() => {
            this.pianoKeyboard.setKeyPressed(midiNote, false);
        }, 200);
    }

    handleNoteOff(midiNote) {
        if (!this.granularSynth) return;
        
        this.granularSynth.noteOff();
        this.pianoKeyboard.setKeyPressed(midiNote, false);
    }

    handleControlChange(controller, value) {
        switch (controller) {
            case 1: // Selection Size
                this.selectionSize = Math.floor((value / 127) * this.maxSelectionChunks) + 1;
                document.getElementById('grain-size').value = this.selectionSize;
                document.querySelector('#grain-size + .value-display').textContent = this.selectionSize;
                break;
            case 2: // Grain Duration
                this.grainDurationCoeff = 1 + (value / 127) * 7; // 1-8 range
                document.getElementById('grain-duration').value = this.grainDurationCoeff;
                document.querySelector('#grain-duration + .value-display').textContent = this.grainDurationCoeff.toFixed(1);
                break;
            case 4: // Loop On/Off
                this.isLooping = value > 0;
                this.updateLoopState();
                break;
            case 5: // Record Trigger
                if (value > 0) this.startRecording();
                break;
            case 7: // Filter Cutoff
                this.filterCutoff = value;
                document.getElementById('filter-cutoff').value = value;
                document.querySelector('#filter-cutoff + .value-display').textContent = value;
                break;
        }
        this.updateGranularParameters();
    }

    handlePitchBend(value) {
        // Convert 14-bit pitch bend to selection start position
        const normalizedValue = (value - 8192) / 8192; // -1 to 1
        const maxPosition = this.numChunks - this.selectionSize;
        this.selectionStart = Math.max(0, Math.min(maxPosition, 
            Math.floor((normalizedValue + 1) * maxPosition / 2)));
        this.updateSelection();
    }

    // Audio Processing Methods
    calculateMidiNoteRatio(midiNote) {
        // Chromatic ratios for pitch calculation (from original)
        const chromaticRatios = [
            1, 1.0594630943591, 1.1224620483089, 1.1892071150019,
            1.2599210498937, 1.3348398541685, 1.4142135623711, 1.4983070768743,
            1.5874010519653, 1.6817928305039, 1.7817974362766, 1.8877486253586
        ];
        
        const distanceFromCenter = midiNote - 60; // C4 as center
        
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
    }

    async toggleRecording() {
        if (!this.audioRecorder) return;
        
        if (this.isRecording) {
            this.stopRecording();
        } else {
            this.startRecording();
        }
    }

    async startRecording() {
        if (!this.audioRecorder || this.isRecording) return;
        
        try {
            await this.audioRecorder.startRecording();
            this.isRecording = true;
            
            const recordBtn = document.getElementById('record-toggle');
            recordBtn.classList.add('recording');
            recordBtn.querySelector('.text').textContent = 'Stop';
            
            this.updateStatus();
            console.log('Recording started');
            
        } catch (error) {
            console.error('Failed to start recording:', error);
            alert('Failed to access microphone. Please check permissions.');
        }
    }

    async stopRecording() {
        if (!this.audioRecorder || !this.isRecording) return;
        
        try {
            this.recordedBuffer = await this.audioRecorder.stopRecording();
            this.isRecording = false;
            
            // Update granular synth with new buffer
            if (this.granularSynth && this.recordedBuffer) {
                this.granularSynth.setBuffer(this.recordedBuffer);
                this.waveformDisplay.setBuffer(this.recordedBuffer);
            }
            
            const recordBtn = document.getElementById('record-toggle');
            recordBtn.classList.remove('recording');
            recordBtn.querySelector('.text').textContent = 'Record';
            
            this.updateStatus();
            console.log('Recording completed');
            
        } catch (error) {
            console.error('Failed to stop recording:', error);
        }
    }

    toggleLoop() {
        this.isLooping = !this.isLooping;
        this.updateLoopState();
    }

    updateLoopState() {
        const loopBtn = document.getElementById('loop-toggle');
        
        if (this.isLooping) {
            loopBtn.classList.add('active');
            if (this.granularSynth) {
                this.granularSynth.loopOn();
            }
        } else {
            loopBtn.classList.remove('active');
            if (this.granularSynth) {
                this.granularSynth.loopOff();
            }
        }
    }

    handleSelectionChange(start, size) {
        this.selectionStart = start;
        this.selectionSize = size;
        this.updateSelection();
    }

    updateSelection() {
        if (this.granularSynth) {
            this.granularSynth.setSelection(this.selectionStart, this.selectionSize);
        }
        
        // Update UI
        const selectionInfo = document.getElementById('selection-info');
        selectionInfo.textContent = `Selection: ${this.selectionStart}-${this.selectionStart + this.selectionSize} chunks`;
        
        // Update slider
        document.getElementById('grain-size').value = this.selectionSize;
        document.querySelector('#grain-size + .value-display').textContent = this.selectionSize;
    }

    updateGranularParameters() {
        if (!this.granularSynth) return;
        
        this.granularSynth.setGrainDurationCoeff(this.grainDurationCoeff);
        this.granularSynth.setFilterCutoff(this.filterCutoff);
        this.granularSynth.setSelection(this.selectionStart, this.selectionSize);
    }

    async loadSampleFiles(files) {
        const sampleList = document.getElementById('sample-list');
        
        for (const file of files) {
            try {
                const arrayBuffer = await file.arrayBuffer();
                const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
                
                this.sampleBuffers.push({
                    name: file.name,
                    buffer: audioBuffer
                });
                
                // Create sample item in UI
                const sampleItem = document.createElement('div');
                sampleItem.className = 'sample-item';
                sampleItem.innerHTML = `
                    <h4>${file.name}</h4>
                    <p>${audioBuffer.duration.toFixed(1)}s</p>
                `;
                
                sampleItem.addEventListener('click', () => {
                    this.loadSample(audioBuffer);
                    // Update active state
                    document.querySelectorAll('.sample-item').forEach(item => item.classList.remove('active'));
                    sampleItem.classList.add('active');
                });
                
                sampleList.appendChild(sampleItem);
                
            } catch (error) {
                console.error('Failed to load sample:', file.name, error);
            }
        }
    }

    loadSample(audioBuffer) {
        this.recordedBuffer = audioBuffer;
        
        if (this.granularSynth) {
            this.granularSynth.setBuffer(audioBuffer);
        }
        
        if (this.waveformDisplay) {
            this.waveformDisplay.setBuffer(audioBuffer);
        }
        
        console.log('Sample loaded:', audioBuffer.duration, 'seconds');
    }

    clearAllSamples() {
        this.sampleBuffers = [];
        document.getElementById('sample-list').innerHTML = '';
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    updateStatus() {
        const audioStatus = document.getElementById('audio-status');
        const recordingStatus = document.getElementById('recording-status');
        const grainCount = document.getElementById('grain-count');
        
        audioStatus.textContent = this.isAudioStarted ? 'Active' : 'Not Started';
        audioStatus.className = this.isAudioStarted ? 'active' : '';
        
        recordingStatus.textContent = this.isRecording ? 'Recording...' : 'Ready';
        recordingStatus.className = this.isRecording ? 'recording' : '';
        
        if (this.granularSynth) {
            grainCount.textContent = this.granularSynth.getActiveGrainCount();
        }
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.collidoscopeApp = new OpenCollidoscopeApp();
});

// Handle browser compatibility
if (!window.AudioContext && !window.webkitAudioContext) {
    alert('Web Audio API is not supported in this browser. Please use a modern browser like Chrome, Firefox, or Safari.');
}