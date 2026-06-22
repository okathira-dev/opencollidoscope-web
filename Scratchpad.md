# Scratchpad

このファイルは、タスクの計画と進捗状況を追跡するためのスクラッチパッドとして使用されます。
（`.cursor/rules/global.mdc`のルールに従って管理されています）

## 現在のタスク

### Phase 1 実装（次: M2 残り → M3）

演奏用 UI は **筐体の物理配置を模す**（`ConfigPanel` 設定ドロワーではない）。レイアウト正本: [docs/ui-mapping.md](docs/ui-mapping.md)「1 プレイヤー分の物理レイアウト」。

### M2 残り: 演奏 UI（筐体レイアウト）

現状 `SynthEngine` は縦積みの暫定 UI。オリジナル版筐体に沿った **演奏用 `ControlPanel`** へ置き換える。

```text
[波形ディスプレイ — WaveDisplay]
[Wavejet 水平レール — 選択開始 / Pitch Bend]
────────────────────────────────────────
 縦スライダー×2 │ Wavejetノブ │ 録音 │ 鍵盤 │ ループ
 Filter/Duration │ 選択サイズ  │      │      │ (M3)
```

- [ ] `ControlPanel` 新規 — 演奏用コントロール列（`ConfigPanel` とは別コンポーネント）
- [ ] `SynthEngine` レイアウトを筐体配置へ変更（暫定縦積みスライダー・ラベルを演奏 UI へ統合）
- [ ] **Wavejet 水平レール** — 波形直下、選択開始位置（現状の単独 Slider をここへ）
- [ ] **選択サイズ縦スライダー** — Wavejet ノブ回転相当（CC1）。現状ホイールのみ
- [ ] **Duration 縦スライダー** — 粒/雲アイコン相当（CC2）。現状は横スライダーで別位置
- [ ] **録音ボタン** — 演奏コントロール列へ移動（鍵盤左隣。赤プッシュボタン風）
- [ ] **鍵盤** — 演奏コントロール列内に配置（現状は縦積み最下部）
- [ ] フィルター・ループの **配置枠** を左列・右端に確保（機能実装は M3）

### M3: ループ・フィルター・オシロスコープ

UI 対応表: [docs/ui-mapping.md](docs/ui-mapping.md)

- [ ] ループ ON/OFF トグル（演奏コントロール列右端。`synthStore.loop.enabled` は既存）
- [ ] フィルター縦スライダー（演奏コントロール列左。太陽/月相当）+ `BiquadFilterNode`
- [ ] 選択アルファのフィルター連動（透明度 0.5〜1.0）
- [ ] `ConfigPanel` に **フィルター・視覚タブ** 追加
- [ ] `Oscilloscope`（`AnalyserNode` + Canvas）
- [ ] 再生カーソル表示（Worklet トリガー → 白色チャンク）
- [ ] 選択境界の終点バー表示（現状始点ノブのみ）

### M4: プリセット・MIDI・パーティクル

- [ ] `ConfigPanel` に **プリセット・JSON 入出力**（`savePreset` 等）
- [ ] Web MIDI API（`src/domain/midi/`）
- [ ] パーティクル演出
- [ ] キーボードショートカット一式（`R` `A`/`D` `W`/`S` `Space` `9`/`0` `F`）
- [ ] フルスクリーン切替（オリジナル `f` キー相当）

## 完了済みタスク

### M2: 選択 + グラニュラー + 鍵盤（コア）

- [x] `src/domain/audio/` — grain.ts（Hann窓・補間・ピッチ）、env-asr.ts + テスト
- [x] `granular-processor` Worklet（PGranular 移植、ボイス管理、メッセージプロトコル）
- [x] `GranularSynthesizer` クラス + `synthStore`
- [x] `waveStore` 選択状態（start/size）+ ストア購読で Worklet 同期
- [x] `WaveDisplay` 選択ハイライト + ドラッグ + ホイール
- [x] `PianoKeyboard` + PC キーボード（A S D F G H J K / W E T Y U）
- [x] `ConfigPanel` グラニュラータブ
- [x] `SynthEngine` 統合（録音 → 選択 → 鍵盤演奏）— **UI は暫定縦積み。筐体レイアウトは M2 残り**

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
- [X] `docs/ui-mapping.md` — オリジナル vs Web版 UI 対応表
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
| 設定 UI | M1 から折りたたみ `ConfigPanel` 常設（デバッグ・全パラメータ）。**演奏用 UI は別コンポーネント**（筐体レイアウト） |
| ディレクトリ | `src/features/synth-engine/` + `src/stores/` + `src/domain/` |

## 振り返り

- M1 スパイク完了。`?worker&url` + coi-serviceworker で SharedArrayBuffer / AudioWorklet を確認。
- M1 本体完了。録音 Worklet → チャンク min/max → Canvas 波形表示、折りたたみ ConfigPanel（音声タブ）、Zustand ストア4つ。
- M2 コア完了。PGranular 移植、選択 UI、PianoKeyboard、synthStore。演奏 UI は暫定縦積みのまま。
- UI 対応表を `docs/ui-mapping.md` に整理。M2 残りに筐体レイアウトの演奏 UI を追加。
- 次: M2 残り（`ControlPanel` 筐体配置）→ M3。
