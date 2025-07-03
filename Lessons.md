# Lessons

このファイルは、プロジェクト内で学んだ教訓や再利用可能な知識を記録するために使用します。
（`.cursor/rules/global.mdc`のルールに従って管理されています）

## User Specified Lessons

ユーザーが指定した特定の教訓や要件：

### Audio Web Development
- Web Audio APIはHTTPS環境での実行が必要（特にmicrophone access）
- AudioContextの状態管理は重要（suspended/runningの切り替え）
- ブラウザ間でのWeb Audio API実装差異に注意

### MIDI Integration
- Web MIDI APIの対応状況はブラウザ依存
- MIDI device接続/切断の動的ハンドリングが必要
- MIDI Control Change値の正規化（0-127 → アプリケーション固有の範囲）

### Performance Optimization
- 32同時グレインは現代ブラウザで実現可能
- Canvas描画のリアルタイム性能最適化が重要
- AudioBuffer操作での効率的なメモリ使用

## Cursor learned

CursorがプロジェクトWorker中に学習した内容：

### OpenCollidoscope Original Architecture
- **グラニュラー合成エンジン**: PGranularクラスがSuperCollider TGrainsベース
- **MIDI Control Mapping**: CC1(selection), CC2(grain duration), CC4(loop), CC5(record), CC7(filter)
- **音程計算**: MIDI Note 60 (C4)基準の12平均律chromatic ratios
- **エンベロープ**: ASR型（Attack 10ms, Release 50ms）
- **選択制御**: ピッチベンドで選択位置制御（オリジナル仕様）

### React TypeScript Migration Patterns
- **型定義の重要性**: Web Audio API関連の型定義で開発効率大幅向上
- **Custom Hooks設計**: `useAudioContext`, `useKeyboardInput`で状態管理分離
- **Component分割**: 責任領域別のコンポーネント設計（Piano, Waveform, Oscilloscope）
- **State Management**: React hooksによるオーディオパラメータ管理

### Web Audio API TypeScript Integration
- **GainNode型安全性**: TypeScriptでのWeb Audio API操作の品質向上
- **AudioBuffer管理**: React useEffectでのリソース管理パターン
- **Real-time Processing**: useCallbackとuseMemoでのパフォーマンス最適化
- **Canvas Operations**: useRefとTypeScriptでの高品質canvas描画

### Build and Development Environment
- **Create React App**: TypeScriptテンプレートでの迅速プロジェクト立ち上げ
- **ESLint Integration**: React + TypeScript環境でのコード品質管理
- **Vite vs CRA**: Create React Appでも十分な開発環境を提供
- **型エラー解決**: React型定義の適切な設定とインポート

### Cross-Platform Considerations
- **Browser Compatibility**: Chrome/Firefox/Safari/Edgeでの機能差異
- **Mobile Support**: Touch eventsによるモバイル対応
- **HTTPS Requirements**: マイクロフォンアクセスとMIDI APIのセキュリティ要件
- **Performance**: デバイス性能に応じたグレイン数調整の必要性

### CSS and Styling Best Practices
- **CSS Variables**: ダークテーマ実装での保守性向上
- **Responsive Design**: モバイルファーストアプローチ
- **Accessibility**: キーボードナビゲーションとフォーカス管理
- **Animation Performance**: reduce-motionメディアクエリ対応

### Audio Programming Patterns
- **Granular Synthesis**: Web Audio APIでの32同時グレイン実装
- **Real-time Analysis**: AnalyserNodeによるオシロスコープ実装
- **Buffer Management**: AudioBufferの効率的な操作パターン
- **MIDI Event Handling**: MIDIMessageEventの型安全な処理

### Project Structure and Architecture
- **Module Organization**: TypeScript項目でのファイル構造設計
- **Hook Patterns**: カスタムフックによるロジック分離
- **Component Design**: 再利用可能なコンポーネント設計原則
- **Type Organization**: audio.ts/ui.tsでの型定義分離

### Error Handling and Debugging
- **TypeScript Errors**: Create React App環境での型エラー解決
- **Audio API Errors**: ブラウザ権限とHTTPS要件への対応
- **Build Process**: Create React Appビルドプロセスの理解
- **Development Workflow**: React開発サーバーとホットリロード

### Performance and Optimization
- **React Re-rendering**: useCallback/useMemoでの最適化
- **Canvas Performance**: requestAnimationFrameによるスムーズ描画
- **Audio Processing**: Web Audio APIのlatency最適化
- **Memory Management**: AudioBuffer/AudioContextのメモリリーク防止

### Future Enhancement Opportunities
- **Testing Integration**: Jest/React Testing Library導入パターン
- **PWA Implementation**: Service Worker統合の可能性
- **WebAssembly**: 高性能音声処理でのWASM活用
- **Real-time Collaboration**: WebRTCによる多人数演奏機能

## Lessons管理ルール

### 新しいLessonの追加
- プロジェクト作業中に発見した重要な知見は即座に記録
- 技術的な詳細だけでなく、設計思想や意思決定の背景も含める
- 将来のプロジェクトで参照しやすいよう、具体的なコード例や設定を含める

### Lessonの更新
- 新しい情報で既存のLessonが更新される場合は、古い情報を削除せず追記
- 変更理由や改善点を明記
- バージョン情報や時期を記載して履歴を追跡可能にする

### プロジェクト固有のLessons

#### OpenCollidoscope React Migration
- **成功要因**: 段階的な実装アプローチ（型定義 → オーディオ → UI → 統合）
- **技術選択**: Create React Appの選択が開発速度向上に貢献
- **設計パターン**: Custom Hooksによる関心の分離が保守性向上
- **パフォーマンス**: React useCallbackとWeb Audio APIの組み合わせで十分な性能

#### TypeScript Web Audio Development
- **型安全性の価値**: コンパイル時のバグ検出で開発効率向上
- **API Integration**: Web Audio API型定義の重要性を実証
- **Real-time Applications**: TypeScriptでもリアルタイム音響処理は十分可能
- **Code Organization**: 型駆動開発でのファイル構造最適化パターン
