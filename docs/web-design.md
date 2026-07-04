# Collidoscope Web版 設計書

ドキュメント索引: [README.md](README.md)

本ドキュメントは、Open Collidoscope の Web 再実装における**アーキテクチャと設計方針**を定義します。

- 機能要件・設定値: [web-spec.md](web-spec.md)

**注意**: 本書の TypeScript コード例は設計思想の伝達用です。実装時はライブラリ API・型・エラーハンドリングを実態に合わせて再設計してください。

## 全体アーキテクチャ

```mermaid
graph TB
    subgraph uiLayer [UI Layer]
        MainApp
        SynthEngine
        WaveDisplay
        PianoKeyboard
        ControlPanel
        Oscilloscope
        ConfigPanel
    end

    subgraph logicLayer [Business Logic Layer]
        AudioEngineManager
        GranularSynthesizer
        WaveRecorder
        SelectionController
        ParameterController
    end

    subgraph audioLayer [Audio Processing Layer]
        AudioContext
        MediaStream
        RecordingWorklet
        GranularWorklet
        BiquadFilterNode
        GainNode
        AnalyserNode
    end

    subgraph stateLayer [State Management - Zustand]
        AudioStore
        WaveStore
        SynthStore
        ConfigStore
        UIStore
    end

    MainApp --> SynthEngine
    SynthEngine --> AudioEngineManager
    SynthEngine --> GranularSynthesizer
    WaveDisplay --> WaveRecorder
    ControlPanel --> ParameterController
    ConfigPanel --> ConfigStore

    AudioEngineManager --> AudioContext
    GranularSynthesizer --> GranularWorklet
    WaveRecorder --> RecordingWorklet
    Oscilloscope --> AnalyserNode

    AudioStore --> MainApp
    WaveStore --> WaveDisplay
    SynthStore --> SynthEngine
    ConfigStore --> ConfigPanel
```

## C++ → Web 移植マッピング

| C++ モジュール | Web 対応 | 備考 |
| --- | --- | --- |
| `PGranular.h` | `features/synth-engine/worklets/granular-processor.ts` | Vite `?worker&url` でビルド |
| `EnvASR.h` | `src/domain/audio/env-asr.ts` | Worklet から import 可（純粋関数のみ） |
| `PGranularNode` | `GranularSynthesizer` クラス | Worklet との MessagePort 統合、ボイス管理 |
| `BufferToWaveRecorderNode` | `features/synth-engine/worklets/recording-processor.ts` | 録音 + チャンク min/max |
| `AudioEngine` | `AudioEngineManager` | グラフ構築、パラメータ橋渡し |
| `Wave` / `Chunk` | `features/synth-engine/components/WaveDisplay.tsx` | Canvas 描画 |
| `Oscilloscope` | `Oscilloscope` コンポーネント | `AnalyserNode` + Canvas |
| `ParticleController` | `ParticleSystem`（`particle-system.ts`） | `WaveDisplay` 内 Canvas 描画 |
| `Config` | `src/domain/config/` | Zod スキーマ + `ConfigManager` |
| `MIDI` | Web MIDI API ラッパー | `src/domain/midi/` + `midiStore` |
| `CollidoscopeApp` | `MainApp` + Zustand stores | フレームループ → React ライフサイクル |
| `Messages` / `RingBufferPack` | `AudioWorkletNode.port` | MessagePort による双方向通信 |
| Cinder OpenGL 描画 | HTML5 Canvas | `requestAnimationFrame` |

## 音声処理パイプライン

### 録音パイプライン

```mermaid
flowchart LR
    Mic[Microphone] --> Stream[MediaStream]
    Stream --> Source[MediaStreamAudioSourceNode]
    Source --> InputGain[GainNode]
    InputGain --> Compressor[DynamicsCompressorNode optional]
    Compressor --> InputAnalyser[AnalyserNode]
    InputAnalyser --> RecWorklet[RecordingWorklet]
    InputAnalyser --> SilentGain[GainNode gain 0]
    SilentGain --> Dest[AudioDestination]
    RecWorklet --> Buffer[Float32Array]
    RecWorklet -->|chunk| WaveStore
    Buffer -->|normalize optional| Finalize[finalizeRecordedBuffer]
    Finalize --> AudioStore
```

```text
Microphone
  → MediaStreamAudioSourceNode
  → GainNode（入力ゲイン）
  → DynamicsCompressorNode?（ON 時のみ）
  → AnalyserNode
      ├─（監視時）GainNode(0) → destination（レベルメーター用にグラフを駆動）
      └─（録音時）AudioWorkletNode(recording)
```

