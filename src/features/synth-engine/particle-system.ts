export const MAX_PARTICLES = 150;
export const MAX_PARTICLE_ADD = 22;
export const MAX_GRAIN_DURATION_COEFF = 8;
export const PARTICLE_CLOUD_SIZE_COEFF = 40;

export interface Particle {
  cloudCenterX: number;
  cloudCenterY: number;
  x: number;
  y: number;
  velX: number;
  velY: number;
  cloudSize: number;
  age: number;
  lifespan: number;
  flyOver: boolean;
}

export interface ParticleSpawnParams {
  particleSpread: number;
  filterCoeff: number;
  selectionStart: number;
  selectionEnd: number;
  canvasHeight: number;
}

function randFloat(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function randInt(min: number, max: number): number {
  return Math.floor(randFloat(min, max + 1));
}

function randUnitVector2(): { x: number; y: number } {
  const angle = Math.random() * Math.PI * 2;
  return { x: Math.cos(angle), y: Math.sin(angle) };
}

function rotateVector2(x: number, y: number, radians: number): { x: number; y: number } {
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  return {
    x: x * cos - y * sin,
    y: x * sin + y * cos,
  };
}

export function chunkCenterX(chunkIndex: number, chunkStep: number, chunkWidth: number): number {
  return chunkIndex * chunkStep + chunkWidth / 2;
}

export function computeParticleSpawnAmount(particleSpread: number, filterCoeff: number): number {
  const amountCoeff = particleSpread / MAX_GRAIN_DURATION_COEFF;
  return Math.max(1, Math.floor(amountCoeff * MAX_PARTICLE_ADD * filterCoeff));
}

export class ParticleSystem {
  private readonly particles: Particle[] = [];
  private activeCount = 0;

  getActiveCount(): number {
    return this.activeCount;
  }

  update(): void {
    for (let i = 0; i < this.activeCount; ) {
      const particle = this.particles[i];
      if (!particle) {
        i++;
        continue;
      }

      particle.age += 1;
      const expired =
        (!particle.flyOver && particle.age > particle.lifespan) ||
        (particle.flyOver && particle.age >= 300);

      if (expired) {
        this.swapRemove(i);
        continue;
      }

      particle.x += particle.velX;
      particle.y += particle.velY;

      const dx = particle.x - particle.cloudCenterX;
      const dy = particle.y - particle.cloudCenterY;
      const distance = Math.hypot(dx, dy);
      if (!particle.flyOver && distance > particle.cloudSize) {
        const rotated = rotateVector2(particle.velX, particle.velY, 5);
        particle.velX = rotated.x;
        particle.velY = rotated.y;
      }

      i++;
    }
  }

  addParticles(params: ParticleSpawnParams, chunkStep: number, chunkWidth: number): void {
    if (params.particleSpread <= 1) {
      return;
    }

    const amountCoeff = params.particleSpread / MAX_GRAIN_DURATION_COEFF;
    let amount = Math.max(1, Math.floor(amountCoeff * MAX_PARTICLE_ADD * params.filterCoeff));

    const reduction = Math.floor((this.activeCount / MAX_PARTICLES) * MAX_PARTICLE_ADD);
    amount -= reduction;

    if (this.activeCount + amount > MAX_PARTICLES) {
      amount = MAX_PARTICLES - this.activeCount;
    }

    if (amount <= 0) {
      return;
    }

    const cloudSize = params.particleSpread * PARTICLE_CLOUD_SIZE_COEFF;
    const centerY = params.canvasHeight / 2;

    for (let i = 0; i < amount; i++) {
      const randomChunkIndex = randInt(params.selectionStart, params.selectionEnd);
      const centerX = chunkCenterX(randomChunkIndex, chunkStep, chunkWidth);
      const jitter = randUnitVector2();
      const jitterScale = randFloat(0, 5);

      const particle: Particle = {
        cloudCenterX: centerX + jitter.x * jitterScale,
        cloudCenterY: centerY + jitter.y * jitterScale,
        x: centerX + jitter.x * jitterScale,
        y: centerY + jitter.y * jitterScale,
        velX: 0,
        velY: 0,
        cloudSize,
        age: 0,
        lifespan: randInt(30, 60),
        flyOver: randInt(0, 499) === 0,
      };

      const speed = randFloat(1, 5);
      const direction = randUnitVector2();
      particle.velX = direction.x * speed;
      particle.velY = direction.y * speed;

      if (this.activeCount < this.particles.length) {
        this.particles[this.activeCount] = particle;
      } else {
        this.particles.push(particle);
      }
      this.activeCount += 1;
    }
  }

  draw(ctx: CanvasRenderingContext2D, color: string): void {
    if (this.activeCount === 0) {
      return;
    }

    ctx.fillStyle = color;
    for (let i = 0; i < this.activeCount; i++) {
      const particle = this.particles[i];
      if (!particle) {
        continue;
      }
      ctx.fillRect(Math.round(particle.x), Math.round(particle.y), 1, 1);
    }
  }

  private swapRemove(index: number): void {
    this.activeCount -= 1;
    if (index < this.activeCount) {
      const last = this.particles[this.activeCount];
      if (last) {
        this.particles[index] = last;
      }
    }
  }
}
