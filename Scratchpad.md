# Scratchpad

このファイルは、タスクの計画と進捗状況を追跡するためのスクラッチパッドとして使用されます。
（`.cursor/rules/global.mdc`のルールに従って管理されています）

## 現在のタスク

### Phase 1 実装（次: M3）

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

### M2: 選択 + グラニュラー + 鍵盤

- [x] `src/domain/audio/` — grain.ts（Hann窓・補間・ピッチ）、env-asr.ts + テスト
- [x] `granular-processor` Worklet（PGranular 移植、ボイス管理、メッセージプロトコル）
- [x] `GranularSynthesizer` クラス + `synthStore`
- [x] `waveStore` 選択状態（start/size）+ ストア購読で Worklet 同期
- [x] `WaveDisplay` 選択ハイライト + ドラッグ + ホイール
- [x] `PianoKeyboard` + PC キーボード（A S D F G H J K / W E T Y U）
- [x] `ConfigPanel` グラニュラータブ
- [x] `SynthEngine` 統合（録音 → 選択 → 鍵盤演奏）

### M1: 録音 → 波形表示

- [x] スパイク: Vite `?worker&url` / coi-serviceworker
- [x] `src/domain/audio/` — チャンク計算・フェード + 単体テスト
- [x] `src/stores/` — audioStore, waveStore, configStore, uiStore
- [x] `recording-processor` Worklet（SAB 優先 / postMessage フォールバック）
- [x] `SynthEngine` 骨格 + `WaveDisplay` + `ConfigPanel`（音声タブ）
- [x] `App.tsx` を `SynthEngine` に接続（スパイク UI 置き換え）

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
| GitHub Pages | coi-serviceworker を M1 スパイクで検証済み |
| 設定 UI | M1 から折りたたみ `ConfigPanel` 常設。プリセット・JSON は M4 |
| ディレクトリ | `src/features/synth-engine/` + `src/stores/` + `src/domain/` |

## 振り返り

- M1 スパイク完了。`?worker&url` + coi-serviceworker で SharedArrayBuffer / AudioWorklet を確認。
- M1 本体完了。録音 Worklet → チャンク min/max → Canvas 波形表示、折りたたみ ConfigPanel（音声タブ）、Zustand ストア4つ。
- M2 完了。PGranular 移植の granular-processor、選択 UI、PianoKeyboard、synthStore。録音バッファからグラニュラー演奏可能。
- 次: M3（ループ、フィルター、オシロスコープ、再生カーソル）。
