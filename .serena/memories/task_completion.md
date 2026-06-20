# タスク完了時に実行すべきこと

変更を仕上げる前後で、次を実行してよいことを確認する:

1. **Biome**: `pnpm check`（または `pnpm check:fix` で自動修正後に再確認）
2. **型**: `pnpm compile`
3. **ユニットテスト**: `pnpm test` または `pnpm test:coverage`（ロジックに触れた場合）
4. **Markdown を編集した場合**: `pnpm lint-md`

コミット前: Husky の lint-staged が TS/JS（Biome + `tsc --noEmit`）と md をチェックするため、ローカルで `pnpm check` と関連テストを通しておくとスムーズ。