図中の `DynamicsCompressorNode optional` は、`compressorEnabled` が ON のときだけ `GainNode` と `AnalyserNode` の間に挿入される経路を表す。OFF 時は `wireInputChain(false)` により **Gain → Analyser 直結**で、Compressor ノードはグラフから切り離される（図では省略表現のためノード自体は残って見える）。

録音 Worklet はオーディオスレッドでサンプルを蓄積し、チャンク境界ごとに min/max をメインスレッドへ `postMessage` します。録音完了時、設定で有効ならピーク正規化を適用し、チャンク min/max を再計算します。

実装の正本:

| 領域 | パス |
| --- | --- |
| 入力グラフ・制約適用 | `src/stores/audio-store.ts` |
| ブラウザ制約・コンプレッサー設定 | `src/domain/audio/mic-input.ts` |
| 録音後ピーク正規化 | `src/domain/audio/recording-normalize.ts` |
| 設定 UI | `src/features/synth-engine/components/MicInputSettings.tsx` |
| 設定スキーマ | `config.micInput`（`src/domain/config/config-schema.ts`） |

### マイク入力前処理（Web 独自拡張）

オリジナルは Scarlett 2i2 のハードゲインと生の JACK 入力のみ。Web 版はブラウザマイク向けに次を追加する。

| 機能 | 実装 | 備考 |
| --- | --- | --- |
| 入力ゲイン | `GainNode` + `setTargetAtTime` | オリジナルの IF ゲインノブ相当 |
| 入力レベルメーター | `AnalyserNode` + MUI `LinearProgress` | マイク許可後、録音前から監視 |
| ブラウザ音声処理 | `getUserMedia` / `applyConstraints` | `autoGainControl`, `noiseSuppression`, `echoCancellation`。デフォルト OFF（楽器向け） |
| 入力コンプレッサー | `DynamicsCompressorNode` | ブラウザ組み込み。パラメータのみアプリが設定 |
| 録音後ピーク正規化 | `normalizePeakBuffer`（自作） | 録音完了時のみ。再生音量は `config.audio.attenuation` で調整 |

**反映タイミング**:

| 設定 | タイミング |
| --- | --- |
| 入力ゲイン・コンプレッサー | 変更直後（録音中でも可） |
| ブラウザ処理トグル | マイク許可後は `applyConstraints` で即時。許可前は次回 `getUserMedia` |
| ピーク正規化 | 録音完了時のみ（既存バッファには遡及しない） |

**意図的に採用していないもの**: `ConvolverNode.normalize`（リバーブ用 IR の等パワー正規化でありマイク入力とは無関係）。

### 再生パイプライン

```mermaid
flowchart LR
    Buffer[AudioBuffer] --> Selection[Selection]
    Selection --> Granular[GranularWorklet]
    Granular --> Filter[BiquadFilterNode]
    Filter --> Gain[GainNode]
    Gain --> Dest[AudioDestination]
    Gain --> Analyser[AnalyserNode]
    Analyser --> Scope[Oscilloscope]
    Granular -->|TRIGGER| WaveStore
```

```text
AudioBuffer → GranularWorklet → BiquadFilterNode → GainNode → AudioDestination
                     ↓                                      ↓
              CursorTriggers                         AnalyserNode → Oscilloscope
```

### グラニュラー処理フロー

```mermaid
flowchart TB
    subgraph grainProcess [Grain Processing]
        Create[Grain Creation]
        RandOffset[Random Offset]
        Hann[Hann Window]
        Interp[Linear Interpolation]
        Pitch[Playback Rate]
    end

    subgraph voiceMgmt [Voice Management]
        NoteOn[MIDI Note On]
        Alloc[Voice Allocation max 6]
        ASR[ASR Envelope]
    end

    Buffer[Audio Buffer] --> Selection[Selection]
    Selection --> Create
    Create --> RandOffset --> Hann --> Interp --> Pitch
    NoteOn --> Alloc --> ASR
    Pitch --> Mixer[Voice Mixer]
    ASR --> Mixer
    Mixer --> Filter[Lowpass Filter]
    Filter --> Output[Audio Output]
```

## 状態管理設計

Zustand で責務を分離します。Phase 2 ではエンジンごとに Store を複製するか、`engineId` キーでネストします。

