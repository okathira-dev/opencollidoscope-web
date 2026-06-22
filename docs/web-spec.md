# Collidoscope Web版 実装仕様

本ドキュメントは、Open Collidoscope を Web 技術で再実装する際の**目標・機能要件・設定値**を定義します。

- オリジナル実装の分析: [original-analysis.md](original-analysis.md)
- アーキテクチャ設計: [web-design.md](web-design.md)
- UI 対応表: [ui-mapping.md](ui-mapping.md)
- 公式資料ミラー: [`opencollidoscope_downloads/`](../opencollidoscope_downloads/)（Introduction、MIDI reference、Physical Build 等）

## プロジェクトの目的

1. **演奏体験の再現**: オリジナル Collidoscope の「録音 → 選択 → グラニュラー演奏」をブラウザで実現する
2. **アクセシビリティ**: 専用ハードウェアなしで、マイクとキーボード（または Web MIDI）だけで演奏できるようにする
3. **拡張性**: 設定 UI、プリセット、JSON エクスポートなど、オリジナルにない運用面の改善を加える

## フェーズ戦略

### Phase 1: 単一音声処理システム（現在のフォーカス）

- 赤色波形（Wave 0）のみ実装
- 録音、波形表示、グラニュラーシンセ、フィルター、オシロスコープ、パーティクルを単一エンジンで完成
- UI/UX の最適化に集中

### Phase 2: デュアル音声処理システム

- 黄色波形（Wave 1）の追加
- 状態管理の分離（エンジンごとの Store）
- 画面縦分割レイアウト（オリジナル同様、Wave 1 は反転表示）

コンポーネントは Phase 1 から `engineId` を受け取れる形で設計し、Phase 2 で複製可能にする。

## ハードウェアバージョンと Web 版 UI 方針

オープンソース Collidoscope には **オリジナル版**と**新版**の 2 種類の物理筐体がある（詳細は [original-analysis.md](original-analysis.md) の「物理ハードウェア」、[ui-mapping.md](ui-mapping.md) のバージョン別表）。

| 方針 | 内容 |
| --- | --- |
| Phase 1 の基準 | **オリジナル版**の UI メタファー（縦スライダー、トグルスイッチ、Wavejet 操作感） |
| MIDI / 音声 | 両バージョン共通。`CollidoscopeApp` の処理式を Web 版の正とする |
| 将来対応 | 新版 UI（縦ノブ、プッシュボタンループ等）を設定で切替可能にする設計を見据える |

### オリジナル版を基準とする演奏用コントロール

| パラメータ | オリジナル版の物理入力 | Web 版 UI（目標） |
| --- | --- | --- |
| フィルター | 縦スライダー（太陽/月） | 縦 Slider（M3） |
| Duration | 縦スライダー（粒/雲） | 縦 Slider（M2 実装済み） |
| 選択サイズ | Wavejet ノブ回転 | Slider / ホイール（M3） |
| 選択位置 | Wavejet 水平移動 | ドラッグ / Slider（M2 実装済み） |
| ループ | トグルスイッチ | トグル（M3） |
| 録音 | プッシュボタン | ボタン（M1 実装済み） |

## Phase 1 マイルストーン

仕様上 Phase 1 に含まれる機能を、実装順に分割する。M1〜M3 で「演奏できる最小版」、M4 で拡張と運用面を完成させる。

| マイルストーン | 目標 | 含む機能 |
| --- | --- | --- |
| **M1** | 録音して波形が見える | マイク、録音、チャンク波形表示、**設定パネル（折りたたみ・音声タブ）** |
| **M2** | 選択して演奏できる | 選択 UI、グラニュラーシンセ、ピアノ鍵盤、**設定パネルにグラニュラータブ追加** |
| **M3** | 演奏の質とフィードバック | ループ、フィルター、オシロスコープ、再生カーソル、**設定パネルにフィルター/視覚タブ追加** |
| **M4** | 拡張・本番運用 | プリセット、JSON 入出力、MIDI、パーティクル、ショートカット |

**設定 UI**: デバッグとパラメータ確認のため、**M1 から折りたたみ式の設定パネルを常設**する。普段は最小化（アイコンまたは細いバー）し、クリックで展開して GUI から `ConfigManager` 経由で値を変更できる。プリセット保存・JSON 入出力は **M4** で追加する。

