# Open Collidoscope Web — プロジェクト概要

## プロダクト

[Open Collidoscope](https://code.soundsoftware.ac.uk/projects/opencollidoscope) の Web ブラウザ移植版。
グラニュラーシンセシス楽器をブラウザで動作させる。

## 技術スタック

- **フロントエンド**: React 19, TypeScript 6, Vite 8, MUI 9, Zustand, Web Audio API
- **品質**: Biome 2.5（lint + format）, markdownlint-cli2, Vitest 4（`jsdom`）, `@testing-library/react`, `@vitest/coverage-v8`
- **パッケージマネージャ**: pnpm 11
- **Node**: ^24.14.0
- **AI ツール**: Cursor Rules/Skills, Serena MCP, Playwright MCP, Chrome DevTools MCP

## リポジトリ構成

- `src/` — アプリケーションソース（`domain/config/` に設定バリデーション実装済み）
- `opencollidoscope/` — オリジナル C++ ソース（参照用）
- `docs/original-analysis.md` — オリジナル C++ 実装分析
- `docs/web-spec.md` — Web版実装仕様
- `docs/web-design.md` — Web版設計書
- `Scratchpad.md` — 短期タスクログ

## 実装戦略

- Phase 1: M1（録音→波形）→ M4。Scratchpad.md が実装 TODO の正本
- 設定 UI: M1 から折りたたみ ConfigPanel。プリセットは M4
- Phase 2: 第2音声処理システム（黄色波形、`NUM_WAVES=2`）

## 開発環境の未整備

意図的なトレードオフと未導入ツールの一覧は `docs/web-spec.md` の「開発環境の意図的な選択と未整備」が正本。
