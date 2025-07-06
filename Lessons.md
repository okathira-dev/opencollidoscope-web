# Lessons

このファイルは、プロジェクト内で学んだ教訓や再利用可能な知識を記録するためのものです。
（`.cursor/rules/global.mdc`のルールに従って管理されています）

## User Specified Lessons

- Python venvの使用: `./venv`ディレクトリにあるPython仮想環境を常に使用（activate）してください。最初に`which uv`を実行して'uv'が利用可能かを確認し、利用可能であれば仮想環境をアクティベートした後に`uv pip install`を使用してパッケージをインストールしてください。利用できない場合は`pip`を使用してください。
- デバッグ情報: プログラム出力に役立つデバッグ情報を含めてください。
- ファイル編集の前提: ファイルを編集する前に必ずその内容を確認してください。
- Cursorの制限に関して: `git`や`gh`を使用する際に複数行のコミットメッセージが必要な場合は、まずメッセージをファイルに書き、`git commit -F <filename>`などのコマンドを使用してコミットしてください。その後ファイルを削除します。コミットメッセージとPRタイトルには「[Cursor] 」を含めてください。

## Cursor learned

- 検索結果: 国際的なクエリに対して異なる文字エンコーディング（UTF-8）を適切に処理することを確保してください。
- デバッグ情報の出力: パイプライン統合を改善するため、stderrにデバッグ情報を追加し、stdoutはメイン出力をクリーンに保ちます。
- seabornスタイル: matplotlibでseabornスタイルを使用する場合、最近のseabornバージョン変更により、'seaborn'ではなく'seaborn-v0_8'をスタイル名として使用してください。
- OpenAIモデル名: OpenAIのGPT-4（ビジョン機能付き）には'gpt-4o'をモデル名として使用してください。
- 最新情報の検索: 最新ニュースを検索する場合は、前年ではなく現在の年（2025）を使用するか、単に「recent」キーワードを使用して最新情報を取得してください。
- 型安全なlocalStorage実装: `JSON.parse(data) as Type`は危険な実装。Zodライブラリを使用してランタイム型検証を行うことで、予期しないデータ形式によるエラーを防止。Result型パターン（`{ success: boolean, data?: T, error?: string }`）で成功/失敗を明確に区別することが重要。zod-storageなどの専用ライブラリも効果的。

- 設計書のコードは擬似コード扱い: 設計書に記載されているTypeScriptコードは、アーキテクチャ設計の概念と実装方向性を示すための擬似コード的な説明。実際の実装時には依存関係の詳細確認、型定義の精密化、エラーハンドリングの拡張、パフォーマンス最適化、テスタビリティ、ブラウザ互換性などを考慮して再設計が必要。設計書のコードをそのままコピー＆ペーストして使用することは推奨されない。

## Project Specific Lessons

