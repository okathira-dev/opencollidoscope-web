---
name: collidoscope-repository-context
description: Open Collidoscope Web リポジトリの構造、技術スタック、参照ドキュメントを提示する。リポジトリ全体の把握、オンボーディング、どこを編集すべきかの判断が必要なときに使う。
---

# Open Collidoscope Web Repository Context

## When to use

- リポジトリ全体像（構造、技術スタック）を短時間で把握したいとき
- 変更対象の配置先を判断したいとき
- 参照すべき主要ドキュメントを確認したいとき

## Quick context

- プロダクト: [Open Collidoscope](https://code.soundsoftware.ac.uk/projects/opencollidoscope) の Web ブラウザ移植版
- 主な技術: React 19 / TypeScript 6 / Vite 8 / MUI 9 / Zustand / Web Audio API / Biome 2.5 / Vitest 4 / pnpm 11
- Vite の `root` は `src/`（テストも `src/` 配下の `*.test.ts(x)` を想定）
- オリジナル C++ コード: `opencollidoscope/`（参照用、Mercurial クローン）
- 未整備・意図的な選択: `docs/web-spec.md` の「開発環境の意図的な選択と未整備」
- テスト: `src/**/*.test.{ts,tsx}` をコロケーション。セットアップは `src/test/setup.ts`、UI は `renderWithTheme`

## ディレクトリ構成

```text
src/
├── features/       # 機能ディレクトリ（synth-engine 等）
│   └── synth-engine/
├── components/     # 汎用 UI コンポーネント
├── stores/         # グローバル Zustand ストア（AudioStore, ConfigStore 等）
├── consts/         # ドメイン定数
├── domain/         # ドメインロジック
├── utils/          # ユーティリティ
├── App.tsx
├── main.tsx
└── index.html

opencollidoscope/   # オリジナル C++ ソース（参照用）
.serena/memories/   # 長期知識（Serena MCP）
.cursor/rules/      # Cursor ルール
.cursor/skills/     # Cursor Skills
```

## 主要ドキュメント

索引（管轄・正本の一覧）: `docs/README.md`

- `docs/ui-mapping.md` — 電子的対応・物理形状・Web 実装ギャップ（正本）
- `docs/layout-specs/` — 筐体・Web 配置（ワイヤーフレーム確定後の正本）
- `docs/hardware-layout.md` — 座標系・資料索引・配置暫定図
- `docs/original-analysis.md` — オリジナル C++ 実装の分析（処理式・Teensy）
- `docs/web-spec.md` — Web版実装仕様（マイルストーン・機能要件）
- `docs/web-design.md` — Web版設計書（アーキテクチャ、Mermaid 図）
- `Scratchpad.md` — 短期タスクログ
- `.serena/memories/` — 長期知識（アーキテクチャ分析、コーディング規約等）

## 実装フェーズ

- Phase 1: マイルストーン **M1 → M4**（`docs/web-spec.md`）
- Phase 2: 第2音声処理システム（`NUM_WAVES=2`）

## ディレクトリ構成（実装時）

```text
src/
├── features/synth-engine/   # メイン機能（worklets, components）
├── stores/                  # audio, wave, config, ui（M1）, synth（M2）
├── domain/config/           # 実装済み
├── domain/audio/            # M1〜
└── components/              # 汎用 UI のみ
```
