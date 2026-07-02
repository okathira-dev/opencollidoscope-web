import { Box } from "@mui/material";

import { OctaveButton } from "./OctaveButton.tsx";
import { PianoKeyboard } from "./PianoKeyboard.tsx";

interface KeyboardClusterProps {
  disabled?: boolean;
}

export function KeyboardCluster({ disabled = false }: KeyboardClusterProps) {
  return (
    <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1 }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1, pb: 0.5 }}>
        <OctaveButton direction="down" disabled={disabled} />
        <OctaveButton direction="up" disabled={disabled} />
      </Box>
      <PianoKeyboard disabled={disabled} />
    </Box>
  );
}