```mermaid
graph LR
    subgraph stores [Zustand Stores]
        AudioStore
        WaveStore
        SynthStore
        ConfigStore
        UIStore
    end

    subgraph components [Components]
        MainApp
        SynthEngine
        WaveDisplay
        PianoKeyboard
        ControlPanel
        ConfigPanel
    end

    AudioStore --> MainApp
    WaveStore --> WaveDisplay
    SynthStore --> SynthEngine
    ConfigStore --> ConfigPanel
    UIStore --> MainApp
    SynthStore --> PianoKeyboard
    SynthStore --> ControlPanel
    WaveStore --> ControlPanel
```

### AudioStore

```typescript
interface AudioState {
  audioContext: AudioContext | null;
  sampleRate: number;
  isRecording: boolean;
  recordedBuffer: Float32Array | null;
  micStream: MediaStream | null;
  micConstraintSupport: MicConstraintSupport;
  micConstraintError: string | null;

  initializeAudio: () => Promise<void>;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  applyMicInputConfig: (config: MicInputConfig) => Promise<void>;
  setInputGain: (gain: number) => void;
  updateMicConstraints: (constraints: MediaTrackAudioConstraints) => Promise<void>;
}
```

モジュールスコープで `inputGainNode` / `compressorNode` / `inputAnalyserNode` / `silentOutputNode` を保持。`getInputAnalyserNode()` はレベルメーター用に export。

**導入タイミング**: M1（基本録音）。マイク入力前処理は Web 独自拡張として後続追加。

### ConfigStore

```typescript
interface ConfigState {
  config: CollidoscopeConfig;
  configManager: ConfigManager;

  updateConfig: (updates: PartialCollidoscopeConfig) => void;
  resetConfig: () => void;
  exportConfig: () => string;
  importConfig: (json: string) => void;

  presets: string[];
  savePreset: (name: string) => void;
  loadPreset: (name: string) => void;
  deletePreset: (name: string) => void;
}
```

実装済みドメイン: `src/domain/config/`（Zod スキーマ、`ConfigManager`、localStorage 永続化）。プリセットは `PRESETS_STORAGE_KEY`（`collidoscope-presets`）。

### MidiStore

```typescript
interface MidiState {
  isSupported: boolean;
  isInitialized: boolean;
  error: string | null;
  inputDevices: MidiDeviceInfo[];

  initializeMidi: () => Promise<void>;
  disposeMidi: () => void;
}
```

ドメイン: `src/domain/midi/`（`MidiManager`, `midi-parser`, `midi-router`）。Phase 1 は ch 0 のみ。

### UIStore

```typescript
interface UIState {
  isConfigPanelOpen: boolean;  // false = 最小化（デフォルト）
  hardwareVariant: "original" | "new";  // デフォルト "original"
  playerLayout: "facing" | "stacked" | "solo";  // デフォルト "facing"
  isFullscreen: boolean;

  openConfigPanel: () => void;
  closeConfigPanel: () => void;
  toggleConfigPanel: () => void;
  setHardwareVariant: (variant: "original" | "new") => void;
  setPlayerLayout: (layout: "facing" | "stacked" | "solo") => void;
  toggleFullscreen: () => Promise<void>;
}
```

パネルの開閉は `UIStore`、設定値は `ConfigStore`。**導入タイミング**: M1（`isConfigPanelOpen`）、M2.5（`hardwareVariant`, `playerLayout`）、M4（`isFullscreen`）。

### WaveStore

```typescript
interface CursorState {
  startChunk: number;
  startTime: number;
}

interface WaveState {
  chunks: ChunkData[];
  selection: { start: number; size: number; isNull: boolean };
  cursors: Record<number, CursorState>;
  particleTriggerTick: number;

  setChunk: (index: number, min: number, max: number) => void;
  setSelection: (start: number, size: number) => void;
  setCursor: (voiceId: number, startChunk: number, startTime: number) => void;
  triggerParticleSpawn: () => void;
}
```

**導入タイミング**: M1（チャンク表示）。選択・カーソルは M2〜M3、パーティクルトリガーは M4。

### SynthStore

```typescript
interface SynthState {
  grainDurationCoeff: number;
  filterCutoff: number;  // MIDI 0–127。演奏 UI と `BiquadFilterNode` に反映
  loop: { enabled: boolean };

  noteOn: (midiNote: number) => void;
  noteOff: (midiNote: number) => void;
  setLoopEnabled: (enabled: boolean) => void;
  setGrainDurationCoeff: (coeff: number) => void;
  setFilterCutoff: (cutoff: number) => void;
}
```

