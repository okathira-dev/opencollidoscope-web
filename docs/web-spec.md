# Collidoscope Web版 実装仕様

ドキュメント索引: [README.md](README.md)

本ドキュメントは、Open Collidoscope を Web 技術で再実装する際の**目標・機能要件・設定値**を定義します。

- オリジナル実装の分析: [original-analysis.md](original-analysis.md)
- アーキテクチャ設計: [web-design.md](web-design.md)
- UI 対応・実装ギャップ: [ui-mapping.md](ui-mapping.md)
- 公式資料ミラー: [`opencollidoscope_downloads/`](../opencollidoscope_downloads/)（Introduction、MIDI reference、Physical Build 等）

## プロジェクトの目的

1. **演奏体験の再現**: オリジナル Collidoscope の「録音 → 選択 → グラニュラー演奏」をブラウザで実現する
2. **アクセシビリティ**: 専用ハードウェアなしで、マイクとキーボード（または Web MIDI）だけで演奏できるようにする
3. **拡張性**: 設定 UI、プリセット、JSON エクスポートなど、オリジナルにない運用面の改善を加える

## フェーズ戦略

### Phase 1: 単一音声処理システム（現在のフォーカス）

- 赤色波形（Wave 0）のみ実装
- 録音、波形表示、グラニュラーシンセ、フィルター、オシロスコープ、パーティクルを単一エンジンで完成
- UI/UX の最適化に集中

### Phase 2: デュアル音声処理システム

- 黄色波形（Wave 1）の追加
- 状態管理の分離（エンジンごとの Store）
- 画面縦分割レイアウト（オリジナル同様、Wave 1 は反転表示）

コンポーネントは Phase 1 から `engineId` を受け取れる形で設計し、Phase 2 で複製可能にする。

## ハードウェアバージョンと Web 版 UI 方針

オープンソース Collidoscope には **オリジナル版**と**新版**の 2 種類の物理筐体がある（詳細は [original-analysis.md](original-analysis.md) の「物理ハードウェア」、[ui-mapping.md](ui-mapping.md) の「物理コントロール形状」）。

| 方針 | 内容 |
| --- | --- |
| Phase 1 の基準 | **オリジナル版**をデフォルト。M2.5 で両バリアントの UI 配置と `uiStore` による本切替を完成 |
| MIDI / 音声 | 両バージョン共通。`CollidoscopeApp` の処理式を Web 版の正とする |
| 配置・形状・実装ギャップ | [ui-mapping.md](ui-mapping.md) · [layout-specs/](layout-specs/README.md)（`<variant>/layout.html`）を参照 |

演奏用コントロールの形状・実装状態は [ui-mapping.md](ui-mapping.md) を参照（本書では重複記載しない）。

## Phase 1 マイルストーン

仕様上 Phase 1 に含まれる機能を、実装順に分割する。**M1〜M4 は完了**（単一エンジンで演奏・拡張運用まで到達）。次は Phase 2（Wave 1 / 黄色波形）。

| マイルストーン | 目標 | 含む機能 |
| --- | --- | --- |
| **M1** | 録音して波形が見える | マイク、録音、チャンク波形表示、**設定パネル（折りたたみ・音声タブ）** |
| **M2** | 選択して演奏できる | 選択 UI、グラニュラーシンセ、ピアノ鍵盤、**設定パネルにグラニュラータブ追加** |
| **M2.5** | **UI 配置確定（両バリアント）+ バリアント切替** | `layout-specs/original/` + `new/` を参照した 180 度投影グリッド、`PlayerControlSurface` で A/B 両面配置。オリジナル=`PlayerModule`、新版=`NewPlayerModule`（`VerticalMobileKnob`、C3-C6 鍵盤）。`uiStore.hardwareVariant` + `VariantSwitcher`、`uiStore.playerLayout`（向き合い/二段。`solo` は M3）。Filter / Loop / B 側はプレースホルダ可 |
| **M3** | 演奏の質とフィードバック | ソロモード（Player B 非表示）、ループ、フィルター、オシロスコープ、再生カーソル、**設定パネルにフィルター/視覚タブ追加**（M2.5 のスロットへ配線） |
| **M4** | 拡張・本番運用 | プリセット、JSON 入出力、Web MIDI、パーティクル、PC 鍵盤レイアウト、フルスクリーンボタン |

