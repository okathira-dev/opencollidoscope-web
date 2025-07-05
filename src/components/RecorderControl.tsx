import { Button, Typography, Box } from "@mui/material";

interface RecorderControlProps {
  isRecording: boolean;
  startRecording: () => void;
  error: string | null;
}

export const RecorderControl = ({
  isRecording,
  startRecording,
  error,
}: RecorderControlProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
      }}
    >
      <Button
        variant="contained"
        onClick={startRecording}
        disabled={isRecording}
        size="large"
      >
        {isRecording ? "RECORDING..." : "RECORD"}
      </Button>
      {error && (
        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};
