# Scratchpad

このファイルは、タスクの計画と進捗状況を追跡するためのスクラッチパッドとして使用されます。
（`.cursor/rules/global.mdc`のルールに従って管理されています）

## 現在のタスク

opencollidoscope Web版実装計画策定とフェーズ1実装開始

- [X] オリジナルコードの分析と理解
- [X] 要件仕様書の更新・補完
- [X] Web版設計書の作成
- [X] 必要なメモの整理
- [X] 設計書の図式化（Mermaidダイアグラム）
- [X] 設定値のコンフィグ化対応
- [X] 最新Web Audio API対応（AudioWorklet）
- [X] 実装計画の策定（5段階フェーズ）
- [ ] フェーズ1: 基盤実装の開始

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
- [X] 型安全なlocalStorage読み込みの実装
  - Zodライブラリの調査・選択
  - `JSON.parse(configJson) as Partial<CollidoscopeConfig>`の問題点特定
  - Zodスキーマによるランタイム型検証の実装
  - Result型パターンの採用
  - ベストプラクティスの文書化
- [X] 設計書コードの位置づけ明確化
  - 設計書冒頭に注意書きを追加
  - 擬似コード的な性質を明確化
  - 実装時の再設計ポイントを文書化
  - Lessons.mdに実装時の注意点を記録
- [X] 音声処理パイプライン詳細のMermaid化
  - 録音パイプライン：マイク→録音→チャンク処理→状態管理の詳細フロー
  - 再生パイプライン：グラニュラーシンセシス、フィルター、ボイス管理の詳細
  - 視覚化・フィードバックパイプライン：オシロスコープ、波形表示、パーティクルシステム
  - MIDI制御パイプライン：MIDI入力処理、CC制御、ノート処理の詳細
  - テキストベースの簡単な図をMermaidダイアグラムで置き換え

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

## 実装計画（5段階フェーズ）

### 技術調査完了（2025年1月）

**AudioWorkletとReactの統合**:

- AudioWorkletは`public/worklet/`に配置する
- AudioContextの初期化はユーザージェスチャー後に実行
- MessagePortを使用したパラメータ制御
- ScriptProcessorNodeからAudioWorkletNodeへの完全移行

**プロジェクト構造（Feature-based）**:

```
src/
├── features/           # 機能別モジュール
│   ├── audio/         # 音声処理機能
│   ├── granular/      # グラニュラーシンセシス
│   ├── recording/     # 録音機能
│   └── visualization/ # 波形表示・視覚化
├── components/        # 再利用可能コンポーネント
├── hooks/            # カスタムフック
├── services/         # API・音声サービス
├── store/            # 状態管理（Zustand）
├── utils/            # ユーティリティ関数
└── worklets/         # AudioWorkletProcessor
```

**ベストプラクティス**:

- React.memo、useMemo、useCallbackによる最適化
- Custom Hooks（useAudio、useWorklet、useGranular等）
- Canvas描画の最適化（requestAnimationFrame）
- エラーハンドリングとフォールバック

### フェーズ1: 基盤実装（約2-3週間）

**目標**: 基本的な音声録音・再生機能の実装

**主要タスク**:

1. プロジェクト構造のセットアップ
   - Vite + React + TypeScript
   - 状態管理（Zustand）
   - 型定義とインターフェース
2. AudioContextの管理
   - useAudioContextフック
   - ユーザージェスチャー対応
   - ブラウザ互換性チェック
3. 基本的な録音機能
   - getUserMedia使用
   - MediaStreamAudioSourceNode
   - 2秒間の録音バッファ
4. 基本的な再生機能
   - AudioBufferSourceNode
   - 波形データの管理
5. 基本的なUIフレームワーク
   - Material-UI v7セットアップ
   - レスポンシブレイアウト

**成果物**: 録音→再生の基本フローが動作

### フェーズ2: 音声処理（約3-4週間）

**目標**: AudioWorkletを使用した音声処理の実装

**主要タスク**:

1. AudioWorkletProcessor実装
   - RecordingProcessor（録音用）
   - PlaybackProcessor（再生用）
   - public/worklet/配下に配置
2. チャンク分割機能
   - 150チャンクへの分割
   - チャンク選択機能
   - 選択範囲の管理
3. 波形表示機能
   - Canvas描画
   - リアルタイム更新
   - 色分け（赤色波形）
4. 基本的なエフェクト
   - ゲインコントロール
   - フィルター（ローパス）
   - アテニュエーション

**成果物**: AudioWorkletベースの音声処理システム

### フェーズ3: グラニュラーシンセシス（約4-5週間）

**目標**: PGranularアルゴリズムの完全移植

**主要タスク**:

1. Grainクラスの実装
   - Hann窓エンベロープ
   - 線形補間
   - ランダムオフセット
2. Voice管理システム
   - 最大6ボイス
   - ASRエンベロープ
   - ポリフォニー対応
3. GranularProcessor実装
   - 最大32グレイン
   - グレイン持続時間制御
   - ピッチ・時間軸制御
4. リアルタイム制御
   - パラメータの動的変更
   - スムーズな遷移

**成果物**: 完全なグラニュラーシンセシス機能

### フェーズ4: UI/UX（約2-3週間）

**目標**: 使いやすいユーザーインターフェースの完成

**主要タスク**:

1. コントロールパネル
   - リアルタイムパラメータ制御
   - 設定管理UI
   - プリセット機能
2. 視覚フィードバック
   - オシロスコープ
   - パーティクルシステム
   - カーソル表示
3. レスポンシブ対応
   - モバイル最適化
   - タッチ操作対応
4. キーボードショートカット
   - 録音/再生制御
   - パラメータ操作

**成果物**: プロダクション品質のUI

### フェーズ5: 最適化・品質（約2週間）

**目標**: パフォーマンス最適化と品質向上

**主要タスク**:

1. パフォーマンス最適化
   - React DevTools Profilerによる分析
   - 不要な再レンダリング削除
   - メモリリーク対策
2. テスト実装
   - 単体テスト（Vitest）
   - 音声処理テスト
   - E2Eテスト（Playwright）
3. エラーハンドリング
   - 音声エラーの処理
   - ブラウザ互換性対応
   - フォールバック機能
4. 設定管理
   - Zodスキーマバリデーション
   - localStorage永続化
   - 設定エクスポート/インポート

**成果物**: 完成された安定版アプリケーション

## メモと反省

- ルールファイルは適切に整理・構造化されている
- ルールの分割と再構成により、責任範囲がより明確になった
- 日本語化によりグローバルルールの一貫性が向上した
- コマンド例やプロンプトなどの技術的な文字列は原文のままにすることで正確性を確保
- ドキュメントとルールファイルの相互参照により、プロジェクト全体の把握がしやすくなった
- 実装計画は調査結果に基づく現実的なフェーズ分割を策定
- 各フェーズで動作する成果物を定義し、段階的な開発を可能にした
