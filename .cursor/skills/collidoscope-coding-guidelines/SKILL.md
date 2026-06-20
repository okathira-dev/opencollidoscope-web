---
name: collidoscope-coding-guidelines
description: Open Collidoscope Web 実装時の基本コーディング規約（差分最小、責務尊重、型安全、Zustand 状態管理）を適用する。実装・リファクタ・レビューで規約確認が必要なときに使う。
---

# Open Collidoscope Web Coding Guidelines

## When to use

- 実装・修正・リファクタ時に基本規約を確認したいとき
- 変更差分の方針やテスト追加方針を揃えたいとき

## Core rules

- 複雑な箇所のみコメントで補足し、冗長な説明コメントは避ける。
- 型安全を優先し、`any` は必要最小限に限定する。
- 設計書の TypeScript コードは擬似コード扱い。実装時は依存関係・型定義・エラーハンドリングを再設計する。

## Scope and references

- コロケーション原則、ディレクトリ構造、Zustand 状態管理ルールの正本は `.cursor/rules/coding-rules.mdc`。
- ストア設計の正本は `opencollidoscope-web-design.md` の状態管理セクション。
- Biome 運用の正本は `.cursor/rules/biome.mdc`。

## Import / export

- 原則 `named export` / `named import`
- フレームワーク都合などで必要な場合のみ `default export`

## 状態管理（Zustand）

- 生の store オブジェクトはエクスポートしない
- selector 付きカスタムフック（`useAudioStore` 等）をコンポーネントから使う
- 状態管理ライブラリのインポートはストア定義ファイルでのみ行う
- コンポーネントファイルから直接 zustand をインポートしない

## 変更後の検証

- `pnpm check` を通す（Biome + 型チェック + markdownlint）
- ロジックに触れた場合は `pnpm test`
