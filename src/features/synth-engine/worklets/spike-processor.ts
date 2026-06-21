class SpikeProcessor extends AudioWorkletProcessor {
  private phase = 0;
  private readonly frequency = 440;

  process(_inputs: Float32Array[][], outputs: Float32Array[][]): boolean {
    const output = outputs[0];
    if (!output) {
      return true;
    }

    for (let ch = 0; ch < output.length; ch++) {
      const channel = output[ch];
      if (!channel) {
        continue;
      }
      for (let i = 0; i < channel.length; i++) {
        channel[i] = Math.sin(this.phase) * 0.2;
        this.phase += (2 * Math.PI * this.frequency) / sampleRate;
      }
    }
    return true;
  }
}

registerProcessor("spike-processor", SpikeProcessor);
