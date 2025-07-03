import { Box, Typography, Container } from "@mui/material";
import { useState } from "react";
import * as Tone from "tone";
import { SampleLoader } from "./components/SampleLoader.tsx";
import { PianoKeyboard } from "./components/PianoKeyboard.tsx";
import { useGrainSynth } from "./hooks/useGrainSynth.ts";

export function App() {
  const [buffer, setBuffer] = useState<Tone.ToneAudioBuffer | null>(null);
  const { playNote } = useGrainSynth(buffer);

  return (
    <Container sx={{ position: "relative" }}>
      <Typography variant="h1" sx={{ fontSize: "2rem", mt: 3, mb: 3 }}>
        Open Collidoscope Web App
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <SampleLoader onLoaded={(buf) => setBuffer(buf)} />
        <PianoKeyboard onNote={playNote} />
      </Box>
    </Container>
  );
}
