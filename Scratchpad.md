# Scratchpad

このファイルは、タスクの計画と進捗状況を追跡するためのスクラッチパッドとして使用されます。
（`.cursor/rules/global.mdc`のルールに従って管理されています）

## 現在のタスク

opencollidoscope Web版移植設計書作成

- [X] オリジナルコードの分析と理解
- [X] 要件仕様書の更新・補完
- [X] Web版設計書の作成
- [X] 必要なメモの整理
- [X] 設計書の図式化（Mermaidダイアグラム）
- [X] 設定値のコンフィグ化対応
- [X] 最新Web Audio API対応（AudioWorklet）

## 進捗状況

- [X] オリジナルCollidoscopeプロジェクトのコード分析完了
  - AudioEngine: 音声入力・録音・グラニュラーシンセシス・フィルター
  - PGranular: グラニュラーシンセシスの核心ロジック
  - Wave/Chunk: 波形表示とチャンク管理
  - MIDI: 外部コントローラー入力
  - Config: システム設定・定数
- [X] 主要な定数値とパラメータを特定
- [X] 設計書の作成完了
- [X] 要件仕様書の更新完了
- [X] 図式化完了（Mermaidダイアグラム）
  - 全体アーキテクチャ図
  - 音声処理パイプライン図
  - 状態管理構造図
  - グラニュラーシンセシス処理フロー図
- [X] 設定値のコンフィグ化対応
  - CollidoscopeConfig インターフェース設計
  - ConfigManager クラス実装
  - ConfigStore（Zustand）設計
  - ConfigPanel コンポーネント設計
  - 設定の動的変更とリアルタイム更新実装
  - プリセット管理機能
  - 設定の永続化（localStorage）
- [X] AudioWorklet対応（Chrome最新版対応）
  - ScriptProcessorNode廃止対応
  - AudioWorkletProcessor実装設計
  - 録音・再生用AudioWorklet設計
  - エラーハンドリング強化（HTTPS、ブラウザ対応チェック）
  - セキュリティ要件整理
- [X] オリジナルCollidoscopeの2音声処理システム構造分析
  - NUM_WAVES=2の確認（CMakeLists.txt）
  - 独立したコンポーネント構造の解析
  - 段階的実装戦略の策定（Phase 1: 単一音声処理システム、Phase 2: デュアル音声処理システム）
  - 設計書・仕様書の更新

## オリジナルCollidoscope分析結果

### 主要コンポーネント

1. **AudioEngine**: 音声処理の中核
2. **PGranular**: グラニュラーシンセシス
3. **Wave/Chunk**: 波形表示
4. **MIDI**: コントローラー入力
5. **Config**: 設定管理

### 重要な定数・パラメータ

- チャンク数: 150（波形分割数）
- 波形長: 2.0秒（録音時間）
- 最大選択サイズ: 37チャンク
- 最大グレイン数: 32
- 最大ボイス数: 6
- グレイン持続係数: 1-8
- フィルター周波数: 200Hz-22050Hz

### MIDI制御

- ピッチベンド: 選択開始位置（0-149）
- CC1: 選択サイズ（1-37）
- CC2: グレイン持続時間
- CC4: ループオン/オフ
- CC5: 録音トリガー
- CC7: フィルターカットオフ

### 分析メモ

- オリジナルコードはC++/Cinderで実装、リアルタイム音声処理に特化
- グラニュラーシンセシスがCollidoscopeの核心機能
- 2つの独立した音声処理システム（赤・黄）をサポート
- Web Audio APIでの実装は十分可能だが、リアルタイム性に注意が必要

### オリジナルの2音声処理システム構造（詳細分析）

**CMakeLists.txt分析結果**:

```cmake
add_definitions(-DNUM_WAVES=2)
```

**独立したコンポーネント構造**:

- `array< shared_ptr< Wave >, NUM_WAVES > mWaves` - 2つの独立した波形
- `array< PGranularNodeRef, NUM_WAVES > mPGranularNodes` - 2つの独立したグラニュラーシンセサイザー
- `array< FilterLowPassNodeRef, NUM_WAVES> mLowPassFilterNodes` - 2つの独立したフィルター
- `array< MIDIMessage, NUM_WAVES > mPitchBendMessages` - 2つの独立したMIDI制御

**色分け・表示**:

- 音声処理システム0（赤色）: RGB(243, 6, 62) / #F3063E
- 音声処理システム1（黄色）: RGB(255, 204, 0) / #FFCC00
- 画面縦分割: `mSelectionBarHeight = mWindowHeight / NUM_WAVES`

**結論**: オリジナルのCollidoscopeは**2つの完全に独立した音声処理システムが一体化されたハードウェア**。この2つの音声処理システムを併せて一つのCollidoscopeと呼んでいます。

### Web版実装戦略

**Phase 1: 単一音声処理システム実装**（現在のフォーカス）

- 赤色波形（Wave 0）のみを実装
- 全機能を単一音声処理システムで完成
- UI/UXの最適化に集中

**Phase 2: デュアル音声処理システム拡張**（将来的な拡張）

- 黄色波形（Wave 1）の追加
- 状態管理の分離
- レイアウト調整（縦分割）

## リポジトリ構造分析結果

### ルール間の整合性

- 基本的に整合性は保たれています
- 最近の変更：
  - `global.mdc`とScratchpad.mdの関係を明確化
  - Lessons.mdファイルを作成し、Lessonsに関する情報をglobal.mdcから分離
  - global.mdcに他のルールファイルとの関連性を明示的に記載
  - global.mdcを日本語化し、内容の一貫性を向上（コマンド例の文字列は技術的な正確性のため原文のまま）

## メモと反省

- ルールファイルは適切に整理・構造化されている
- ルールの分割と再構成により、責任範囲がより明確になった
- 日本語化によりグローバルルールの一貫性が向上した
- コマンド例やプロンプトなどの技術的な文字列は原文のままにすることで正確性を確保
- ドキュメントとルールファイルの相互参照により、プロジェクト全体の把握がしやすくなった
