# オリジナル Collidoscope vs Web版 UI対応表

ドキュメント索引・管轄: [README.md](README.md)

オリジナル実装の分析は [original-analysis.md](original-analysis.md)、Web版の機能要件は [web-spec.md](web-spec.md) を参照。

**演奏 UI と設定 UI**: 筐体配置のコントロールは演奏用コンポーネント（`PlayerControlSurface`）に置く。`ConfigPanel` はデバッグ・全パラメータ用。

## 調査結果

オリジナルは **GUI ウィジェットを一切持たない** フルスクリーン楽器。すべての操作は物理コントロール / キーボード / MIDI で、フィードバックは視覚と音声のみ。Web版はブラウザ向けにボタン・スライダー・設定パネルなどの GUI 要素を追加している。

---

## 電子的対応（正本）

> C++ `CollidoscopeApp`・Teensy ファームウェア・[Collidoscope MIDI messages reference.pdf](../opencollidoscope_downloads/Collidoscope%20MIDI%20messages%20reference.pdf) に基づく既存分析を **正本としてよい**。バリアント切替（`original` / `new`）でも **MIDI と Store キーは変えない**。

| スロット ID | パラメータ | MIDI | マッピング（Web / オリジナル共通） | Web Store / 実装 |
| --- | --- | --- | --- | --- |
| `SLOT_KEYBOARD` | 演奏 | Note On/Off | ピッチ付きグレイン（最大 6 ボイス） | `synthStore` noteOn/Off |
| `SLOT_KEYBOARD_OCTAVE_UP` | オクターブ + | —（鍵盤内部） | 表示音域を 1 オクターブ上へ | `synthStore` keyboardOctaveOffset |
| `SLOT_KEYBOARD_OCTAVE_DOWN` | オクターブ - | —（鍵盤内部） | 表示音域を 1 オクターブ下へ | 同上 |
| `SLOT_WAVEJET`（水平） | 選択開始 | Pitch Bend 0〜149 | チャンクインデックス | `waveStore.selection.start` |
| `SLOT_WAVEJET`（回転） | 選択サイズ | CC1 | MIDI 0〜127 → 1〜37 チャンク | `waveStore.selection.size` |
| `SLOT_FADER_DURATION` / 新版ノブ回転 | Duration | CC2 | 0〜127 → グレイン持続係数 1.0〜8.0 | `synthStore.grainDurationCoeff` |
| `SLOT_LOOP_TOGGLE` / `SLOT_LOOP_PUSH` | ループ | CC4 | >0 = ON / 0 = OFF | `synthStore.loop.enabled` |
| `SLOT_RECORD` | 録音 | CC5 | 2 秒録音トリガー | `audioStore` 録音 |
| `SLOT_FADER_FILTER` / 新版ノブ上下 | フィルター | CC7 | カットオフ + 選択透明度 0.5〜1.0 | `synthStore.filterCutoff` + `config.filter`（範囲）+ `BiquadFilterNode` |

