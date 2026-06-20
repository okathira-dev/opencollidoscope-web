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
- 主な技術: React 19 / TypeScript 6 / Vite 8 / MUI 9 / Zustand / Tone.js / Biome 2.5 / Vitest 4 / pnpm 11
- Vite の `root` は `src/`（テストも `src/` 配下の `*.test.ts(x)` を想定）
- オリジナル C++ コード: `opencollidoscope/`（参照用、Mercurial クローン）
- 未整備・意図的な選択: `opencollidoscope-web-spec.md` セクション 5.4

## ディレクトリ構成

```text
src/
├── features/       # 各機能ディレクトリ（今後実装）
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

- `opencollidoscope-web-spec.md` — 実装仕様（**5.4** に未整備・意図的選択の正本）
- `opencollidoscope-web-design.md` — 設計書（アーキテクチャ、Mermaid 図、擬似コード）
- `Scratchpad.md` — 短期タスクログ
- `.serena/memories/` — 長期知識（アーキテクチャ分析、コーディング規約等）

## 実装フェーズ

- Phase 1: 単一音声処理システム（赤色波形）の実装
- Phase 2: 第2音声処理システム（黄色波形）の追加（`NUM_WAVES=2`）
