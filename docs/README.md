# ドキュメント索引

Open Collidoscope Web の設計ドキュメント。**同じ内容を複数ファイルに書かない** — 下表の「正本」だけを更新し、他はリンクで参照する。

## 管轄（どこに何を書くか）

| 領域 | 正本 | 補助 |
| --- | --- | --- |
| **電子的つながり**（MIDI、Store キー、マッピング） | [ui-mapping.md — 電子的対応](ui-mapping.md#電子的対応正本) | [original-analysis.md — MIDI 制御・処理式](original-analysis.md#midi-制御) |
| **物理コントロール形状** | [ui-mapping.md — 物理コントロール形状](ui-mapping.md#物理コントロール形状資料ベース) | Introduction PDF |
| **筐体・Web 配置** | [layout-specs/README.md](layout-specs/README.md)（`<variant>/layout.html`、kebab-case ブロック名） | [hardware-layout.md](hardware-layout.md)（暫定図・座標系） |
| **Web 実装ギャップ** | [ui-mapping.md — Web 版 UI 実装状態](ui-mapping.md#web-版-ui-実装状態) | [Scratchpad.md](../Scratchpad.md) |
| **機能要件・マイルストーン** | [web-spec.md](web-spec.md) | — |
| **アーキテクチャ・Store** | [web-design.md](web-design.md) | — |
| **オリジナル C++ 分析** | [original-analysis.md](original-analysis.md) | — |
| **座標系・一次資料索引** | [hardware-layout.md — 座標系](hardware-layout.md#座標系用語定義) | — |

### 信頼度の原則

- **配置**: `layout-specs/<variant>/layout.html` のみが正本（Planner の kebab-case ブロック名 + `-a`/`-b`）。`SLOT_*` は Web 移植層（ui-mapping）。向き・形状・MIDI は他資料。既存 AI 配置分析は信用しない。
- **電子**: 既存分析（C++ / Teensy / MIDI PDF）を正本としてよい。
- **バリアント**（`original` / `new`）: 変わるのは配置と形状のみ。MIDI / Store は不変。

## 各ドキュメントの役割

| ファイル | 書くこと | 書かないこと |
| --- | --- | --- |
| [ui-mapping.md](ui-mapping.md) | 電子対応表、形状表、Web 実装状態、視覚ギャップ | 座標系、C++ 処理式の詳細 |
| [hardware-layout.md](hardware-layout.md) | 座標系、資料索引、暫定配置図 | MIDI 表、形状一覧、管轄表 |
| [layout-specs/](layout-specs/README.md) | kebab-case 配置ブロック（`display-red`, `keyboards-a` 等） | MIDI、形状、向き、機能、`SLOT_*`、YAML/JSON、管轄表 |
| [original-analysis.md](original-analysis.md) | C++ / Teensy / 処理式 / ピン配線 | MIDI 一覧表、形状一覧表 |
| [web-spec.md](web-spec.md) | マイルストーン、機能要件、設定値 | 配置図、コンポーネント状態の重複 |
| [web-design.md](web-design.md) | React / Store / Worklet 設計 | UI 配置の詳細 |
