# Scratchpad

このファイルは、タスクの計画と進捗状況を追跡するためのスクラッチパッドとして使用されます。
（`.cursor/rules/global.mdc`のルールに従って管理されています）

## 現在のタスク

### Phase 1 実装（次: M1）

### M1: 録音 → 波形表示

- [x] スパイク: Vite `?worker&url` で空 Worklet を `addModule` できること
- [x] スパイク: [coi-serviceworker](https://github.com/gzuidhof/coi-serviceworker)（GitHub Pages / SharedArrayBuffer 用。未完了でも postMessage で継続可）
- [ ] `src/features/synth-engine/` 骨格（`SynthEngine.tsx`, `index.ts`）
- [ ] `src/domain/audio/` — チャンク計算・フェード等の純粋関数 + 単体テスト
- [ ] `src/stores/` — `audioStore`, `waveStore`, `configStore`, `uiStore`（`isConfigPanelOpen`）
- [ ] `ConfigPanel` — 折りたたみ式、**音声タブ**のみ（`ConfigManager` 接続）
- [ ] `recording-processor` Worklet（TypeScript）
- [ ] 録音バッファ共有（優先: SharedArrayBuffer、フォールバック: postMessage）
- [ ] マイク入力・`AudioContext` 初期化（`audioStore`）
- [ ] `WaveDisplay`（Canvas）+ Record UI
- [ ] `App.tsx` を `SynthEngine` に接続

### M2: 選択 + グラニュラー + 鍵盤

- [ ] `granular-processor` Worklet（`PGranular` 移植、`domain/audio` と共有）
- [ ] `synthStore` 追加
- [ ] `ConfigPanel` に **グラニュラータブ** 追加
- [ ] 選択 UI（スライダー + ホイール）
- [ ] `PianoKeyboard` + PC キーボード

### M3: ループ・フィルター・オシロスコープ

- [ ] ループ ON/OFF
- [ ] `BiquadFilterNode` ローパス
- [ ] `ConfigPanel` に **フィルター・視覚タブ** 追加
- [ ] `Oscilloscope`（`AnalyserNode` + Canvas）
- [ ] 再生カーソル表示

### M4: プリセット・MIDI・パーティクル

- [ ] `ConfigPanel` に **プリセット・JSON 入出力**（`savePreset` 等）
- [ ] Web MIDI API（`src/domain/midi/`）
- [ ] パーティクル演出
- [ ] キーボードショートカット一式

## 完了済みタスク

技術判断・ドキュメント

- [X] Tone.js 削除、Web Audio API + AudioWorklet 一本化
- [X] マイルストーン M1〜M4、折りたたみ設定 UI、ディレクトリ方針をドキュメント化
- [X] `docs/original-analysis.md` / `web-spec.md` / `web-design.md`
- [X] 旧 spec/design 削除、参照パス更新
- [X] lint-staged 修正（vitest タスク空時は `[]` を返す）

TDD 基盤・設定ドメイン

- [X] Vitest / Testing Library / coverage 基盤
- [X] `src/domain/config/`（Zod + ConfigManager + テスト）

オリジナル分析・初期設計

- [X] オリジナル C++ 分析、AudioWorklet 方針、2 波形構造の整理

## 技術判断（確定済み）

| 項目 | 決定 |
| --- | --- |
| 音声 | Web Audio API のみ（Tone.js 不使用） |
| Worklet | TypeScript（`?worker&url`） |
| バッファ | SharedArrayBuffer 優先 / postMessage フォールバック |
| GitHub Pages | coi-serviceworker を M1 スパイクで検証 |
| 設定 UI | M1 から折りたたみ `ConfigPanel` 常設。プリセット・JSON は M4 |
| ディレクトリ | `src/features/synth-engine/` + `src/stores/` + `src/domain/` |

## 振り返り

- M1 スパイク完了（`spike/worklet-coi` ブランチ）。`?worker&url` で TS Worklet を `addModule` 可能。coi-serviceworker + 静的配信（COOP/COEP ヘッダーなし）で `crossOriginIsolated` / `SharedArrayBuffer` / AudioWorklet テスト成功。
- 次: `spike/worklet-coi` を main へ PR マージ後、GitHub Pages で最終確認。続いて M1 本体（`SynthEngine` 骨格、`recording-processor` 等）へ着手。
