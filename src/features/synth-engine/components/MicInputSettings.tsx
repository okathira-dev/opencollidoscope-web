import {
  Alert,
  Box,
  Collapse,
  FormControlLabel,
  LinearProgress,
  Slider,
  Switch,
  Typography,
} from "@mui/material";
import { type ChangeEvent, useCallback } from "react";

import {
  useApplyMicInputConfig,
  useIsAudioInitialized,
  useMicConstraintError,
  useMicConstraintSupport,
  useSetInputGain,
  useUpdateMicConstraints,
} from "../../../stores/audio-store.ts";
import { useConfigMicInput, useUpdateConfig } from "../../../stores/config-store.ts";
import { useDeferredConfigSlider } from "../hooks/useDeferredConfigSlider.ts";
import { getInputPeakBarColor, useInputPeakLevel } from "../hooks/useInputPeakLevel.ts";

function SettingDescription({ children }: { children: string }) {
  return (
    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
      {children}
    </Typography>
  );
}

function InputLevelMeter() {
  const isInitialized = useIsAudioInitialized();
  const peakLevel = useInputPeakLevel();

  const percent = Math.min(peakLevel * 100, 100);
  const barColor = getInputPeakBarColor(peakLevel);

  return (
    <Box>
      <Typography variant="body2" gutterBottom>
        入力レベル: {(peakLevel * 100).toFixed(0)}%
      </Typography>
      <LinearProgress
        variant="determinate"
        value={percent}
        color={barColor}
        aria-label="マイク入力レベル"
        sx={{ height: 8, borderRadius: 1 }}
      />
      <SettingDescription>
        マイクから入っている音の大きさです。録音前にバーが適度に動くか確認してください。赤に近づくと音が大きすぎて割れる可能性があります。
      </SettingDescription>
      {!isInitialized && (
        <SettingDescription>マイクの許可後にレベルメーターが表示されます。</SettingDescription>
      )}
    </Box>
  );
}

