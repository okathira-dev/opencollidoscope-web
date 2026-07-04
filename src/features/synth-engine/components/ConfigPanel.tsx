import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SettingsIcon from "@mui/icons-material/Settings";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Drawer,
  Fab,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Slider,
  TextField,
  Typography,
} from "@mui/material";
import { type ReactNode, useCallback, useRef, useState } from "react";

import {
  useConfig,
  useConfigAudio,
  useDeletePreset,
  useExportConfig,
  useImportConfig,
  useLoadPreset,
  usePresets,
  useResetConfig,
  useSavePreset,
  useUpdateConfig,
} from "../../../stores/config-store.ts";
import {
  useInitializeMidi,
  useMidiError,
  useMidiInitialized,
  useMidiInputDevices,
  useMidiSupported,
} from "../../../stores/midi-store.ts";
import {
  useCloseConfigPanel,
  useIsConfigPanelOpen,
  useToggleConfigPanel,
} from "../../../stores/ui-store.ts";

const DRAWER_WIDTH = 320;

interface ConfigAccordionSectionProps {
  id: string;
  title: string;
  children: ReactNode;
}

function ConfigAccordionSection({ id, title, children }: ConfigAccordionSectionProps) {
  return (
    <Accordion
      disableGutters
      elevation={0}
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
        mb: 1,
        bgcolor: "background.paper",
        "&:before": { display: "none" },
        "&.Mui-expanded": { mb: 1 },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`${id}-content`}
        id={`${id}-header`}
        sx={{
          minHeight: 48,
          cursor: "pointer",
          "&:hover": { bgcolor: "action.hover" },
          "& .MuiAccordionSummary-content": { my: 1 },
          "& .MuiAccordionSummary-expandIconWrapper": { color: "text.secondary" },
        }}
      >
        <Typography variant="subtitle2">{title}</Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 0, borderTop: 1, borderColor: "divider" }}>
        {children}
      </AccordionDetails>
    </Accordion>
  );
}

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

function FilterTab() {
  const config = useConfig();
  const updateConfig = useUpdateConfig();
  const { filter } = config;

  const handleMinCutoffChange = useCallback(
    (_: Event, value: number | number[]) => {
      const minCutoff = Array.isArray(value) ? (value[0] ?? filter.minCutoff) : value;
      updateConfig({ filter: { minCutoff: Math.round(minCutoff) } });
    },
    [filter.minCutoff, updateConfig],
  );

  const handleMaxCutoffChange = useCallback(
    (_: Event, value: number | number[]) => {
      const maxCutoff = Array.isArray(value) ? (value[0] ?? filter.maxCutoff) : value;
      updateConfig({ filter: { maxCutoff: Math.round(maxCutoff) } });
    },
    [filter.maxCutoff, updateConfig],
  );

  const handleQFactorChange = useCallback(
    (_: Event, value: number | number[]) => {
      const qFactor = Array.isArray(value) ? (value[0] ?? filter.qFactor) : value;
      updateConfig({ filter: { qFactor } });
    },
    [filter.qFactor, updateConfig],
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 2 }}>
      <Box>
        <Typography variant="body2" gutterBottom>
          最小カットオフ: {filter.minCutoff} Hz
        </Typography>
        <Slider
          value={filter.minCutoff}
          min={20}
          max={20000}
          step={10}
          onChange={handleMinCutoffChange}
          aria-label="最小カットオフ"
        />
      </Box>

      <Box>
        <Typography variant="body2" gutterBottom>
          最大カットオフ: {filter.maxCutoff} Hz
        </Typography>
        <Slider
          value={filter.maxCutoff}
          min={200}
          max={22050}
          step={10}
          onChange={handleMaxCutoffChange}
          aria-label="最大カットオフ"
        />
      </Box>

      <Box>
        <Typography variant="body2" gutterBottom>
          Q 係数: {filter.qFactor.toFixed(3)}
        </Typography>
        <Slider
          value={filter.qFactor}
          min={0.1}
          max={30}
          step={0.01}
          onChange={handleQFactorChange}
          aria-label="Q 係数"
        />
      </Box>
    </Box>
  );
}

