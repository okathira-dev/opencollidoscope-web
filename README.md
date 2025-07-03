# OpenCollidoscope Web

An interactive granular synthesizer inspired by the original OpenCollidoscope created by Ben Bengler and Fiore Martin at Queen Mary University of London, Center for Digital Music.

![OpenCollidoscope Web](https://img.shields.io/badge/Status-Complete-brightgreen)
![License](https://img.shields.io/badge/License-GPL_v3-blue)
![Web Audio API](https://img.shields.io/badge/Web_Audio_API-Supported-orange)

## 🎵 What is OpenCollidoscope?

OpenCollidoscope Web is a browser-based implementation of the original hardware/software granular synthesizer. It allows users to record audio in real-time, select portions of the recorded material, and use those selections as source material for granular synthesis with interactive control over grain parameters.

## ✨ Features

### Core Functionality
- **Real-time granular synthesis** with up to 32 simultaneous grains
- **Live audio recording** via microphone input
- **Interactive selection control** with visual waveform display
- **Piano keyboard interface** (both virtual and computer keyboard)
- **MIDI controller support** via Web MIDI API
- **Real-time oscilloscope** for audio output visualization

### Control Parameters (Original Compatible)
- **Selection Size**: MIDI CC1 / UI Slider (1-127 chunks)
- **Grain Duration**: MIDI CC2 / UI Slider (1.0-8.0x multiplier)
- **Filter Cutoff**: MIDI CC7 / UI Slider (50Hz-22050Hz)
- **Loop On/Off**: MIDI CC4 / UI Button
- **Record Trigger**: MIDI CC5 / UI Button

### Input Methods
- **Computer Keyboard**: `A S D F G H J K L` (white keys) / `W E T Y U O P` (black keys)
- **Virtual Piano**: Click/touch interface
- **MIDI Controllers**: External MIDI device support
- **Microphone**: Real-time audio recording

## 🚀 Quick Start

### 1. Open in Browser
Simply open `index.html` in a modern web browser:
```bash
# Using Python 3 (recommended for local development)
python -m http.server 8000

# Or using Node.js
npx serve .

# Then open: http://localhost:8000
```

### 2. Initialize Audio System
1. Click **"Start Audio"** button to initialize Web Audio API
2. Allow microphone access when prompted (for recording functionality)

### 3. Record Your First Sample
1. Click **"Record"** button or press `R` key
2. Make some sound (voice, instrument, etc.)
3. Click **"Stop"** to finish recording

### 4. Play with Granular Synthesis
1. Use the selection controls to choose which part of your recording to granularize
2. Adjust grain parameters with the sliders
3. Play notes using:
   - Computer keyboard keys
   - Virtual piano keyboard
   - Connected MIDI controller

## 🎮 Controls Reference

### Keyboard Shortcuts
| Key | Function |
|-----|----------|
| `Space` | Toggle Loop On/Off |
| `R` | Toggle Recording |
| `F` | Toggle Fullscreen |
| `A-L` | Piano white keys (C4-D5) |
| `W,E,T,Y,U,O,P` | Piano black keys |

### MIDI Controller Mapping
| MIDI Message | Function | Range |
|--------------|----------|-------|
| Note On/Off | Trigger grains with pitch | MIDI Note 60 = C4 (no pitch shift) |
| CC 1 | Selection Size | 0-127 |
| CC 2 | Grain Duration Coefficient | 0-127 (maps to 1.0-8.0x) |
| CC 4 | Loop On/Off | >0 = On, 0 = Off |
| CC 5 | Record Trigger | >0 = Start Recording |
| CC 7 | Filter Cutoff | 0-127 (50Hz-22050Hz) |
| Pitch Bend | Selection Start Position | 14-bit value |

## 🏗️ Technical Implementation

### Architecture
- **Frontend**: Vanilla JavaScript (ES6 Modules)
- **Audio Engine**: Web Audio API with granular synthesis
- **UI Framework**: HTML5 Canvas + Modern CSS
- **Input Handling**: Web MIDI API + getUserMedia

### Browser Compatibility
- **Chrome/Edge**: Full support ✅
- **Firefox**: Full support ✅
- **Safari**: Core functionality ✅
- **Mobile**: Touch support ✅

### Performance
- **Maximum Grains**: 32 simultaneous (matching original)
- **Sample Rate**: 44.1kHz (browser dependent)
- **Latency**: Optimized for real-time performance
- **Memory**: Efficient buffer management

## 📁 Project Structure

```
opencollidoscope-web/
├── index.html                 # Main application entry point
├── src/
│   ├── main.js                # Main application controller
│   ├── audio/
│   │   ├── GranularSynth.js   # Core granular synthesis engine
│   │   ├── AudioRecorder.js   # Microphone recording
│   │   └── MIDIHandler.js     # MIDI input handling
│   ├── ui/
│   │   ├── PianoKeyboard.js   # Virtual piano interface
│   │   ├── WaveformDisplay.js # Waveform visualization
│   │   └── Oscilloscope.js    # Real-time oscilloscope
│   └── styles/
│       ├── main.css           # Core application styles
│       ├── keyboard.css       # Piano keyboard styles
│       └── controls.css       # Control interface styles
└── opencollidoscope/          # Original C++ source code (reference)
```

## 🔧 Development

### Local Development
```bash
# Clone the repository
git clone [repository-url]
cd opencollidoscope-web

# Start local server
python -m http.server 8000

# Open http://localhost:8000
```

### Code Style
- **JavaScript**: ES6+ features, modular architecture
- **CSS**: CSS Grid, CSS Variables, BEM methodology
- **HTML**: Semantic markup, accessibility-first

## 🎛️ Advanced Usage

### Custom Sample Loading
1. Click "Upload Samples" to load your own audio files
2. Supported formats: WAV, MP3, OGG, FLAC
3. Click on uploaded samples to make them active for granular synthesis

### Performance Optimization
- Use shorter audio samples for better performance
- Adjust grain count and duration for your hardware capabilities
- Enable/disable visual effects based on performance needs

## 🐛 Troubleshooting

### Common Issues

**No Audio Output**
- Ensure browser supports Web Audio API
- Check if "Start Audio" button was clicked
- Verify system audio output is working

**Microphone Not Working**
- Grant microphone permissions in browser
- Check browser console for permission errors
- Ensure microphone is not in use by other applications

**MIDI Controller Not Recognized**
- Enable Web MIDI API in browser settings (Chrome://flags)
- Ensure MIDI device is connected before starting the application
- Check browser console for MIDI connection status

**Performance Issues**
- Reduce number of active grains
- Lower audio buffer size in browser settings
- Close other browser tabs/applications

## 📜 License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](opencollidoscope/GPLv3_license.txt) file for details.

## 🙏 Acknowledgments

- **Original OpenCollidoscope**: Ben Bengler, Fiore Martin @ Queen Mary University of London
- **Inspiration**: SuperCollider TGrains UGen, Ross Bencina's "Implementing Real-Time Granular Synthesis"
- **Web Audio API**: Modern web standards for professional audio applications

## 🔗 Links

- [Original OpenCollidoscope Project](http://code.soundsoftware.ac.uk/projects/opencollidoscope)
- [Queen Mary University of London - Centre for Digital Music](https://www.qmul.ac.uk/dmrn/)
- [Web Audio API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

---

**Built with ❤️ using Web Audio API and modern web technologies**
