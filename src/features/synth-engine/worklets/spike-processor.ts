class SpikeProcessor extends AudioWorkletProcessor {
  process(inputs: Float32Array[][], outputs: Float32Array[][]): boolean {
    const input = inputs[0];
    const output = outputs[0];
    if (input && output) {
      for (let ch = 0; ch < output.length; ch++) {
        const inp = input[ch];
        const out = output[ch];
        if (inp && out) {
          out.set(inp);
        }
      }
    }
    return true;
  }
}

registerProcessor("spike-processor", SpikeProcessor);