**設定 UI**: デバッグとパラメータ確認のため、**M1 から折りたたみ式の設定パネルを常設**する。普段は最小化（アイコンまたは細いバー）し、クリックで展開して GUI から `ConfigManager` 経由で値を変更できる。プリセット保存・JSON 入出力は **M4** で `ConfigPanel`「プリセット」タブに実装済み。

**調査タスク**（M1 の先頭で実施。未完了でも postMessage フォールバックで継続可）:

- [x] Vite `?worker&url` による Worklet の TypeScript ビルド（`spike-processor` で `addModule`・440Hz 出力を確認）
- [x] GitHub Pages 向け [coi-serviceworker](https://github.com/gzuidhof/coi-serviceworker) による COOP/COEP 迂回（`crossOriginIsolated` / `SharedArrayBuffer` を確認。初回リロードあり）

実装の正本: `vite.config.ts`（coi プラグイン + dev/preview ヘッダー）、`src/index.html`、`src/features/synth-engine/worklets/recording-processor.ts`（録音）・`granular-processor.ts`（グラニュラー再生）

### マイルストーンと Store の導入タイミング

| マイルストーン | 新規 Store / UI |
| --- | --- |
| M1 | `audioStore`, `waveStore`, `configStore`, `uiStore`（`isConfigPanelOpen`）, 折りたたみ `ConfigPanel` |
| M2 | `synthStore`, グラニュラータブ |
| M2.5 | `uiStore` 拡張（`hardwareVariant`, `playerLayout`）, `VariantSwitcher` |
| M3 | フィルター・視覚タブ（Store は既存を拡張） |
| M4 | プリセット API（`configStore`）、`midiStore`、パーティクル、`uiStore.isFullscreen` |

## 機能一覧

| 機能 | 説明 | Phase | マイルストーン |
| --- | --- | --- | --- |
| マイク入力 | `getUserMedia` でマイクから音声取得 | 1 | M1 |
| 録音 | 指定時間の録音、フェードイン/アウト、チャンク分割 | 1 | M1 |
| 波形表示 | チャンク min/max バー、選択範囲ハイライト、アニメーション | 1 | M1 |
| 選択操作 | 開始位置（ドラッグ）、サイズ（ホイール） | 1 | M2 |
| グラニュラーシンセ | グレイン生成、Hann 窓、ピッチ、ループ | 1 | M2 |
| ピアノ鍵盤 | 画面上の鍵盤 + PC キーボード（Z-/ 行=白鍵、A-L 行=黒鍵、C キー=C4） | 1 | M2 / M4 |
| ループ | 選択範囲のループ再生 | 1 | M3 |
| フィルター | ローパス、指数的カットオフ制御 | 1 | M3 |
| オシロスコープ | 再生中の出力波形をリアルタイム表示 | 1 | M3 |
| 再生カーソル | ループ中の再生位置表示 | 1 | M3 |
| パーティクル | duration coeff に連動した視覚フィードバック | 1 | M4 |
| MIDI 入力 | Web MIDI API による外部コントローラー対応 | 1 | M4 |
| 設定パネル（折りたたみ GUI） | 常設。最小化がデフォルト。`ConfigManager` と双方向バインド | 1 | M1 着手、マイルストーンごとにタブ拡張 |
| プリセット・JSON 入出力 | 設定の保存・読み込み・エクスポート | 1 | M4 |
| フルスクリーン | Fullscreen API 切替ボタン（`SynthEngine` 上部） | 1 | M4 |
| 第 2 エンジン | 独立した黄色波形システム | 2 | — |

## 設定値

**重要**: 以下の値はすべて設定可能として実装する。記載値はデフォルト。オリジナルでハードコードされていた定数の多くを、Web 版ではユーザーが変更できるようにする。

### 音声設定

| パラメータ | デフォルト | 範囲 |
| --- | --- | --- |
| 録音時間（`waveLength`） | 2.0 秒 | 0.1〜10 秒 |
| チャンク数（`chunkCount`） | 150 | 1〜1000 |
| サンプルレート | 44100 Hz | Web Audio API デフォルト |
| 最大選択サイズ | 37 チャンク | 1〜チャンク数 |
| アテニュエーション | -12dB（0.25118864315096） | 0〜1 |

### グラニュラーシンセシス設定

| パラメータ | デフォルト | 範囲 |
| --- | --- | --- |
| 最大グレイン数 | 32 | 1〜128 |
| 最小グレイン持続時間 | 640 サンプル | 正の数 |
| グレイン持続係数 | 1.0〜8.0 | 1.0〜8.0 |
| 最大ボイス数 | 6 | 1〜16 |

### エンベロープ設定（ASR）

| パラメータ | デフォルト |
| --- | --- |
| アタック時間 | 0.01 秒（10ms） |
| リリース時間 | 0.05 秒（50ms） |
| サステインレベル | 1.0 |

### フィルター設定

| パラメータ | デフォルト |
| --- | --- |
| 最小カットオフ周波数 | 200 Hz |
| 最大カットオフ周波数 | 22050 Hz |
| Q ファクター | 0.707（Butterworth） |

### 視覚設定

| パラメータ | デフォルト |
| --- | --- |
| Wave 1 色（赤） | `#F3063E` |
| Wave 2 色（黄） | `#FFCC00` |
| カーソル色 | `#FFFFFF` |
| 最大パーティクル数 | 150 |
| チャンクアニメーションフレーム数 | 3 |

### MIDI 設定

公式定義: [`opencollidoscope_downloads/Collidoscope MIDI messages reference.pdf`](../opencollidoscope_downloads/Collidoscope%20MIDI%20messages%20reference.pdf)

MIDI マッピング一覧: [ui-mapping.md — 電子的対応](ui-mapping.md#電子的対応正本)。

**CC7 フィルター（Web 版の正）**: [original-analysis.md — フィルター](original-analysis.md#フィルター) の `CollidoscopeApp` 式と同一（式の記載は同節のみ）。

### 設定管理要件

1. JSON 形式でエクスポート/インポート可能
2. 再生中でも設定値を変更可能（リアルタイム反映）
3. Zod によるバリデーションと依存関係チェック（例: 最大選択サイズ ≤ チャンク数）
4. 設定パネル UI から各値を変更可能
5. 複数プリセットの保存・呼び出し
6. localStorage への永続化（Zod でランタイム検証）

実装の正本: `src/domain/config/`（`config-schema.ts`, `config-manager.ts`, `default-config.ts`）。プリセットは `localStorage["collidoscope-presets"]` に名前付きで保存。

### Web MIDI 入力

- 実装: `src/domain/midi/`（`MidiManager`, `midi-parser`, `midi-router`）+ `src/stores/midi-store.ts`
- Phase 1 は MIDI チャンネル 1（ch 0）のみ。`CollidoscopeApp::receiveCommands()` と同一マッピング
- シンセ初期化後に自動有効化。失敗時は `ConfigPanel`「MIDI」タブから再試行
- CC 番号は `config.midi.ccMappings` で参照（デフォルト: CC1=選択サイズ、CC2=Duration、CC4=ループ、CC5=録音、CC7=フィルター）

## 機能仕様詳細

### 音声入力

- `navigator.mediaDevices.getUserMedia` でマイクアクセス
- `MediaStreamAudioSourceNode` に接続
- 録音トリガー時に AudioWorklet へストリームを渡す

### 録音

- `AudioWorkletNode` で録音（`ScriptProcessorNode` は使用しない）
- 録音時間は設定可能
- 録音と同時にチャンク分割し、各チャンクの min/max を計算
- 録音開始・終了にフェードイン/アウト
- 新規録音時は既存バッファを破棄

### 波形表示

- 録音バッファをチャンク数に分割し、各チャンクを縦バーで描画
- 選択範囲をハイライト表示
- 新チャンク出現時にポップアップアニメーション（3 フレーム）
- `requestAnimationFrame` で描画

### 選択操作

| 操作 | 筐体 UI | 補助操作 |
| --- | --- | --- |
| 選択開始位置 | Wavejet 水平レール（波形直下） | 波形ドラッグ、横ホイール |
| 選択サイズ | Wavejet ノブ相当の縦スライダー（演奏列） | 波形上ホイール |

### グラニュラーシンセシス

オリジナルの `PGranular` アルゴリズムを再現する（詳細は [original-analysis.md](original-analysis.md)）:

- Hann 窓（raised cosine recurrence）
- 線形補間サンプリング
- ランダムオフセット（最大約 10ms）
- ピッチ: MIDI 60 = 基準、12 平均律
- ループ: 選択範囲のループ再生
- ポリフォニー: 最大 6 ボイス + ループ 1

### オシロスコープ

- `AnalyserNode` で出力波形を取得
- バッファサイズを 4 で除算してポイント数を決定
- `requestAnimationFrame` で Canvas 描画

### 再生カーソルとパーティクル

- グレイントリガー時、選択範囲上に再生位置カーソルを表示
- `grainDurationCoeff > 1` のときパーティクルを放出（オリジナル `ParticleController` 準拠）
- 実装: `src/features/synth-engine/particle-system.ts` + `WaveDisplay` 統合
- 最大パーティクル数 150。白 1px ドット、選択範囲内ランダム位置、クラウド境界バウンス
- スポーン数は duration 係数とフィルター CC（0–127 正規化）に比例

## UI 仕様

### 演奏 UI と設定 UI の分離

| UI | コンポーネント | 役割 |
| --- | --- | --- |
| **演奏 UI** | `PlayerControlSurface` + `WaveDisplay` + `PianoKeyboard` 等 | オリジナル筐体の物理配置を模す。日常の演奏操作のみ |
| **設定 UI** | `ConfigPanel`（折りたたみ Drawer） | デバッグ・全パラメータ調整。演奏画面の主要操作はここに置かない |

Phase 1 では **プレイヤー A（Wave 0・赤）** を機能面の基準とし、画面上は **180 度投影** により A 端が下部（鍵盤帯）、B 端が上部に来る（[layout-specs — 座標系と Web 投影](layout-specs/README.md#座標系と-web-投影)）。配置の正本は [layout-specs/original/](layout-specs/README.md)。コンポーネント状態・実装ギャップは [ui-mapping.md](ui-mapping.md) を参照。

`ControlPanel` 暫定横一列は `SynthEngine` から外れ、`PlayerControlSurface`（12 行グリッド・A/B 両面）に置換済み。Filter・ループは A 側で配線済み（M3）。

### 設定パネル（折りたたみ GUI）

演奏画面に常設する。**デフォルトは最小化**（画面端のアイコンボタン、または細いヘッダバーのみ表示）。ユーザーが開くとパネルが展開し、スライダー・数値入力で設定を変更できる。

| 要件 | 内容 |
| --- | --- |
| 初期状態 | 最小化（メイン UI を邪魔しない） |
| 展開 | クリック / トグルでパネル表示。再度操作で最小化可能 |
| データ源 | `ConfigStore` ↔ `ConfigManager`（Zod 検証済み） |
| 反映 | 変更はリアルタイムで音声エンジン・Worklet に伝播 |
| 段階的拡張 | M1: 音声 → M2: グラニュラー → M3: フィルター・視覚 → M4: プリセット・MIDI |

実装時は MUI の `Drawer`（`anchor="right"`, `variant="persistent"`）または浮動 `Paper` を想定。**演奏用コントロールは `PlayerControlSurface` に筐体配置で置き、全パラメータ調整は `ConfigPanel` に限定する**（[ui-mapping.md](ui-mapping.md) 参照）。

### PC 鍵盤（ピアノ演奏）

画面上の `PianoKeyboard` に加え、PC キーボードから G#3〜C5（17 鍵）を演奏できる。正本: `src/features/synth-engine/keyboard-layout.ts`。

| 行 | キー | 音（オクターブ offset 0） |
| --- | --- | --- |
| 白鍵（Z 行） | Z X **C** V B N M , . / | A3 B3 **C4** D4 E4 F4 G4 A4 B4 C5 |
| 黒鍵（A 行） | **A** S — F G — J K L | **G#3** A#3 — C#4 D#4 — F#4 G#4 A#4 |

- **C キー = C4（MIDI 60、rate 1.0 = 録音原音）**
- **A キー = G#3**（Z=A3 の左隣の黒鍵に物理位置が一致）
- D / H / ; は黒鍵なし区間のため未割当
- オクターブシフトは `OctaveButton` のみ（±2 オクターブ）

### フルスクリーン

- `SynthEngine` 上部のトグルボタンで Fullscreen API 切替
- キーボードショートカットは設けない（ブラウザ標準の F11 等に委ねる）

### オリジナル C++ デバッグショートカット（Web 版では未実装）

オリジナル `CollidoscopeApp` の Wave 0 向けデバッグキー（`r`/`a`/`d`/`w`/`s`/`9`/`0`/Space/`f`）は Web 版 Phase 1 では移植していない。PC キーボードはピアノ演奏専用。

## 技術スタック

| 領域 | 技術 |
| --- | --- |
| フロントエンド | React 19, TypeScript 6 |
| ビルド | Vite 8（ルートは `src/`） |
| UI | MUI 9 |
| 状態管理 | Zustand |
| 音声処理 | Web Audio API（AudioWorklet） |
| 描画 | HTML5 Canvas |
| 設定検証 | Zod |
| パッケージ管理 | pnpm 11 |
| Node.js | ^24.14.0 |

**音声ライブラリ**: 高レベル抽象化（Tone.js 等）は使わない。オリジナル `PGranular` の挙動を追いながら移植するため、Web Audio API と AudioWorklet を直接使う。

**録音バッファ共有（パフォーマンス優先）**:

1. **優先**: `SharedArrayBuffer` でメインスレッドと Worklet が同一バッファを参照（オリジナルの録音・再生共有に近い）
2. **条件**: `crossOriginIsolated === true`（COOP/COEP）。GitHub Pages では [coi-serviceworker](https://github.com/gzuidhof/coi-serviceworker) による迂回を M1 前に検証する
3. **フォールバック**: 未隔離環境では `postMessage` + `AudioBuffer` コピー（初回ロード・開発時の保険）

### 品質・テスト

| ツール | 用途 |
| --- | --- |
| Biome | lint / format |
| markdownlint-cli2 | Markdown 品質 |
| Vitest | 単体テスト（デフォルト jsdom） |
| `@testing-library/react` | コンポーネントテスト |
| `@vitest/coverage-v8` | カバレッジ |
| Husky + lint-staged | pre-commit（Biome, tsc, vitest related, markdownlint） |
| GitHub Actions | check → test:coverage → build |
| Playwright | E2E（将来、CI 未設定） |

## 対応ブラウザ

AudioWorklet 対応が必須:

| ブラウザ | 最低バージョン |
| --- | --- |
| Chrome | 66+ |
| Firefox | 76+ |
| Safari | 14.1+ |
| Edge | 79+ |

## セキュリティ・実行要件

- **HTTPS 必須**: AudioWorklet はセキュアコンテキストでのみ動作
- **ユーザージェスチャー**: 音声再生にはユーザー操作が必要
- **マイク権限**: 録音にはマイクアクセス許可が必要
- **CORS**: AudioWorklet ファイルは同一オリジンで提供

## 開発環境の意図的な選択と未整備

### 意図的な選択

| 項目 | 内容 |
| --- | --- |
| ツールチェーン | Node.js ^24.14.0 / TypeScript 6 / Vite 8 など最新寄り |
| Vite の `root` | リポジトリ直下ではなく `src/` |
| 品質ツールの分離 | TS/JS は Biome、Markdown は markdownlint-cli2 |
| pre-commit | staged ファイルに Biome、プロジェクト全体に `tsc --noEmit` |
| 参照用 C++ 同梱 | `opencollidoscope/` は Web ビルド対象外 |
| Pages デプロイ | `publish-pages.yml` は build のみ。品質ゲートは CI が担当 |

### 未整備（導入予定）

| 項目 | 現状 | 導入目安 |
| --- | --- | --- |
| E2E テスト | Playwright は MCP のみ | 主要ユーザーフロー実装後 |
| カバレッジ閾値 | レポート生成済み、閾値未設定 | テストが一定数増えた段階 |
| Phase 2（Wave 1） | 単一エンジン（Wave 0）のみ | デュアルエンジン・縦分割レイアウト |
| C++ デバッグショートカット | 未移植（PC 鍵盤はピアノ演奏専用） | 必要なら別途検討 |

## パフォーマンス要件

- AudioWorklet でメインスレッドをブロックしない
- グレインプール（最大 32）の効率的な再利用
- `requestAnimationFrame` による描画最適化
- 128 サンプルバッファでの低レイテンシ
