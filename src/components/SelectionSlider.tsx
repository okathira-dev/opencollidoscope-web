import { Box, Slider, Typography } from "@mui/material";

import { useSynthStore } from "../store/synthStore";
import { SELECTION_SCALE_FACTOR } from "../constants/config";

export const SelectionSlider = () => {
  const { selectionStart, setSelectionStart, selectionSize, setSelectionSize } =
    useSynthStore();

  const handleStartChange = (_: Event, newValue: number | number[]) => {
    setSelectionStart(newValue as number);
  };

  const handleSizeChange = (event: React.WheelEvent<HTMLDivElement>) => {
    const newSize = selectionSize + (event.deltaY > 0 ? -1 : 1);
    if (newSize >= 1 && newSize <= SELECTION_SCALE_FACTOR) {
      setSelectionSize(newSize);
    }
  };

  return (
    <Box
      sx={{
        p: 2,
        border: "1px solid grey",
        bgcolor: "background.default",
        borderRadius: 1,
      }}
    >
      <Typography variant="h6" gutterBottom>
        Selection Start: {selectionStart}
      </Typography>
      <div onWheel={handleSizeChange}>
        <Slider
          value={selectionStart}
          onChange={handleStartChange}
          min={0}
          max={SELECTION_SCALE_FACTOR}
          aria-labelledby="selection-start-slider"
          valueLabelDisplay="auto"
        />
      </div>
      <Typography variant="h6" gutterBottom>
        Selection Size: {selectionSize}
      </Typography>
    </Box>
  );
};
