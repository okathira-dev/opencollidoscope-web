/**
 * Open Collidoscope Web Application
 * Based on the original C++ implementation with modern React architecture
 */

import {
  ThemeProvider,
  CssBaseline,
  Box,
  Typography,
  Paper,
} from "@mui/material";
import { useEffect, useCallback } from "react";

// Components
import { PianoKeyboard } from "./components/PianoKeyboard";
import { RecorderControl } from "./components/RecorderControl";
import { SynthControls } from "./components/SynthControls";
import { WaveformDisplay } from "./components/WaveformDisplay";
import {
  useCollidoscopeActions,
  useIsInitialized,
} from "./store/CollidoscopeStore";
import theme from "./theme";

import type React from "react";

const App: React.FC = () => {
  const actions = useCollidoscopeActions();
  const isInitialized = useIsInitialized();

  // Initialize the application
  useEffect(() => {
    let mounted = true;

    const initializeApp = async () => {
      try {
        await actions.initialize();
        if (mounted) {
          console.log("Collidoscope initialized successfully");
        }
      } catch (error) {
        console.error("Failed to initialize Collidoscope:", error);
      }
    };

    void initializeApp();

    return () => {
      mounted = false;
      actions.cleanup();
    };
  }, []); // 依存配列を空にして一度だけ実行

  // Handle keyboard events
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      event.preventDefault();
      actions.handleKeyDown(event.key);
    },
    [actions],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  if (!isInitialized) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            backgroundColor: "background.default",
          }}
        >
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h4" gutterBottom>
              Open Collidoscope Web
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Initializing audio engine...
            </Typography>
          </Paper>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          backgroundColor: "background.default",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Open Collidoscope Web
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Interactive granular synthesizer - Press R to record, A to play
          </Typography>
        </Box>

        {/* Main Content */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            p: 2,
            gap: 2,
          }}
        >
          {/* Waveform Display */}
          <Paper sx={{ p: 2, flex: 1, minHeight: 200 }}>
            <WaveformDisplay audioBuffer={null} />
          </Paper>

          {/* Controls */}
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            {/* Recorder */}
            <Paper sx={{ p: 2, minWidth: 200 }}>
              <RecorderControl
                isRecording={false}
                startRecording={() => {}}
                error={null}
              />
            </Paper>

            {/* Piano Keyboard */}
            <Paper sx={{ p: 2, flex: 1, minWidth: 300 }}>
              <PianoKeyboard onNotePlay={() => {}} />
            </Paper>

            {/* Synth Controls */}
            <Paper sx={{ p: 2, minWidth: 250 }}>
              <SynthControls setMasterVolume={() => {}} />
            </Paper>
          </Box>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            p: 1,
            borderTop: 1,
            borderColor: "divider",
            textAlign: "center",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Keyboard: R=Record, A=Play, Space=Loop, W/S=Selection Size,
            A/D=Selection Position, 9/0=Grain Duration, F=Fullscreen
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default App;
