# オリジナル Collidoscope vs Web版 UI対応表

オリジナル実装の分析は [original-analysis.md](original-analysis.md)、Web版の機能要件は [web-spec.md](web-spec.md) を参照。

## ドキュメントの管轄

| 領域 | 正本 | 信頼度 |
| --- | --- | --- |
| **電子的つながり**（MIDI、Pitch Bend、Teensy ピン、処理式、`synthStore` / `waveStore` キー） | **本書「電子的対応」** · [original-analysis.md](original-analysis.md) | **既存分析を正本としてよい** |
| **物理コントロールの形状・操作軸**（縦フェーダー／ノブなど） | 本書「物理コントロール形状」· Introduction PDF | 資料ベース（配置とは別） |
| **筐体・Web 画面上の配置** | [layout-specs/README.md](layout-specs/README.md) | ワイヤーフレーム確定後 |

2 バージョン間の差異は物理コントロールの**形状**のみで、**MIDI メッセージとソフトウェア処理は同一**。Web 版に影響するのは UI の見た目・操作メタファー（配置は `layout-specs` で決める）。

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
| `SLOT_FADER_FILTER` / 新版ノブ上下 | フィルター | CC7 | カットオフ + 選択透明度 0.5〜1.0 | M3: `config.filter` + 音声ノード |

