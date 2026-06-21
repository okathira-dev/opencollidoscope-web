export enum EnvASRState {
  Idle = "idle",
  Attack = "attack",
  Sustain = "sustain",
  Release = "release",
}

export class EnvASR {
  private sustainLevel: number;
  private attackRate: number;
  private releaseRate: number;
  private value = 0;
  private state: EnvASRState = EnvASRState.Idle;

  constructor(sustainLevel: number, attackTime: number, releaseTime: number, sampleRate: number) {
    this.sustainLevel = sustainLevel;
    const safeAttack = attackTime <= 0 ? 0.001 : attackTime;
    const safeRelease = releaseTime <= 0 ? 0.001 : releaseTime;
    this.attackRate = 1.0 / (safeAttack * sampleRate);
    this.releaseRate = 1.0 / (safeRelease * sampleRate);
  }

  tick(): number {
    switch (this.state) {
      case EnvASRState.Idle:
        this.value = 0;
        break;
      case EnvASRState.Attack:
        this.value += this.attackRate;
        if (this.value >= this.sustainLevel) {
          this.value = this.sustainLevel;
          this.state = EnvASRState.Sustain;
        }
        break;
      case EnvASRState.Sustain:
        break;
      case EnvASRState.Release:
        this.value -= this.releaseRate;
        if (this.value <= 0) {
          this.value = 0;
          this.state = EnvASRState.Idle;
        }
        break;
    }
    return this.value;
  }

  noteOn(): void {
    if (this.state === EnvASRState.Idle) {
      this.state = EnvASRState.Attack;
    }
  }

  noteOff(): void {
    if (this.state !== EnvASRState.Idle) {
      this.state = EnvASRState.Release;
    }
  }

  getState(): EnvASRState {
    return this.state;
  }

  setState(state: EnvASRState): void {
    this.state = state;
  }

  get isIdle(): boolean {
    return this.state === EnvASRState.Idle;
  }

  get currentValue(): number {
    return this.value;
  }
}