export function MicInputSettings() {
  const micInput = useConfigMicInput();
  const updateConfig = useUpdateConfig();
  const { applyConfig, commitConfig } = useDeferredConfigSlider();
  const applyMicInputConfig = useApplyMicInputConfig();
  const setInputGain = useSetInputGain();
  const updateMicConstraints = useUpdateMicConstraints();
  const constraintSupport = useMicConstraintSupport();
  const constraintError = useMicConstraintError();
  const isInitialized = useIsAudioInitialized();

  const syncMicInput = useCallback(
    async (nextConfig: typeof micInput) => {
      await applyMicInputConfig(nextConfig);
    },
    [applyMicInputConfig],
  );

  const handleInputGainChange = useCallback(
    (_: Event, value: number | number[]) => {
      const inputGain = Array.isArray(value) ? (value[0] ?? micInput.inputGain) : value;
      const nextConfig = { ...micInput, inputGain };
      applyConfig({ micInput: { inputGain } });
      setInputGain(inputGain);
      void syncMicInput(nextConfig);
    },
    [micInput, setInputGain, syncMicInput, applyConfig],
  );

  const handleConstraintToggle = useCallback(
    async (key: "autoGainControl" | "noiseSuppression" | "echoCancellation", checked: boolean) => {
      const nextConfig = { ...micInput, [key]: checked };
      updateConfig({ micInput: { [key]: checked } });
      if (isInitialized) {
        try {
          await updateMicConstraints({
            autoGainControl: nextConfig.autoGainControl,
            noiseSuppression: nextConfig.noiseSuppression,
            echoCancellation: nextConfig.echoCancellation,
          });
        } catch {
          updateConfig({ micInput: { [key]: micInput[key] } });
          return;
        }
      }
      void syncMicInput(nextConfig);
    },
    [isInitialized, micInput, syncMicInput, updateConfig, updateMicConstraints],
  );

  const handleCompressorEnabledChange = useCallback(
    (_: ChangeEvent<HTMLInputElement>, checked: boolean) => {
      const nextConfig = { ...micInput, compressorEnabled: checked };
      updateConfig({ micInput: { compressorEnabled: checked } });
      void syncMicInput(nextConfig);
    },
    [micInput, syncMicInput, updateConfig],
  );

  const handleCompressorParamChange = useCallback(
    (
      key:
        | "compressorThreshold"
        | "compressorKnee"
        | "compressorRatio"
        | "compressorAttack"
        | "compressorRelease",
      value: number,
    ) => {
      const nextConfig = { ...micInput, [key]: value };
      applyConfig({ micInput: { [key]: value } });
      void syncMicInput(nextConfig);
    },
    [micInput, syncMicInput, applyConfig],
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 2 }}>
      <InputLevelMeter />

      <Box>
        <Typography variant="body2" gutterBottom>
          入力ゲイン: {micInput.inputGain.toFixed(1)} 倍
        </Typography>
        <Slider
          value={micInput.inputGain}
          min={0}
          max={5}
          step={0.1}
          onChange={handleInputGainChange}
          onChangeCommitted={commitConfig}
          aria-label="入力ゲイン"
        />
        <SettingDescription>
          録音に入る音の大きさを手動で調整します。1.0
          がそのまま、小さすぎるときは上げ、音が割れるときは下げてください。スライダーを動かすとすぐ反映されます（録音中でも可）。元の
          Collidoscope ではオーディオインターフェースのゲインノブに相当します。
        </SettingDescription>
      </Box>

      <Box>
        <FormControlLabel
          control={
            <Switch
              checked={micInput.normalizeRecording}
              onChange={(_, checked) => updateConfig({ micInput: { normalizeRecording: checked } })}
            />
          }
          label="録音後にピーク正規化"
        />
        <SettingDescription>
          録音が終わった直後に、バッファ全体の最大音量を目標レベルに揃えます。小さく録音された音を再生しやすくします。次回の録音から適用され、録音中は変更されません。
        </SettingDescription>

        <Collapse in={micInput.normalizeRecording}>
          <Box sx={{ mt: 2, pl: 1 }}>
            <Typography variant="body2" gutterBottom>
              目標ピーク: {(micInput.normalizeTargetPeak * 100).toFixed(0)}%
            </Typography>
            <Slider
              value={micInput.normalizeTargetPeak}
              min={0.1}
              max={1}
              step={0.05}
              onChange={(_, value) => {
                const normalizeTargetPeak = Array.isArray(value)
                  ? (value[0] ?? micInput.normalizeTargetPeak)
                  : value;
                applyConfig({ micInput: { normalizeTargetPeak } });
              }}
              onChangeCommitted={commitConfig}
              aria-label="正規化目標ピーク"
            />
            <SettingDescription>
              録音バッファの最大振幅をこの割合に揃えます。100%
              でフルレンジに引き上げます。再生時の音量や割れの調整は「音声」タブのアテニュエーションで行います。
            </SettingDescription>
          </Box>
        </Collapse>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom>
          ブラウザのマイク処理
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
          ブラウザがマイク入力に自動でかける処理です。マイク許可後はトグルを切り替えるとすぐ反映されます（録音中でも可）。楽器の録音では
          OFF がおすすめですが、環境によっては ON の方が聞き取りやすい場合もあります。
        </Typography>

        <FormControlLabel
          control={
            <Switch
              checked={micInput.autoGainControl}
              onChange={(_, checked) => handleConstraintToggle("autoGainControl", checked)}
              disabled={isInitialized && !constraintSupport.autoGainControl}
            />
          }
          label="自動ゲイン調整（autoGainControl）"
        />
        <SettingDescription>
          マイク音量を自動で均します。会話向けの処理で、持続する音（楽器の長音など）が小さくなったり変化したりすることがあります。
        </SettingDescription>

        <FormControlLabel
          sx={{ mt: 1 }}
          control={
            <Switch
              checked={micInput.noiseSuppression}
              onChange={(_, checked) => handleConstraintToggle("noiseSuppression", checked)}
              disabled={isInitialized && !constraintSupport.noiseSuppression}
            />
          }
          label="ノイズ抑制（noiseSuppression）"
        />
        <SettingDescription>
          背景ノイズを減らします。静かな環境音や楽器の倍音を誤って抑えることがあります。
        </SettingDescription>

        <FormControlLabel
          sx={{ mt: 1 }}
          control={
            <Switch
              checked={micInput.echoCancellation}
              onChange={(_, checked) => handleConstraintToggle("echoCancellation", checked)}
              disabled={isInitialized && !constraintSupport.echoCancellation}
            />
          }
          label="エコー除去（echoCancellation）"
        />
        <SettingDescription>
          スピーカーから出た音がマイクに入るのを抑えます。ヘッドホン使用時や単独録音では OFF
          でも問題ないことが多いです。
        </SettingDescription>

        {constraintError && (
          <Alert severity="warning" sx={{ mt: 1 }}>
            {constraintError}
          </Alert>
        )}
      </Box>

      <Box>
        <FormControlLabel
          control={
            <Switch checked={micInput.compressorEnabled} onChange={handleCompressorEnabledChange} />
          }
          label="入力コンプレッサー"
        />
        <SettingDescription>
          大きな音だけを抑えてクリッピングを防ぎます。Web Audio API の DynamicsCompressorNode
          が処理します（ブラウザ組み込み）。ON
          にすると小さな音が相対的に大きく聞こえる場合があります（自動メイクアップゲインの影響）。
        </SettingDescription>

        <Collapse in={micInput.compressorEnabled}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2, pl: 1 }}>
            <Box>
              <Typography variant="body2" gutterBottom>
                しきい値: {micInput.compressorThreshold.toFixed(0)} dB
              </Typography>
              <Slider
                value={micInput.compressorThreshold}
                min={-100}
                max={0}
                step={1}
                onChange={(_, value) =>
                  handleCompressorParamChange(
                    "compressorThreshold",
                    Array.isArray(value) ? (value[0] ?? micInput.compressorThreshold) : value,
                  )
                }
                onChangeCommitted={commitConfig}
                aria-label="コンプレッサーしきい値"
              />
              <SettingDescription>
                この音量を超えた部分から圧縮が始まります。値を上げる（0
                に近づける）とより強く抑えます。
              </SettingDescription>
            </Box>

            <Box>
              <Typography variant="body2" gutterBottom>
                ニー: {micInput.compressorKnee.toFixed(0)} dB
              </Typography>
              <Slider
                value={micInput.compressorKnee}
                min={0}
                max={40}
                step={1}
                onChange={(_, value) =>
                  handleCompressorParamChange(
                    "compressorKnee",
                    Array.isArray(value) ? (value[0] ?? micInput.compressorKnee) : value,
                  )
                }
                onChangeCommitted={commitConfig}
                aria-label="コンプレッサーニー"
              />
              <SettingDescription>
                圧縮が始まる際のなだらかさです。大きいほど急激に変化しません。
              </SettingDescription>
            </Box>

            <Box>
              <Typography variant="body2" gutterBottom>
                レシオ: {micInput.compressorRatio.toFixed(1)} : 1
              </Typography>
              <Slider
                value={micInput.compressorRatio}
                min={1}
                max={20}
                step={0.5}
                onChange={(_, value) =>
                  handleCompressorParamChange(
                    "compressorRatio",
                    Array.isArray(value) ? (value[0] ?? micInput.compressorRatio) : value,
                  )
                }
                onChangeCommitted={commitConfig}
                aria-label="コンプレッサーレシオ"
              />
              <SettingDescription>
                しきい値を超えた音をどれだけ抑えるかの比率です。大きいほど強く圧縮します。
              </SettingDescription>
            </Box>

            <Box>
              <Typography variant="body2" gutterBottom>
                アタック: {micInput.compressorAttack.toFixed(3)} 秒
              </Typography>
              <Slider
                value={micInput.compressorAttack}
                min={0}
                max={1}
                step={0.001}
                onChange={(_, value) =>
                  handleCompressorParamChange(
                    "compressorAttack",
                    Array.isArray(value) ? (value[0] ?? micInput.compressorAttack) : value,
                  )
                }
                onChangeCommitted={commitConfig}
                aria-label="コンプレッサーアタック"
              />
              <SettingDescription>
                音が大きくなってから圧縮がかかり始めるまでの時間です。
              </SettingDescription>
            </Box>

            <Box>
              <Typography variant="body2" gutterBottom>
                リリース: {micInput.compressorRelease.toFixed(3)} 秒
              </Typography>
              <Slider
                value={micInput.compressorRelease}
                min={0}
                max={1}
                step={0.01}
                onChange={(_, value) =>
                  handleCompressorParamChange(
                    "compressorRelease",
                    Array.isArray(value) ? (value[0] ?? micInput.compressorRelease) : value,
                  )
                }
                onChangeCommitted={commitConfig}
                aria-label="コンプレッサーリリース"
              />
              <SettingDescription>
                音が小さくなったあと、圧縮が戻るまでの時間です。
              </SettingDescription>
            </Box>
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
}
