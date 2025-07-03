/**
 * AudioRecorder.js - Microphone recording functionality
 * Records audio from microphone using getUserMedia and Web Audio API
 */

export class AudioRecorder {
    constructor(audioContext) {
        this.audioContext = audioContext;
        this.mediaStream = null;
        this.sourceNode = null;
        this.recordingNode = null;
        this.isRecording = false;
        this.recordedChunks = [];
        this.mediaRecorder = null;
        
        // Recording settings
        this.sampleRate = audioContext.sampleRate;
        this.channels = 1; // Mono recording
        this.bufferSize = 4096;
    }

    async startRecording() {
        if (this.isRecording) {
            throw new Error('Already recording');
        }

        try {
            // Request microphone access
            this.mediaStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: this.sampleRate,
                    channelCount: this.channels,
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false
                }
            });

            // Create audio nodes
            this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);
            
            // Use ScriptProcessorNode for recording (deprecated but still widely supported)
            // Note: AudioWorklet would be better but requires more complex setup
            this.recordingNode = this.audioContext.createScriptProcessor(this.bufferSize, 1, 1);
            
            // Initialize recording buffer
            this.recordedChunks = [];
            
            // Set up recording process
            this.recordingNode.onaudioprocess = (event) => {
                if (this.isRecording) {
                    const inputBuffer = event.inputBuffer;
                    const inputData = inputBuffer.getChannelData(0);
                    
                    // Store audio data
                    this.recordedChunks.push(new Float32Array(inputData));
                }
            };
            
            // Connect audio graph
            this.sourceNode.connect(this.recordingNode);
            this.recordingNode.connect(this.audioContext.destination);
            
            this.isRecording = true;
            console.log('Recording started');
            
        } catch (error) {
            console.error('Failed to start recording:', error);
            throw error;
        }
    }

    async stopRecording() {
        if (!this.isRecording) {
            throw new Error('Not currently recording');
        }

        this.isRecording = false;

        try {
            // Disconnect and clean up audio nodes
            if (this.recordingNode) {
                this.recordingNode.disconnect();
                this.recordingNode.onaudioprocess = null;
                this.recordingNode = null;
            }

            if (this.sourceNode) {
                this.sourceNode.disconnect();
                this.sourceNode = null;
            }

            // Stop media stream
            if (this.mediaStream) {
                this.mediaStream.getTracks().forEach(track => track.stop());
                this.mediaStream = null;
            }

            // Create AudioBuffer from recorded chunks
            const audioBuffer = this.createAudioBuffer();
            
            console.log('Recording stopped, duration:', audioBuffer.duration, 'seconds');
            
            return audioBuffer;
            
        } catch (error) {
            console.error('Failed to stop recording:', error);
            throw error;
        }
    }

    createAudioBuffer() {
        if (this.recordedChunks.length === 0) {
            // Return empty buffer if no data recorded
            return this.audioContext.createBuffer(1, 1, this.sampleRate);
        }

        // Calculate total length
        const totalLength = this.recordedChunks.reduce((sum, chunk) => sum + chunk.length, 0);
        
        // Create AudioBuffer
        const audioBuffer = this.audioContext.createBuffer(
            this.channels,
            totalLength,
            this.sampleRate
        );

        // Copy recorded data to buffer
        const bufferData = audioBuffer.getChannelData(0);
        let offset = 0;
        
        for (const chunk of this.recordedChunks) {
            bufferData.set(chunk, offset);
            offset += chunk.length;
        }

        return audioBuffer;
    }

    getRecordingLevel() {
        // Calculate current recording level (RMS)
        if (!this.isRecording || this.recordedChunks.length === 0) {
            return 0;
        }

        const lastChunk = this.recordedChunks[this.recordedChunks.length - 1];
        let sum = 0;
        
        for (let i = 0; i < lastChunk.length; i++) {
            sum += lastChunk[i] * lastChunk[i];
        }
        
        return Math.sqrt(sum / lastChunk.length);
    }

    async checkMicrophonePermission() {
        try {
            const result = await navigator.permissions.query({ name: 'microphone' });
            return result.state; // 'granted', 'denied', or 'prompt'
        } catch (error) {
            console.warn('Unable to check microphone permission:', error);
            return 'unknown';
        }
    }

    static async isSupported() {
        return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    }

    destroy() {
        if (this.isRecording) {
            this.stopRecording().catch(console.error);
        }
    }
}