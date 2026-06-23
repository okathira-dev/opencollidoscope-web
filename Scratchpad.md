# Scratchpad

このファイルは、タスクの計画と進捗状況を追跡するためのスクラッチパッドとして使用されます。
（`.cursor/rules/global.mdc`のルールに従って管理されています）

## 現在のタスク

### 方針転換（M3 の前に配置を固める）

M2 残りで **横一列 `ControlPanel`** を入れたが、これは `WEB_ROW_1〜6` の暫定投影であり [hardware-layout.md](docs/hardware-layout.md) の物理ゾーン（`lateral_left` / `lateral_right` / `player_end`）と一致していない。

**次フェーズの優先順位**:

1. **M2.5** — オリジナル / 新版の **配置だけ** をすべて決め、切替可能にする（機能はスタブ・既存配線でよい）
2. **M3** — 決まったスロットにループ・フィルター・オシロ等の **挙動を接続**
3. **M4** — 拡張（プリセット・MIDI 等）

正本: [docs/hardware-layout.md](docs/hardware-layout.md) · レビュー用 Canvas: [collidoscope-hardware-layout](C:/Users/sardo/.cursor/projects/g-dev-opencollidoscope-web/canvases/collidoscope-hardware-layout.canvas.tsx)

---

### M2.5: UI 配置確定 + ハードウェアバリアント切替

**ゴール**: `hw_version=original | new` を切り替えると演奏面の **見た目・スロット位置** が変わる。Filter / Loop 等は未配線でもスロットに存在すること。

#### A. 仕様・データモデル

- [ ] `HardwareUiVariant` 型（`'original' | 'new'`）を定義
- [ ] `uiStore` に `hardwareUiVariant` + setter（将来 `configStore` / プリセットへ移す余地をコメントで残す）
- [ ] バリアント切替 UI（演奏画面上部の Pill または `ConfigPanel`「表示」タブ — **演奏中も切替可能**）
- [ ] [hardware-layout.md](docs/hardware-layout.md) の「Web 投影」を **2D グリッド**（`lateral_left` / `lateral_right` / `player_end`）に更新
- [ ] [ui-mapping.md](docs/ui-mapping.md) にバリアント別スロット表を追記（配置確定後）

#### B. レイアウト基盤（スロット駆動）

- [ ] `src/features/synth-engine/layout/` を新設
  - [ ] `types.ts` — `ControlSlotId`, `GridRegion`, `VariantLayout` 型
  - [ ] `original-layout.ts` — オリジナル版スロット → グリッド座標
  - [ ] `new-layout.ts` — 新版スロット → グリッド座標
- [ ] `PlayerControlSurface` — `variant` を受け取り、スロット定義に従って子を配置（`ControlPanel` は薄いラッパーに縮小 or 置換）
- [ ] `SynthEngine` 構成を正本どおり 3 段に固定:
  - `WEB_STACK_1` `WaveDisplay`
  - `WEB_STACK_2` `WavejetRow`（水平 + サイズ）
  - `WEB_STACK_3` `PlayerControlSurface`

#### C. オリジナル版配置（`hw_version=original`）

物理: [hardware-layout.md](docs/hardware-layout.md)「1 プレイヤー分 — オリジナル版」・Doctor Mix 2015 動画

- [ ] **Wavejet 行** (`WEB_STACK_2`)
  - [ ] `SelectionRail` — 水平（選択開始 / Pitch Bend）
  - [ ] **選択サイズ**をここへ移動（ノブ回転メタファー。現状 `ControlPanel` 内の縦 Slider を移す）
- [ ] **演奏面グリッド** (`WEB_STACK_3`)
  - [ ] `lateral_left`: `PianoKeyboard`
  - [ ] `lateral_right`: `VerticalSlider` Filter（太陽/月）— **M3 までスタブ可**
  - [ ] `lateral_right`: `VerticalSlider` Duration（粒/雲）— 既存配線を維持
  - [ ] `lateral_right` 端: Loop **トグル** — **M3 までスタブ可**
  - [ ] `player_end` 行: `RecordButton` を **右端（マイク側）** に配置（中央列から移動）

#### D. 新版配置（`hw_version=new`）

物理: Introduction Fig.1 / CAD `A-1-3` Short Rail

- [ ] **Wavejet 行** — オリジナルと同構成（水平 + サイズノブ）
- [ ] **演奏面グリッド**
  - [ ] `lateral_left`: `PianoKeyboard`
  - [ ] `lateral_right`: `ShortKnobControl` 新規 — 上下=Filter / 回転=Duration（**2 縦フェーダーの代わり**）
  - [ ] `player_end` 行: `RecordButton` + Loop **プッシュボタン**（`RecordButton` と同系の押しボタン UI）
