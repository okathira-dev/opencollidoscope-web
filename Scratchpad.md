# Scratchpad

このファイルは、タスクの計画と進捗状況を追跡するためのスクラッチパッドとして使用されます。
（`.cursor/rules/global.mdc`のルールに従って管理されています）

## 現在のタスク

### 方針（配置 vs 電子）

**配置（空間）**: `docs/layout-specs/<variant>/layout.html` + `layout.css` を正本とする。Web 実装は `PlayerModule`（6×12）を組み合わせて再現する（実行時に layout-specs を直接読み込まない）。

**電子的つながり（MIDI・処理式・Store キー）**: **既存分析を正本としてよい**（[ui-mapping.md — 電子的対応](docs/ui-mapping.md#電子的対応正本) · [original-analysis.md](docs/original-analysis.md)）。バリアント切替でも MIDI / Store は不変。

**次フェーズの優先順位**:

1. **Phase 2** — 第 2 音声処理システム（Wave 1 / 黄色波形）

---

## 完了済みタスク

### M4: プリセット・MIDI・パーティクル

- [x] PC キーボードレイアウト変更（C キー = C4、A キー = G#3）
- [x] `ConfigPanel` に **プリセット・JSON 入出力**（`savePreset` 等）
- [x] Web MIDI API（`src/domain/midi/`）
- [x] パーティクル演出（元実装準拠）
- [x] フルスクリーン切替ボタン

### M3: ループ・フィルター・オシロスコープ

- [x] **ソロモード** — `playerLayout: "solo"` + Player B 非表示
- [x] ループ ON/OFF — オリジナル=トグル / 新版=プッシュ（A 側）
- [x] フィルター — `synthStore.filterCutoff` → `BiquadFilterNode`（A 側）
- [x] 選択アルファのフィルター連動（透明度 0.5〜1.0）
- [x] `ConfigPanel` に **フィルター・視覚タブ** 追加
- [x] `Oscilloscope`（`AnalyserNode` + Canvas）
- [x] 再生カーソル表示（全ボイスのグレイントリガー → 白色チャンク）
- [x] 選択境界の終点バー表示
- [x] `WaveDisplay` 描画をオリジナル C++ 準拠に修正（チャンク単位着色、背景矩形削除）
- [x] フィルター処理式をオリジナル準拠 + `minCutoff` を設定パネル可変に
- [x] `PianoKeyboard` マウス操作修正（`onMouseLeave` 廃止、ポインタキャプチャ、ドラッググライド）
- [x] ドキュメント同期（ui-mapping / web-spec / web-design / layout-specs / hardware-layout）

### M2.5 バリアント切替

- [x] `uiStore` に `hardwareVariant: "original" | "new"` を追加
- [x] `uiStore` に `playerLayout: "facing" | "stacked" | "solo"` を追加
- [x] `VariantSwitcher` UI — `SynthEngine` から `uiStore` 連携
- [x] ドキュメント同期（web-spec / hardware-layout / web-design）

### M2.5 new 版: UI 配置確定

- [x] `new/layout.html` + `layout.css` — A 側は B の 180 度点対称、`loop-button-*`
- [x] `new-layout.ts` — zone 非依存の単一テンプレート（B は `rotate(180deg)`）
- [x] `NewPlayerModule` — 6×12 グリッド・`VerticalMobileKnob` / `LoopPushButton`
- [x] `VerticalMobileKnob` — Wavejet 対称の縦レール + ホイール（上下=Filter、ホイール=Duration）
- [x] `PianoKeyboard` — new 版は C3-C6（37 鍵、`octaveCount=3`）
- [x] `PlayerControlSurface` — `variant` prop で original/new 切替
- [x] A/B 両面・向き合い/二段モード
- [x] B 側配置のみ — オーバーレイ + `WaveDisplayPlaceholder`
- [x] `SynthEngine` 暫定バリアント切替（ToggleButtonGroup）→ `VariantSwitcher` + `uiStore` に置換
- [x] ドキュメント同期（layout-specs / ui-mapping / web-spec / web-design / hardware-layout）
- [ ] Introduction Fig.1・Physical Build / CAD を人間が再確認 — 任意

### M2.5 オリジナル版: UI 配置確定

- [x] `original/layout.html` + `layout.css` — 配置正本（Planner + `-a`/`-b`）
- [x] `original-layout.ts` — `playerModuleAreas` / `playerModuleTemplate`
- [x] `PlayerModule` — 6×12 グリッド・単一プレイヤーモジュール
- [x] `PlayerControlSurface` — A/B 両面・向き合い/二段モード（B は CSS `rotate(180deg)`）
- [x] `HorizontalSlider` — Filter / Duration（横スライダー + MUI アイコン）
- [x] Loop スイッチ縦向き（`rotate(90deg)`）
- [x] Wavejet サイズ UI 削除（`SelectionRail` 開始位置のみ）
- [x] B 側配置のみ — オーバーレイ + `WaveDisplayPlaceholder`（Wave 0 データ非表示）
- [x] `ControlPanel` を `SynthEngine` から外し `PlayerControlSurface` に置換
- [x] ドキュメント同期（layout-specs / web-spec / web-design / ui-mapping / hardware-layout）

### M2 残り: 演奏 UI（筐体レイアウト）— 暫定版

- [x] `ControlPanel` 新規 — 演奏用コントロール列（M2.5 で `PlayerControlSurface` に置換済み）
- [x] `VerticalSlider` / `RecordButton` / `SelectionRail` コンポーネント
- [x] `SynthEngine` レイアウトを筐体配置へ変更
- [x] Wavejet 水平レール（`SelectionRail`）
- [x] Duration スライダー・録音ボタン・鍵盤
- [x] フィルター・ループの配置枠

### M2: 選択 + グラニュラー + 鍵盤（コア）

- [x] `src/domain/audio/` — grain.ts、env-asr.ts + テスト
- [x] `granular-processor` Worklet + `GranularSynthesizer` + `synthStore`
- [x] `waveStore` 選択状態 + Worklet 同期
- [x] `WaveDisplay` 選択 UI
- [x] `PianoKeyboard` + PC キーボード
- [x] `ConfigPanel` グラニュラータブ
- [x] `SynthEngine` 統合

### M1: 録音 → 波形表示

- [x] スパイク・Worklet・ストア・`WaveDisplay`・`ConfigPanel` 音声タブ

技術判断・ドキュメント

- [X] Tone.js 削除、Web Audio API + AudioWorklet 一本化
- [X] マイルストーン M1〜M4、折りたたみ設定 UI、ディレクトリ方針をドキュメント化
- [X] `docs/original-analysis.md` / `web-spec.md` / `web-design.md`
- [X] `docs/ui-mapping.md` — 電子 / 形状 / 配置を分離した UI 対応表
- [X] `docs/hardware-layout.md` — 座標系・投影メモ

TDD 基盤・設定ドメイン

- [X] Vitest / Testing Library / coverage 基盤
- [X] `src/domain/config/`（Zod + ConfigManager + テスト）

## 技術判断（確定済み）

ドキュメント管轄の詳細: [docs/README.md](docs/README.md)

| 項目 | 決定 |
| --- | --- |
| 音声 | Web Audio API のみ（Tone.js 不使用） |
| Worklet | TypeScript（`?worker&url`） |
| バッファ | SharedArrayBuffer 優先 / postMessage フォールバック |
| GitHub Pages | coi-serviceworker を M1 スパイクで検証済み |
| 設定 UI | M1 から折りたたみ `ConfigPanel` 常設。**演奏用 UI は `PlayerControlSurface`** |
| **UI 配置の正本** | **`docs/layout-specs/<variant>/layout.html`（kebab-case + `-a`/`-b`）** |
| **Web 配置実装** | **`PlayerModule`（6×12）×2 + `original-layout.ts` / `new-layout.ts`** |
| **電子的つながりの正本** | **`ui-mapping.md` · `original-analysis.md`** |
| **UI バリアント** | **`original` / `new` を `uiStore.hardwareVariant` で切替** |
| **プレイヤー配置** | **`uiStore.playerLayout`（`facing` / `stacked` / `solo`）** |
| **配置 vs 機能** | **M2.5=配置確定、M3=機能配線** |
| ディレクトリ | `src/features/synth-engine/` + `src/stores/` + `src/domain/` |

## 振り返り

- M1 スパイク完了。`?worker&url` + coi-serviceworker で SharedArrayBuffer / AudioWorklet を確認。
- M1 本体完了。録音 Worklet → チャンク min/max → Canvas 波形表示、折りたたみ ConfigPanel（音声タブ）、Zustand ストア4つ。
- M2 コア完了。PGranular 移植、選択 UI、PianoKeyboard、synthStore。
- M2.5 オリジナル版完了。`PlayerModule` ベースの A/B 配置、向き合い/二段モード、横スライダー、B 側プレースホルダ。
- M2.5 new 版完了。`NewPlayerModule` + `new-layout.ts`（単一テンプレート）、`VerticalMobileKnob`、C3-C6 鍵盤、`loop-button-*`。
- M2.5 バリアント切替完了。`uiStore.hardwareVariant` + `playerLayout`、`VariantSwitcher`。
- M3 完了。ソロモード、ループ/フィルター配線、`BiquadFilterNode`、オシロスコープ、再生カーソル、終点バー、ConfigPanel フィルター/視覚タブ。WaveDisplay 描画修正、フィルター式調整、PianoKeyboard マウス修正、ドキュメント同期。
- M4 完了。PC キーボードレイアウト（Z-/ + A-L 行）、プリセット/JSON I/O、フルスクリーンボタン、パーティクル演出、Web MIDI（`src/domain/midi/`）。
