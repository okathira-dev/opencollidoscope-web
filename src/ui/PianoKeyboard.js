/**
 * PianoKeyboard.js - Interactive piano keyboard component
 * Generates and manages a visual piano keyboard with mouse and touch support
 */

export class PianoKeyboard {
    constructor(container) {
        this.container = container;
        this.keys = new Map();
        this.pressedKeys = new Set();
        
        // Callback functions
        this.onNotePress = null;
        this.onNoteRelease = null;
        
        // Configuration
        this.startNote = 60; // C4
        this.numKeys = 25; // 2 octaves
        
        this.createKeyboard();
        this.setupEventListeners();
    }

    createKeyboard() {
        this.container.innerHTML = '';
        
        // Create keys for the specified range
        for (let i = 0; i < this.numKeys; i++) {
            const midiNote = this.startNote + i;
            const key = this.createKey(midiNote);
            this.keys.set(midiNote, key);
            this.container.appendChild(key);
        }
    }

    createKey(midiNote) {
        const keyElement = document.createElement('button');
        keyElement.className = `piano-key ${this.isBlackKey(midiNote) ? 'black' : 'white'}`;
        keyElement.dataset.midiNote = midiNote;
        
        // Add key label (computer keyboard mapping)
        const keyLabel = this.getKeyLabel(midiNote);
        if (keyLabel) {
            const labelElement = document.createElement('span');
            labelElement.className = 'key-label';
            labelElement.textContent = keyLabel;
            keyElement.appendChild(labelElement);
        }
        
        // Add MIDI note number
        const midiElement = document.createElement('span');
        midiElement.className = 'midi-note';
        midiElement.textContent = midiNote;
        keyElement.appendChild(midiElement);
        
        return keyElement;
    }

    isBlackKey(midiNote) {
        const note = midiNote % 12;
        return [1, 3, 6, 8, 10].includes(note); // C#, D#, F#, G#, A#
    }

    getKeyLabel(midiNote) {
        // Map MIDI notes to computer keyboard keys
        const keyMappings = {
            60: 'A', 61: 'W', 62: 'S', 63: 'E', 64: 'D',
            65: 'F', 66: 'T', 67: 'G', 68: 'Y', 69: 'H',
            70: 'U', 71: 'J', 72: 'K', 73: 'O', 74: 'L',
            75: 'P'
        };
        return keyMappings[midiNote] || '';
    }

    getNoteName(midiNote) {
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const note = noteNames[midiNote % 12];
        const octave = Math.floor(midiNote / 12) - 1;
        return `${note}${octave}`;
    }

    setupEventListeners() {
        this.container.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.container.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.container.addEventListener('mouseleave', (e) => this.handleMouseLeave(e));
        
        // Touch events for mobile support
        this.container.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.container.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        this.container.addEventListener('touchcancel', (e) => this.handleTouchEnd(e));
        
        // Prevent context menu on right click
        this.container.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    handleMouseDown(e) {
        e.preventDefault();
        const key = e.target.closest('.piano-key');
        if (!key) return;
        
        const midiNote = parseInt(key.dataset.midiNote);
        this.pressKey(midiNote);
    }

    handleMouseUp(e) {
        e.preventDefault();
        const key = e.target.closest('.piano-key');
        if (!key) return;
        
        const midiNote = parseInt(key.dataset.midiNote);
        this.releaseKey(midiNote);
    }

    handleMouseLeave(e) {
        // Release all pressed keys when mouse leaves the keyboard
        this.releaseAllKeys();
    }

    handleTouchStart(e) {
        e.preventDefault();
        
        for (const touch of e.changedTouches) {
            const element = document.elementFromPoint(touch.clientX, touch.clientY);
            const key = element?.closest('.piano-key');
            if (key) {
                const midiNote = parseInt(key.dataset.midiNote);
                this.pressKey(midiNote);
            }
        }
    }

    handleTouchEnd(e) {
        e.preventDefault();
        
        for (const touch of e.changedTouches) {
            const element = document.elementFromPoint(touch.clientX, touch.clientY);
            const key = element?.closest('.piano-key');
            if (key) {
                const midiNote = parseInt(key.dataset.midiNote);
                this.releaseKey(midiNote);
            }
        }
    }

    pressKey(midiNote) {
        if (this.pressedKeys.has(midiNote)) return;
        
        this.pressedKeys.add(midiNote);
        const keyElement = this.keys.get(midiNote);
        
        if (keyElement) {
            keyElement.classList.add('pressed', 'playing');
            
            // Remove playing class after animation
            setTimeout(() => {
                keyElement.classList.remove('playing');
            }, 200);
        }
        
        // Calculate velocity based on touch/click (simplified)
        const velocity = 0.8;
        
        if (this.onNotePress) {
            this.onNotePress(midiNote, velocity);
        }
    }

    releaseKey(midiNote) {
        if (!this.pressedKeys.has(midiNote)) return;
        
        this.pressedKeys.delete(midiNote);
        const keyElement = this.keys.get(midiNote);
        
        if (keyElement) {
            keyElement.classList.remove('pressed');
        }
        
        if (this.onNoteRelease) {
            this.onNoteRelease(midiNote);
        }
    }

    releaseAllKeys() {
        for (const midiNote of this.pressedKeys) {
            this.releaseKey(midiNote);
        }
    }

    setKeyPressed(midiNote, pressed) {
        const keyElement = this.keys.get(midiNote);
        if (!keyElement) return;
        
        if (pressed) {
            keyElement.classList.add('pressed');
            this.pressedKeys.add(midiNote);
        } else {
            keyElement.classList.remove('pressed');
            this.pressedKeys.delete(midiNote);
        }
    }

    highlightKey(midiNote, highlight = true) {
        const keyElement = this.keys.get(midiNote);
        if (!keyElement) return;
        
        if (highlight) {
            keyElement.style.boxShadow = '0 0 10px var(--primary-color)';
        } else {
            keyElement.style.boxShadow = '';
        }
    }

    setRange(startNote, numKeys) {
        this.startNote = startNote;
        this.numKeys = numKeys;
        this.createKeyboard();
    }

    destroy() {
        this.releaseAllKeys();
        this.container.innerHTML = '';
        this.keys.clear();
        this.pressedKeys.clear();
    }
}