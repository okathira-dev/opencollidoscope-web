# Scratchpad

このファイルは、Collidoscopeウェブ版プロジェクトの実装進捗を管理するためのものです。

## 現在のタスク

✅ **フェーズ1: 基盤実装の完了**

- プロジェクト構造のセットアップ
- 基本的なAudioContextの管理
- 単純な録音・再生機能の実装

## 進捗状況

### ✅ フェーズ1: 基盤実装 (完了)

- [x] Feature-based構造の作成
  - src/features/, src/components/, src/hooks/, src/store/, src/utils/, src/worklets/
- [x] 基本的な型定義の作成
  - AudioConfig, RecordingState, AudioContextState, ChunkData, SelectionData
  - AudioError, AudioProcessingResult<T>
- [x] AudioContextの管理
  - useAudioContextフック（ブラウザ対応チェック、セキュアコンテキスト対応）
  - AudioContextの初期化・破棄機能
- [x] 基本的な録音機能
  - useRecordingフック（getUserMedia、MediaRecorder、2秒間の録音）
  - マイクアクセス許可の取得
  - 録音時間の管理とタイマー
- [x] 基本的な再生機能
  - usePlaybackフック（AudioBufferSourceNode、GainNode）
  - 再生時間の管理とボリューム調整
- [x] 状態管理
  - Zustandストア（AudioContextState、RecordingState、エラー状態）
  - 便利なセレクタとアクション
- [x] UIコンポーネント
  - AudioControlsコンポーネント（録音・再生コントロール）
  - 状態表示とプログレスバー
- [x] 統合とテスト
  - App.tsxへの統合
  - ビルド確認・動作確認
- [x] **プログレスバーの精度向上**
  - 時間計算の改善（audioContext.currentTime → Date.now()）
  - タイマー間隔の短縮（100ms → 50ms）
  - 循環参照の解決
  - NaN/Infinity保護機能の追加

**成果物：**

- 録音→再生の基本的な流れが動作するWebアプリケーション
- AudioContextの適切な管理
- Material-UIによる現代的なUI
- 正確で滑らかなプログレスバー

### 🔄 フェーズ2: 音声処理 (次のステップ)

- [ ] AudioWorkletProcessorの実装
- [ ] チャンク分割（150チャンク）
- [ ] 波形表示（Canvas rendering）
- [ ] 基本的なエフェクト（gain control、lowpass filter）

**予定の実装項目：**

1. AudioWorkletProcessor実装
   - RecordingProcessor（録音用）
   - PlaybackProcessor（再生用）
   - public/worklet/ディレクトリの作成
2. チャンク分割システム
   - 150チャンクへの分割処理
   - チャンクデータの管理
3. 波形表示システム
   - Canvas API使用
   - リアルタイム波形描画
4. 基本的なエフェクト
   - Gainコントロール
   - BiquadFilterNode（ローパスフィルター）

## 次のステップ

フェーズ2の実装に進む：

1. AudioWorkletProcessorの作成
2. チャンク分割システムの実装
3. 波形表示機能の追加
4. 基本的なエフェクトの実装

## メモと反省

### フェーズ1の学習点

- **Feature-based構造**: 機能ごとにモジュール化することで保守性が向上
- **型定義の重要性**: 早期の型定義により開発効率が向上
- **AudioContextの管理**: ブラウザ対応とセキュアコンテキストの考慮が必要
- **状態管理**: Zustandの使用により複雑な状態管理が簡潔に
- **エラーハンドリング**: 一貫したエラー処理パターンの重要性
- **プログレスバーの精度**: タイマーの実装方法が精度に大きく影響

### プログレスバー修正での学習点

**問題:**

- `audioContext.currentTime` は絶対時間のため、計算がずれる
- 循環参照により予期しない動作が発生
- 100ms間隔では滑らかでない更新

**解決策:**

- `Date.now()` を使用した相対時間計算
- 循環参照を避ける直接的な停止処理
- 50ms間隔での更新による滑らかな表示
- `Math.min/max` による値の範囲制限
- NaN/Infinity保護機能

### 技術的な課題

- **MediaRecorder**: ブラウザ間でのコーデック対応の差異
- **AudioWorklet**: まだ実装していないが、パフォーマンスが重要
- **Canvas描画**: リアルタイム描画の最適化が必要

### 次のフェーズの注意点

- AudioWorkletの実装では、メインスレッドとオーディオワークレッド間の通信を適切に管理する必要がある
- 150チャンクの分割処理では、メモリ使用量の最適化が重要
- Canvas描画では、高いフレームレートを維持するために最適化が必要
