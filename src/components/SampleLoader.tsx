import { Box, Button, Input } from "@mui/material";
import { useState, useEffect } from "react";
import * as Tone from "tone";

import type { ChangeEvent } from "react";

interface Props {
  onLoaded: (buffer: Tone.ToneAudioBuffer) => void;
}

export function SampleLoader({ onLoaded }: Props) {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!fileUrl) return;
    setLoading(true);
    const buffer = new Tone.ToneAudioBuffer(fileUrl, () => {
      setLoading(false);
      onLoaded(buffer);
    });
  }, [fileUrl, onLoaded]);

  return (
    <Box>
      <Input
        type="file"
        inputProps={{ accept: "audio/*" }}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const url = URL.createObjectURL(file);
          setFileUrl(url);
        }}
      />
      {loading && <span>Loading...</span>}
      {fileUrl && !loading && <Button onClick={() => { void Tone.start(); }}>Start Audio</Button>}
    </Box>
  );
}