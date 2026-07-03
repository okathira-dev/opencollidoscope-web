# レイアウト仕様（配置の正本）

ドキュメント索引: [../README.md](../README.md)

**UI 画面上の配置の正本は、このディレクトリの `<variant>/layout.html`（+ 同梱 `layout.css`）のみ。**  
人間は **[CSS Grid Wireframe Planner](https://devtooleasy.com/css/grid-wireframe-planner)** で一次資料を見ながら GUI 配置し、**Copy HTML + CSS の出力をそのまま**保存する。

**YAML / JSON などの別形式は作らない。** 配置以外の情報は他ドキュメントが正本（下記「管轄分離」）。

`docs/hardware-layout.md` や Canvas の配置記述は **暫定・未検証**。配置仕様確定後に必要なら更新する。

## 命名規則（2 層）

| 層 | 識別子 | 例 | 正本 |
| --- | --- | --- | --- |
| **筐体配置** | Planner の kebab-case + ゾーン接尾辞 | `keyboards-b`, `slider-moon-sun-a` | **本ディレクトリ** |
| **Web 移植** | `SLOT_*` | `SLOT_KEYBOARD` | [ui-mapping.md](../ui-mapping.md) |

配置ブロック名に **`SLOT_` 接頭辞は付けない**（Web 移植の用語）。M2.5 は下記「Web 移植対応」で `SLOT_*` / React コンポーネントに解決する。

### ゾーン接尾辞

筐体両端に同じ部品があるとき、[`hardware-layout.md`](../hardware-layout.md) の `ZONE_PLAYER_*` に合わせて接尾辞を付ける。

| 接尾辞 | ゾーン | グリッド上（俯瞰・行方向） |
| --- | --- | --- |
| `-a` | `ZONE_PLAYER_A` | 上端（row 0 付近）— 資料画像どおり **Wave 0 赤**側 |
| `-b` | `ZONE_PLAYER_B` | 下端（row 11 付近）— **Wave 1 黄**側 |

**共有領域**（モニター半分など両端にまたがる 1 領域）は接尾辞なし（例: `display-red`, `display-yellow`）。

Planner で両端に同名ブロックができる場合、保存前に **手動で `-a` / `-b` を付与**する（CSS Grid の非連結同名エリアを避けるため）。

### 座標系と Web 投影

- **layout グリッド**: 一次資料（Fig.2 等）の俯瞰と同じ向き。**row 0 = 上 = プレイヤー A 端（赤）**。
- **Web 実装（M2.5 original）**: `layout.css` の 12 行を **180 度回転（上下+左右反転）** して投影する。投影後は **画面上部 = プレイヤー B 端（黄）**、**画面下部 = プレイヤー A 端（赤）の鍵盤帯**（手前）。
- 実装コード: `src/features/synth-engine/original-layout.ts` の `ORIGINAL_LAYOUT_WEB_TEMPLATE`（`layout-specs` を実行時に読み込まない）。
- **new 版**の投影は `new-layout.ts` で 180 度投影後のグリッドを定義。zone 非依存の単一テンプレート（B は `PlayerControlSurface` で `rotate(180deg)`）。`variant="new"` で `NewPlayerModule` を使用。

### セマンティクス

- グリッドセルは **部品の存在位置**を示す。ブロック矩形が部品の実寸を覆うとは限らない。
- 俯瞰グリッドは **筐体全体**（Wave 0 + Wave 1、両プレイヤー端）を表す。

## 管轄分離（配置資料に書くこと / 書かないこと）

| 内容 | 正本 | `layout.html` に書く？ |
| --- | --- | --- |
| **画面上のブロック配置**（どこに何があるか） | **本ディレクトリ** | **はい** — `grid-template-areas` + kebab-case ブロック名 |
| 電子配線（MIDI CC、Store キー） | [ui-mapping.md — 電子的対応](../ui-mapping.md#電子的対応正本) | いいえ |
| 部品種別・操作形状（スライダー/ノブ/トグル等） | [ui-mapping.md — 物理コントロール形状](../ui-mapping.md#物理コントロール形状資料ベース) | いいえ |
| 音声処理式・Teensy 実装 | [original-analysis.md](../original-analysis.md) | いいえ |
| 機能要件・マイルストーン | [web-spec.md](../web-spec.md) | いいえ |
| 座標系用語・一次資料索引 | [hardware-layout.md](../hardware-layout.md) | いいえ |
| `WEB_STACK_1〜3` とコンポーネント対応の解説 | [hardware-layout.md — Web 投影](../hardware-layout.md#web-版-phase-1-への投影暫定) | いいえ |

バリアント（`original` / `new`）で変わるのは **配置と形状** のみ。MIDI / Store の配線は不変。

## ワークフロー（人間）

```text
一次資料（PDF / 動画 / CAD）を横に開く（トレース・重ね描きはしない）
        ↓
CSS Grid Wireframe Planner で 12 列グリッド上にブロックを配置
        ↓
両端の同名ブロックに -a / -b 接尾辞を付与 → Copy HTML + CSS
        ↓
docs/layout-specs/<variant>/layout.html + layout.css に保存
        ↓
ブラウザで開き、一次資料と見比べて矛盾がないか確認
```

## 配置作成 GUI（確定）

| 項目 | 内容 |
| --- | --- |
| ツール | [CSS Grid Wireframe Planner](https://devtooleasy.com/css/grid-wireframe-planner) |
| 操作 | 空セルをドラッグでブロック作成。ダブルクリックで名前変更。Delete で削除 |
| 正本への保存 | `layout.html` + `layout.css`（HTML に `<link href="layout.css">` を付ける） |

Planner の詳細: [公式 How to Use](https://devtooleasy.com/css/grid-wireframe-planner)（行数 1〜20、12 列、ブロックは重ね不可）。

### 手順

1. Planner を開き、**Rows** を筐体俯瞰の段数に合わせる（上端=Player B、共有モニター、下端=Player A、など）
2. 空セルを **クリック＋ドラッグ** でブロックを作成する
3. ブロック名は **Planner の kebab-case のまま**（例: `slider-moon-sun`）。`SLOT_*` にはリネームしない
4. 筐体両端に同じ名前のブロックがある場合、**`-a`（上端）/ `-b`（下端）** を付与してから `grid-template-areas` を更新する
5. **Copy HTML + CSS** を `original/` または `new/` 配下に保存する
6. 一次資料を見ながらブラウザで開き、空間関係に矛盾がないか確認する

### レイアウト上の例外（配置の延長のみ）

フェーダー縦 2 本など **1 ブロックに収まらない縦積み** は、Planner 出力後に **同じ HTML 内** で子 `display: grid` を足す。これも配置の表現であり、別ファイル（YAML 等）にはしない。

## 成果物

| パス | 役割 |
| --- | --- |
| `original/layout.html` | オリジナル版（`hw_version=original`）配置の**唯一の正本** |
| `original/layout.css` | 上記のグリッド定義 |
| `new/layout.html` | 新版（`hw_version=new`）配置の**唯一の正本** |
| `new/layout.css` | 上記のグリッド定義 |

## プレビューのルール

1. **矩形 + ブロック名ラベル**（質感・実機トレースは不要）
2. 色は 2〜3 色、影・グラデなし
3. 矛盾時は **`layout.html` / `layout.css` が正本**

## 未接続ブロックの同定（original）

Teensy ファームウェア（`CollidoscopeTeensy_original.ino`）のピンは 2 プレイヤー × 6 センサー = 12 個すべて [ui-mapping.md](../ui-mapping.md) の既知 `SLOT_*` に対応済み。以下は Teensy 非接続・MIDI 非出力。

| 配置ブロック | 同定 | 根拠 |
| --- | --- | --- |
| `plus-button-*` | MIDI 鍵盤のオクターブ + | 鍵盤横の配置。USB MIDI 鍵盤本体の機能（Teensy ピンなし） |
| `minus-button-*` | MIDI 鍵盤のオクターブ - | 同上 |

`keyboards-*` は USB MIDI 鍵盤本体（C 起点 2 オクターブ + 次の C、計 25 鍵。Web デフォルトは C3-C5 で中央が C4 = 原音）。`mic-*` は XLR マイク入力（Teensy 非経由、アナログ入力）。

## Web 移植対応（M2.5 参考）

配置ブロック名から Web 層への対応。詳細は [ui-mapping.md](../ui-mapping.md)。

| 配置ブロック（例） | ゾーン | `SLOT_*`（Web） | コンポーネント | 備考 |
| --- | --- | --- | --- | --- |
| `keyboards-a` / `keyboards-b` | 各端 | `SLOT_KEYBOARD` | `PianoKeyboard` | C3-C5（25 鍵・中央 C4） |
| `plus-button-*` | 各端 | `SLOT_KEYBOARD_OCTAVE_UP` | `OctaveButton` | オクターブ + |
| `minus-button-*` | 各端 | `SLOT_KEYBOARD_OCTAVE_DOWN` | `OctaveButton` | オクターブ - |
| `slider-moon-sun-a` / `slider-moon-sun-b` | 各端 | `SLOT_FADER_FILTER` | `HorizontalSlider` | original・横スライダー |
| `slider-small-big-a` / `slider-small-big-b` | 各端 | `SLOT_FADER_DURATION` | `HorizontalSlider` | original・横スライダー |
| `wavejet-a` / `wavejet-b` | 各端 | `SLOT_WAVEJET` | `SelectionRail` | 開始位置のみ（サイズ UI なし） |
| `display-red` | 共有 | `SLOT_WAVE_DISPLAY` | `WaveDisplay` | Wave 0 |
| `display-yellow` | 共有 | `SLOT_WAVE_DISPLAY` | `WaveDisplay` | Wave 1 |
| `toggle-switch-a` / `toggle-switch-b` | 各端 | `SLOT_LOOP_TOGGLE` | `Switch` | original |
| `record-button-a` / `record-button-b` | 各端 | `SLOT_RECORD` | `RecordButton` | |
| `mic-a` / `mic-b` | 各端 | `SLOT_MIC` | — | Web 未実装可 |

### 新版（`new/`）追加ブロック

| 配置ブロック（例） | ゾーン | `SLOT_*`（Web） | コンポーネント | 備考 |
| --- | --- | --- | --- | --- |
| `vertical-mobile-knob-a` / `vertical-mobile-knob-b` | 各端 | `SLOT_SHORT_KNOB` | `VerticalMobileKnob` | 縦レール=Filter、ホイール=Duration（Wavejet 対称） |
| `loop-button-a` / `loop-button-b` | 各端 | `SLOT_LOOP_PUSH` | `LoopPushButton` | 48m-ss プッシュ（LED） |
| `keyboards-a` / `keyboards-b` | 各端 | `SLOT_KEYBOARD` | `PianoKeyboard` | C3-C6（37 鍵、`octaveCount=3`） |
| その他共有ブロック | — | 上表と同じ | 同上 | `wavejet-*` / `display-*` / `record-*` / `mic-*` / `plus-button-*` / `minus-button-*` |

### オリジナル版のみ（新版では置換）

| 配置ブロック | 新版での置換 |
| --- | --- |
| `slider-moon-sun-*` | `vertical-mobile-knob-*`（Filter 成分） |
| `slider-small-big-*` | `vertical-mobile-knob-*`（Duration 成分） |
| `toggle-switch-*` | `loop-button-*` |

## 一次資料（照合用・トレースしない）

| バリアント | 資料 |
| --- | --- |
| オリジナル | [`Introduction to Collidoscope.pdf`](../opencollidoscope_downloads/Introduction%20to%20Collidoscope.pdf) Fig.2、Doctor Mix [演奏](https://www.youtube.com/watch?v=9XMfKYVu_fg) / [Behind](https://www.youtube.com/watch?v=qKSkQ8ZrvG8) |
| 新版 | 同 PDF Fig.1、[`Collidoscope Physical Build.pdf`](../opencollidoscope_downloads/Collidoscope%20Physical%20Build.pdf)、[`CAD/Drawings/`](../opencollidoscope_downloads/CAD/Drawings/) |

## M2.5 への引き渡し

M2.5 は `layout.css` の `grid-template-areas` とブロック名を**参照して**、上記対応表経由で `SLOT_*` / React コンポーネントにマッピングする。`layout-specs` を実行時入力として直接読み込む必要はない（`original-layout.ts` / `new-layout.ts` で 180 度投影後のグリッドを定義）。

- 配置ブロック → `SLOT_*`: 本 README の「Web 移植対応」+ [ui-mapping.md](../ui-mapping.md)
- 形状・向き・MIDI 配線: 同書および [original-analysis.md](../original-analysis.md)（M3 で配線）
- Filter / Loop はブロックが HTML 上に存在すればよい（機能配線は M3）
- プレイヤー B 側は M2.5 で**配置のみ**（disable / placeholder）。機能配線は M3 以降
- Wavejet のサイズ変更スライダーは Web UI に置かない（実機にない。ホイール操作は `WaveDisplay` 側で継続）
