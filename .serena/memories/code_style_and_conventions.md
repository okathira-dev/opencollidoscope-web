# コーディングスタイルと規約

## リンター・フォーマッター

- **Biome のみ**（ESLint / Prettier / Markuplint は使用しない）
- ダブルクォート、セミコロン、2スペースインデント
- import 整理は Biome の `organizeImports`

## コロケーション原則

- 関連する機能は1つのディレクトリにまとめる
- 子コンポーネントは親コンポーネントのディレクトリ内に配置する

## インポート

- 可能な限り default import を避け、named import を使う

## 状態管理（Zustand）

- 生の store オブジェクトはエクスポートしない
- selector 付きカスタムフック（`useAudioStore` 等）をコンポーネントから使う
- zustand のインポートはストア定義ファイルでのみ行う
- 設計書の `AudioStore` / `ConfigStore` / `WaveStore` / `SynthStore` に沿う

## 知識の管理

- 長期的な知見 → `.serena/memories/`（本ファイル群）
- 短期タスク → `Scratchpad.md`
- `Lessons.md` は使用しない

## コミット

- コミットメッセージと PR タイトルに「[Cursor] 」を含める
- ファイル編集前に必ず内容を確認する

## コード編集後の検証

- コード変更後は **必ず `pnpm check`** を実行してから完了とする
- ロジック変更時は `pnpm test` も実行する
- 部分置換後は編集ファイルを Read し、メソッドの `{` / `}` と重複定義がないか確認する
- 詳細: `.cursor/rules/code-edit-verification.mdc`

## 型安全

- `JSON.parse(data) as Type` は危険。Zod 等でランタイム型検証を行う
- 設計書の TypeScript コードは擬似コード扱い。実装時は再設計が必要

## テスト

- Vitest の `describe` / `it` / `expect` は明示 import（globals は使わない）
- テストファイルはソースの隣に `*.test.ts(x)` でコロケーション
- UI テストは `src/test/test-utils.tsx` の `renderWithTheme` を使う
- Zod 4 ではネストした `.default({})` だけでは内側のデフォルトが適用されない。空のネスト構造をマージしてから `parse` する
