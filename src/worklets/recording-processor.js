/**
 * RecordingProcessor - 録音処理用AudioWorkletProcessor
 *
 * 機能:
 * - 録音中の音声を150のチャンクに分割
 * - 各チャンクの最小値・最大値を計算
 * - チャンクデータをメインスレッドに送信
 * - エンベロープによるクリック音の除去
 */
class RecordingProcessor extends AudioWorkletProcessor {
  constructor() {
    super();

    // 初期設定
    this.totalChunks = 150;
    this.chunkSize = 0; // 動的に計算
    this.totalFrames = 0;
    this.recordedFrames = 0;

    // 現在のチャンク情報
    this.currentChunkIndex = 0;
    this.chunkFrameCount = 0;
    this.chunkMinValue = 1.0;
    this.chunkMaxValue = -1.0;
    this.chunkData = null;

    // 録音状態
    this.isRecording = false;
    this.recordingStartTime = 0;

    // エンベロープ設定（クリック音除去）
    this.envelopeLength = 1024; // 約23ms（44.1kHz）
    this.envelopeValue = 0.0;
    this.envelopeRate = 0.0;
    this.isEnvelopeActive = false;

    // メインスレッドからのメッセージ処理
    this.port.onmessage = (event) => {
      this.handleMessage(event.data);
    };
  }

  /**
   * メインスレッドからのメッセージを処理
   */
  handleMessage(message) {
    switch (message.type) {
      case "start":
        this.startRecording(message.payload);
        break;
      case "stop":
        this.stopRecording();
        break;
      case "config":
        this.updateConfig(message.payload);
        break;
      default:
        console.warn("Unknown message type:", message.type);
    }
  }

  /**
   * 録音開始
   */
  startRecording(config) {
    this.totalFrames = Math.floor(config.duration * sampleRate);
    this.chunkSize = Math.floor(this.totalFrames / this.totalChunks);

    // 初期化
    this.recordedFrames = 0;
    this.currentChunkIndex = 0;
    this.chunkFrameCount = 0;
    this.chunkMinValue = 1.0;
    this.chunkMaxValue = -1.0;
    this.chunkData = new Float32Array(this.chunkSize);

    // エンベロープ初期化
    this.envelopeValue = 0.0;
    this.envelopeRate = 1.0 / this.envelopeLength;
    this.isEnvelopeActive = true;

    this.isRecording = true;
    this.recordingStartTime = currentTime;

    console.log("🎤 Recording started:", {
      totalFrames: this.totalFrames,
      chunkSize: this.chunkSize,
      totalChunks: this.totalChunks,
      duration: config.duration,
    });

    // 録音開始をメインスレッドに通知
    this.port.postMessage({
      type: "recording-started",
      payload: {
        totalFrames: this.totalFrames,
        chunkSize: this.chunkSize,
        totalChunks: this.totalChunks,
      },
    });
  }

  /**
   * 録音停止
   */
  stopRecording() {
    this.isRecording = false;

    // 最後のチャンクを送信
    if (this.chunkFrameCount > 0) {
      this.sendChunk(true);
    }

    console.log("🛑 Recording stopped:", {
      totalFrames: this.recordedFrames,
      duration: this.recordedFrames / sampleRate,
    });

    // 録音終了をメインスレッドに通知
    this.port.postMessage({
      type: "recording-stopped",
      payload: {
        totalFrames: this.recordedFrames,
        duration: this.recordedFrames / sampleRate,
      },
    });
  }

  /**
   * 設定更新
   */
  updateConfig(config) {
    if (config.totalChunks) {
      this.totalChunks = config.totalChunks;
    }
    if (config.envelopeLength) {
      this.envelopeLength = config.envelopeLength;
      this.envelopeRate = 1.0 / this.envelopeLength;
    }
  }

  /**
   * メインの音声処理
   */
  process(inputs, outputs, parameters) {
    if (!this.isRecording) {
      return true;
    }

    const input = inputs[0];
    if (!input || input.length === 0) {
      return true;
    }

    const inputChannel = input[0];
    const frameCount = inputChannel.length;

    // 録音完了チェック
    if (this.recordedFrames >= this.totalFrames) {
      this.stopRecording();
      return true;
    }

    // フレームを処理
    for (let i = 0; i < frameCount; i++) {
      if (this.recordedFrames >= this.totalFrames) {
        break;
      }

      let sample = inputChannel[i];

      // エンベロープ適用（開始時のクリック音除去）
      if (this.isEnvelopeActive && this.recordedFrames < this.envelopeLength) {
        sample *= this.envelopeValue;
        this.envelopeValue += this.envelopeRate;
        if (this.envelopeValue >= 1.0) {
          this.envelopeValue = 1.0;
          this.isEnvelopeActive = false;
        }
      }

      // エンベロープ適用（終了時のクリック音除去）
      const remainingFrames = this.totalFrames - this.recordedFrames;
      if (remainingFrames <= this.envelopeLength) {
        const fadeOutValue = remainingFrames / this.envelopeLength;
        sample *= fadeOutValue;
      }

      // チャンクデータに追加
      if (this.chunkData) {
        this.chunkData[this.chunkFrameCount] = sample;
      }

      // 最小値・最大値更新
      this.chunkMinValue = Math.min(this.chunkMinValue, sample);
      this.chunkMaxValue = Math.max(this.chunkMaxValue, sample);

      this.chunkFrameCount++;
      this.recordedFrames++;

      // チャンク完了チェック
      if (this.chunkFrameCount >= this.chunkSize) {
        this.sendChunk(false);
        this.nextChunk();
      }
    }

    return true;
  }

  /**
   * チャンクデータをメインスレッドに送信
   */
  sendChunk(isLast) {
    if (!this.chunkData) return;

    const chunkDataToSend = isLast
      ? this.chunkData.slice(0, this.chunkFrameCount)
      : this.chunkData.slice();

    console.log(`📦 Chunk ${this.currentChunkIndex}:`, {
      size: chunkDataToSend.length,
      min: this.chunkMinValue,
      max: this.chunkMaxValue,
      isLast,
    });

    this.port.postMessage({
      type: "chunk",
      payload: {
        chunkIndex: this.currentChunkIndex,
        audioData: chunkDataToSend,
        minValue: this.chunkMinValue,
        maxValue: this.chunkMaxValue,
        timestamp: currentTime,
        isLast: isLast,
      },
    });
  }

  /**
   * 次のチャンクに移行
   */
  nextChunk() {
    this.currentChunkIndex++;
    this.chunkFrameCount = 0;
    this.chunkMinValue = 1.0;
    this.chunkMaxValue = -1.0;

    // 次のチャンクのデータ配列を確保
    const remainingFrames = this.totalFrames - this.recordedFrames;
    const nextChunkSize = Math.min(this.chunkSize, remainingFrames);

    if (nextChunkSize > 0) {
      this.chunkData = new Float32Array(nextChunkSize);
    }
  }
}

// AudioWorkletProcessorに登録
registerProcessor("recording-processor", RecordingProcessor);
