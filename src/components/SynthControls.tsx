import {
  Box,
  FormControlLabel,
  Slider,
  Switch,
  Typography,
} from "@mui/material";
import { useState, useEffect } from "react";

import {
  MAX_GRAIN_DURATION_COEFF,
  MIN_FILTER_CUTOFF_FREQ,
  MAX_FILTER_CUTOFF_FREQ,
  DEFAULT_MASTER_VOLUME,
} from "../constants/config";
import { useSynthStore } from "../store/synthStore";

interface SynthControlsProps {
  setMasterVolume: (volume: number) => void;
}

export const SynthControls = ({ setMasterVolume }: SynthControlsProps) => {
  const {
    grainDuration,
    setGrainDuration,
    filterCutoff,
    setFilterCutoff,
    loop,
    toggleLoop,
  } = useSynthStore();
  const [localMasterVolume, setLocalMasterVolume] = useState(
    DEFAULT_MASTER_VOLUME,
  ); // マスターボリュームの初期値

  // マスターボリュームの変更をuseGranularSynthに伝える
  useEffect(() => {
    setMasterVolume(localMasterVolume);
  }, [localMasterVolume, setMasterVolume]);

  const handleGrainDurationChange = (_: Event, newValue: number | number[]) => {
    setGrainDuration(newValue as number);
  };

  const handleFilterCutoffChange = (_: Event, newValue: number | number[]) => {
    setFilterCutoff(newValue as number);
  };

  const handleMasterVolumeChange = (_: Event, newValue: number | number[]) => {
    setLocalMasterVolume(newValue as number);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        p: 2,
        border: "1px solid grey",
        bgcolor: "background.default",
        borderRadius: 1,
      }}
    >
      <Typography variant="h6">
        Grain Duration: {grainDuration.toFixed(1)}
      </Typography>
      <Slider
        value={grainDuration}
        onChange={handleGrainDurationChange}
        min={1}
        max={MAX_GRAIN_DURATION_COEFF}
        step={0.1}
        aria-labelledby="grain-duration-slider"
        valueLabelDisplay="auto"
      />

      <Typography variant="h6">
        Filter Cutoff: {filterCutoff.toFixed(0)} Hz
      </Typography>
      <Slider
        value={filterCutoff}
        onChange={handleFilterCutoffChange}
        min={MIN_FILTER_CUTOFF_FREQ}
        max={MAX_FILTER_CUTOFF_FREQ}
        step={10}
        aria-labelledby="filter-cutoff-slider"
        valueLabelDisplay="auto"
      />

      <Typography variant="h6">
        Master Volume: {localMasterVolume.toFixed(1)}
      </Typography>
      <Slider
        value={localMasterVolume}
        onChange={handleMasterVolumeChange}
        min={0}
        max={1}
        step={0.05}
        aria-labelledby="master-volume-slider"
        valueLabelDisplay="auto"
      />

      <FormControlLabel
        control={<Switch checked={loop} onChange={toggleLoop} />}
        label={<Typography variant="h6">Loop</Typography>}
      />
    </Box>
  );
};