**導入タイミング**: M2（M1 では未使用）。`filterCutoff` は M3 で追加。

## コンポーネント設計

### MainApp

- 音声コンテキスト初期化（ユーザージェスチャー後）
- レイアウト管理、エラーハンドリング

### SynthEngine

```typescript
interface SynthEngineProps {
  engineId: number;
  color: string;
  position: "primary" | "secondary";
}
```

Phase 1 では `engineId=0` のみ。子コンポーネント（WaveDisplay, ControlPanel, PianoKeyboard）を統合。

**演奏面の配置（M2.5 完了）**: `PlayerControlSurface` が `original-layout.ts` / `new-layout.ts`（180 度投影）で A/B 両面を駆動。配置の正本は [layout-specs/](layout-specs/README.md) の kebab-case ブロック名。オリジナル版は `PlayerModule` + 横スライダー、新版は `NewPlayerModule` + `VerticalMobileKnob`（縦レール + ホイール）+ C3-C6 鍵盤。A 側は機能配線済み（M3 までにループ・フィルター・視覚 FB 完了）、B 側は配置のみ。筐体バリアント切替は `VariantSwitcher`（`uiStore.hardwareVariant`）。プレイヤー配置モード（向き合い/二段/ソロ）は `uiStore.playerLayout` + `SynthEngine` 上部の ToggleButtonGroup。**M4**: フルスクリーントグルボタンを同エリアに追加。

### VariantSwitcher

筐体バリアント（`original` / `new`）の切替 UI。`uiStore.hardwareVariant` を読み書きする。`SynthEngine` 上部に配置。音声・MIDI・Store キーは切替しない。

### PlayerControlSurface

`variant`（`HardwareVariant`）と `playerLayout`（`PlayerLayout`）を受け取り、`PlayerModule` / `NewPlayerModule` を選択して A/B を描画。`playerLayout === "solo"` のとき Player B を非表示にする。

### WaveDisplay

Canvas ベース。`WaveStore` から `chunks` / `selection` / `cursors` を購読し、`requestAnimationFrame` で描画。

**チャンク着色**（オリジナル `Wave::draw` 準拠）:

| 状態 | 色 |
| --- | --- |
| 選択範囲外 | `#808080`（グレー） |
| 選択範囲内 | アクセント色 + `selectionAlphaFromFilter`（0.5〜1.0） |
| 再生カーソル位置 | `config.visual.colors.cursor`（白） |

**再生カーソル**: グレイントリガー時に `synthStore` が `selection.start` と `performance.now()` を `waveStore.setCursor` へ渡す。`drawChunks` 内の `computeCursorIndices` が毎フレーム `startChunk + floor(elapsed / msPerChunk)` で位置を算出し、選択終端を超えたカーソルは非表示。

M4 で `ParticleSystem` を統合（グレイントリガー時にパーティクル放出、波形背面に白点描画）。

### ParticleSystem

純粋 TS クラス（`src/features/synth-engine/particle-system.ts`）。オリジナル `ParticleController` 準拠。React/DOM 非依存で `WaveDisplay` から利用。

### GranularSynthesizer

メインスレッド側のラッパー。AudioWorkletNode の生成、MessagePort 経由のパラメータ送信、フィルター/ゲインノードの接続を担当。

```typescript
class GranularSynthesizer {
  setAudioBuffer(buffer: AudioBuffer): void;
  setSelection(start: number, size: number): void;
  noteOn(midiNote: number): void;
  noteOff(midiNote: number): void;
  setLooping(enabled: boolean): void;
  setFilterCutoff(frequency: number): void;
  dispose(): void;
}
```

### ConfigPanel

**折りたたみ式の常設パネル。** デフォルト最小化、展開時に全設定を GUI 編集できる。移植・デバッグ時にオリジナル定数をいじりながら挙動を確認する用途を兼ねる。

- **配置**: 画面右端の MUI `Drawer`（`persistent`）
- **最小化時**: 歯車 FAB。`uiStore.isConfigPanelOpen === false` がデフォルト
- **展開時**: MUI `Accordion` の縦積み（`ConfigAccordionSection`）。**`Tabs` は使わない** — 複数セクションを同時に開ける
- **セクション一覧**（`ConfigPanel.tsx` の `title`）: 音声 / マイク入力 / グラニュラー / フィルター / 視覚 / プリセット / MIDI
- **実装メモ**: 子コンポーネント名は `AudioTab` 等の歴史的命名だが、UI 上はアコーディオンセクション
- **M1**: `ConfigStore` 接続 + 「音声」セクション（`waveLength`, `chunkCount` 等）
- **M1 拡張**: 「マイク入力」セクション（`MicInputSettings`）
- **M2 以降**: グラニュラー、フィルター、視覚セクションを追加
- **M4**: 「プリセット」セクション（保存・読み込み・JSON 入出力）、「MIDI」セクション（デバイス一覧・CC マッピング表示）

