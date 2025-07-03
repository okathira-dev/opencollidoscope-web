/**
 * MIDIHandler.js - Web MIDI API integration
 * Handles MIDI input for controlling the granular synthesizer
 */

export class MIDIHandler {
    constructor() {
        this.midiAccess = null;
        this.inputPorts = new Map();
        this.isSupported = false;
        
        // Event callbacks
        this.onNoteOn = null;
        this.onNoteOff = null;
        this.onControlChange = null;
        this.onPitchBend = null;
        this.onMIDIError = null;
        
        this.initialize();
    }

    async initialize() {
        try {
            if (navigator.requestMIDIAccess) {
                this.midiAccess = await navigator.requestMIDIAccess();
                this.isSupported = true;
                this.setupMIDIInputs();
                this.setupMIDIEventListeners();
                console.log('MIDI support initialized');
            } else {
                console.warn('Web MIDI API not supported');
            }
        } catch (error) {
            console.error('Failed to initialize MIDI:', error);
            if (this.onMIDIError) {
                this.onMIDIError(error);
            }
        }
    }

    setupMIDIInputs() {
        if (!this.midiAccess) return;

        // Set up existing MIDI inputs
        for (const input of this.midiAccess.inputs.values()) {
            this.connectInput(input);
        }

        // Listen for MIDI device connections/disconnections
        this.midiAccess.onstatechange = (event) => {
            if (event.port.type === 'input') {
                if (event.port.state === 'connected') {
                    this.connectInput(event.port);
                    console.log('MIDI input connected:', event.port.name);
                } else if (event.port.state === 'disconnected') {
                    this.disconnectInput(event.port);
                    console.log('MIDI input disconnected:', event.port.name);
                }
            }
        };
    }

    connectInput(input) {
        if (this.inputPorts.has(input.id)) return;

        input.onmidimessage = (message) => this.handleMIDIMessage(message);
        this.inputPorts.set(input.id, input);
        console.log('Connected MIDI input:', input.name);
    }

    disconnectInput(input) {
        if (this.inputPorts.has(input.id)) {
            input.onmidimessage = null;
            this.inputPorts.delete(input.id);
        }
    }

    setupMIDIEventListeners() {
        // Additional setup if needed
    }

    handleMIDIMessage(message) {
        const data = message.data;
        const command = data[0] & 0xf0;
        const channel = data[0] & 0x0f;
        const note = data[1];
        const velocity = data[2];

        switch (command) {
            case 0x90: // Note On
                if (velocity > 0) {
                    this.handleNoteOn(note, velocity, channel);
                } else {
                    // Note on with velocity 0 is treated as note off
                    this.handleNoteOff(note, channel);
                }
                break;

            case 0x80: // Note Off
                this.handleNoteOff(note, channel);
                break;

            case 0xb0: // Control Change
                this.handleControlChange(note, velocity, channel); // note is controller number
                break;

            case 0xe0: // Pitch Bend
                const pitchBendValue = (velocity << 7) | note; // 14-bit value
                this.handlePitchBend(pitchBendValue, channel);
                break;

            default:
                // Ignore other MIDI messages
                break;
        }
    }

    handleNoteOn(note, velocity, channel) {
        if (this.onNoteOn) {
            // Convert MIDI velocity (0-127) to normalized value (0-1)
            const normalizedVelocity = velocity / 127;
            this.onNoteOn(note, normalizedVelocity, channel);
        }
    }

    handleNoteOff(note, channel) {
        if (this.onNoteOff) {
            this.onNoteOff(note, channel);
        }
    }

    handleControlChange(controller, value, channel) {
        if (this.onControlChange) {
            this.onControlChange(controller, value, channel);
        }
    }

    handlePitchBend(value, channel) {
        if (this.onPitchBend) {
            this.onPitchBend(value, channel);
        }
    }

    getConnectedInputs() {
        return Array.from(this.inputPorts.values()).map(input => ({
            id: input.id,
            name: input.name,
            manufacturer: input.manufacturer,
            state: input.state
        }));
    }

    static async isSupported() {
        return !!(navigator.requestMIDIAccess);
    }

    destroy() {
        if (this.midiAccess) {
            this.midiAccess.onstatechange = null;
            
            for (const input of this.inputPorts.values()) {
                input.onmidimessage = null;
            }
            
            this.inputPorts.clear();
            this.midiAccess = null;
        }
    }
}