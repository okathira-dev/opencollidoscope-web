import SettingsIcon from "@mui/icons-material/Settings";
import { Box, Drawer, Fab, IconButton, Slider, Tab, Tabs, Typography } from "@mui/material";
import { useCallback, useState } from "react";

import { useConfigAudio, useResetConfig, useUpdateConfig } from "../../../stores/config-store.ts";
import {
  useCloseConfigPanel,
  useIsConfigPanelOpen,
  useToggleConfigPanel,
} from "../../../stores/ui-store.ts";

const DRAWER_WIDTH = 320;

function AudioTab() {
  const audio = useConfigAudio();
  const updateConfig = useUpdateConfig();
  const resetConfig = useResetConfig();

  const handleWaveLengthChange = useCallback(
    (_: Event, value: number | number[]) => {
      const waveLength = Array.isArray(value) ? (value[0] ?? audio.waveLength) : value;
      updateConfig({ audio: { waveLength } });
    },
    [audio.waveLength, updateConfig],
  );

  const handleChunkCountChange = useCallback(
    (_: Event, value: number | number[]) => {
      const chunkCount = Array.isArray(value) ? (value[0] ?? audio.chunkCount) : value;
      updateConfig({ audio: { chunkCount: Math.round(chunkCount) } });
    },
    [audio.chunkCount, updateConfig],
  );

  const handleAttenuationChange = useCallback(
    (_: Event, value: number | number[]) => {
      const attenuation = Array.isArray(value) ? (value[0] ?? audio.attenuation) : value;
      updateConfig({ audio: { attenuation } });
    },
    [audio.attenuation, updateConfig],
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 2 }}>
      <Box>
        <Typography variant="body2" gutterBottom>
          録音時間: {audio.waveLength.toFixed(1)} 秒
        </Typography>
        <Slider
          value={audio.waveLength}
          min={0.1}
          max={10}
          step={0.1}
          onChange={handleWaveLengthChange}
          aria-label="録音時間"
        />
      </Box>

      <Box>
        <Typography variant="body2" gutterBottom>
          チャンク数: {audio.chunkCount}
        </Typography>
        <Slider
          value={audio.chunkCount}
          min={1}
          max={1000}
          step={1}
          onChange={handleChunkCountChange}
          aria-label="チャンク数"
        />
      </Box>

      <Box>
        <Typography variant="body2" gutterBottom>
          アテニュエーション: {audio.attenuation.toFixed(3)}
        </Typography>
        <Slider
          value={audio.attenuation}
          min={0}
          max={1}
          step={0.001}
          onChange={handleAttenuationChange}
          aria-label="アテニュエーション"
        />
      </Box>

      <Typography
        component="button"
        type="button"
        onClick={resetConfig}
        sx={{
          alignSelf: "flex-start",
          background: "none",
          border: "none",
          color: "primary.main",
          cursor: "pointer",
          p: 0,
          textDecoration: "underline",
        }}
      >
        設定をリセット
      </Typography>
    </Box>
  );
}

export function ConfigPanel() {
  const isOpen = useIsConfigPanelOpen();
  const toggleConfigPanel = useToggleConfigPanel();
  const closeConfigPanel = useCloseConfigPanel();
  const [tabIndex, setTabIndex] = useState(0);

  return (
    <>
      {!isOpen && (
        <Fab
          color="primary"
          aria-label="設定パネルを開く"
          onClick={toggleConfigPanel}
          sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 1200 }}
        >
          <SettingsIcon />
        </Fab>
      )}

      <Drawer
        variant="persistent"
        anchor="right"
        open={isOpen}
        sx={{
          width: isOpen ? DRAWER_WIDTH : 0,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            p: 2,
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h6">設定</Typography>
          <IconButton aria-label="設定パネルを閉じる" onClick={closeConfigPanel} size="small">
            <SettingsIcon />
          </IconButton>
        </Box>

        <Tabs value={tabIndex} onChange={(_, value: number) => setTabIndex(value)} sx={{ mb: 1 }}>
          <Tab label="音声" />
        </Tabs>

        {tabIndex === 0 && <AudioTab />}
      </Drawer>
    </>
  );
}