function VisualTab() {
  const config = useConfig();
  const updateConfig = useUpdateConfig();
  const { visual } = config;

  const handleWave1ColorChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      updateConfig({ visual: { colors: { wave1: event.target.value } } });
    },
    [updateConfig],
  );

  const handleWave2ColorChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      updateConfig({ visual: { colors: { wave2: event.target.value } } });
    },
    [updateConfig],
  );

  const handleCursorColorChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      updateConfig({ visual: { colors: { cursor: event.target.value } } });
    },
    [updateConfig],
  );

  const handleChunkAnimationFramesChange = useCallback(
    (_: Event, value: number | number[]) => {
      const chunkAnimationFrames = Array.isArray(value)
        ? (value[0] ?? visual.chunkAnimationFrames)
        : value;
      updateConfig({ visual: { chunkAnimationFrames: Math.round(chunkAnimationFrames) } });
    },
    [visual.chunkAnimationFrames, updateConfig],
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 2 }}>
      <Box>
        <Typography variant="body2" gutterBottom>
          Wave 1 色
        </Typography>
        <input
          type="color"
          value={visual.colors.wave1}
          onChange={handleWave1ColorChange}
          aria-label="Wave 1 色"
        />
      </Box>

      <Box>
        <Typography variant="body2" gutterBottom>
          Wave 2 色
        </Typography>
        <input
          type="color"
          value={visual.colors.wave2}
          onChange={handleWave2ColorChange}
          aria-label="Wave 2 色"
        />
      </Box>

      <Box>
        <Typography variant="body2" gutterBottom>
          カーソル色
        </Typography>
        <input
          type="color"
          value={visual.colors.cursor}
          onChange={handleCursorColorChange}
          aria-label="カーソル色"
        />
      </Box>

      <Box>
        <Typography variant="body2" gutterBottom>
          チャンクアニメーションフレーム: {visual.chunkAnimationFrames}
        </Typography>
        <Slider
          value={visual.chunkAnimationFrames}
          min={1}
          max={10}
          step={1}
          onChange={handleChunkAnimationFramesChange}
          aria-label="チャンクアニメーションフレーム"
        />
      </Box>
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

function PresetTab() {
  const presets = usePresets();
  const savePreset = useSavePreset();
  const loadPreset = useLoadPreset();
  const deletePreset = useDeletePreset();
  const exportConfig = useExportConfig();
  const importConfig = useImportConfig();
  const [presetName, setPresetName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showMessage = useCallback((text: string) => {
    setMessage(text);
  }, []);

  const handleSavePreset = useCallback(() => {
    const trimmed = presetName.trim();
    try {
      savePreset(trimmed);
      setPresetName("");
      showMessage(`プリセット "${trimmed}" を保存しました`);
    } catch (error) {
      showMessage(error instanceof Error ? error.message : "保存に失敗しました");
    }
  }, [presetName, savePreset, showMessage]);

  const handleLoadPreset = useCallback(
    (name: string) => {
      try {
        loadPreset(name);
        showMessage(`プリセット "${name}" を読み込みました`);
      } catch (error) {
        showMessage(error instanceof Error ? error.message : "読み込みに失敗しました");
      }
    },
    [loadPreset, showMessage],
  );

  const handleDeletePreset = useCallback(
    (name: string) => {
      try {
        deletePreset(name);
        showMessage(`プリセット "${name}" を削除しました`);
      } catch (error) {
        showMessage(error instanceof Error ? error.message : "削除に失敗しました");
      }
    },
    [deletePreset, showMessage],
  );

  const handleExportJson = useCallback(() => {
    const json = exportConfig();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "collidoscope-config.json";
    anchor.click();
    URL.revokeObjectURL(url);
    showMessage("設定を JSON としてエクスポートしました");
  }, [exportConfig, showMessage]);

  const handleImportJson = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        try {
          importConfig(String(reader.result ?? ""));
          showMessage(`"${file.name}" をインポートしました`);
        } catch (error) {
          showMessage(error instanceof Error ? error.message : "インポートに失敗しました");
        }
      };
      reader.readAsText(file);
      event.target.value = "";
    },
    [importConfig, showMessage],
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
      <Typography variant="body2" color="text.secondary">
        現在の設定を名前付きプリセットとして保存・呼び出しできます。
      </Typography>

      <Box sx={{ display: "flex", gap: 1 }}>
        <TextField
          size="small"
          label="プリセット名"
          value={presetName}
          onChange={(event) => setPresetName(event.target.value)}
          fullWidth
        />
        <Button variant="contained" onClick={handleSavePreset} disabled={!presetName.trim()}>
          保存
        </Button>
      </Box>

      {presets.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          保存済みプリセットはありません
        </Typography>
      ) : (
        <List dense disablePadding>
          {presets.map((name) => (
            <ListItem
              key={name}
              secondaryAction={
                <Box sx={{ display: "flex", gap: 0.5 }}>
                  <Button size="small" onClick={() => handleLoadPreset(name)}>
                    読込
                  </Button>
                  <Button size="small" color="error" onClick={() => handleDeletePreset(name)}>
                    削除
                  </Button>
                </Box>
              }
            >
              <ListItemText primary={name} />
            </ListItem>
          ))}
        </List>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Button variant="outlined" onClick={handleExportJson}>
          JSON エクスポート
        </Button>
        <Button variant="outlined" onClick={() => fileInputRef.current?.click()}>
          JSON インポート
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={handleImportJson}
        />
      </Box>

      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );
}

