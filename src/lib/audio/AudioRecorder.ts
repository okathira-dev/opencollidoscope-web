/**
 * AudioRecorder.ts - Web Audio API implementation for microphone recording
 * Based on the original OpenCollidoscope recording functionality
 */

import type { RecordingState } from "../../types/audio";

export class AudioRecorder {
  private audioContext: AudioContext;
  private mediaRecorder: MediaRecorder | null = null;
  private mediaStream: MediaStream | null = null;
  private audioChunks: Blob[] = [];
  private isRecording: boolean = false;
  private recordingStartTime: number = 0;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
  }

  async startRecording(): Promise<void> {
    try {
      // Request microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: 44100,
        },
      });

      // Setup MediaRecorder
      this.mediaRecorder = new MediaRecorder(this.mediaStream, {
        mimeType: "audio/webm;codecs=opus",
      });

      this.audioChunks = [];
      this.recordingStartTime = Date.now();

      // Setup event handlers
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        console.log("Recording stopped");
      };

      this.mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
      };

      // Start recording
      this.mediaRecorder.start(100); // Collect data every 100ms
      this.isRecording = true;

      console.log("Recording started");
    } catch (error) {
      console.error("Failed to start recording:", error);
      throw error;
    }
  }

  async stopRecording(): Promise<AudioBuffer> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this.isRecording) {
        reject(new Error("No active recording to stop"));
        return;
      }

      this.mediaRecorder.onstop = async () => {
        try {
          // Create blob from recorded chunks
          const audioBlob = new Blob(this.audioChunks, { type: "audio/webm" });

          // Convert blob to ArrayBuffer
          const arrayBuffer = await audioBlob.arrayBuffer();

          // Decode audio data
          const audioBuffer =
            await this.audioContext.decodeAudioData(arrayBuffer);

          this.cleanup();
          resolve(audioBuffer);
        } catch (error) {
          console.error("Failed to process recorded audio:", error);
          this.cleanup();
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      };

      this.mediaRecorder.stop();
      this.isRecording = false;
    });
  }

  private cleanup(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isRecording = false;
  }

  getRecordingState(): RecordingState {
    const duration = this.isRecording
      ? (Date.now() - this.recordingStartTime) / 1000
      : 0;

    return {
      isRecording: this.isRecording,
      duration,
      bufferLength: this.audioChunks.length,
    };
  }

  destroy(): void {
    if (this.isRecording) {
      this.mediaRecorder?.stop();
    }
    this.cleanup();
  }
}
