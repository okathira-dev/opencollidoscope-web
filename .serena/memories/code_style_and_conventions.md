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

## 型安全

- `JSON.parse(data) as Type` は危険。Zod 等でランタイム型検証を行う
- 設計書の TypeScript コードは擬似コード扱い。実装時は再設計が必要