- C++音声処理からWeb移植の重要ポイント:
  - **グラニュラーシンセシス**: オリジナルのPGranular.hには32グレイン、6ボイス、Hann窓エンベロープの詳細実装があり、Web Audio APIでの再現時にこれらの具体的な値と仕様を参考にすること
  - **チャンク処理**: 150チャンク、2秒録音、最大37チャンク選択という具体的な数値がオリジナルの操作感に重要
  - **色とアニメーション**: Wave1赤(#F3063E)、Wave2黄(#FFCC00)、3フレームのポップアニメーションなど、視覚的な詳細がユーザー体験に影響する
  - **エンベロープ設定**: アタック10ms、リリース50ms、-12dBアテニュエーションなどの具体的な音響パラメータがオリジナルの音質再現に必須
  - **MIDI制御マッピング**: ピッチベンド（選択位置0-149）、CC1（選択サイズ1-37）、CC2（持続時間）など、物理コントローラーとの互換性のための具体的なマッピング
- 設計書の図式化とMermaidダイアグラム:
  - **Mermaidダイアグラムの効果的な活用**: アスキーアート図よりも視覚的に理解しやすく、複雑なアーキテクチャを階層的に表現可能
  - **技術設計書でのMermaid使用のベストプラクティス**: 全体アーキテクチャ（graph TB）、処理フロー（graph LR）、色分けでコンポーネント識別、サブグラフでモジュール境界明確化
  - **設計書の構造化**: 概要→アーキテクチャ→詳細設計の順で構成し、図と詳細説明の適切な配置により実装時に参照しやすい形で情報整理
- 設定値のコンフィグ化設計:
  - **ハードコーディングからの脱却**: 仕様に出現する具体的な値（チャンク数150、最大グレイン数32など）はすべて設定可能な値として設計することで、拡張性と柔軟性を向上
  - **設定管理の階層化**: 音声設定、グラニュラーシンセシス設定、視覚設定、MIDI設定など、機能別に階層化された設定構造により管理しやすさを向上
  - **リアルタイム設定反映**: 設定変更時に即座に反映される仕組み（useEffect + Zustand）により、ユーザビリティを向上
  - **設定の永続化**: localStorage を使用した設定の保存・復元により、ユーザーのカスタマイズ体験を向上
  - **プリセット管理**: 複数の設定プリセットの保存・呼び出し機能により、様々な用途に応じた設定の切り替えを可能に
- 最新Web Audio API対応（AudioWorklet）:
  - **ScriptProcessorNode廃止**: 非推奨APIの回避により、将来的な互換性を確保。AudioWorkletNodeを使用することで最新ブラウザに対応
  - **専用ワーカースレッド**: AudioWorkletによりメインスレッドをブロックしない音声処理を実現し、UIのレスポンシブ性を向上
  - **セキュリティ要件**: HTTPS必須、ユーザージェスチャー必要など、現代のWebセキュリティ要件に対応した設計
  - **ブラウザ対応範囲**: Chrome 66+、Firefox 76+、Safari 14.1+という明確な対応ブラウザ範囲の設定により、実装の複雑性を削減
  - **エラーハンドリング強化**: AudioWorklet固有のエラー（セキュアコンテキスト、ブラウザ対応など）に対する包括的なエラーハンドリング設計
- オリジナルCollidoscopeのアーキテクチャ分析:
  - **2つの独立した音声処理システム**: `NUM_WAVES=2`により、オリジナルのCollidoscopeは2つの完全に独立した音声処理システムが一体化されたハードウェアであることが判明。この2つの音声処理システムを併せて一つのCollidoscopeと呼んでいる
  - **段階的実装戦略**: 初期実装では単一音声処理システム（赤色波形）のみを実装し、全機能を完成させてから第2音声処理システム（黄色波形）を追加する戦略が有効
  - **コンポーネント独立性**: 各音声処理システムに対してWave、PGranular、Filter、MIDIコントローラーなど、すべてのコンポーネントが独立して実装されている
  - **レイアウト設計**: 画面が縦に2分割される設計（`mSelectionBarHeight = mWindowHeight / NUM_WAVES`）により、2つの音声処理システムが並行して表示される
  - **色分け**: 音声処理システム0（赤色）と音声処理システム1（黄色）の明確な色分けにより、ユーザーが2つの音声処理システムを区別できる

- Web Audio API + React実装計画の策定:
  - **フェーズ分割の重要性**: 複雑な音声処理アプリケーションの実装時、基盤→音声処理→グラニュラーシンセシス→UI/UX→最適化の5段階フェーズ分割により、各段階で動作する成果物を確保し、問題の早期発見・解決を図る
  - **Feature-based構造**: `src/features/`配下に音声処理機能を分割配置することで、モジュール境界を明確化し、コードの可読性と保守性を向上
  - **AudioWorkletの配置**: AudioWorkletProcessorは`public/worklet/`配下に配置し、メインスレッドから独立させることで、リアルタイム音声処理のパフォーマンスを確保
  - **段階的な最適化**: 初期実装では機能実装に集中し、最終フェーズでパフォーマンス最適化・テスト・エラーハンドリングを行う戦略が効果的
  - **カスタムフックの活用**: useAudio、useWorklet、useGranular等のカスタムフックにより、音声処理ロジックのコンポーネント間共有と再利用性を向上
  - **現実的な期間設定**: 基盤実装（2-3週間）、音声処理（3-4週間）、グラニュラーシンセシス（4-5週間）など、各フェーズの実装内容に応じた現実的な期間設定が重要
  - **技術調査の事前実施**: 実装開始前のAudioWorkletとReactの統合、ベストプラクティスの調査により、実装中の技術的な迷いを削減

## Lessons管理ルール

1. **目的**: このファイルは、プロジェクト作業中に学んだ教訓や再利用可能な知識を記録し、共有するためのものです。

2. **更新方法**:
   - 新しいLessonを発見したら、適切なセクションに追加してください
   - 既存のLessonを修正・改善する場合は、その理由を記載してください
   - 各Lessonは簡潔かつ具体的に記述し、可能であれば例を含めてください

3. **分類**:
   - User Specified Lessons: ユーザーが明示的に指定した重要なレッスン
   - Cursor learned: AIが作業中に学んだレッスン
   - Project Specific Lessons: 特定のプロジェクトに関連するレッスン（必要に応じて追加）

4. **他のファイルとの連携**:
   - Scratchpad.mdでタスクを実行する際、このLessons.mdを参照して過去の教訓を活かしてください
   - 新しいLessonを発見したら、現在のタスクを中断せずに、タスク完了後にこのファイルを更新してください

### Web Audio API + React 実装計画策定

プロジェクトの要件を理解し、技術調査を行ってから実装計画を策定するアプローチが効果的でした。C++からWebへの移植では、元のコードの理解、Web Audio APIの制約、Reactのベストプラクティスを組み合わせた段階的なアプローチが重要です。

### react-hooks/exhaustive-deps エラーは useEffect の乱用のサイン

`react-hooks/exhaustive-deps` エラーが発生した場合、`useEffect` の乱用を疑うべきです。

**問題のあるパターン:**

```typescript
// 悪い例：useEffect で状態同期
useEffect(() => {
  audioActions.setRecording({
    ...recording,
    isPlaying: playback.isPlaying,
  });
}, [recording, playback.isPlaying, audioActions]);
```

**解決方法:**

```typescript
// 良い例：直接的な状態管理
const recording = useRecording(audioContext);
const playback = usePlayback(audioContext);
// フックから直接値を取得し、複雑な同期を避ける
```

**重要なポイント:**

1. `useEffect` は状態同期のために使うべきではない
2. 複雑な依存関係は設計の問題を示している
3. フックの責任を明確にし、直接的な状態管理を行う
4. Zustand などの状態管理ライブラリを複雑に使いすぎない

この修正により、7個のESLintエラーと3個の警告がすべて解決されました。

### Promise 返却関数の onClick 属性での使用

React の `onClick` 属性は `void` を期待するため、Promise を返却する関数を直接使用するとESLintエラーが発生します。

**問題のあるパターン:**

```typescript
// 悪い例
<Button onClick={handleAsyncFunction} />
```

**解決方法:**

```typescript
// 良い例
<Button onClick={() => {
  void handleAsyncFunction();
}} />
```

### 🔴 重要: 初期からのzustand状態管理アーキテクチャ設計の重要性

複雑な状態管理を持つアプリケーションでは、最初からzustandベースの設計を行うべきです。

**遭遇した問題（useCallback + useRef地獄）:**

```typescript
// 悪い例：複雑な依存関係
const handleMessage = useCallback((message) => {
  setWorkletState(prev => ({ ...prev, chunks: [...prev.chunks, chunk] }));
}, [audioContext]);

const startRecording = useCallback(async () => {
  workletNode.port.onmessage = (event) => {
    handleMessage(event.data); // 古いクロージャの参照
  };
}, [audioContext, handleMessage]); // 循環依存

// useRefによる回避策（複雑）
const handleMessageRef = useRef(handleMessage);
handleMessageRef.current = handleMessage;
workletNode.port.onmessage = (event) => {
  handleMessageRef.current(event.data);
};
```

**zustandベースの解決法:**

```typescript
// 良い例：シンプルな状態管理
const { addChunk, setWorkletRecording } = useWorkletActions();

const startRecording = useCallback(async () => {
  workletNode.port.onmessage = (event) => {
    if (event.data.type === 'chunk') {
      addChunk(chunkData); // 常に最新の関数を参照
    }
  };
}, [addChunk]); // addChunkは安定した参照
```

**重要な教訓:**

1. **最初にアーキテクチャを正しく設計すべき**: 後からの状態管理移行は大変
2. **複雑な状態は最初からzustandで設計**: ReactのフックだけでExampleは軽い状態管理のみ
3. **useCallbackの依存配列問題は、zustandで解決できる**: 状態管理ライブラリの安定した参照
4. **状態の一元管理は、デバッグ性と保守性を大幅に向上**: devtoolsでの状態追跡

**将来の開発指針:**

- 3つ以上の状態を持つ機能は、最初からzustandで設計する
- AudioWorklet等のワーカーとの通信は、zustandで状態を一元管理する
- ReactのuseStateとuseEffectは、ローカルなUI状態管理のみに使用する
