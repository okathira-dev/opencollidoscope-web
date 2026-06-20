# Collidoscope アーキテクチャ分析

## オリジナル C++ から Web 移植の重要ポイント

### グラニュラーシンセシス

- オリジナルの PGranular.h には 32 グレイン、6 ボイス、Hann 窓エンベロープの詳細実装がある
- Web Audio API での再現時にこれらの具体的な値と仕様を参考にする

### チャンク処理

- 150 チャンク、2 秒録音、最大 37 チャンク選択という具体的な数値がオリジナルの操作感に重要

### 色とアニメーション

- Wave1 赤 (#F3063E)、Wave2 黄 (#FFCC00)、3 フレームのポップアニメーション

### エンベロープ設定

- アタック 10ms、リリース 50ms、-12dB アテニュエーション

### MIDI 制御マッピング

- ピッチベンド（選択位置 0-149）、CC1（選択サイズ 1-37）、CC2（持続時間）

## 2 つの独立した音声処理システム

- `NUM_WAVES=2` により、オリジナルは 2 つの完全に独立した音声処理システムが一体化
- 段階的実装戦略: Phase 1 で単一システム（赤色波形）、Phase 2 で第 2 システム（黄色波形）
- 各システムに Wave、PGranular、Filter、MIDI コントローラーが独立実装
- 画面が縦に 2 分割（`mSelectionBarHeight = mWindowHeight / NUM_WAVES`）

## AudioWorklet 対応

- ScriptProcessorNode は非推奨。AudioWorkletNode を使用
- HTTPS 必須、ユーザージェスチャー必要
- 対応ブラウザ: Chrome 66+、Firefox 76+、Safari 14.1+

## 設定値のコンフィグ化

- ハードコーディングからの脱却: チャンク数 150、最大グレイン数 32 等はすべて設定可能に
- 設定管理の階層化: 音声設定、グラニュラーシンセシス設定、視覚設定、MIDI 設定
- localStorage による永続化、プリセット管理

## 設計書の扱い

- 正本: `docs/original-analysis.md`（オリジナル分析）、`docs/web-spec.md`（仕様）、`docs/web-design.md`（設計）
- 設計書の TypeScript コードは擬似コード。実装時は依存関係・型定義・エラーハンドリングを再設計
- Mermaid ダイアグラムはアーキテクチャ理解に有効
