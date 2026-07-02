import { Box } from "@mui/material";

export interface WaveDisplayPlaceholderProps {
  accentColor: string;
}

/** Wave 1 等、未配線ディスプレイ枠。波形データ・RAF・操作は持たない */
export function WaveDisplayPlaceholder({ accentColor }: WaveDisplayPlaceholderProps) {
  return (
    <Box
      aria-hidden
      sx={{
        width: "100%",
        height: "100%",
        minHeight: 0,
        bgcolor: "#000000",
        boxSizing: "border-box",
        borderBottom: `2px solid ${accentColor}`,
      }}
    />
  );
}