**調査タスク**（M1 の先頭で実施。未完了でも postMessage フォールバックで継続可）:

- [x] Vite `?worker&url` による Worklet の TypeScript ビルド（`spike-processor` で `addModule`・440Hz 出力を確認）
- [x] GitHub Pages 向け [coi-serviceworker](https://github.com/gzuidhof/coi-serviceworker) による COOP/COEP 迂回（`crossOriginIsolated` / `SharedArrayBuffer` を確認。初回リロードあり）

実装の正本: `vite.config.ts`（coi プラグイン + dev/preview ヘッダー）、`src/index.html`、`src/features/synth-engine/worklets/spike-processor.ts`（スパイク用。M1 本実装時に `recording-processor` へ置き換え）

### マイルストーンと Store の導入タイミング

| マイルストーン | 新規 Store / UI |
| --- | --- |
| M1 | `audioStore`, `waveStore`, `configStore`, `uiStore`（`isConfigPanelOpen`）, 折りたたみ `ConfigPanel` |
| M2 | `synthStore`, グラニュラータブ |
| M3 | フィルター・視覚タブ（Store は既存を拡張） |
| M4 | プリセット API（`configStore`）、MIDI、パーティクル |

## 機能一覧

| 機能 | 説明 | Phase | マイルストーン |
| --- | --- | --- | --- |
| マイク入力 | `getUserMedia` でマイクから音声取得 | 1 | M1 |
| 録音 | 指定時間の録音、フェードイン/アウト、チャンク分割 | 1 | M1 |
| 波形表示 | チャンク min/max バー、選択範囲ハイライト、アニメーション | 1 | M1 |
| 選択操作 | 開始位置（ドラッグ）、サイズ（ホイール） | 1 | M2 |
| グラニュラーシンセ | グレイン生成、Hann 窓、ピッチ、ループ | 1 | M2 |
| ピアノ鍵盤 | 画面上の鍵盤 + PC キーボード | 1 | M2 |
| ループ | 選択範囲のループ再生 | 1 | M3 |
| フィルター | ローパス、指数的カットオフ制御 | 1 | M3 |
| オシロスコープ | 再生中の出力波形をリアルタイム表示 | 1 | M3 |
| 再生カーソル | ループ中の再生位置表示 | 1 | M3 |
| パーティクル | duration coeff に連動した視覚フィードバック | 1 | M4 |
| MIDI 入力 | Web MIDI API による外部コントローラー対応 | 1 | M4 |
| 設定パネル（折りたたみ GUI） | 常設。最小化がデフォルト。`ConfigManager` と双方向バインド | 1 | M1 着手、マイルストーンごとにタブ拡張 |
| プリセット・JSON 入出力 | 設定の保存・読み込み・エクスポート | 1 | M4 |
| 第 2 エンジン | 独立した黄色波形システム | 2 | — |

## 設定値

**重要**: 以下の値はすべて設定可能として実装する。記載値はデフォルト。オリジナルでハードコードされていた定数の多くを、Web 版ではユーザーが変更できるようにする。

### 音声設定

| パラメータ | デフォルト | 範囲 |
| --- | --- | --- |
| 録音時間（`waveLength`） | 2.0 秒 | 0.1〜10 秒 |
| チャンク数（`chunkCount`） | 150 | 1〜1000 |
| サンプルレート | 44100 Hz | Web Audio API デフォルト |
| 最大選択サイズ | 37 チャンク | 1〜チャンク数 |
| アテニュエーション | -12dB（0.25118864315096） | 0〜1 |

### グラニュラーシンセシス設定

| パラメータ | デフォルト | 範囲 |
| --- | --- | --- |
| 最大グレイン数 | 32 | 1〜128 |
| 最小グレイン持続時間 | 640 サンプル | 正の数 |
| グレイン持続係数 | 1.0〜8.0 | 1.0〜8.0 |
| 最大ボイス数 | 6 | 1〜16 |

### エンベロープ設定（ASR）

| パラメータ | デフォルト |
| --- | --- |
| アタック時間 | 0.01 秒（10ms） |
| リリース時間 | 0.05 秒（50ms） |
| サステインレベル | 1.0 |

### フィルター設定

| パラメータ | デフォルト |
| --- | --- |
| 最小カットオフ周波数 | 200 Hz |
| 最大カットオフ周波数 | 22050 Hz |
| Q ファクター | 0.707（Butterworth） |

### 視覚設定

| パラメータ | デフォルト |
| --- | --- |
| Wave 1 色（赤） | `#F3063E` |
| Wave 2 色（黄） | `#FFCC00` |
| カーソル色 | `#FFFFFF` |
| 最大パーティクル数 | 150 |
| チャンクアニメーションフレーム数 | 3 |

### MIDI 設定

公式定義: [`opencollidoscope_downloads/Collidoscope MIDI messages reference.pdf`](../opencollidoscope_downloads/Collidoscope%20MIDI%20messages%20reference.pdf)

| パラメータ | デフォルト | マッピング |
| --- | --- | --- |
| ピッチベンド範囲 | 0〜149 | 選択開始（チャンクインデックス） |
| CC1 | 選択サイズ | 0〜127 → 1〜37 チャンク |
| CC2 | グレイン持続係数 | 0〜127 → 1.0〜8.0 |
| CC4 | ループ ON/OFF | 0 = OFF、>0 = ON |
| CC5 | 録音トリガー | 値は任意（エッジで開始） |
| CC7 | フィルターカットオフ | 下記参照 |

**CC7 フィルター（Web 版の正）**: `CollidoscopeApp` と同じ指数マッピングを用いる。

```text
cutoff = pow(maxCutoff / 200, midiVal / 127) × minCutoff
selectionAlpha = lmap(midiVal, 0, 127, 0, 1)  → 描画時 0.5 + alpha × 0.5
```

- `midiVal = 0` → 200 Hz（最大カット、選択ハイライトは暗い）
- `midiVal = 127` → 22050 Hz（フィルターなし、選択ハイライトは明るい）

公式 MIDI リファレンス PDF はオリジナル版フェーダーの**物理位置**（太陽側 = 明るい）で周波数を記述している。Teensy はアナログ値を `map(..., 0, 127)` で MIDI 値に変換するため、PDF の記述とコード上の MIDI→周波数の対応は座標系が異なる場合がある。**Web 版は上記の CollidoscopeApp 式を正とする。**

**物理入力（参考）**: オリジナル版 = 縦スライダー（太陽/月、CC7）、新版 = 縦ストリップセンサー（ノブ上下、同 CC7）。

### 設定管理要件

1. JSON 形式でエクスポート/インポート可能
2. 再生中でも設定値を変更可能（リアルタイム反映）
3. Zod によるバリデーションと依存関係チェック（例: 最大選択サイズ ≤ チャンク数）
4. 設定パネル UI から各値を変更可能
5. 複数プリセットの保存・呼び出し
6. localStorage への永続化（Zod でランタイム検証）

実装の正本: `src/domain/config/`（`config-schema.ts`, `config-manager.ts`, `default-config.ts`）

## 機能仕様詳細

### 音声入力

- `navigator.mediaDevices.getUserMedia` でマイクアクセス
- `MediaStreamAudioSourceNode` に接続
- 録音トリガー時に AudioWorklet へストリームを渡す

### 録音

- `AudioWorkletNode` で録音（`ScriptProcessorNode` は使用しない）
- 録音時間は設定可能
- 録音と同時にチャンク分割し、各チャンクの min/max を計算
- 録音開始・終了にフェードイン/アウト
- 新規録音時は既存バッファを破棄

### 波形表示

- 録音バッファをチャンク数に分割し、各チャンクを縦バーで描画
- 選択範囲をハイライト表示
- 新チャンク出現時にポップアップアニメーション（3 フレーム）
- `requestAnimationFrame` で描画

### 選択操作

| 操作 | 筐体 UI | 補助操作 |
| --- | --- | --- |
| 選択開始位置 | Wavejet 水平レール（波形直下） | 波形ドラッグ、横ホイール |
| 選択サイズ | Wavejet ノブ相当の縦スライダー（演奏列） | 波形上ホイール |

### グラニュラーシンセシス

オリジナルの `PGranular` アルゴリズムを再現する（詳細は [original-analysis.md](original-analysis.md)）:

- Hann 窓（raised cosine recurrence）
- 線形補間サンプリング
- ランダムオフセット（最大約 10ms）
- ピッチ: MIDI 60 = 基準、12 平均律
- ループ: 選択範囲のループ再生
- ポリフォニー: 最大 6 ボイス + ループ 1

### オシロスコープ

- `AnalyserNode` で出力波形を取得
- バッファサイズを 4 で除算してポイント数を決定
- `requestAnimationFrame` で Canvas 描画

### 再生カーソルとパーティクル

- ループ再生中、選択範囲上に再生位置カーソルを表示
- duration coeff > 1 のときパーティクルを放出
- 最大パーティクル数 150

## UI 仕様

### 演奏 UI と設定 UI の分離

| UI | コンポーネント | 役割 |
| --- | --- | --- |
| **演奏 UI** | `ControlPanel`（新規）+ `WaveDisplay` + `PianoKeyboard` 等 | オリジナル筐体の物理配置を模す。日常の演奏操作のみ |
| **設定 UI** | `ConfigPanel`（折りたたみ Drawer） | デバッグ・全パラメータ調整。演奏画面の主要操作はここに置かない |

Phase 1 では **オリジナル版筐体**のレイアウトを演奏 UI の基準とする（[ui-mapping.md](ui-mapping.md) 参照）。

### 全体レイアウト（オリジナル版筐体準拠）

```text
┌─────────────────────────────────────────┐
│  波形ディスプレイ（WaveDisplay）           │
├─────────────────────────────────────────┤
│  Wavejet 水平レール（選択開始）            │
├──────┬─────────┬────────┬────────┬──────┤
│Filter│Duration │選択サイズ│ 録音   │ 鍵盤 │ループ│
│縦    │縦       │(ノブ)   │ボタン  │      │トグル│
│(M3)  │(M2残)   │(M2残)   │        │      │(M3) │
└──────┴─────────┴────────┴────────┴──────┘
```

- Phase 1: 単一シンジンを画面中央に配置
- 縦積みの暫定 UI（`SynthEngine` 内の単独 Slider 等）は **M2 残り**で上記レイアウトへ置き換える
- Filter・ループは M3 で同列に実装。M2 残りでは配置枠のみ確保可

### UI コンポーネント

| コンポーネント | 配置 | 機能 |
| --- | --- | --- |
| `WaveDisplay` | 上部 | チャンク波形、選択ハイライト、ドラッグ操作 |
| Wavejet 水平レール | 波形直下 | 選択開始位置（Pitch Bend 相当） |
| フィルター縦スライダー | 演奏列・左（M3） | 太陽/月アイコン相当（CC7） |
| Duration 縦スライダー | 演奏列・左（M2 残り） | 粒/雲アイコン相当（CC2） |
| 選択サイズスライダー | 演奏列・中央（M2 残り） | Wavejet ノブ回転相当（CC1） |
| 録音ボタン | 演奏列（M2 残り） | 赤プッシュボタン相当（CC5） |
| ピアノ鍵盤 | 演奏列（M2 残り） | Note On/Off |
| ループトグル | 演奏列・右端（M3） | トグルスイッチ相当（CC4） |
| `ConfigPanel` | 画面端 Drawer | 折りたたみ式。全パラメータ（デバッグ用） |
| プリセット / JSON | `ConfigPanel` 内（M4） | 設定の保存・入出力 |

### 設定パネル（折りたたみ GUI）

演奏画面に常設する。**デフォルトは最小化**（画面端のアイコンボタン、または細いヘッダバーのみ表示）。ユーザーが開くとパネルが展開し、スライダー・数値入力で設定を変更できる。

| 要件 | 内容 |
| --- | --- |
| 初期状態 | 最小化（メイン UI を邪魔しない） |
| 展開 | クリック / トグルでパネル表示。再度操作で最小化可能 |
| データ源 | `ConfigStore` ↔ `ConfigManager`（Zod 検証済み） |
| 反映 | 変更はリアルタイムで音声エンジン・Worklet に伝播 |
| 段階的拡張 | M1: 音声タブ → M2: グラニュラー → M3: フィルター・視覚 → M4: MIDI・プリセット |

実装時は MUI の `Drawer`（`anchor="right"`, `variant="persistent"`）または浮動 `Paper` を想定。**演奏用コントロールは `ControlPanel` に筐体配置で置き、全パラメータ調整は `ConfigPanel` に限定する**（[ui-mapping.md](ui-mapping.md) 参照）。

### キーボードショートカット

| キー | 操作 |
| --- | --- |
| `R` | 録音開始 |
| `W` / `S` | 選択サイズ増減 |
| `A` / `D` | 選択開始位置調整 |
| Space | ループ ON/OFF |
| `9` / `0` | グレイン持続時間調整 |
| `F` | フルスクリーン切替 |

## 技術スタック

| 領域 | 技術 |
| --- | --- |
| フロントエンド | React 19, TypeScript 6 |
| ビルド | Vite 8（ルートは `src/`） |
| UI | MUI 9 |
| 状態管理 | Zustand |
| 音声処理 | Web Audio API（AudioWorklet） |
| 描画 | HTML5 Canvas |
| 設定検証 | Zod |
| パッケージ管理 | pnpm 11 |
| Node.js | ^24.14.0 |

**音声ライブラリ**: 高レベル抽象化（Tone.js 等）は使わない。オリジナル `PGranular` の挙動を追いながら移植するため、Web Audio API と AudioWorklet を直接使う。

**録音バッファ共有（パフォーマンス優先）**:

1. **優先**: `SharedArrayBuffer` でメインスレッドと Worklet が同一バッファを参照（オリジナルの録音・再生共有に近い）
2. **条件**: `crossOriginIsolated === true`（COOP/COEP）。GitHub Pages では [coi-serviceworker](https://github.com/gzuidhof/coi-serviceworker) による迂回を M1 前に検証する
3. **フォールバック**: 未隔離環境では `postMessage` + `AudioBuffer` コピー（初回ロード・開発時の保険）

### 品質・テスト

| ツール | 用途 |
| --- | --- |
| Biome | lint / format |
| markdownlint-cli2 | Markdown 品質 |
| Vitest | 単体テスト（デフォルト jsdom） |
| `@testing-library/react` | コンポーネントテスト |
| `@vitest/coverage-v8` | カバレッジ |
| Husky + lint-staged | pre-commit（Biome, tsc, vitest related, markdownlint） |
| GitHub Actions | check → test:coverage → build |
| Playwright | E2E（将来、CI 未設定） |

## 対応ブラウザ

AudioWorklet 対応が必須:

| ブラウザ | 最低バージョン |
| --- | --- |
| Chrome | 66+ |
| Firefox | 76+ |
| Safari | 14.1+ |
| Edge | 79+ |

## セキュリティ・実行要件

- **HTTPS 必須**: AudioWorklet はセキュアコンテキストでのみ動作
- **ユーザージェスチャー**: 音声再生にはユーザー操作が必要
- **マイク権限**: 録音にはマイクアクセス許可が必要
- **CORS**: AudioWorklet ファイルは同一オリジンで提供

## 開発環境の意図的な選択と未整備

### 意図的な選択

| 項目 | 内容 |
| --- | --- |
| ツールチェーン | Node.js ^24.14.0 / TypeScript 6 / Vite 8 など最新寄り |
| Vite の `root` | リポジトリ直下ではなく `src/` |
| 品質ツールの分離 | TS/JS は Biome、Markdown は markdownlint-cli2 |
| pre-commit | staged ファイルに Biome、プロジェクト全体に `tsc --noEmit` |
| 参照用 C++ 同梱 | `opencollidoscope/` は Web ビルド対象外 |
| Pages デプロイ | `publish-pages.yml` は build のみ。品質ゲートは CI が担当 |

### 未整備（導入予定）

| 項目 | 現状 | 導入目安 |
| --- | --- | --- |
| E2E テスト | Playwright は MCP のみ | 主要ユーザーフロー実装後 |
| カバレッジ閾値 | レポート生成済み、閾値未設定 | テストが一定数増えた段階 |
| 音声処理本体 | 設定ドメインのみ実装済み | Phase 1 実装フェーズ |

## パフォーマンス要件

- AudioWorklet でメインスレッドをブロックしない
- グレインプール（最大 32）の効率的な再利用
- `requestAnimationFrame` による描画最適化
- 128 サンプルバッファでの低レイテンシ
