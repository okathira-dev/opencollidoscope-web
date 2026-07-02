import { Box, IconButton, Typography } from "@mui/material";

export interface RecordButtonProps {
  isRecording: boolean;
  onToggle: () => void;
  disabled?: boolean;
  statusText?: string;
}

export function RecordButton({
  isRecording,
  onToggle,
  disabled = false,
  statusText,
}: RecordButtonProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
        minWidth: 72,
      }}
    >
      <Box
        sx={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 64,
          height: 64,
        }}
      >
        {isRecording && (
          <Box
            sx={{
              position: "absolute",
              width: 56,
              height: 56,
              borderRadius: "50%",
              border: "2px solid #f3063e",
              "@keyframes recordPulse": {
                "0%": { boxShadow: "0 0 0 0 rgba(243, 6, 62, 0.7)" },
                "70%": { boxShadow: "0 0 0 12px rgba(243, 6, 62, 0)" },
                "100%": { boxShadow: "0 0 0 0 rgba(243, 6, 62, 0)" },
              },
              animation: "recordPulse 1.5s ease-out infinite",
            }}
          />
        )}
        <IconButton
          onClick={onToggle}
          disabled={disabled}
          aria-label={isRecording ? "録音停止" : "録音"}
          sx={{
            width: 48,
            height: 48,
            bgcolor: isRecording ? "#f3063e" : "#8b0000",
            border: "3px solid #444",
            borderRadius: "50%",
            boxShadow: isRecording
              ? "0 0 12px rgba(243, 6, 62, 0.8), inset 0 0 8px rgba(255,255,255,0.2)"
              : "inset 0 2px 4px rgba(0,0,0,0.5)",
            "&:hover": {
              bgcolor: isRecording ? "#ff1a4a" : "#a00000",
            },
            "&.Mui-disabled": {
              bgcolor: "#333",
              borderColor: "#222",
            },
          }}
        >
          <Box
            sx={{
              width: isRecording ? 16 : 20,
              height: isRecording ? 16 : 20,
              borderRadius: isRecording ? 2 : "50%",
              bgcolor: "#fff",
            }}
          />
        </IconButton>
      </Box>
      {statusText !== undefined && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ textAlign: "center", maxWidth: 100, lineHeight: 1.2 }}
        >
          {statusText}
        </Typography>
      )}
    </Box>
  );
}
