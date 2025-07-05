import {
  Box,
  Typography,
  Container,
  Slider,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { useState } from "react";

import { PianoKeyboard } from "./components/PianoKeyboard.tsx";
import { SampleLoader } from "./components/SampleLoader.tsx";
import { Waveform } from "./components/Waveform.tsx";
import { useGrainSynth } from "./hooks/useGrainSynth.ts";

import type * as Tone from "tone";

export function App() {
  const [buffer, setBuffer] = useState<Tone.ToneAudioBuffer | null>(null);
  const {
    selection,
    setSelection,
    grainDuration,
    setGrainDuration,
    loop,
    toggleLoop,
    playNote,
  } = useGrainSynth(buffer);

  return (
    <Container sx={{ position: "relative" }}>
      <Typography variant="h1" sx={{ fontSize: "2rem", mt: 3, mb: 3 }}>
        Open Collidoscope Web App
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <SampleLoader onLoaded={(buf) => setBuffer(buf)} />

        {buffer && (
          <>
            <Waveform buffer={buffer.get() ?? null} selection={selection} />

            {/* Selection Range Slider */}
            <Box sx={{ px: 2 }}>
              <Typography gutterBottom>Selection (Start / End %)</Typography>
              <Slider
                value={[
                  (selection[0] / buffer.duration) * 100,
                  (selection[1] / buffer.duration) * 100,
                ]}
                onChange={(_, val) => {
                  const [startP = 0, endP = 100] = val as number[];
                  setSelection([
                    (startP / 100) * buffer.duration,
                    (endP / 100) * buffer.duration,
                  ]);
                }}
                valueLabelDisplay="auto"
              />
            </Box>

            {/* Grain Duration */}
            <Box sx={{ px: 2 }}>
              <Typography gutterBottom>Grain Duration (ms)</Typography>
              <Slider
                value={grainDuration * 1000}
                min={20}
                max={500}
                step={5}
                onChange={(_, v) => {
                  setGrainDuration((v as number) / 1000);
                }}
                valueLabelDisplay="auto"
              />
            </Box>

            {/* Loop Toggle */}
            <FormControlLabel
              control={<Switch checked={loop} onChange={toggleLoop} />}
              label="Loop"
            />
          </>
        )}
        <PianoKeyboard onNote={playNote} />
      </Box>
    </Container>
  );
}
