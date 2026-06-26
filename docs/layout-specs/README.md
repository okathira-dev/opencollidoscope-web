# レイアウト仕様（ワイヤーフレーム正本）

ドキュメント索引: [../README.md](../README.md)

**UI 配置の正本はこのディレクトリ**（ワイヤーフレーム + 機械可読なスロット定義）。  
`docs/hardware-layout.md` や Canvas の配置記述は **暫定・未検証**（AI 分析ベース）として扱い、ワイヤーフレーム確定後に更新する。

電子的つながり・物理形状は [ui-mapping.md](../ui-mapping.md) を参照。バリアント切替で変わるのは **配置と UI メタファー（形状）のみ**。

## 成果物（M2.5 前に作成）

| ファイル | 内容 |
| --- | --- |
| `original.web.yaml` | オリジナル版 Web 投影 — スロット ID・リージョン・向き・積み方 |
| `new.web.yaml` | 新版 Web 投影 |
| `original.wireframe.png` | ラベル付きワイヤー（人間確認 + AI 補助） |
| `new.wireframe.png` | 同上 |

## ワイヤーフレーム作成ルール

1. **矩形 + テキストラベルのみ**（実機写真のトレース・質感再現は不要）
2. 各領域に **`SLOT_*` ID をそのまま記載**
3. スライダーは **向きを明示**（horizontal / vertical）し、複数ある場合は **stack: vertical** 等を注記
4. 色は 2〜3 色、影・グラデなし
5. 矛盾時は **YAML を正本**、PNG は補助

## 参照資料（一次資料）

- `opencollidoscope_downloads/Introduction to Collidoscope.pdf` — Fig.1（新版）, Fig.2（オリジナル）
- Doctor Mix 2015 演奏動画（オリジナル版のみ）
- `opencollidoscope_downloads/CAD/Drawings/`（新版のみ）

## ツール候補

- **Figma / Inkscape** — ワイヤーフレーム作成（推奨）
- **YAML** — AI 向けスロット定義（手書き or ワイヤー確定後に起こす）
