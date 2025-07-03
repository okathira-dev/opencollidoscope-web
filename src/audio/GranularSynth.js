/**
 * GranularSynth.js - Web Audio API implementation of granular synthesizer
 * Based on the original PGranular implementation from OpenCollidoscope
 */

export class GranularSynth {
    constructor(audioContext) {
        this.audioContext = audioContext;
        this.output = audioContext.createGain();
        this.filterNode = audioContext.createBiquadFilter();
        this.masterGain = audioContext.createGain();
        
        // Granular parameters (matching original)
        this.maxGrains = 32;
        this.minGrainDuration = 0.04; // 40ms minimum (640 samples at 16kHz)
        this.grainDurationCoeff = 1.0;
        this.selectionStart = 0;
        this.selectionSize = 64;
        this.attenuation = 0.25; // -12dB default attenuation
        
        // Audio buffer and state
        this.sourceBuffer = null;
        this.grains = [];
        this.activeGrains = 0;
        this.isLooping = false;
        this.isNoteOn = false;
        
        // ASR Envelope parameters (matching original)
        this.attackTime = 0.01; // 10ms
        this.releaseTime = 0.05; // 50ms
        
        // Note tracking for polyphony
        this.activeNotes = new Map();
        this.nextGrainId = 0;
        
        this.setupAudioGraph();
        this.initializeGrains();
    }

    setupAudioGraph() {
        // Filter setup (low pass)
        this.filterNode.type = 'lowpass';
        this.filterNode.frequency.value = 22050; // Max frequency
        this.filterNode.Q.value = 0.707;
        
        // Master gain setup
        this.masterGain.gain.value = this.attenuation;
        
        // Audio routing: grains -> filter -> master gain -> output
        this.filterNode.connect(this.masterGain);
        this.masterGain.connect(this.output);
    }

    initializeGrains() {
        this.grains = [];
        for (let i = 0; i < this.maxGrains; i++) {
            this.grains.push({
                id: i,
                active: false,
                source: null,
                gain: null,
                startTime: 0,
                duration: 0,
                rate: 1.0,
                phase: 0,
                envelope: null
            });
        }
    }

    setBuffer(audioBuffer) {
        this.sourceBuffer = audioBuffer;
        this.stopAllGrains();
        console.log('Buffer set:', audioBuffer.duration, 'seconds');
    }

    setMasterVolume(volume) {
        this.masterGain.gain.value = volume * this.attenuation;
    }

    setGrainDurationCoeff(coeff) {
        this.grainDurationCoeff = Math.max(1.0, Math.min(8.0, coeff));
    }

    setFilterCutoff(midiValue) {
        // Convert MIDI value (0-127) to frequency (50Hz - 22050Hz)
        const minCutoff = 50;
        const maxCutoff = 22050;
        const normalizedValue = midiValue / 127;
        
        // Exponential scaling for more musical control
        const frequency = minCutoff * Math.pow(maxCutoff / minCutoff, normalizedValue);
        this.filterNode.frequency.value = frequency;
    }

    setSelection(start, size) {
        this.selectionStart = start;
        this.selectionSize = size;
    }

    noteOn(rate = 1.0, velocity = 0.8) {
        if (!this.sourceBuffer) return;
        
        this.isNoteOn = true;
        
        if (this.isLooping) {
            this.startLoopGrains(rate, velocity);
        } else {
            this.triggerGrain(rate, velocity);
        }
    }

    noteOff() {
        this.isNoteOn = false;
        this.stopLoopGrains();
    }

    loopOn() {
        this.isLooping = true;
        if (this.isNoteOn) {
            this.startLoopGrains(1.0, 0.8);
        }
    }

    loopOff() {
        this.isLooping = false;
        this.stopLoopGrains();
    }

    triggerGrain(rate = 1.0, velocity = 0.8) {
        if (!this.sourceBuffer) return;
        
        const grain = this.getNextAvailableGrain();
        if (!grain) return;
        
        this.setupGrain(grain, rate, velocity, false);
    }

    startLoopGrains(rate = 1.0, velocity = 0.8) {
        if (!this.sourceBuffer || !this.isLooping) return;
        
        // Calculate trigger interval based on selection size
        const selectionDuration = this.getSelectionDuration();
        const triggerInterval = selectionDuration / this.grainDurationCoeff;
        
        // Schedule first grain immediately
        this.triggerGrain(rate, velocity);
        
        // Schedule subsequent grains
        this.scheduleLoopGrains(rate, velocity, triggerInterval);
    }

    scheduleLoopGrains(rate, velocity, interval) {
        if (!this.isLooping || !this.isNoteOn) return;
        
        setTimeout(() => {
            if (this.isLooping && this.isNoteOn) {
                this.triggerGrain(rate, velocity);
                this.scheduleLoopGrains(rate, velocity, interval);
            }
        }, interval * 1000);
    }

    stopLoopGrains() {
        this.isLooping = false;
        // Note: individual grains will stop naturally when their envelopes finish
    }

