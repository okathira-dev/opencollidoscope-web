# オリジナル Collidoscope vs Web版 UI対応表

ドキュメント索引・管轄: [README.md](README.md)

オリジナル実装の分析は [original-analysis.md](original-analysis.md)、Web版の機能要件は [web-spec.md](web-spec.md) を参照。

**演奏 UI と設定 UI**: 筐体配置のコントロールは演奏用コンポーネント（現状 `ControlPanel`、M2.5 でスロット駆動に置換予定）に置く。`ConfigPanel` はデバッグ・全パラメータ用。

## 調査結果

オリジナルは **GUI ウィジェットを一切持たない** フルスクリーン楽器。すべての操作は物理コントロール / キーボード / MIDI で、フィードバックは視覚と音声のみ。Web版はブラウザ向けにボタン・スライダー・設定パネルなどの GUI 要素を追加している。

---

## 電子的対応（正本）

> C++ `CollidoscopeApp`・Teensy ファームウェア・[Collidoscope MIDI messages reference.pdf](../opencollidoscope_downloads/Collidoscope%20MIDI%20messages%20reference.pdf) に基づく既存分析を **正本としてよい**。バリアント切替（`original` / `new`）でも **MIDI と Store キーは変えない**。

| スロット ID | パラメータ | MIDI | マッピング（Web / オリジナル共通） | Web Store / 実装 |
| --- | --- | --- | --- | --- |
| `SLOT_KEYBOARD` | 演奏 | Note On/Off | ピッチ付きグレイン（最大 6 ボイス） | `synthStore` noteOn/Off |
| `SLOT_WAVEJET`（水平） | 選択開始 | Pitch Bend 0〜149 | チャンクインデックス | `waveStore.selection.start` |
| `SLOT_WAVEJET`（回転） | 選択サイズ | CC1 | MIDI 0〜127 → 1〜37 チャンク | `waveStore.selection.size` |
| `SLOT_FADER_DURATION` / 新版ノブ回転 | Duration | CC2 | 0〜127 → グレイン持続係数 1.0〜8.0 | `synthStore.grainDurationCoeff` |
| `SLOT_LOOP_TOGGLE` / `SLOT_LOOP_PUSH` | ループ | CC4 | >0 = ON / 0 = OFF | `synthStore.loop.enabled` |
| `SLOT_RECORD` | 録音 | CC5 | 2 秒録音トリガー | `audioStore` 録音 |
| `SLOT_FADER_FILTER` / 新版ノブ上下 | フィルター | CC7 | カットオフ + 選択透明度 0.5〜1.0 | `config.filter` + 音声ノード（M3 予定） |