```typescript
// 最小化状態は UIStore で管理（ConfigStore ではない）
interface UIState {
  isConfigPanelOpen: boolean;  // false = 最小化がデフォルト
  // ...
}
```

変更は `updateConfig` → `ConfigManager` → 各 Store / Worklet へ伝播する。開閉は `uiStore.toggleConfigPanel()`。

## AudioWorklet 実装方針

### Worklet は TypeScript で書く

**全部 TS で問題ない。** `public/*.js` に手書きする必要はない。

```typescript
import recordingWorkletUrl from "./worklets/recording-processor.ts?worker&url";

await audioContext.audioWorklet.addModule(recordingWorkletUrl);
```

- Vite の `?worker&url` で TS を別チャンクにトランスパイルし、URL を `addModule` に渡す
- `?url` のみは TS を変換しないため使わない
- Worklet から `src/domain/audio/` の**純粋関数**（Hann 窓、補間、ピッチ比など）を import し、オリジナル `PGranular.h` と同じ式を共有する
- Worklet 内では React / Zustand / DOM API を import しない

アルゴリズムの正本は `domain/audio`、リアルタイム処理の殻は `worklets/*.ts`、という分担にする。

### ファイル配置

```text
src/features/synth-engine/
├── SynthEngine.tsx
├── components/
│   ├── WaveDisplay.tsx
│   ├── ControlPanel.tsx
│   ├── PianoKeyboard.tsx
│   └── Oscilloscope.tsx
├── worklets/
│   ├── recording-processor.ts
│   └── granular-processor.ts
├── hooks/
└── index.ts
```

### 録音バッファ共有（パフォーマンス優先）

```mermaid
flowchart TB
    subgraph isolated [crossOriginIsolated 時]
        SAB[SharedArrayBuffer]
        RecW[recording Worklet] --> SAB
        GranW[granular Worklet] --> SAB
        Main[メインスレッド] --> SAB
    end

    subgraph fallback [未隔離時フォールバック]
        AB[AudioBuffer]
        RecW2[recording Worklet] -->|postMessage| AB
        AB --> GranW2[granular Worklet]
    end
```

| 方式 | 用途 |
| --- | --- |
| `SharedArrayBuffer` | 本番・隔離済み環境。録音と再生が同一メモリを参照 |
| `postMessage` + コピー | `crossOriginIsolated` が false のとき（開発初回、coi 未導入） |