    getNextAvailableGrain() {
        for (let grain of this.grains) {
            if (!grain.active) {
                return grain;
            }
        }
        return null; // No available grains
    }

    setupGrain(grain, rate, velocity, isLoop = false) {
        const currentTime = this.audioContext.currentTime;
        
        // Calculate grain parameters
        const selectionDuration = this.getSelectionDuration();
        const grainDuration = Math.max(this.minGrainDuration, 
            selectionDuration * this.grainDurationCoeff);
        
        // Create audio nodes for this grain
        grain.source = this.audioContext.createBufferSource();
        grain.gain = this.audioContext.createGain();
        grain.envelope = this.audioContext.createGain();
        
        // Set buffer and playback rate
        grain.source.buffer = this.sourceBuffer;
        grain.source.playbackRate.value = rate;
        
        // Calculate random offset (matching original behavior)
        const randomOffset = Math.random() * (this.audioContext.sampleRate / 100);
        const startOffset = this.getSelectionStartTime() + (randomOffset / this.audioContext.sampleRate);
        
        // Connect audio graph for this grain
        grain.source.connect(grain.gain);
        grain.gain.connect(grain.envelope);
        grain.envelope.connect(this.filterNode);
        
        // Setup gain (velocity and attenuation)
        grain.gain.gain.value = velocity * this.attenuation;
        
        // Setup Hann window envelope (matching original raised cosine bell)
        this.setupHannEnvelope(grain.envelope, currentTime, grainDuration);
        
        // Setup grain properties
        grain.active = true;
        grain.startTime = currentTime;
        grain.duration = grainDuration;
        grain.rate = rate;
        grain.id = this.nextGrainId++;
        
        // Start playback
        grain.source.start(currentTime, startOffset, grainDuration);
        
        // Schedule cleanup
        grain.source.addEventListener('ended', () => {
            this.cleanupGrain(grain);
        });
        
        // Stop after duration
        grain.source.stop(currentTime + grainDuration);
        
        this.activeGrains++;
    }

    setupHannEnvelope(envelopeNode, startTime, duration) {
        const envelope = envelopeNode.gain;
        
        // Hann window: 0.5 * (1 - cos(2π * t / duration))
        // Implemented as attack-sustain-release for simplicity
        
        envelope.setValueAtTime(0, startTime);
        envelope.linearRampToValueAtTime(1, startTime + this.attackTime);
        envelope.setValueAtTime(1, startTime + duration - this.releaseTime);
        envelope.linearRampToValueAtTime(0, startTime + duration);
    }

    cleanupGrain(grain) {
        if (grain.source) {
            grain.source.disconnect();
            grain.source = null;
        }
        if (grain.gain) {
            grain.gain.disconnect();
            grain.gain = null;
        }
        if (grain.envelope) {
            grain.envelope.disconnect();
            grain.envelope = null;
        }
        
        grain.active = false;
        this.activeGrains = Math.max(0, this.activeGrains - 1);
    }

    stopAllGrains() {
        for (let grain of this.grains) {
            if (grain.active && grain.source) {
                grain.source.stop();
                this.cleanupGrain(grain);
            }
        }
        this.activeGrains = 0;
    }

    getSelectionStartTime() {
        if (!this.sourceBuffer) return 0;
        
        // Convert chunk position to time
        const chunksPerSecond = 150 / this.sourceBuffer.duration; // 150 chunks total
        return this.selectionStart / chunksPerSecond;
    }

    getSelectionDuration() {
        if (!this.sourceBuffer) return this.minGrainDuration;
        
        // Convert chunk size to duration
        const chunksPerSecond = 150 / this.sourceBuffer.duration; // 150 chunks total
        return Math.max(this.minGrainDuration, this.selectionSize / chunksPerSecond);
    }

    getActiveGrainCount() {
        return this.activeGrains;
    }

    connect(destination) {
        this.output.connect(destination);
    }

    disconnect() {
        this.output.disconnect();
    }

    destroy() {
        this.stopAllGrains();
        this.disconnect();
        
        if (this.filterNode) {
            this.filterNode.disconnect();
        }
        if (this.masterGain) {
            this.masterGain.disconnect();
        }
        if (this.output) {
            this.output.disconnect();
        }
    }
}

// Utility class for envelope generation
export class ASREnvelope {
    constructor(audioContext, attackTime = 0.01, sustainLevel = 1.0, releaseTime = 0.05) {
        this.audioContext = audioContext;
        this.attackTime = attackTime;
        this.sustainLevel = sustainLevel;
        this.releaseTime = releaseTime;
        this.state = 'idle'; // idle, attack, sustain, release
    }

    trigger(gainNode, startTime, duration) {
        const gain = gainNode.gain;
        
        gain.setValueAtTime(0, startTime);
        gain.linearRampToValueAtTime(this.sustainLevel, startTime + this.attackTime);
        
        const releaseStartTime = startTime + duration - this.releaseTime;
        gain.setValueAtTime(this.sustainLevel, releaseStartTime);
        gain.linearRampToValueAtTime(0, startTime + duration);
    }
}