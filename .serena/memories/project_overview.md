# Open Collidoscope Web — プロジェクト概要

## プロダクト

[Open Collidoscope](https://code.soundsoftware.ac.uk/projects/opencollidoscope) の Web ブラウザ移植版。
グラニュラーシンセシス楽器をブラウザで動作させる。

## 技術スタック

- **フロントエンド**: React 19, TypeScript 6, Vite 8, MUI 9, Zustand, Tone.js
- **品質**: Biome 2.5（lint + format）, markdownlint-cli2, Vitest 4（デフォルト `jsdom`）
- **パッケージマネージャ**: pnpm 11
- **Node**: ^24.14.0
- **AI ツール**: Cursor Rules/Skills, Serena MCP, Playwright MCP, Chrome DevTools MCP

## リポジトリ構成

- `src/` — アプリケーションソース（現在はプレースホルダー）
- `opencollidoscope/` — オリジナル C++ ソース（参照用）
- `opencollidoscope-web-spec.md` — 実装仕様
- `opencollidoscope-web-design.md` — 設計書
- `Scratchpad.md` — 短期タスクログ

## 実装戦略

- Phase 1: 単一音声処理システム（赤色波形）の実装
- Phase 2: 第2音声処理システム（黄色波形）の追加（`NUM_WAVES=2`）

## 開発環境の未整備

意図的なトレードオフと未導入ツールの一覧は `opencollidoscope-web-spec.md` **5.4** が正本。
