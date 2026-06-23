# オリジナル Collidoscope vs Web版 UI対応表

オリジナル実装の分析は [original-analysis.md](original-analysis.md)、Web版の機能要件は [web-spec.md](web-spec.md) を参照。**物理配置・位置関係の正本**は [hardware-layout.md](hardware-layout.md)（ゾーン ID `SLOT_*` / `WEB_ROW_*`）。

## Web 版 UI の基準

**Phase 1 ではオリジナル版ハードウェアの UI メタファーを基準とする**（縦スライダー、トグルスイッチ、Wavejet 操作感）。新版ハードウェア（縦ノブ + プッシュボタン）は将来、設定で UI バリアント切替として対応する予定。

2 バージョン間の差異は物理コントロールの形状のみで、**MIDI メッセージとソフトウェア処理は同一**。Web 版に影響するのは UI の見た目・操作メタファーのみ。

**演奏 UI と設定 UI**: 筐体配置のコントロールは `ControlPanel`（演奏用）に置く。`ConfigPanel` はデバッグ・全パラメータ用であり、Filter / Duration / 選択サイズ等の主要操作をここだけに置かない。

## 調査結果

オリジナルは **GUI ウィジェットを一切持たない** フルスクリーン楽器。すべての操作は物理コントロール / キーボード / MIDI で、フィードバックは視覚と音声のみ。Web版はブラウザ向けにボタン・スライダー・設定パネルなどの GUI 要素を追加している。

---

## バージョン別物理コントロール対応

公式資料: [`opencollidoscope_downloads/Introduction to Collidoscope.pdf`](../opencollidoscope_downloads/Introduction%20to%20Collidoscope.pdf)

| パラメータ | MIDI | オリジナル版（Web 版の基準） | 新版（将来対応） | Web 版 UI | 状態 |
| --- | --- | --- | --- | --- | --- |
| フィルター | CC7 | 縦スライダー（太陽/月アイコン） | 縦ノブ上下移動 | 縦 Slider（M3 予定） | 未実装 |
| Duration | CC2 | 縦スライダー（粒/雲アイコン） | ノブ回転 | 演奏列・縦 Slider（M2 残り） | **一部** |
| 選択サイズ | CC1 | Wavejet ノブ回転 | 同左 | 演奏列・縦 Slider（M2 残り） | **一部** |
| 選択位置 | Pitch Bend | Wavejet 水平移動 | 同左 | 波形直下レール + ドラッグ（M2 残り） | **一部** |
| ループ | CC4 | トグルフリックスイッチ | プッシュボタン | 演奏列・右端トグル（M3） | Store のみ |
| 録音 | CC5 | 16mm 赤プッシュボタン（LED リング） | 同左 | 演奏列・ボタン（M2 残りで配置移動） | 済・配置未 |
| 演奏 | Note On/Off | USB MIDI 鍵盤 | 同左 | 演奏列・`PianoKeyboard`（M2 残りで配置移動） | 済・配置未 |

### 1 プレイヤー分の物理レイアウト（オリジナル版）

詳細な俯瞰図・座標系・Web 投影は [hardware-layout.md](hardware-layout.md) を参照。要約:

```text
[波形] → 下段に Wavejet 水平レール（SLOT_WAVEJET）
inward 行: 鍵盤（左）| 波形 | 縦フェーダー×2 + ループトグル（右）
player_end: マイク + 録音ボタン（筐体端・マイク付近）
```

| スロット ID | 正式名称 | MIDI |
| --- | --- | --- |
| `SLOT_FADER_FILTER` | Filter フェーダー（太陽/月） | CC7 |
| `SLOT_FADER_DURATION` | Duration フェーダー（粒/雲） | CC2 |
| `SLOT_WAVEJET` | Wavejet（水平=位置、回転=サイズ） | Pitch Bend + CC1 |
| `SLOT_RECORD` | Record（LED リング付き） | CC5 |
| `SLOT_KEYBOARD` | USB MIDI Keyboard | Note On/Off |
| `SLOT_LOOP_TOGGLE` | Loop トグル（新版は `SLOT_LOOP_PUSH`） | CC4 |

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

## 対応表: 操作・コントロール

オリジナル列は **オリジナル版ハードウェア**の物理入力を記載。括弧内はデバッグ用 PC キーボード。

| パーツ | オリジナル版（物理） | Web版 | 状態 | 対応マイルストーン |
| --- | --- | --- | --- | --- |
| 録音トリガー | 録音プッシュボタン → CC5（`r`） | ボタンあり（演奏列外） | **一部** | M2 残り |
| 選択位置移動 | Wavejet 水平 → Pitch Bend（`a`/`d`） | 波形ドラッグ + レール未実装 | **一部** | M2 残り |
| 選択サイズ変更 | Wavejet ノブ回転 → CC1（`w`/`s`） | ホイールのみ | **一部** | M2 残り |
| ループ ON/OFF | トグルスイッチ → CC4（Space） | Store 有り、**UI なし** | **未実装（UI）** | M3 |
| グレイン duration 係数 | 縦スライダー（粒/雲）→ CC2（`9`/`0`） | 横 Slider（暫定・配置未） | **一部** | M2 残り |
| フィルターカットオフ | 縦スライダー（太陽/月）→ CC7 | なし | **未実装** | M3 |
| フルスクリーン | —（`f` のみ） | なし | **未実装** | M4 |
| ノート演奏 | USB MIDI 鍵盤 → Note On/Off | `PianoKeyboard`（演奏列外） | **一部** | M2 残り |
| Web MIDI 入力 | RtMidi 全ポート | なし | **未実装** | M4 |

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

- [hardware-layout.md](hardware-layout.md) — **筐体位置関係の正本**（ゾーン ID、バージョン別図、Web 投影）
- [web-spec.md](web-spec.md) — Phase 1 マイルストーン定義、ハードウェア UI 方針
- [web-design.md](web-design.md) — コンポーネント設計（`Oscilloscope`、`ControlPanel` 等）
- [original-analysis.md](original-analysis.md) — オリジナル視覚システム・MIDI マッピング・物理ハードウェア
- [opencollidoscope_downloads/](../opencollidoscope_downloads/) — 公式 PDF ミラー + CAD 図面 PDF（Introduction、MIDI reference、Physical Build 等）
