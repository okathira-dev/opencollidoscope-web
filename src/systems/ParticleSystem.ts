/**
 * Particle System based on the original ParticleController.h
 * Implements visual particles for grain duration visualization
 */

import {
  PARTICLE_SIZE_COEFF,
  MAX_GRAIN_DURATION_COEFF,
} from "../constants/config";

import type { ParticleData, DrawInfo } from "../types";

interface ParticleConfig {
  readonly maxParticles: number;
  readonly particleLifetime: number;
  readonly baseVelocity: number;
  readonly velocityVariation: number;
  readonly gravity: number;
  readonly fadeRate: number;
}

const DEFAULT_PARTICLE_CONFIG: ParticleConfig = {
  maxParticles: 100,
  particleLifetime: 3000, // 3 seconds
  baseVelocity: 50,
  velocityVariation: 30,
  gravity: 20,
  fadeRate: 0.02,
};

export class ParticleSystem {
  private particles: ParticleData[] = [];
  private config: ParticleConfig;
  private lastUpdateTime: number = 0;
  private particleIdCounter: number = 0;

  constructor(config: ParticleConfig = DEFAULT_PARTICLE_CONFIG) {
    this.config = config;
  }

  addParticles(
    amount: number,
    centerPoint: { x: number; y: number },
    cloudSize: number,
    color: string = "#ffffff",
  ): void {
    const actualAmount = Math.min(
      amount,
      this.config.maxParticles - this.particles.length,
    );

    for (let i = 0; i < actualAmount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * cloudSize;
      const velocity =
        this.config.baseVelocity +
        (Math.random() - 0.5) * this.config.velocityVariation;

      const particle: ParticleData = {
        id: `particle_${this.particleIdCounter++}`,
        x: centerPoint.x + Math.cos(angle) * distance,
        y: centerPoint.y + Math.sin(angle) * distance,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        radius: Math.random() * 3 + 1,
        alpha: 1.0,
        color,
      };

      this.particles.push(particle);
    }
  }

  update(deltaTime: number): void {
    const currentTime = Date.now();
    if (this.lastUpdateTime === 0) {
      this.lastUpdateTime = currentTime;
    }

    const dt = (currentTime - this.lastUpdateTime) / 1000; // Convert to seconds
    this.lastUpdateTime = currentTime;

    // Update existing particles
    this.particles = this.particles
      .map((particle) => this.updateParticle(particle, dt))
      .filter((particle) => particle.alpha > 0);
  }

  private updateParticle(
    particle: ParticleData,
    deltaTime: number,
  ): ParticleData {
    // Update position
    const newX = particle.x + particle.vx * deltaTime;
    const newY = particle.y + particle.vy * deltaTime;

    // Update velocity (gravity)
    const newVy = particle.vy + this.config.gravity * deltaTime;

    // Update alpha (fade out)
    const newAlpha = Math.max(
      0,
      particle.alpha - this.config.fadeRate * deltaTime,
    );

    return {
      ...particle,
      x: newX,
      y: newY,
      vy: newVy,
      alpha: newAlpha,
    };
  }

  getParticles(): readonly ParticleData[] {
    return this.particles;
  }

  clear(): void {
    this.particles = [];
  }

  getParticleCount(): number {
    return this.particles.length;
  }

  // Helper method to calculate particle amount based on selection and grain duration
  static calculateParticleAmount(
    selectionSize: number,
    grainDurationCoeff: number,
    maxParticleAdd: number = 20,
  ): number {
    const amountCoeff = grainDurationCoeff / MAX_GRAIN_DURATION_COEFF;
    const selectionCoeff = 1 - selectionSize / 100; // Smaller selection = more particles
    return Math.max(
      1,
      Math.floor(amountCoeff * selectionCoeff * maxParticleAdd),
    );
  }

  // Helper method to calculate cloud size based on grain duration
  static calculateCloudSize(grainDurationCoeff: number): number {
    return grainDurationCoeff * PARTICLE_SIZE_COEFF;
  }
}

// Cursor system for tracking playback position
export interface CursorState {
  readonly id: number;
  readonly position: number;
  readonly isActive: boolean;
  readonly lastUpdate: number;
  readonly color: string;
}

