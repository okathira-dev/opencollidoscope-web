import { Box, Button, Typography } from "@mui/material";
import { useCallback, useEffect } from "react";

interface PianoKeyboardProps {
  onNotePlay: (midiNote: number) => void;
}

const midiNotes = [
  { note: "C", midi: 60, key: "a" },
  { note: "C#", midi: 61, key: "w" },
  { note: "D", midi: 62, key: "s" },
  { note: "D#", midi: 63, key: "e" },
  { note: "E", midi: 64, key: "d" },
  { note: "F", midi: 65, key: "f" },
  { note: "F#", midi: 66, key: "t" },
  { note: "G", midi: 67, key: "g" },
  { note: "G#", midi: 68, key: "y" },
  { note: "A", midi: 69, key: "h" },
  { note: "A#", midi: 70, key: "u" },
  { note: "B", midi: 71, key: "j" },
  { note: "C", midi: 72, key: "k" },
];

export const PianoKeyboard = ({ onNotePlay }: PianoKeyboardProps) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const note = midiNotes.find((n) => n.key === event.key);
      if (note) {
        onNotePlay(note.midi);
      }
    },
    [onNotePlay],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        p: 2,
        border: "1px solid grey",
        bgcolor: "background.default",
        borderRadius: 1,
      }}
    >
      {midiNotes.map((note) => (
        <Button
          key={note.midi}
          variant="outlined"
          onClick={() => onNotePlay(note.midi)}
          sx={{
            minWidth: note.note.includes("#") ? "30px" : "50px",
            height: "100px",
            backgroundColor: note.note.includes("#") ? "black" : "white",
            color: note.note.includes("#") ? "white" : "black",
            border: "1px solid grey",
            margin: "0 2px",
            position: "relative",
            zIndex: note.note.includes("#") ? 1 : 0,
            left: note.note.includes("#") ? "-25px" : "0",
            right: note.note.includes("#") ? "-25px" : "0",
            "&:hover": {
              backgroundColor: note.note.includes("#") ? "#333" : "#eee",
            },
          }}
        >
          <Box sx={{ position: "absolute", bottom: 5 }}>
            <Typography variant="caption">{note.note}</Typography>
            <Typography variant="caption">({note.key})</Typography>
          </Box>
        </Button>
      ))}
    </Box>
  );
};
