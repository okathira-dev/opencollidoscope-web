import { Box } from "@mui/material";

interface SpeakerGrilleProps {
  size?: number;
}

export function SpeakerGrille({ size = 48 }: SpeakerGrilleProps) {
  return (
    <Box
      role="img"
      aria-label="スピーカー（装飾）"
      sx={{
        width: size,
        height: size,
        borderRadius: "50%",
        border: "2px solid #333",
        bgcolor: "#1a1a1a",
        backgroundImage: `
          radial-gradient(circle at center, #333 0, #333 2px, transparent 2px),
          radial-gradient(circle at center, transparent 6px, #222 6px, #222 7px, transparent 7px)
        `,
        backgroundSize: "8px 8px, 100% 100%",
        flexShrink: 0,
        pointerEvents: "none",
      }}
    />
  );
}