export class CursorSystem {
  private cursors: Map<number, CursorState> = new Map();
  private cursorIdCounter: number = 0;
  private readonly maxCursorAge: number = 5000; // 5 seconds

  createCursor(position: number, color: string = "#ffffff"): number {
    const id = this.cursorIdCounter++;
    const cursor: CursorState = {
      id,
      position,
      isActive: true,
      lastUpdate: Date.now(),
      color,
    };

    this.cursors.set(id, cursor);
    return id;
  }

  updateCursor(id: number, position: number): void {
    const cursor = this.cursors.get(id);
    if (!cursor) return;

    const updatedCursor: CursorState = {
      ...cursor,
      position,
      lastUpdate: Date.now(),
    };

    this.cursors.set(id, updatedCursor);
  }

  removeCursor(id: number): void {
    this.cursors.delete(id);
  }

  deactivateCursor(id: number): void {
    const cursor = this.cursors.get(id);
    if (!cursor) return;

    const updatedCursor: CursorState = {
      ...cursor,
      isActive: false,
      lastUpdate: Date.now(),
    };

    this.cursors.set(id, updatedCursor);
  }

  update(): void {
    const now = Date.now();

    // Remove expired cursors
    for (const [id, cursor] of this.cursors.entries()) {
      if (now - cursor.lastUpdate > this.maxCursorAge) {
        this.cursors.delete(id);
      }
    }
  }

  getActiveCursors(): readonly CursorState[] {
    return Array.from(this.cursors.values()).filter(
      (cursor) => cursor.isActive,
    );
  }

  getAllCursors(): readonly CursorState[] {
    return Array.from(this.cursors.values());
  }

  clear(): void {
    this.cursors.clear();
  }

  getCursorCount(): number {
    return this.cursors.size;
  }
}

// Combined system for managing both particles and cursors
export class VisualEffectsSystem {
  private particleSystem: ParticleSystem;
  private cursorSystem: CursorSystem;
  private animationFrameId: number | null = null;
  private isRunning: boolean = false;

  constructor(particleConfig?: ParticleConfig) {
    this.particleSystem = new ParticleSystem(particleConfig);
    this.cursorSystem = new CursorSystem();
  }

  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.animate();
  }

  stop(): void {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private animate = (): void => {
    if (!this.isRunning) return;

    this.particleSystem.update(0); // deltaTime calculated internally
    this.cursorSystem.update();

    this.animationFrameId = requestAnimationFrame(this.animate);
  };

  // Particle system methods
  addParticles(
    amount: number,
    centerPoint: { x: number; y: number },
    cloudSize: number,
    color?: string,
  ): void {
    this.particleSystem.addParticles(amount, centerPoint, cloudSize, color);
  }

  getParticles(): readonly ParticleData[] {
    return this.particleSystem.getParticles();
  }

  clearParticles(): void {
    this.particleSystem.clear();
  }

  // Cursor system methods
  createCursor(position: number, color?: string): number {
    return this.cursorSystem.createCursor(position, color);
  }

  updateCursor(id: number, position: number): void {
    this.cursorSystem.updateCursor(id, position);
  }

  removeCursor(id: number): void {
    this.cursorSystem.removeCursor(id);
  }

  deactivateCursor(id: number): void {
    this.cursorSystem.deactivateCursor(id);
  }

  getActiveCursors(): readonly CursorState[] {
    return this.cursorSystem.getActiveCursors();
  }

  getAllCursors(): readonly CursorState[] {
    return this.cursorSystem.getAllCursors();
  }

  clearCursors(): void {
    this.cursorSystem.clear();
  }

  // Combined methods
  clear(): void {
    this.clearParticles();
    this.clearCursors();
  }

  getStats(): { particles: number; cursors: number } {
    return {
      particles: this.particleSystem.getParticleCount(),
      cursors: this.cursorSystem.getCursorCount(),
    };
  }
}

// Singleton instance
let visualEffectsInstance: VisualEffectsSystem | null = null;

export const getVisualEffectsSystem = (): VisualEffectsSystem => {
  if (!visualEffectsInstance) {
    visualEffectsInstance = new VisualEffectsSystem();
  }
  return visualEffectsInstance;
};
