/**
 * Message System based on the original Messages.h
 * Handles communication between audio engine and UI components
 */

import { Command } from "../types";

import type {
  RecordWaveMessage,
  CursorTriggerMessage,
  NoteMessage,
  MessageHandler,
  WaveIndex,
  SynthID,
} from "../types";

// Message queue with type safety
class MessageQueue<T> {
  private queue: T[] = [];
  private maxSize: number;

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;
  }

  enqueue(message: T): void {
    if (this.queue.length >= this.maxSize) {
      this.queue.shift(); // Remove oldest message
    }
    this.queue.push(message);
  }

  dequeue(): T | undefined {
    return this.queue.shift();
  }

  peek(): T | undefined {
    return this.queue[0];
  }

  dequeueAll(): T[] {
    const messages = [...this.queue];
    this.queue = [];
    return messages;
  }

  dequeueMany(count: number): T[] {
    const messages = this.queue.splice(0, count);
    return messages;
  }

  size(): number {
    return this.queue.length;
  }

  clear(): void {
    this.queue = [];
  }

  isEmpty(): boolean {
    return this.queue.length === 0;
  }
}

// Event emitter for type-safe message handling
class MessageEmitter<T> {
  private handlers: MessageHandler<T>[] = [];

  subscribe(handler: MessageHandler<T>): () => void {
    this.handlers.push(handler);

    // Return unsubscribe function
    return () => {
      const index = this.handlers.indexOf(handler);
      if (index >= 0) {
        this.handlers.splice(index, 1);
      }
    };
  }

  emit(message: T): void {
    this.handlers.forEach((handler) => {
      try {
        handler(message);
      } catch (error) {
        console.error("Message handler error:", error);
      }
    });
  }

  removeAllHandlers(): void {
    this.handlers = [];
  }

  getHandlerCount(): number {
    return this.handlers.length;
  }
}

// Main message system
export class MessageSystem {
  private recordWaveQueue: MessageQueue<RecordWaveMessage>;
  private cursorTriggerQueue: MessageQueue<CursorTriggerMessage>;
  private noteQueue: MessageQueue<NoteMessage>;

  private recordWaveEmitter: MessageEmitter<RecordWaveMessage>;
  private cursorTriggerEmitter: MessageEmitter<CursorTriggerMessage>;
  private noteEmitter: MessageEmitter<NoteMessage>;

  private processingInterval: number | null = null;
  private isProcessing: boolean = false;

  constructor() {
    this.recordWaveQueue = new MessageQueue<RecordWaveMessage>();
    this.cursorTriggerQueue = new MessageQueue<CursorTriggerMessage>();
    this.noteQueue = new MessageQueue<NoteMessage>();

    this.recordWaveEmitter = new MessageEmitter<RecordWaveMessage>();
    this.cursorTriggerEmitter = new MessageEmitter<CursorTriggerMessage>();
    this.noteEmitter = new MessageEmitter<NoteMessage>();
  }

  // Start message processing
  start(processingInterval: number = 16): void {
    // ~60fps
    if (this.isProcessing) return;

    this.isProcessing = true;
    this.processingInterval = window.setInterval(() => {
      this.processMessages();
    }, processingInterval);
  }

  // Stop message processing
  stop(): void {
    this.isProcessing = false;
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
  }

  // Process all queued messages
  private processMessages(): void {
    this.processRecordWaveMessages();
    this.processCursorTriggerMessages();
    this.processNoteMessages();
  }

  private processRecordWaveMessages(): void {
    const messages = this.recordWaveQueue.dequeueAll();
    messages.forEach((message) => this.recordWaveEmitter.emit(message));
  }

  private processCursorTriggerMessages(): void {
    const messages = this.cursorTriggerQueue.dequeueAll();
    messages.forEach((message) => this.cursorTriggerEmitter.emit(message));
  }

  private processNoteMessages(): void {
    const messages = this.noteQueue.dequeueAll();
    messages.forEach((message) => this.noteEmitter.emit(message));
  }

  // Message enqueue methods
  enqueueRecordWave(message: RecordWaveMessage): void {
    this.recordWaveQueue.enqueue(message);
  }

  enqueueCursorTrigger(message: CursorTriggerMessage): void {
    this.cursorTriggerQueue.enqueue(message);
  }

  enqueueNote(message: NoteMessage): void {
    this.noteQueue.enqueue(message);
  }

  // Subscription methods
  subscribeToRecordWave(
    handler: MessageHandler<RecordWaveMessage>,
  ): () => void {
    return this.recordWaveEmitter.subscribe(handler);
  }

  subscribeToCursorTrigger(
    handler: MessageHandler<CursorTriggerMessage>,
  ): () => void {
    return this.cursorTriggerEmitter.subscribe(handler);
  }

  subscribeToNote(handler: MessageHandler<NoteMessage>): () => void {
    return this.noteEmitter.subscribe(handler);
  }

