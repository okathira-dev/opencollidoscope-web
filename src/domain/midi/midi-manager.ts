import type { CollidoscopeConfig } from "../config/index.ts";
import type { MidiDeviceInfo } from "./midi-message.ts";
import { parseMidiMessage } from "./midi-parser.ts";
import { type MidiRouterActions, routeMidiMessage } from "./midi-router.ts";

export type MidiMessageHandler = (deviceId: string, data: Uint8Array) => void;

function toDeviceInfo(input: MIDIInput): MidiDeviceInfo {
  return {
    id: input.id,
    name: input.name ?? "Unknown device",
    manufacturer: input.manufacturer ?? "",
  };
}

export class MidiManager {
  private access: MIDIAccess | null = null;
  private readonly boundHandlers = new Map<string, (event: MIDIMessageEvent) => void>();
  private config: CollidoscopeConfig;
  private waveChannel = 0;
  private actions: MidiRouterActions | null = null;
  private onDevicesChanged: ((devices: MidiDeviceInfo[]) => void) | null = null;

  constructor(config: CollidoscopeConfig) {
    this.config = config;
  }

  static isSupported(): boolean {
    return typeof navigator !== "undefined" && "requestMIDIAccess" in navigator;
  }

  setConfig(config: CollidoscopeConfig): void {
    this.config = config;
  }

  setWaveChannel(channel: number): void {
    this.waveChannel = channel;
  }

  setActions(actions: MidiRouterActions): void {
    this.actions = actions;
  }

  setOnDevicesChanged(callback: (devices: MidiDeviceInfo[]) => void): void {
    this.onDevicesChanged = callback;
  }

  async initialize(): Promise<MidiDeviceInfo[]> {
    if (!MidiManager.isSupported()) {
      throw new Error("このブラウザは Web MIDI API に対応していません");
    }

    this.access = await navigator.requestMIDIAccess();
    this.access.onstatechange = () => {
      this.attachAllInputs();
      this.notifyDevicesChanged();
    };

    this.attachAllInputs();
    const devices = this.listInputDevices();
    this.notifyDevicesChanged();
    return devices;
  }

  listInputDevices(): MidiDeviceInfo[] {
    if (!this.access) {
      return [];
    }

    return [...this.access.inputs.values()].map(toDeviceInfo);
  }

  dispose(): void {
    if (!this.access) {
      return;
    }

    for (const [id, handler] of this.boundHandlers) {
      const input = this.access.inputs.get(id);
      input?.removeEventListener("midimessage", handler);
    }
    this.boundHandlers.clear();
    this.access.onstatechange = null;
    this.access = null;
  }

  private attachAllInputs(): void {
    if (!this.access) {
      return;
    }

    for (const input of this.access.inputs.values()) {
      if (this.boundHandlers.has(input.id)) {
        continue;
      }

      const handler = (event: MIDIMessageEvent) => {
        this.handleMessage(event);
      };
      input.addEventListener("midimessage", handler);
      this.boundHandlers.set(input.id, handler);
    }
  }

  private handleMessage(event: MIDIMessageEvent): void {
    if (!this.actions || !event.data) {
      return;
    }

    const parsed = parseMidiMessage(event.data);
    if (!parsed) {
      return;
    }

    routeMidiMessage(parsed, {
      waveChannel: this.waveChannel,
      config: this.config,
      actions: this.actions,
    });
  }

  private notifyDevicesChanged(): void {
    this.onDevicesChanged?.(this.listInputDevices());
  }
}