詳細（Teensy ピン配線・処理式・ノイズ除去）: [original-analysis.md — MIDI 制御](original-analysis.md#midi-制御)

---

## 物理コントロール形状（資料ベース）

筐体上の**位置**は [layout-specs/](layout-specs/README.md) で決める。ここでは**入力デバイスの形状・操作軸**のみ。

公式資料: [`Introduction to Collidoscope.pdf`](../opencollidoscope_downloads/Introduction%20to%20Collidoscope.pdf)

| スロット ID | パラメータ | オリジナル版 | 新版 | 部品 | 操作軸 |
| --- | --- | --- | --- | --- | --- |
| `SLOT_FADER_FILTER` | フィルター | 縦スライダー（太陽/月） | Short Knob 上下 | Bourns 縦フェーダー | 縦 |
| `SLOT_FADER_DURATION` | Duration | 縦スライダー（粒/雲） | 同ノブ回転 | Bourns 縦フェーダー | 縦 / 回転 |
| `SLOT_WAVEJET` | 選択位置・サイズ | 水平移動 / ノブ回転 | 同左 | SoftPot + エンコーダー + 38mm ノブ | 水平=開始、回転=サイズ |
| `SLOT_RECORD` | 録音 | 16mm 赤プッシュ（LED リング） | 同左 | 16mm 赤プッシュ | 押下 |
| `SLOT_KEYBOARD` | 演奏 | USB MIDI 鍵盤 | 同左 | USB MIDI 鍵盤 | — |
| `SLOT_LOOP_TOGGLE` | ループ | トグルフリックスイッチ | — | 12V トグル | フリック |
| `SLOT_LOOP_PUSH` | ループ | — | プッシュボタン | 48m-ss プッシュ | 押下 |

---

## Web 版 UI 実装状態

**画面上の配置**は暫定（[hardware-layout.md — Web 投影](hardware-layout.md#web-版-phase-1-への投影暫定)、確定後は [layout-specs/](layout-specs/README.md)）。**配線・Store** は上記「電子的対応」を正本とする。

| パラメータ | Web 版 UI | 配線状態 | 配置状態 | マイルストーン |
| --- | --- | --- | --- | --- |
| フィルター | 縦 Slider / Short Knob 縦軸 | 未実装 | 暫定 | M3 |
| Duration | 縦 Slider / Short Knob 回転 | 済（暫定） | 暫定 | 配置確定 M2.5 |
| 選択サイズ | 縦 Slider | 済（暫定） | 暫定 | 配置確定 M2.5 |
| 選択位置 | `SelectionRail` + ドラッグ | 済（暫定） | 暫定 | 配置確定 M2.5 |
| ループ | `ControlPanel` 内 Switch | Store のみ | 暫定 | M3 |
| 録音 | `RecordButton` | 済 | 暫定 | 配置確定 M2.5 |
| 演奏 | `PianoKeyboard` | 済 | 暫定 | 配置確定 M2.5 |

デバッグ用 PC キーボード: `r`=録音、`a`/`d`=選択位置、`w`/`s`=選択サイズ、`9`/`0`=Duration、`Space`=ループ、`f`=フルスクリーン（M4 予定）。

---

## 対応表: 視覚要素

| パーツ | オリジナル | Web版 | 状態 | 対応マイルストーン |
| --- | --- | --- | --- | --- |
| 黒背景 | 全画面黒 | `Box`（黒 bg） | 済 | M1 |
| チャンクバー | 7px 幅 × 150 本、min/max バー | Canvas 描画、`accentColor` | 済 | M1 |
| チャンク出現アニメーション | 3 フレームポップアップ | `updatedAt` ベースのパルス | 済 | M1 |
| チャンクリセットアニメーション | 10 フレーム縮小 | なし | **未実装** | — |
| 選択ハイライト | 半透明カラー塗り | Canvas 半透明 fill | 済 | M2 |
| 選択境界バー | 始点・終点に全高バー（50% alpha） | 始点にノブ（円）のみ、終点なし | **差異あり** | M3 |
| 選択アルファ（フィルター連動） | フィルター CC7 で透明度 0.5〜1.0 | なし | **未実装** | M3 |
| 再生カーソル | 白色、アクティブチャンクを白描画 | なし | **未実装** | M3 |
| オシロスコープ | 白 PolyLine、波形背後に描画 | なし | **未実装** | M3 |
| パーティクル | 白点、`durationCoeff > 1` で発生 | なし | **未実装** | M4 |
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
| ConfigPanel（設定ドロワー） | 折りたたみ式、全パラメータ調整 | M1〜 |
| 設定 FAB（歯車アイコン） | パネル開閉 | M1 |
| 音声タブ | 録音時間、チャンク数等 | M1 |
| グラニュラータブ | グレイン数、ボイス数、エンベロープ等 | M2 |

## M2 残り UI（暫定実装済み — M2.5 で layout-specs に基づき再配置）

以下は `ControlPanel` 内に暫定実装済み。M2.5 でワイヤーフレーム正本に従い `PlayerControlSurface`（スロット駆動）へ置換予定。配置の詳細は [hardware-layout.md — Web 投影](hardware-layout.md#web-版-phase-1-への投影暫定)。

1. **`ControlPanel`** — 演奏用コントロール列（`ConfigPanel` とは別）
2. **`SelectionRail`** — 波形直下、選択開始
3. **選択サイズ・Duration 縦スライダー** — `VerticalSlider`
4. **`RecordButton` + `PianoKeyboard`** — 演奏列内
5. **Filter・ループの配置枠** — M3 実装に備えたプレースホルダ

## M3 で実装すべき UI 要素

1. **ループ ON/OFF トグル** — `synthStore.loop.enabled` は既存
2. **フィルターカットオフ縦スライダー** — `BiquadFilterNode`（処理式は [original-analysis.md — フィルター](original-analysis.md#フィルター)）
3. **選択アルファのフィルター連動**
4. **オシロスコープ** — `AnalyserNode` + Canvas
5. **再生カーソル** — Worklet トリガーメッセージ
6. **ConfigPanel にフィルター・視覚タブ追加**

## 追加で検討すべき項目

- **選択境界の終点表示** — 現在は始点ノブのみ
- **チャンクリセットアニメーション** — 優先度低
- **新版 UI バリアント** — フィルター/Duration をノブ操作、ループをプッシュボタンに変更（M2.5）

## 関連ドキュメント

- [README.md](README.md) — ドキュメント索引・管轄
- [layout-specs/README.md](layout-specs/README.md) — 筐体・Web 配置（正本・予定）
- [hardware-layout.md](hardware-layout.md) — 座標系・資料索引・配置暫定図
- [web-spec.md](web-spec.md) — Phase 1 マイルストーン定義
- [web-design.md](web-design.md) — コンポーネント設計
- [original-analysis.md](original-analysis.md) — C++ / Teensy 処理式の詳細