  // Utility methods for creating messages
  createRecordWaveMessage(
    cmd: Command,
    index: number,
    arg1: number = 0,
    arg2: number = 0,
  ): RecordWaveMessage {
    return { cmd, index, arg1, arg2 };
  }

  createCursorTriggerMessage(
    cmd: Command,
    synthID: SynthID,
  ): CursorTriggerMessage {
    return { cmd, synthID };
  }

  createNoteMessage(
    cmd: Command,
    midiNote: number,
    rate: number = 1.0,
  ): NoteMessage {
    return { cmd, midiNote, rate };
  }

  // Batch message handling
  enqueueRecordWaveMessages(messages: RecordWaveMessage[]): void {
    messages.forEach((message) => this.recordWaveQueue.enqueue(message));
  }

  enqueueCursorTriggerMessages(messages: CursorTriggerMessage[]): void {
    messages.forEach((message) => this.cursorTriggerQueue.enqueue(message));
  }

  enqueueNoteMessages(messages: NoteMessage[]): void {
    messages.forEach((message) => this.noteQueue.enqueue(message));
  }

  // Queue status methods
  getQueueSizes(): { recordWave: number; cursorTrigger: number; note: number } {
    return {
      recordWave: this.recordWaveQueue.size(),
      cursorTrigger: this.cursorTriggerQueue.size(),
      note: this.noteQueue.size(),
    };
  }

  getHandlerCounts(): {
    recordWave: number;
    cursorTrigger: number;
    note: number;
  } {
    return {
      recordWave: this.recordWaveEmitter.getHandlerCount(),
      cursorTrigger: this.cursorTriggerEmitter.getHandlerCount(),
      note: this.noteEmitter.getHandlerCount(),
    };
  }

  // Clear methods
  clearQueues(): void {
    this.recordWaveQueue.clear();
    this.cursorTriggerQueue.clear();
    this.noteQueue.clear();
  }

  clearHandlers(): void {
    this.recordWaveEmitter.removeAllHandlers();
    this.cursorTriggerEmitter.removeAllHandlers();
    this.noteEmitter.removeAllHandlers();
  }

  clear(): void {
    this.stop();
    this.clearQueues();
    this.clearHandlers();
  }

  // Debug methods
  getStats(): {
    isProcessing: boolean;
    queueSizes: { recordWave: number; cursorTrigger: number; note: number };
    handlerCounts: { recordWave: number; cursorTrigger: number; note: number };
  } {
    return {
      isProcessing: this.isProcessing,
      queueSizes: this.getQueueSizes(),
      handlerCounts: this.getHandlerCounts(),
    };
  }
}

// Helper functions for common message operations
export const createWaveChunkMessage = (
  index: number,
  bottom: number,
  top: number,
): RecordWaveMessage => ({
  cmd: Command.WAVE_CHUNK,
  index,
  arg1: bottom,
  arg2: top,
});

export const createWaveStartMessage = (): RecordWaveMessage => ({
  cmd: Command.WAVE_START,
  index: 0,
  arg1: 0,
  arg2: 0,
});

export const createTriggerUpdateMessage = (
  synthID: SynthID,
): CursorTriggerMessage => ({
  cmd: Command.TRIGGER_UPDATE,
  synthID,
});

export const createTriggerEndMessage = (
  synthID: SynthID,
): CursorTriggerMessage => ({
  cmd: Command.TRIGGER_END,
  synthID,
});

export const createNoteOnMessage = (
  midiNote: number,
  rate: number = 1.0,
): NoteMessage => ({
  cmd: Command.NOTE_ON,
  midiNote,
  rate,
});

export const createNoteOffMessage = (midiNote: number): NoteMessage => ({
  cmd: Command.NOTE_OFF,
  midiNote,
  rate: 0,
});

export const createLoopOnMessage = (): RecordWaveMessage => ({
  cmd: Command.LOOP_ON,
  index: 0,
  arg1: 0,
  arg2: 0,
});

export const createLoopOffMessage = (): RecordWaveMessage => ({
  cmd: Command.LOOP_OFF,
  index: 0,
  arg1: 0,
  arg2: 0,
});

// Message filtering utilities
export const filterMessagesByCommand = <T extends { cmd: Command }>(
  messages: T[],
  command: Command,
): T[] => {
  return messages.filter((message) => message.cmd === command);
};

export const filterMessagesByWaveIndex = (
  messages: RecordWaveMessage[],
  waveIndex: WaveIndex,
): RecordWaveMessage[] => {
  return messages.filter((message) => message.index === waveIndex);
};

export const filterMessagesBySynthID = (
  messages: CursorTriggerMessage[],
  synthID: SynthID,
): CursorTriggerMessage[] => {
  return messages.filter((message) => message.synthID === synthID);
};

// Singleton instance
let messageSystemInstance: MessageSystem | null = null;

export const getMessageSystem = (): MessageSystem => {
  if (!messageSystemInstance) {
    messageSystemInstance = new MessageSystem();
  }
  return messageSystemInstance;
};
