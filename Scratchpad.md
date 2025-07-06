# Scratchpad

このファイルは、Collidoscopeウェブ版プロジェクトの実装進捗を管理するためのものです。

## 現在のタスク

✅ **フェーズ1: 基盤実装の完了**

- プロジェクト構造のセットアップ
- 基本的なAudioContextの管理
- 単純な録音・再生機能の実装

✅ **フェーズ2: 音声処理の完了**

- AudioWorkletProcessor実装
- チャンク分割システム（150チャンク）
- 波形表示システム（Canvas API）
- 基本的な音声処理機能

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
  - タイマー間隔の短縮（100ms → 50ms → requestAnimationFrame）
  - 循環参照の解決
  - NaN/Infinity保護機能の追加

**成果物：**

- 録音→再生の基本的な流れが動作するWebアプリケーション
- AudioContextの適切な管理
- Material-UIによる現代的なUI
- 正確で滑らかなプログレスバー

### ✅ フェーズ2: 音声処理 (完了)

- [x] AudioWorkletProcessorの実装
  - `recording-processor.js`作成
  - 150チャンクへの自動分割機能
  - エンベロープによるクリック音除去
  - リアルタイムチャンクデータ送信
- [x] チャンク分割システム
  - 150チャンクへの均等分割
  - 各チャンクの最小値・最大値計算
  - チャンクデータの管理とストレージ
- [x] 波形表示システム
  - `WaveformDisplay`コンポーネント作成
  - Canvas APIを使用したリアルタイム描画
  - チャンク境界線の表示
  - チャンクインデックス表示
  - 波形統計情報の表示
- [x] AudioWorklet統合
  - `useAudioWorklet`フック作成
  - メインスレッドとワークレッドの通信
  - チャンクからAudioBufferの作成
  - AudioControlsにWorklet機能追加

**技術的成果：**

- **AudioWorkletProcessor**: 高性能な音声処理をワーカースレッドで実行
- **リアルタイムチャンク分割**: 録音中に150チャンクに自動分割
- **Canvas波形表示**: 高解像度対応の滑らかな波形描画
- **型安全性**: TypeScript型定義の充実
- **ビルド成功**: 全エラー解決済み

### ✅ フェーズ2.6: Zustandベース状態管理への移行 (完了)

- [x] **AudioWorklet状態管理の問題解決**
  - useCallbackとuseRefの複雑な依存関係による状態更新問題
  - 古いクロージャの参照による無限レンダリングループ
  - 状態の一元管理不足による同期問題
- [x] **audioStore.tsの拡張**
  - AudioWorkletStateインターフェース追加
  - workletアクション群の実装（addChunk, clearChunks, setWorkletRecording等）
  - 便利なセレクタフック（useWorkletState, useWorkletChunks等）
- [x] **useAudioWorkletZustandフック作成**
  - zustandベースの状態管理
  - useCallbackの依存配列問題を解決
  - シンプルで保守性の高い実装
- [x] **コンポーネントの移行**
  - App.tsxをzustandベースに更新
  - AudioControlsコンポーネントの移行
  - WaveformDisplayとの統合

**技術的成果：**

- **状態管理の一元化**: 全AudioWorklet状態をzustandで管理
- **依存配列問題の解決**: useCallbackによる循環依存を排除
- **デバッグ性の向上**: devtoolsによる状態変更の追跡
- **保守性の向上**: シンプルで理解しやすいコード構造

### 🔄 フェーズ3: グラニュラーシンセシス (次のステップ)

- [ ] PGranular移植
- [ ] Hann窓エンベロープ実装
- [ ] 線形補間機能
- [ ] ボイス管理システム

**予定の実装項目：**

1. GranularProcessor実装
   - グレイン生成・管理
   - ハン窓エンベロープ
   - ピッチシフト・タイムストレッチ
2. MIDI入力対応
   - Web MIDI API統合
   - ノートオン・オフ処理
3. グレイン制御
   - グレイン密度調整
   - 再生位置制御
   - 選択範囲機能

## 次のステップ

フェーズ3の実装に進む：

1. GranularProcessorの作成
2. グレイン管理システムの実装
3. MIDI入力機能の追加
4. 高度な音声効果の実装

## メモと反省

### フェーズ1の学習点

- **Feature-based構造**: 機能ごとにモジュール化することで保守性が向上
- **型定義の重要性**: 早期の型定義により開発効率が向上
- **AudioContextの管理**: ブラウザ対応とセキュアコンテキストの考慮が必要
- **状態管理**: Zustandの使用により複雑な状態管理が簡潔に
- **エラーハンドリング**: 一貫したエラー処理パターンの重要性
- **プログレスバーの精度**: タイマーの実装方法が精度に大きく影響
- **requestAnimationFrameの利点**: 60fps滑らかな更新とバッテリー効率

### フェーズ2の学習点

**AudioWorkletProcessorの実装:**

- JavaScriptでの実装が標準的（TypeScript型チェックから除外が必要）
- メインスレッドとワーカースレッド間の通信設計が重要
- リアルタイム音声処理の高いパフォーマンス要求

**チャンク分割システム:**

- 150チャンクの均等分割計算の精度が重要
- エンベロープによるクリック音除去が音質に大きく影響
- チャンクデータの効率的な管理とメモリ使用量の最適化

**Canvas波形表示:**

- 高解像度対応（devicePixelRatio）が必須
- 描画パフォーマンスの最適化（60fps維持）
- TypeScript型安全性と配列要素の未定義チェック

### 技術的な課題と解決

- **TypeScriptとAudioWorklet**: workletsディレクトリをtsconfig.jsonで除外
- **Canvas描画精度**: デバイスピクセル比に対応した高解像度描画
- **音声処理パフォーマンス**: AudioWorkletProcessorによる高効率処理
- **リアルタイム通信**: port.postMessageによる効率的なデータ転送

### 次のフェーズの注意点

- **グラニュラーシンセシス**: 複雑なアルゴリズムの最適化が重要
- **MIDI統合**: ブラウザ間のWeb MIDI API対応の差異
- **パフォーマンス**: 複数グレインの同時処理による負荷管理
- **UI/UX**: 高度な機能の直感的な操作インターフェース設計