**GitHub Pages**: カスタム HTTP ヘッダが使えないため、[coi-serviceworker](https://github.com/gzuidhof/coi-serviceworker) で Service Worker 経由の COOP/COEP 注入を行う（スパイクで検証済み。`vite.config.ts` のプラグインが `dist/` に同梱）。初回訪問時にページリロードが発生する点に留意。

### recording-processor.ts

- 入力サンプルをバッファに蓄積（SAB または内部バッファ）
- チャンク境界で min/max を計算し `postMessage`
- 録音完了をメインスレッドへ通知

### granular-processor.ts

オリジナル `PGranular` の `processGrains` / `synthesizeGrain` を移植:

- グレインプール（最大 32、再利用）
- raised cosine bell エンベロープ
- 線形補間
- `port.onmessage` でパラメータ受信
- トリガー時に `postMessage({ type: 'cursorTrigger', ... })`

### メインスレッド ↔ Worklet 通信

| 方向 | メッセージ例 |
| --- | --- |
| Main → Worklet | `setAudioBuffer`, `setSelection`, `noteOn`, `noteOff`, `setLooping`, `setGrainDurationCoeff` |
| Worklet → Main | `recordingComplete`, `waveChunk`, `cursorTrigger`, `grainEnd` |

## オリジナルとの意図的な差異

| 観点 | オリジナル | Web 版 |
| --- | --- | --- |
| 定数 | `Config.h` でハードコード | Zod スキーマ + 設定 UI で変更可能 |
| 入力 | Teensy 物理コントローラー + MIDI | PC キーボード + Web MIDI + 画面上 UI |
| 描画 | Cinder OpenGL | HTML5 Canvas |
| スレッド | Cinder オーディオスレッド + GUI スレッド | AudioWorklet + メインスレッド（React） |
| レイアウト | 縦 2 分割固定 | Phase 1 は単一、レスポンシブ対応 |
| 設定永続化 | XML（未使用） | localStorage + JSON 入出力 |
| 波形数 | 常に 2 | Phase 1 は 1、Phase 2 で 2 |

## 設定の動的変更

`ConfigStore` の変更を各 Store / AudioWorklet に伝播します。

```typescript
// 設定変更時の反映例
useEffect(() => {
  if (config.audio.chunkCount !== currentChunkCount) {
    waveStore.updateChunks(config.audio.chunkCount);
  }
  granularSynth.updateParams({
    maxGrains: config.granular.maxGrains,
    minGrainDuration: config.granular.minGrainDuration,
  });
}, [config]);
```

チャンク数変更時は選択範囲の再計算、色設定は CSS カスタムプロパティへ即時反映。

## パフォーマンス最適化

| 領域 | 方針 |
| --- | --- |
| 音声 | AudioWorklet でメインスレッド非ブロッキング。グレインプール再利用 |
| React | `useMemo`, `useCallback`, `React.memo` で再描画抑制 |
| Canvas | `requestAnimationFrame`、必要領域のみ再描画 |
| メモリ | AudioBuffer の適切な解放、Worklet 内プール管理 |

## エラーハンドリング

| エラー種別 | 対応 |
| --- | --- |
| マイク権限拒否 | `AudioPermissionError`、UI で再試行案内 |
| AudioWorklet 非対応 | ブラウザ要件を表示 |
| 非セキュアコンテキスト | HTTPS 必須の案内 |
| Worklet 読み込み失敗 | `AudioWorkletError`、フォールバックなし（必須機能） |
| 設定 JSON 不正 | Zod 検証エラーをユーザーに表示 |

起動時に `checkSecureContext()` と `checkAudioWorkletSupport()` を実行。

## テスト戦略

| レイヤー | 対象 | 環境 |
| --- | --- | --- |
| 単体 | 設定ドメイン、ユーティリティ、エンベロープ計算 | Vitest（node / jsdom） |
| コンポーネント | UI コンポーネント | Vitest + Testing Library |
| 統合 | Store ↔ ドメインロジック | Vitest |
| E2E | 録音・演奏フロー | Playwright（将来） |

音声 Worklet はブラウザ依存のため、核心アルゴリズム（Hann 窓、補間、ピッチ計算）は純粋関数として `src/domain/audio/` に切り出し、node 環境でテスト可能にする。

## ディレクトリ構成

[coding-rules.mdc](.cursor/rules/coding-rules.mdc) に準拠。機能単位は `features/` にコロケーションする。

```text
src/
├── features/
│   └── synth-engine/           # Phase 1 の主機能
│       ├── SynthEngine.tsx     # メインコンポーネント
│       ├── components/         # WaveDisplay, ControlPanel 等
│       ├── worklets/           # recording / granular（TypeScript）
│       ├── hooks/              # useRecording, useGranular 等
│       └── index.ts            # SynthEngine のみ re-export
├── components/                 # 汎用 UI（Button, Layout 等）
├── domain/
│   ├── config/                 # 実装済み
│   ├── audio/                  # 純粋関数（Worklet とテストで共有）
│   └── midi/                   # Web MIDI ラッパー（M4 実装済み）
├── stores/                     # グローバル Zustand（Audio, Wave, Synth, Config, UI, Midi）
├── hooks/                      # アプリ全体のフック
├── test/                       # setup, test-utils
├── App.tsx
└── main.tsx
```

**Store の配置**: Phase 1 は単一エンジンのため `src/stores/` に集約。Phase 2 で `engineId` キーを増やすか、エンジンごとにインスタンス化する。

**設定 UI**: `ConfigPanel` は **M1 から** `features/synth-engine/components/` に常設（`Drawer` + `Accordion`）。`ConfigStore` と同時に導入し、マイルストーンごとにアコーディオンセクションを増やす。プリセット・JSON・MIDI セクションは M4 で追加済み。

## 今後の拡張

1. **Phase 2**: `SynthEngine` の複製、Store の `engineId` 分離、縦分割レイアウト
2. **Web MIDI**: CC マッピングの学習機能
3. **エフェクト**: リバーブ、ディストーション、ディレイ（オリジナル外）
4. **PWA**: オフライン対応