function MidiTab() {
  const config = useConfig();
  const isSupported = useMidiSupported();
  const isInitialized = useMidiInitialized();
  const error = useMidiError();
  const inputDevices = useMidiInputDevices();
  const initializeMidi = useInitializeMidi();
  const { ccMappings } = config.midi;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
      {!isSupported ? (
        <Typography variant="body2" color="error">
          このブラウザは Web MIDI API に対応していません
        </Typography>
      ) : (
        <>
          <Button
            variant="contained"
            onClick={() => {
              void initializeMidi();
            }}
            disabled={isInitialized}
          >
            {isInitialized ? "MIDI 接続済み" : "MIDI を有効化"}
          </Button>
          {error && (
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          )}
          <Typography variant="subtitle2">入力デバイス</Typography>
          {inputDevices.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              接続された MIDI 入力デバイスはありません
            </Typography>
          ) : (
            <List dense disablePadding>
              {inputDevices.map((device) => (
                <ListItem key={device.id} disablePadding>
                  <ListItemText
                    primary={device.name}
                    secondary={device.manufacturer || device.id}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </>
      )}

      <Typography variant="subtitle2">CC マッピング（Phase 1: チャンネル 1）</Typography>
      <Typography variant="body2">CC{ccMappings.selectionSize}: 選択サイズ</Typography>
      <Typography variant="body2">CC{ccMappings.grainDuration}: グレイン持続係数</Typography>
      <Typography variant="body2">CC{ccMappings.loopToggle}: ループ ON/OFF</Typography>
      <Typography variant="body2">CC{ccMappings.recordTrigger}: 録音トリガー</Typography>
      <Typography variant="body2">CC{ccMappings.filterCutoff}: フィルター</Typography>
      <Typography variant="body2">
        Pitch Bend: 選択開始位置（{config.midi.pitchBendRange.min}–{config.midi.pitchBendRange.max}
        ）
      </Typography>
    </Box>
  );
}

export function ConfigPanel() {
  const isOpen = useIsConfigPanelOpen();
  const toggleConfigPanel = useToggleConfigPanel();
  const closeConfigPanel = useCloseConfigPanel();

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
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <Typography variant="h6">設定</Typography>
          <IconButton aria-label="設定パネルを閉じる" onClick={closeConfigPanel} size="small">
            <SettingsIcon />
          </IconButton>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
          項目をクリックして開閉できます
        </Typography>

        <Box sx={{ flex: 1, overflow: "auto", mt: 1.5 }}>
          <ConfigAccordionSection id="audio" title="音声">
            <AudioTab />
          </ConfigAccordionSection>

          <ConfigAccordionSection id="granular" title="グラニュラー">
            <GranularTab />
          </ConfigAccordionSection>

          <ConfigAccordionSection id="filter" title="フィルター">
            <FilterTab />
          </ConfigAccordionSection>

          <ConfigAccordionSection id="visual" title="視覚">
            <VisualTab />
          </ConfigAccordionSection>

          <ConfigAccordionSection id="preset" title="プリセット">
            <PresetTab />
          </ConfigAccordionSection>

          <ConfigAccordionSection id="midi" title="MIDI">
            <MidiTab />
          </ConfigAccordionSection>
        </Box>
      </Drawer>
    </>
  );
}
