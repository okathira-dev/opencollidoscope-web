import { Box, Grid, Typography } from "@mui/material";
import { useRef } from "react";

import { OscilloscopeDisplay } from "./OscilloscopeDisplay";
import { PianoKeyboard } from "./PianoKeyboard";
import { RecorderControl } from "./RecorderControl";
import { SelectionSlider } from "./SelectionSlider";
import { SynthControls } from "./SynthControls";
import { WaveformDisplay } from "./WaveformDisplay";
import { useAudioContext } from "../hooks/useAudioContext";
import { useGranularSynth } from "../hooks/useGranularSynth";
import { useRecorder } from "../hooks/useRecorder";

export const SynthEngine = () => {
  const { error: audioContextError } = useAudioContext();
  const {
    isRecording,
    audioBuffer,
    error: recorderError,
    startRecording,
  } = useRecorder();
  const particleTriggerRef = useRef<(x: number, y: number) => void>();
  const { play, setMasterVolume } = useGranularSynth(
    audioBuffer,
    particleTriggerRef,
  );

  const combinedError = audioContextError || recorderError;

  return (
    <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 2 }}>
      {combinedError && (
        <Typography
          color="error"
          variant="h6"
          sx={{ mb: 2, textAlign: "center" }}
        >
          Error: {combinedError}
        </Typography>
      )}
      <Grid container spacing={3}>
        {/* レコーダーコントロールとオシロスコープ */}
        <Grid item xs={12} md={6}>
          <RecorderControl
            isRecording={isRecording}
            startRecording={startRecording}
            error={recorderError}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <OscilloscopeDisplay />
        </Grid>

        {/* 波形表示 */}
        <Grid item xs={12}>
          <WaveformDisplay
            audioBuffer={audioBuffer}
            particleTriggerRef={particleTriggerRef}
          />
        </Grid>

        {/* スライダーとその他のシンセコントロールを横並びに */}
        <Grid item xs={12} md={6}>
          <SelectionSlider />
        </Grid>
        <Grid item xs={12} md={6}>
          <SynthControls setMasterVolume={setMasterVolume} />
        </Grid>

        {/* ピアノキーボード */}
        <Grid item xs={12}>
          <PianoKeyboard onNotePlay={play} />
        </Grid>
      </Grid>
    </Box>
  );
};