- [ ] 新版では Filter・Duration の縦フェーダー 2 本を **表示しない**

#### E. 共通コンポーネント（配置フェーズで追加）

| コンポーネント | 用途 | 備考 |
| --- | --- | --- |
| `ShortKnobControl` | 新版 Filter+Duration | 縦ドラッグ + 回転（または縦 Slider + 回転ノブの複合 UI） |
| `LoopControl` | ループ UI | `variant` で `Toggle` / `PushButton` を切替 |
| `WavejetRow` | WEB_STACK_2 ラッパー | Rail + Size を横並び |
| `PlayerEndBar` | player_end 行 | 録音・ループ（新版）を右寄せ |

#### F. レビュー完了条件（M2.5 の Done）

- [ ] Canvas の「オリジナル版」「新版」「Web 投影」タブと実 UI のスロット対応が一致
- [ ] バリアント切替で **配置が変わり**、MIDI / Store のキーは変わらない（同じ `synthStore` / `waveStore`）
- [ ] Filter・Loop が未実装でも **正しい位置にプレースホルダ** がある
- [ ] `ControlPanel` の暫定横一列（Filter｜Duration｜サイズ｜録音｜鍵盤｜Loop）を撤去

---

### M3: ループ・フィルター・オシロスコープ（配置確定後）

**前提**: M2.5 でスロット位置は固定。M3 は **配線と視覚フィードバック** のみ。

- [ ] ループ ON/OFF — `LoopControl` に `synthStore.loop.enabled` 接続（オリジナル=トグル / 新版=プッシュ）
- [ ] フィルター — オリジナル=`VerticalSlider` / 新版=`ShortKnobControl` 縦軸 + `BiquadFilterNode`
- [ ] Duration — オリジナル=`VerticalSlider` / 新版=`ShortKnobControl` 回転軸（既存 CC2 配線を UI に合わせる）
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

---

## 完了済みタスク

### M2 残り: 演奏 UI（筐体レイアウト）— 暫定版

- [x] `ControlPanel` 新規 — 演奏用コントロール列（**M2.5 でスロット駆動に作り直し予定**）
- [x] `VerticalSlider` / `RecordButton` / `SelectionRail` コンポーネント
- [x] `SynthEngine` レイアウトを筐体配置へ変更（3 段のうち STACK_3 が未確定）
- [x] Wavejet 水平レール（`SelectionRail`）
- [x] 選択サイズ縦スライダー（**M2.5 で Wavejet 行へ移動予定**）
- [x] Duration 縦スライダー
- [x] 録音ボタン・鍵盤（**M2.5 でグリッド再配置予定**）
- [x] フィルター・ループの配置枠（**M2.5 でバリアント別スロットへ**）

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
- [X] `docs/ui-mapping.md` — オリジナル vs Web版 UI 対応表
- [X] `docs/hardware-layout.md` + Canvas — 筐体位置関係の正本

TDD 基盤・設定ドメイン

- [X] Vitest / Testing Library / coverage 基盤
- [X] `src/domain/config/`（Zod + ConfigManager + テスト）

## 技術判断（確定済み）

| 項目 | 決定 |
| --- | --- |
| 音声 | Web Audio API のみ（Tone.js 不使用） |
| Worklet | TypeScript（`?worker&url`） |
| バッファ | SharedArrayBuffer 優先 / postMessage フォールバック |
| GitHub Pages | coi-serviceworker を M1 スパイクで検証済み |
| 設定 UI | M1 から折りたたみ `ConfigPanel` 常設。**演奏用 UI は別コンポーネント**（筐体レイアウト） |
| **UI バリアント** | **`original` / `new` を `uiStore` で切替。MIDI・音声処理は共通** |
| **配置 vs 機能** | **M2.5=配置確定、M3=機能配線** |
| ディレクトリ | `src/features/synth-engine/` + `layout/` + `src/stores/` + `src/domain/` |

## 振り返り

- M1 スパイク完了。`?worker&url` + coi-serviceworker で SharedArrayBuffer / AudioWorklet を確認。
- M1 本体完了。録音 Worklet → チャンク min/max → Canvas 波形表示、折りたたみ ConfigPanel（音声タブ）、Zustand ストア4つ。
- M2 コア完了。PGranular 移植、選択 UI、PianoKeyboard、synthStore。
- M2 残り完了。暫定 `ControlPanel` 横一列を実装。**物理ゾーンとのズレを確認** → M2.5 で配置確定 + バリアント切替を先行。
- 次: **M2.5**（配置・切替）→ M3（フィルター・ループ等の配線）。
