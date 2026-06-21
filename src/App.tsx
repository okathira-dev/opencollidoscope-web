import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { useCallback, useMemo, useState } from "react";

import spikeProcessorUrl from "./features/synth-engine/worklets/spike-processor.ts?worker&url";

type WorkletTestStatus = "idle" | "running" | "success" | "error";

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
  const [workletStatus, setWorkletStatus] = useState<WorkletTestStatus>("idle");
  const [workletMessage, setWorkletMessage] = useState<string>("");

  const crossOriginIsolated = self.crossOriginIsolated;
  const sharedArrayBufferAvailable = useMemo(() => isSharedArrayBufferAvailable(), []);

  const runWorkletTest = useCallback(async () => {
    setWorkletStatus("running");
    setWorkletMessage("");

    try {
      const audioContext = new AudioContext();
      await audioContext.resume();
      await audioContext.audioWorklet.addModule(spikeProcessorUrl);
      const node = new AudioWorkletNode(audioContext, "spike-processor");
      node.disconnect();
      await audioContext.close();

      setWorkletStatus("success");
      setWorkletMessage("addModule と AudioWorkletNode の生成に成功しました。");
    } catch (error) {
      setWorkletStatus("error");
      setWorkletMessage(error instanceof Error ? error.message : String(error));
    }
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
            disabled={workletStatus === "running"}
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
      </Box>
    </Container>
  );
}