詳細（Teensy ピン配線・処理式・ノイズ除去）: [original-analysis.md — MIDI 制御](original-analysis.md#midi-制御)

Web MIDI 入力（M4、`src/domain/midi/` + `midiStore`）も上記と同一 Store にルーティングする。Phase 1 は MIDI チャンネル 1（ch 0）のみ。

---

## 物理コントロール形状（資料ベース）

筐体上の**画面上の配置**は [layout-specs/](layout-specs/README.md) の kebab-case ブロック名（例: `keyboards-a`, `display-red`）が正本。**MIDI・Store・部品形状・操作向き**は本書の `SLOT_*` が正本。配置資料にそれらを重複記載しない。

配置ブロック名 → `SLOT_*` の対応: [layout-specs/README.md — Web 移植対応](layout-specs/README.md#web-移植対応m25-参考)

公式資料: [`Introduction to Collidoscope.pdf`](../opencollidoscope_downloads/Introduction%20to%20Collidoscope.pdf)

| スロット ID | パラメータ | オリジナル版 | 新版 | 部品 | 操作軸 |
| --- | --- | --- | --- | --- | --- |
| `SLOT_FADER_FILTER` | フィルター | 縦スライダー（太陽/月） | Vertical Mobile Knob 上下 | Bourns 縦フェーダー / SoftPot 縦 | 縦 |
| `SLOT_FADER_DURATION` | Duration | 縦スライダー（粒/雲） | 同ノブ回転 | Bourns 縦フェーダー / エンコーダー | 縦 / 回転 |
| `SLOT_WAVEJET` | 選択位置・サイズ | 水平移動 / ノブ回転 | 同左 | SoftPot + エンコーダー + 38mm ノブ | 水平=開始、回転=サイズ |
| `SLOT_SHORT_KNOB` | Filter + Duration | — | Vertical Mobile Knob（縦レール + ノブ） | Wavejet と同部品・縦配置 | 縦=Filter、回転=Duration |
| `SLOT_RECORD` | 録音 | 16mm 赤プッシュ（LED リング） | 同左 | 16mm 赤プッシュ | 押下 |
| `SLOT_KEYBOARD` | 演奏 | USB MIDI 鍵盤（C3-C5、25 鍵・中央 C4） | USB MIDI 鍵盤（C3-C6、37 鍵） | USB MIDI 鍵盤 | — |
| `SLOT_KEYBOARD_OCTAVE_UP` | オクターブ + | 鍵盤横プッシュ | — | 鍵盤本体ボタン | 押下 |
| `SLOT_KEYBOARD_OCTAVE_DOWN` | オクターブ - | 鍵盤横プッシュ | — | 鍵盤本体ボタン | 押下 |
| `SLOT_LOOP_TOGGLE` | ループ | トグルフリックスイッチ | — | 12V トグル | フリック |
| `SLOT_LOOP_PUSH` | ループ | — | プッシュボタン | 48m-ss プッシュ | 押下 |

---

## Web 版 UI 実装状態

**画面上の配置**は [layout-specs/original/](layout-specs/README.md) を正本とし、`PlayerControlSurface` + `original-layout.ts`（180 度投影）で実装。**配線・Store** は上記「電子的対応」を正本とする。

| パラメータ | Web 版 UI | 配線状態 | 配置状態 | マイルストーン |
| --- | --- | --- | --- | --- |
| フィルター | 横 Slider（`HorizontalSlider`）/ `VerticalMobileKnob` 縦ドラッグ | 済（A 側） | 済（A/B 配置） | M3 |
| Duration | 横 Slider（`HorizontalSlider`）/ `VerticalMobileKnob` ホイール | 済（A 側） | 済（A/B 配置） | M2.5 |
| 選択サイズ | なし（ホイールのみ） | 済 | — | — |
| 選択位置 | `SelectionRail` + ドラッグ | 済（A 側） | 済（A/B 配置） | M2.5 |
| ループ | `Switch`（各端）/ `LoopPushButton`（new） | 済（A 側） | 済（A/B 配置） | M3 |
| 録音 | `RecordButton` | 済（A 側） | 済（A/B 配置） | M2.5 |
| 演奏 | `PianoKeyboard`（25 鍵 / new は 37 鍵）+ PC 鍵盤（Z-/ 行） | 済（A 側） | 済（A/B 配置） | M2.5 / M4 |
| オクターブ +/- | `OctaveButton` ×2 | 済（A 側） | 済（A/B 配置） | M2.5 |
| Web MIDI 入力 | `src/domain/midi/` + `midiStore` | 済（ch 0） | — | M4 |
| プリセット / JSON | `ConfigPanel`「プリセット」セクション | 済 | — | M4 |
| フルスクリーン | `SynthEngine` トグルボタン | 済 | — | M4 |
| Wave 1 表示 | 配置枠（黄） | 未実装 | 済（placeholder） | Phase 2 |

**PC 鍵盤（ピアノ演奏）**: Z 行=白鍵、A 行=黒鍵。**C キー=C4**、**A キー=G#3**。正本: `keyboard-layout.ts`。詳細は [web-spec.md — PC 鍵盤](web-spec.md#pc-鍵盤ピアノ演奏)。画面上鍵盤はポインタキャプチャ + ドラッググライド。

オリジナル C++ デバッグショートカット（`r`/`a`/`d`/`w`/`s`/`9`/`0`/Space/`f`）は Web 版 Phase 1 では**未移植**。

---

## 対応表: 視覚要素

| パーツ | オリジナル | Web版 | 状態 | 対応マイルストーン |
| --- | --- | --- | --- | --- |
| 黒背景 | 全画面黒 | `Box`（黒 bg） | 済 | M1 |
| チャンクバー | 7px 幅 × 150 本、min/max バー | Canvas 描画 | 済 | M1 |
| 範囲外チャンク色 | グレー `Color(0.5, 0.5, 0.5)` | `#808080`（選択範囲外のみ） | 済 | M3 |
| チャンク出現アニメーション | 3 フレームポップアップ | `updatedAt` ベースのパルス | 済 | M1 |
| チャンクリセットアニメーション | 10 フレーム縮小 | なし | **未実装** | — |
| 選択ハイライト | 半透明カラー塗り | Canvas 半透明 fill | 済 | M2 |
| 選択境界バー | 始点・終点に全高バー（50% alpha） | 始点・終点バー + 始点ノブ（ドラッグ用） | **差異あり**（始点ノブは Web 独自） | M3 |
| 選択アルファ（フィルター連動） | フィルター CC7 で透明度 0.5〜1.0 | `selectionAlphaFromFilter` + チャンク着色 | 済 | M3 |
| 再生カーソル | 白色、アクティブチャンクを白描画。`elapsed / secondsPerChunk` で選択範囲内を移動 | `cursorTrigger` で `selection.start` + `startTime` を記録し、RAF ループで位置計算 | 済 | M3 |
| オシロスコープ | 白 PolyLine、波形背後に描画 | `AnalyserNode` + Canvas（`WaveDisplay` 背面） | 済 | M3 |
| パーティクル | 白点、`durationCoeff > 1` で発生 | `ParticleSystem` + `WaveDisplay` | 済 | M4 |
| Wave 1（黄 / 上半分 / 反転） | 水平ミラー表示 | なし（Phase 1 では 1 波形のみ） | Phase 2 | Phase 2 |
| 中心線 | 水平軸線 | Canvas `centerLine` | 済 | M1 |

## 対応表: Web版独自の UI（オリジナルにない）

| パーツ | 説明 | マイルストーン |
| --- | --- | --- |
| 「音声を開始」ボタン | `AudioContext` 初期化（ブラウザ要件） | M1 |
| アプリタイトル | "Open Collidoscope" | M1 |
| エラー Alert | 権限エラー等の表示 | M1 |
| 録音ステータステキスト | "録音中…" / "録音済み" 等 | M1 |
| 選択情報ラベル | start / size の数値表示 + ヒント | M2 |
| Duration 係数ラベル | 現在値の数値表示 | M2 |
| PianoKeyboard（画面上鍵盤） | 視覚的ピアノ鍵盤 | M2 |
| 鍵盤ヘルプテキスト | キーマッピング説明 | M2 |
| ConfigPanel（設定ドロワー） | 折りたたみ式 `Drawer` + `Accordion`、全パラメータ調整 | M1〜 |
| 設定 FAB（歯車アイコン） | パネル開閉 | M1 |
| 音声セクション | 録音時間、チャンク数、アテニュエーション等 | M1 |
| マイク入力セクション | 入力ゲイン、レベルメーター、ブラウザ処理、コンプレッサー、録音後正規化 | M1 拡張 |
| グラニュラーセクション | グレイン数、ボイス数、エンベロープ等 | M2 |
| 筐体バリアント切替 | `VariantSwitcher`（`uiStore.hardwareVariant`） | M2.5 |
| プレイヤー配置モード | 向き合い / 二段 / ソロ（`uiStore.playerLayout`） | M2.5 / M3 |
| フルスクリーントグル | Fullscreen API（`uiStore.isFullscreen`） | M4 |
| 音量ステータスバー | `VolumeStatusBar`（`SynthEngine` 上部ツールバー左端）。入力レベル＋「音量（アテニュエーション）」0-1 を常時表示し、クリックで `ConfigPanel` の該当セクション（マイク入力 / 音声）を開く | M1 拡張 |
| プリセットセクション | 名前付き保存・JSON 入出力 | M4 |
| MIDI セクション | 入力デバイス一覧・CC マッピング表示 | M4 |

## M2.5 UI 配置（オリジナル版・実装済み）

`PlayerControlSurface` が `layout-specs/original/layout.css` を 180 度投影した 12 行グリッドで A/B 両面を描画する。

1. **`PlayerControlSurface`** — `original-layout.ts` の `playerModuleTemplate` 駆動
2. **`HorizontalSlider`** — Filter / Duration（`slider-moon-sun-*` / `slider-small-big-*`）
3. **`SelectionRail`** — Wavejet 開始位置のみ（サイズスライダー UI なし）
4. **`RecordButton` + `PianoKeyboard` + `OctaveButton`** — A 側は配線済み、B 側は配置のみ
5. **Filter・ループ** — A 側は配線済み、B 側は配置のみ（Phase 2）
6. **バリアント切替** — `VariantSwitcher`（`uiStore.hardwareVariant`）。配置モードは `uiStore.playerLayout`（向き合い/二段/ソロ）

## M2.5 UI 配置（新版・実装済み）

`PlayerControlSurface` の `variant="new"` で `NewPlayerModule` を使用。`new-layout.ts` は zone 非依存の単一テンプレート（B は `rotate(180deg)`）。

1. **`new-layout.ts`** — `playerModuleAreas` / `playerModuleTemplate`（A/B 共通構造）
2. **`VerticalMobileKnob`** — Wavejet 対称の縦レール + ホイール（`vertical-mobile-knob-*`、上下=Filter、ホイール=Duration）
3. **`LoopPushButton`** — ループプッシュ（`loop-button-*`）
4. **`PianoKeyboard`** — C3-C6（37 鍵、`octaveCount=3`）
5. **A/B 両面・向き合い/二段/ソロモード** — `uiStore.playerLayout`
6. **B 側は配置のみ** — オーバーレイ + `WaveDisplayPlaceholder`
7. **バリアント切替** — `VariantSwitcher`（`uiStore.hardwareVariant`）。配置モード切替は `SynthEngine` 上部の ToggleButtonGroup

暫定 `ControlPanel` は `SynthEngine` から外れ、ファイルも削除済み。

## M3 UI 要素（完了）

1. **ソロモード** — `playerLayout: "solo"` + Player B 非表示
2. **ループ ON/OFF** — `synthStore.loop.enabled`、A 側 `Switch` / `LoopPushButton`
3. **フィルターカットオフ** — `synthStore.filterCutoff` → `BiquadFilterNode`
4. **選択アルファのフィルター連動** — `selectionAlphaFromFilter`
5. **オシロスコープ** — `AnalyserNode` + Canvas
6. **再生カーソル** — Worklet `cursorTrigger` / `cursorEnd` → `waveStore.cursors`（`CursorState`: `startChunk` + `startTime`）。描画は `WaveDisplay` の RAF ループで `secondsPerChunk = waveLength / chunkCount` に基づき進行
7. **ConfigPanel フィルター・視覚セクション**
8. **選択境界の終点バー**

## M4 UI 要素（完了）

1. **PC 鍵盤レイアウト** — Z-/ 行=白鍵、A-L 行=黒鍵、C キー=C4（`keyboard-layout.ts`）
2. **プリセット・JSON** — `ConfigPanel`「プリセット」セクション、`ConfigManager` + `configStore`
3. **フルスクリーン** — `uiStore.toggleFullscreen` + `SynthEngine` トグルボタン
4. **パーティクル** — `particle-system.ts` + `WaveDisplay`（`cursorTrigger` 連動）
5. **Web MIDI** — `src/domain/midi/` + `midiStore` + `ConfigPanel`「MIDI」セクション（Phase 1: ch 0）

## 追加で検討すべき項目

- **チャンクリセットアニメーション** — 優先度低

## 関連ドキュメント

- [README.md](README.md) — ドキュメント索引・管轄
- [layout-specs/README.md](layout-specs/README.md) — 画面上の配置正本（kebab-case ブロック名 + `-a`/`-b` ゾーン接尾辞）
- [hardware-layout.md](hardware-layout.md) — 座標系・資料索引・配置暫定図
- [web-spec.md](web-spec.md) — Phase 1 マイルストーン定義
- [web-design.md](web-design.md) — コンポーネント設計
- [original-analysis.md](original-analysis.md) — C++ / Teensy 処理式の詳細