詳細（Teensy ピン配線・処理式・ノイズ除去）: [original-analysis.md — MIDI 制御](original-analysis.md#midi-制御)

---

## 物理コントロール形状（資料ベース）

筐体上の**位置**は [layout-specs/](layout-specs/README.md) で決める。ここでは**入力デバイスの形状・操作軸**のみ。

公式資料: [`Introduction to Collidoscope.pdf`](../opencollidoscope_downloads/Introduction%20to%20Collidoscope.pdf)

| パラメータ | オリジナル版 | 新版 |
| --- | --- | --- |
| フィルター | 縦スライダー（太陽/月アイコン） | Short Knob 上下移動 |
| Duration | 縦スライダー（粒/雲アイコン） | 同ノブ回転 |
| 選択サイズ | Wavejet ノブ回転 | 同左 |
| 選択位置 | Wavejet 水平移動 | 同左 |
| ループ | トグルフリックスイッチ | プッシュボタン |
| 録音 | 16mm 赤プッシュ（LED リング） | 同左 |
| 演奏 | USB MIDI 鍵盤 | 同左 |

| スロット ID | 部品 | 操作軸 |
| --- | --- | --- |
| `SLOT_FADER_FILTER` | Bourns 縦フェーダー（太陽/月） | 縦 |
| `SLOT_FADER_DURATION` | Bourns 縦フェーダー（粒/雲） | 縦 |
| `SLOT_WAVEJET` | SoftPot + エンコーダー + 38mm ノブ | 水平=開始、回転=サイズ |
| `SLOT_RECORD` | 16mm 赤プッシュ（LED リング） | 押下 |
| `SLOT_KEYBOARD` | USB MIDI 鍵盤 | — |
| `SLOT_LOOP_TOGGLE` | 12V トグル | フリック |
| `SLOT_LOOP_PUSH` | 48m-ss プッシュ（新版） | 押下 |

---

## Web 版 UI 実装状態

**画面上の配置**は暫定（[layout-specs/](layout-specs/README.md) 確定後に更新）。**配線・Store** は上記「電子的対応」を正本とする。

| パラメータ | Web 版 UI（目標コンポーネント） | 配線状態 | 配置状態 | マイルストーン |
| --- | --- | --- | --- | --- |
| フィルター | 縦 Slider / Short Knob 縦軸 | 未実装 | 暫定 | M3 |
| Duration | 縦 Slider / Short Knob 回転 | **一部**（`grainDurationCoeff`） | 暫定 | M2 残り / M3 |
| 選択サイズ | 縦 Slider（Wavejet 行） | **一部** | 暫定 | M2.5 |
| 選択位置 | `SelectionRail` + ドラッグ | **一部** | 暫定 | M2 残り |
| ループ | `LoopControl`（トグル / プッシュ） | Store のみ | 暫定 | M3 |
| 録音 | `RecordButton` | 済 | 暫定 | M2.5 |
| 演奏 | `PianoKeyboard` | 済 | 暫定 | M2.5 |

### 筐体配置（暫定メモ）

詳細は [hardware-layout.md](hardware-layout.md)（配置は未検証）。要約:

```text
[波形] → 下段に Wavejet 水平レール（SLOT_WAVEJET）
inward 行: 鍵盤（左）| 波形 | 縦フェーダー×2 + ループトグル（右）  ← 暫定
player_end: マイク + 録音ボタン（筐体端・マイク付近）  ← 暫定
```

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

## 対応表: 操作・コントロール（電子的つながり）

オリジナル列は **オリジナル版ハードウェア**の物理入力 → MIDI → 処理。括弧内はデバッグ用 PC キーボード。MIDI マッピングは上記「電子的対応」と同一。

| パーツ | オリジナル版（物理 → MIDI） | Web版（配線） | Web版（配置） | マイルストーン |
| --- | --- | --- | --- | --- |
| 録音トリガー | 録音プッシュ → CC5（`r`） | 済 | 暫定 | M2.5 |
| 選択位置移動 | Wavejet 水平 → Pitch Bend（`a`/`d`） | **一部** | 暫定 | M2 残り |
| 選択サイズ変更 | Wavejet ノブ → CC1（`w`/`s`） | **一部** | 暫定 | M2.5 |
| ループ ON/OFF | トグル → CC4（Space） | Store のみ | 暫定 | M3 |
| グレイン duration 係数 | 縦スライダー → CC2（`9`/`0`） | **一部** | 暫定 | M2 残り |
| フィルターカットオフ | 縦スライダー → CC7 | 未実装 | 暫定 | M3 |
| フルスクリーン | —（`f` のみ） | なし | — | M4 |
| ノート演奏 | USB MIDI 鍵盤 → Note On/Off | 済 | 暫定 | M2.5 |
| Web MIDI 入力 | RtMidi 全ポート | なし | — | M4 |

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

## M2 残りで実装すべき UI（筐体レイアウト）

1. **`ControlPanel`** — 演奏用コントロール列（`ConfigPanel` とは別）
2. **Wavejet 水平レール** — 波形直下、選択開始
3. **選択サイズ縦スライダー** — Wavejet ノブ回転相当
4. **Duration 縦スライダー** — 左列（現状の横 Slider を置き換え）
5. **録音ボタン・鍵盤** — 演奏列内への配置移動
6. **Filter・ループの配置枠** — M3 実装に備えたスペース確保

## M3 で実装すべき UI 要素

1. **ループ ON/OFF トグル** — オリジナル版のトグルスイッチ相当（`synthStore.loop.enabled` は既存）
2. **フィルターカットオフ縦スライダー** — オリジナル版の太陽/月フェーダー相当 + `BiquadFilterNode`
3. **選択アルファのフィルター連動** — フィルター値に応じて選択ハイライトの透明度を変化
4. **オシロスコープ** — `AnalyserNode` + Canvas 描画
5. **再生カーソル** — Worklet からのトリガーメッセージで選択範囲内の位置を白色表示
6. **ConfigPanel にフィルター・視覚タブ追加**

## 追加で検討すべき項目

- **選択境界の終点表示** — 現在は始点ノブのみ（オリジナルは始点・終点に全高バー）
- **チャンクリセットアニメーション** — 新規録音時の 10 フレーム縮小（優先度低）
- **新版 UI バリアント** — フィルター/Duration をノブ操作、ループをプッシュボタンに変更（将来）

## 関連ドキュメント

- [layout-specs/README.md](layout-specs/README.md) — **筐体・Web 配置（正本・予定）**
- [hardware-layout.md](hardware-layout.md) — 座標系・資料索引・配置暫定図
- [web-spec.md](web-spec.md) — Phase 1 マイルストーン定義
- [web-design.md](web-design.md) — コンポーネント設計
- [original-analysis.md](original-analysis.md) — **電子的つながりの詳細**（C++ / Teensy）
- [opencollidoscope_downloads/](../opencollidoscope_downloads/) — 公式 PDF ミラー + CAD
