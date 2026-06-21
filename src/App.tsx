import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  List,
  ListItem,
  ListItemText,
  Slider,
  Stack,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import spikeProcessorUrl from "./features/synth-engine/worklets/spike-processor.ts?worker&url";

type WorkletTestStatus = "idle" | "running" | "success" | "error";

const DEFAULT_VOLUME = 0.3;

function isSharedArrayBufferAvailable(): boolean {
  try {
    return typeof SharedArrayBuffer !== "undefined" && new SharedArrayBuffer(1).byteLength === 1;
  } catch {
    return false;
  }
}

function StatusChip({ ok, label }: { ok: boolean; label: string }) {
  return <Chip label={label} color={ok ? "success" : "error"} size="small" variant="outlined" />;
}

export function App() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const [workletStatus, setWorkletStatus] = useState<WorkletTestStatus>("idle");
  const [workletMessage, setWorkletMessage] = useState<string>("");
  const [audioReady, setAudioReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(DEFAULT_VOLUME);

  const crossOriginIsolated = self.crossOriginIsolated;
  const sharedArrayBufferAvailable = useMemo(() => isSharedArrayBufferAvailable(), []);

  useEffect(() => {
    const gainNode = gainNodeRef.current;
    if (gainNode) {
      gainNode.gain.value = volume;
    }
  }, [volume]);

  useEffect(() => {
    return () => {
      workletNodeRef.current?.disconnect();
      gainNodeRef.current?.disconnect();
      void audioContextRef.current?.close();
      audioContextRef.current = null;
      workletNodeRef.current = null;
      gainNodeRef.current = null;
    };
  }, []);

  const runWorkletTest = useCallback(async () => {
    setWorkletStatus("running");
    setWorkletMessage("");

    try {
      if (!audioContextRef.current) {
        const audioContext = new AudioContext();
        await audioContext.resume();
        await audioContext.audioWorklet.addModule(spikeProcessorUrl);

        const workletNode = new AudioWorkletNode(audioContext, "spike-processor");
        const gainNode = audioContext.createGain();
        gainNode.gain.value = volume;

        workletNode.connect(gainNode);

        audioContextRef.current = audioContext;
        workletNodeRef.current = workletNode;
        gainNodeRef.current = gainNode;
      }

      setAudioReady(true);
      setWorkletStatus("success");
      setWorkletMessage(
        "addModule と AudioWorkletNode の生成に成功しました。再生ボタンで音を確認できます。",
      );
    } catch (error) {
      setWorkletStatus("error");
      setWorkletMessage(error instanceof Error ? error.message : String(error));
    }
  }, [volume]);

  const startPlayback = useCallback(async () => {
    const audioContext = audioContextRef.current;
    const gainNode = gainNodeRef.current;
    if (!audioContext || !gainNode) {
      return;
    }

    await audioContext.resume();
    gainNode.connect(audioContext.destination);
    setIsPlaying(true);
  }, []);

  const stopPlayback = useCallback(() => {
    gainNodeRef.current?.disconnect();
    setIsPlaying(false);
  }, []);

  const handleVolumeChange = useCallback((_: Event, value: number | number[]) => {
    setVolume(Array.isArray(value) ? (value[0] ?? DEFAULT_VOLUME) : value);
  }, []);

  return (
    <Container sx={{ position: "relative", py: 3 }}>
      <Typography variant="h1" sx={{ fontSize: "2rem", mb: 1 }}>
        Open Collidoscope Web App
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        M1 スパイク: AudioWorklet + coi-serviceworker 診断
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <Alert severity="info">
          GitHub Pages では初回アクセス時に coi-serviceworker によりページが 1 回リロードされます。
        </Alert>

        <Box>
          <Typography variant="h6" sx={{ mb: 1 }}>
            隔離状態
          </Typography>
          <List dense disablePadding>
            <ListItem disableGutters>
              <ListItemText primary="crossOriginIsolated" secondary={String(crossOriginIsolated)} />
              <StatusChip ok={crossOriginIsolated} label={crossOriginIsolated ? "OK" : "NG"} />
            </ListItem>
            <ListItem disableGutters>
              <ListItemText
                primary="SharedArrayBuffer"
                secondary={sharedArrayBufferAvailable ? "利用可能" : "利用不可"}
              />
              <StatusChip
                ok={sharedArrayBufferAvailable}
                label={sharedArrayBufferAvailable ? "OK" : "NG"}
              />
            </ListItem>
          </List>
        </Box>

        <Box>
          <Typography variant="h6" sx={{ mb: 1 }}>
            AudioWorklet テスト
          </Typography>
          <Button
            variant="contained"
            onClick={runWorkletTest}
            disabled={workletStatus === "running" || audioReady}
          >
            {workletStatus === "running" ? "テスト中..." : "AudioWorklet テスト"}
          </Button>
          {workletStatus !== "idle" && (
            <Alert
              severity={
                workletStatus === "success"
                  ? "success"
                  : workletStatus === "error"
                    ? "error"
                    : "info"
              }
              sx={{ mt: 2 }}
            >
              {workletStatus === "running"
                ? "AudioContext 初期化と Worklet ロードを実行中..."
                : workletMessage}
            </Alert>
          )}
        </Box>

        <Box>
          <Stack direction="row" spacing={1} sx={{ mb: 1, alignItems: "center" }}>
            <Typography variant="h6">音声出力テスト</Typography>
            {isPlaying && <Chip label="再生中" color="primary" size="small" />}
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            440Hz サイン波を AudioWorklet 経由で出力します。
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Button variant="contained" onClick={startPlayback} disabled={!audioReady || isPlaying}>
              再生
            </Button>
            <Button variant="outlined" onClick={stopPlayback} disabled={!audioReady || !isPlaying}>
              停止
            </Button>
          </Stack>
          <Typography variant="body2" gutterBottom>
            音量: {Math.round(volume * 100)}%
          </Typography>
          <Slider
            value={volume}
            min={0}
            max={1}
            step={0.01}
            onChange={handleVolumeChange}
            disabled={!audioReady}
            aria-label="音量"
          />
        </Box>
      </Box>
    </Container>
  );
}
