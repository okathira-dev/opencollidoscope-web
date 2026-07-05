/** デフォルトサンプルレート (Hz) */
export const DEFAULT_SAMPLE_RATE = 44100;

/** マイク入力アナライザの FFT サイズ */
export const INPUT_ANALYSER_FFT_SIZE = 256;

/** GainNode のランプ時定数 (秒) */
export const GAIN_RAMP_TIME_CONSTANT = 0.05;

/** AnalyserNode バイト波形の中心値 (無音) */
export const BYTE_CENTER = 128;

/** AudioWorklet のレンダリング量子 (サンプル数) */
export const AUDIO_RENDER_QUANTUM = 128;

/** ループボイス用の cursor メッセージ voiceId */
export const LOOP_VOICE_ID = -1;

/** チャンク報告未開始のセンチネル */
export const NO_CHUNK_REPORTED = -1;
