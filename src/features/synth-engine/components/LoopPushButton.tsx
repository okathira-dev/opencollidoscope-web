import LoopIcon from "@mui/icons-material/Loop";
import { Box, IconButton, Typography } from "@mui/material";

export interface LoopPushButtonProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  disabled?: boolean;
}

export function LoopPushButton({ enabled, onToggle, disabled = false }: LoopPushButtonProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 0.5,
        minWidth: 56,
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <Typography variant="caption" color="text.secondary">
        Loop
      </Typography>
      <IconButton
        onClick={() => onToggle(!enabled)}
        disabled={disabled}
        aria-label={enabled ? "ループ OFF" : "ループ ON"}
        aria-pressed={enabled}
        sx={{
          width: 40,
          height: 40,
          border: "2px solid #555",
          borderRadius: "50%",
          bgcolor: enabled ? "rgba(255, 204, 0, 0.35)" : "rgba(255,255,255,0.05)",
          boxShadow: enabled ? "0 0 10px rgba(255, 204, 0, 0.6)" : "none",
          "&:hover": {
            bgcolor: enabled ? "rgba(255, 204, 0, 0.45)" : "rgba(255,255,255,0.1)",
          },
        }}
      >
        <LoopIcon sx={{ fontSize: 20, color: enabled ? "#ffcc00" : "text.secondary" }} />
      </IconButton>
    </Box>
  );
}
