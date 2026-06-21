import SettingsIcon from "@mui/icons-material/Settings";
import { Box, Drawer, Fab, IconButton, Slider, Tab, Tabs, Typography } from "@mui/material";
import { useCallback, useState } from "react";

import {
  useConfig,
  useConfigAudio,
  useResetConfig,
  useUpdateConfig,
} from "../../../stores/config-store.ts";
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

  const handleMaxSelectionSizeChange = useCallback(
    (_: Event, value: number | number[]) => {
      const maxSelectionSize = Array.isArray(value) ? (value[0] ?? audio.maxSelectionSize) : value;
      updateConfig({ audio: { maxSelectionSize: Math.round(maxSelectionSize) } });
    },
    [audio.maxSelectionSize, updateConfig],
  );

  const maxSelectionUpperBound = Math.min(audio.chunkCount, 1000);

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
          最大選択サイズ: {audio.maxSelectionSize} チャンク
        </Typography>
        <Slider
          value={Math.min(audio.maxSelectionSize, maxSelectionUpperBound)}
          min={1}
          max={maxSelectionUpperBound}
          step={1}
          onChange={handleMaxSelectionSizeChange}
          aria-label="最大選択サイズ"
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

function GranularTab() {
  const config = useConfig();
  const updateConfig = useUpdateConfig();
  const { granular, envelope } = config;

  const handleMaxGrainsChange = useCallback(
    (_: Event, value: number | number[]) => {
      const maxGrains = Array.isArray(value) ? (value[0] ?? granular.maxGrains) : value;
      updateConfig({ granular: { maxGrains: Math.round(maxGrains) } });
    },
    [granular.maxGrains, updateConfig],
  );

  const handleMaxVoicesChange = useCallback(
    (_: Event, value: number | number[]) => {
      const maxVoices = Array.isArray(value) ? (value[0] ?? granular.maxVoices) : value;
      updateConfig({ granular: { maxVoices: Math.round(maxVoices) } });
    },
    [granular.maxVoices, updateConfig],
  );

  const handleMinGrainDurationChange = useCallback(
    (_: Event, value: number | number[]) => {
      const minGrainDuration = Array.isArray(value)
        ? (value[0] ?? granular.minGrainDuration)
        : value;
      updateConfig({ granular: { minGrainDuration: Math.round(minGrainDuration) } });
    },
    [granular.minGrainDuration, updateConfig],
  );

  const handleDurationRangeMinChange = useCallback(
    (_: Event, value: number | number[]) => {
      const min = Array.isArray(value) ? (value[0] ?? granular.grainDurationRange.min) : value;
      updateConfig({ granular: { grainDurationRange: { min } } });
    },
    [granular.grainDurationRange.min, updateConfig],
  );

  const handleDurationRangeMaxChange = useCallback(
    (_: Event, value: number | number[]) => {
      const max = Array.isArray(value) ? (value[0] ?? granular.grainDurationRange.max) : value;
      updateConfig({ granular: { grainDurationRange: { max } } });
    },
    [granular.grainDurationRange.max, updateConfig],
  );

  const handleAttackTimeChange = useCallback(
    (_: Event, value: number | number[]) => {
      const attackTime = Array.isArray(value) ? (value[0] ?? envelope.attackTime) : value;
      updateConfig({ envelope: { attackTime } });
    },
    [envelope.attackTime, updateConfig],
  );

  const handleReleaseTimeChange = useCallback(
    (_: Event, value: number | number[]) => {
      const releaseTime = Array.isArray(value) ? (value[0] ?? envelope.releaseTime) : value;
      updateConfig({ envelope: { releaseTime } });
    },
    [envelope.releaseTime, updateConfig],
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 2 }}>
      <Box>
        <Typography variant="body2" gutterBottom>
          最大グレイン数: {granular.maxGrains}
        </Typography>
        <Slider
          value={granular.maxGrains}
          min={1}
          max={128}
          step={1}
          onChange={handleMaxGrainsChange}
          aria-label="最大グレイン数"
        />
      </Box>

      <Box>
        <Typography variant="body2" gutterBottom>
          最大ボイス数: {granular.maxVoices}
        </Typography>
        <Slider
          value={granular.maxVoices}
          min={1}
          max={16}
          step={1}
          onChange={handleMaxVoicesChange}
          aria-label="最大ボイス数"
        />
      </Box>

      <Box>
        <Typography variant="body2" gutterBottom>
          最小グレイン持続時間: {granular.minGrainDuration} サンプル
        </Typography>
        <Slider
          value={granular.minGrainDuration}
          min={64}
          max={4096}
          step={64}
          onChange={handleMinGrainDurationChange}
          aria-label="最小グレイン持続時間"
        />
      </Box>

      <Box>
        <Typography variant="body2" gutterBottom>
          Duration 係数 (最小): {granular.grainDurationRange.min.toFixed(1)}
        </Typography>
        <Slider
          value={granular.grainDurationRange.min}
          min={1}
          max={8}
          step={0.1}
          onChange={handleDurationRangeMinChange}
          aria-label="Duration 係数最小"
        />
      </Box>

      <Box>
        <Typography variant="body2" gutterBottom>
          Duration 係数 (最大): {granular.grainDurationRange.max.toFixed(1)}
        </Typography>
        <Slider
          value={granular.grainDurationRange.max}
          min={1}
          max={8}
          step={0.1}
          onChange={handleDurationRangeMaxChange}
          aria-label="Duration 係数最大"
        />
      </Box>

      <Box>
        <Typography variant="body2" gutterBottom>
          アタック時間: {(envelope.attackTime * 1000).toFixed(0)} ms
        </Typography>
        <Slider
          value={envelope.attackTime}
          min={0.001}
          max={0.5}
          step={0.001}
          onChange={handleAttackTimeChange}
          aria-label="アタック時間"
        />
      </Box>

      <Box>
        <Typography variant="body2" gutterBottom>
          リリース時間: {(envelope.releaseTime * 1000).toFixed(0)} ms
        </Typography>
        <Slider
          value={envelope.releaseTime}
          min={0.001}
          max={1}
          step={0.001}
          onChange={handleReleaseTimeChange}
          aria-label="リリース時間"
        />
      </Box>
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
          <Tab label="グラニュラー" />
        </Tabs>

        {tabIndex === 0 && <AudioTab />}
        {tabIndex === 1 && <GranularTab />}
      </Drawer>
    </>
  );
}
