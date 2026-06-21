# 開発でよく使うコマンド（Windows / PowerShell）

前提: リポジトリルートで実行。パッケージマネージャは **pnpm**（`pnpm-lock.yaml` あり）。

## 依存関係

- `pnpm install` — 依存インストール

## 実行・ビルド

- `pnpm dev` — 開発サーバー起動（`--host` で LAN アクセス可）
- `pnpm build` — TypeScript コンパイル + Vite ビルド
- `pnpm preview` — ビルド成果物のプレビュー

## 型チェック

- `pnpm compile` — `tsc --noEmit`

## Lint / フォーマット（Biome）

- **推奨順**: 自動修正が効く指摘なら先に `pnpm check:fix` → 必ず `pnpm check`
- `pnpm check` — Biome + 型チェック + markdownlint までまとめて確認
- `pnpm check:fix` — Biome と markdownlint の自動修正（型チェックなし）
- `pnpm format` / `pnpm format:fix`
- `pnpm lint` / `pnpm lint:fix`

## Markdown

- `pnpm lint-md` / `pnpm lint-md:fix`

## テスト

- `pnpm test` — Vitest 一回実行
- `pnpm test:watch` — ウォッチ
- `pnpm test:coverage` — カバレッジ付き実行（レポートは `coverage/`）
- テストファイルは `src/` 配下にコロケーション（`*.test.ts(x)`）
- UI テストは `@testing-library/react` + `src/test/test-utils.tsx` の `renderWithTheme`

## Git（Windows）

- `git status`, `git diff` — 変更確認
- 複数行コミットメッセージ: ファイルに書いて `git commit -F <filename>`

## Husky / lint-staged

コミット時に TS/JS は `biome check`、`tsc --noEmit`、変更ソースに関連する `vitest related --run`、md は markdownlint が走る（`lint-staged.config.mjs`）。
