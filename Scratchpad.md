# Scratchpad

このファイルは、タスクの計画と進捗状況を追跡するためのスクラッチパッドとして使用されます。
（`.cursor/rules/global.mdc`のルールに従って管理されています）

## 現在のタスク

### 方針（配置 vs 電子）

**配置（空間）**: 既存の UI 配置分析は信用しない。  
`docs/hardware-layout.md`・Canvas・過去の AI 分析によるスロット配置は **暫定・未検証**。一次資料（PDF 図・実機写真・CAD）を人間が確認し、**ワイヤーフレーム + `docs/layout-specs/`** を正本としてから M2.5 を実装する。

**電子的つながり（MIDI・処理式・Store キー）**: **既存分析を正本としてよい**（[ui-mapping.md — 電子的対応](docs/ui-mapping.md#電子的対応正本) · [original-analysis.md](docs/original-analysis.md)）。バリアント切替でも MIDI / Store は不変。

M2.5 の試作実装は **ワイヤーフレーム前のため revert 済み**（`ControlPanel` 暫定版に戻している）。

**次フェーズの優先順位**:

1. **ワイヤーフレーム作成** — オリジナル / 新版の配置を人間が確定
2. **M2.5** — ワイヤーフレーム正本に基づき配置実装 + バリアント切替
3. **M3** — 配線・視覚フィードバック
4. **M4** — 拡張

---

### ワイヤーフレーム作成（M2.5 の前提）

**ゴール**: AI が誤読しにくい **ラベル付きワイヤー + YAML スロット定義** を `docs/layout-specs/` に置く。

ガイド: [docs/layout-specs/README.md](docs/layout-specs/README.md)

#### A. オリジナル版（`hw_version=original`）

- [ ] Introduction Fig.2・Doctor Mix 動画を人間が再確認
- [ ] `original.wireframe.png` — 矩形 + `SLOT_*` ラベル、スライダー向き明示
- [ ] `original.web.yaml` — リージョン・スロット・コンポーネント・向き（horizontal/vertical）・積み方

#### B. 新版（`hw_version=new`）

- [ ] Introduction Fig.1・Physical Build / CAD を人間が再確認
- [ ] `new.wireframe.png`
- [ ] `new.web.yaml`

#### C. 共通

- [ ] 1 プレイヤー分の Web 投影（`WEB_STACK_1〜3`）を両バリアントで定義
- [ ] オリジナル vs 新版の **差分表**（どのスロットが置き換わるか）
- [ ] 確定後: `hardware-layout.md` / `ui-mapping.md` をワイヤーフレームに合わせて更新

#### 完了条件

- [ ] 人間がワイヤーを見て「実機と矛盾しない」と判断できる
- [ ] YAML だけでスロット一覧・向き・リージョンが一意に読める
- [ ] M2.5 実装タスクにそのまま渡せる

---

### M2.5: UI 配置確定 + ハードウェアバリアント切替（ワイヤーフレーム後）

**前提**: `docs/layout-specs/*.yaml` + `*.wireframe.png` が正本。

**ゴール**: `hw_version=original | new` を切り替えると演奏面の **見た目・スロット位置** が変わる。Filter / Loop 等は未配線でもスロットに存在すること。

（詳細タスクはワイヤーフレーム確定後に `layout-specs` から起こし直す）

- [ ] `layout/` + `PlayerControlSurface` 等 — **YAML 正本どおり**に再実装
- [ ] `ControlPanel` 暫定横一列を撤去
- [ ] バリアント切替（`uiStore` + `VariantSwitcher`）
- [ ] `hardware-layout.md` / `ui-mapping.md` をワイヤーフレーム反映版に更新

---

### M3: ループ・フィルター・オシロスコープ（配置確定後）

**前提**: M2.5 でスロット位置は固定。M3 は **配線と視覚フィードバック** のみ。

- [ ] ループ ON/OFF — オリジナル=トグル / 新版=プッシュ
- [ ] フィルター + Duration — ワイヤーフレームで定義されたコントロール形状に接続
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
- [X] `docs/ui-mapping.md` — 電子 / 形状 / 配置を分離した UI 対応表
- [X] `docs/hardware-layout.md` + Canvas — 筐体位置関係（**配置は未検証・暫定**）

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
| 設定 UI | M1 から折りたたみ `ConfigPanel` 常設。**演奏用 UI は別コンポーネント**（筐体レイアウト） |
| **UI 配置の正本** | **`docs/layout-specs/`（ワイヤーフレーム + YAML）。既存 layout 分析は暫定** |
| **電子的つながりの正本** | **`ui-mapping.md` · `original-analysis.md`（既存分析を当てにしてよい）** |
| **UI バリアント** | **`original` / `new` を `uiStore` で切替（M2.5 で実装予定）** |
| **配置 vs 機能** | **M2.5=配置確定、M3=機能配線（配線の正本は電子ドキュメント）** |
| ディレクトリ | `src/features/synth-engine/` + `layout/` + `src/stores/` + `src/domain/` |

## 振り返り

- M1 スパイク完了。`?worker&url` + coi-serviceworker で SharedArrayBuffer / AudioWorklet を確認。
- M1 本体完了。録音 Worklet → チャンク min/max → Canvas 波形表示、折りたたみ ConfigPanel（音声タブ）、Zustand ストア4つ。
- M2 コア完了。PGranular 移植、選択 UI、PianoKeyboard、synthStore。
- M2 残り完了。暫定 `ControlPanel` 横一列を実装。
- M2.5 試作を実施したが、配置分析の信頼性不足・ビジュアル不一致のため **revert**。ワイヤーフレーム作成を先行。
- 次: **ワイヤーフレーム** → **M2.5 再実装** → M3。
