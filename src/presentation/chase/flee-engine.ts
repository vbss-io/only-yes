import {
  Size,
  Vec,
  clamp,
  clampToBounds,
  distance,
} from "@/presentation/chase/geometry";

export interface FleeFrame {
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
}

export interface FleeStepInput {
  dtMs: number;
  pointer: Vec | null;
  predicted: Vec | null;
  now: number;
}

export interface FleeStepResult {
  frame: FleeFrame;
  dodged: boolean;
}

export interface FleeEngineConfig {
  bounds: () => Size;
  size: () => Size;
  fleeRadius?: number;
}

const STIFFNESS = 140;
const ZETA = 0.8;
const DAMPING = 2 * ZETA * Math.sqrt(STIFFNESS);
const RESTITUTION = 0.6;
const MAX_DT_MS = 32;
const DODGE_COOLDOWN_MS = 220;
const SQUASH_DURATION_MS = 120;
const SQUASH_AMOUNT = 0.35;
const EDGE_MARGIN = 8;
const CANDIDATES = 12;
const DEFAULT_FLEE_RADIUS = 110;

interface Squash {
  axis: "x" | "y";
  remainingMs: number;
}

export class FleeEngine {
  private pos: Vec = { x: 0, y: 0 };
  private vel: Vec = { x: 0, y: 0 };
  private target: Vec | null = null;
  private squash: Squash | null = null;
  private lastDodgeAt = -Infinity;
  private readonly fleeRadius: number;

  constructor(private readonly config: FleeEngineConfig) {
    this.fleeRadius = config.fleeRadius ?? DEFAULT_FLEE_RADIUS;
  }

  reset(position: Vec): void {
    this.moveTo(position);
    this.lastDodgeAt = -Infinity;
  }

  moveTo(position: Vec): void {
    this.pos = { ...position };
    this.vel = { x: 0, y: 0 };
    this.target = null;
    this.squash = null;
  }

  position(): Vec {
    return { ...this.pos };
  }

  hasFled(): boolean {
    return this.target !== null;
  }

  threaten(point: Vec, now: number): boolean {
    return this.tryFlee(point, now);
  }

  step(input: FleeStepInput): FleeStepResult {
    const dtMs = clamp(input.dtMs, 0, MAX_DT_MS);
    const dt = dtMs / 1000;
    const threat = input.predicted ?? input.pointer;
    let dodged = false;

    if (input.pointer && this.isThreatened(input.pointer, threat)) {
      dodged = this.tryFlee(threat ?? input.pointer, input.now);
    }

    if (this.target) {
      this.target = clampToBounds(
        this.target,
        this.config.size(),
        this.config.bounds(),
        EDGE_MARGIN
      );
      const ax = STIFFNESS * (this.target.x - this.pos.x) - DAMPING * this.vel.x;
      const ay = STIFFNESS * (this.target.y - this.pos.y) - DAMPING * this.vel.y;
      this.vel.x += ax * dt;
      this.vel.y += ay * dt;
      this.pos.x += this.vel.x * dt;
      this.pos.y += this.vel.y * dt;
      this.collideWithBounds();
    }

    if (this.squash) {
      this.squash.remainingMs -= dtMs;
      if (this.squash.remainingMs <= 0) this.squash = null;
    }

    return { frame: this.frame(), dodged };
  }

  private frame(): FleeFrame {
    const rotation = clamp(this.vel.x * 0.012, -14, 14);
    let scaleX = 1;
    let scaleY = 1;
    if (this.squash) {
      const progress = this.squash.remainingMs / SQUASH_DURATION_MS;
      const amount = SQUASH_AMOUNT * progress;
      if (this.squash.axis === "x") {
        scaleX = 1 - amount;
        scaleY = 1 + amount;
      } else {
        scaleX = 1 + amount;
        scaleY = 1 - amount;
      }
    }
    return { x: this.pos.x, y: this.pos.y, rotation, scaleX, scaleY };
  }

  private isThreatened(pointer: Vec, predicted: Vec | null): boolean {
    const center = this.center();
    const nowClose = distance(pointer, center) < this.fleeRadius;
    const soonClose = predicted
      ? distance(predicted, center) < this.fleeRadius
      : false;
    return nowClose || soonClose;
  }

  private tryFlee(threat: Vec, now: number): boolean {
    if (now - this.lastDodgeAt < DODGE_COOLDOWN_MS) return false;
    this.lastDodgeAt = now;
    this.target = this.pickTarget(threat);
    return true;
  }

  private pickTarget(threat: Vec): Vec {
    const bounds = this.config.bounds();
    const size = this.config.size();
    const maxDistance = Math.hypot(bounds.width, bounds.height);
    const previous = this.target;
    let best: Vec = this.pos;
    let bestScore = -Infinity;
    for (let i = 0; i < CANDIDATES; i++) {
      const candidate = clampToBounds(
        {
          x: Math.random() * Math.max(1, bounds.width - size.width),
          y: Math.random() * Math.max(1, bounds.height - size.height),
        },
        size,
        bounds,
        EDGE_MARGIN
      );
      const center = {
        x: candidate.x + size.width / 2,
        y: candidate.y + size.height / 2,
      };
      const threatDistance = Math.min(distance(center, threat), maxDistance * 0.6);
      const edgeDistance = Math.min(
        center.x,
        center.y,
        bounds.width - center.x,
        bounds.height - center.y
      );
      const spread = previous
        ? Math.min(distance(candidate, previous), 300)
        : 0;
      const score = threatDistance + 0.15 * Math.min(edgeDistance, 120) + 0.25 * spread;
      if (score > bestScore) {
        bestScore = score;
        best = candidate;
      }
    }
    return best;
  }

  private collideWithBounds(): void {
    const bounds = this.config.bounds();
    const size = this.config.size();
    const maxX = Math.max(0, bounds.width - size.width);
    const maxY = Math.max(0, bounds.height - size.height);
    if (this.pos.x < 0 || this.pos.x > maxX) {
      this.pos.x = clamp(this.pos.x, 0, maxX);
      if (Math.abs(this.vel.x) > 40) this.squash = { axis: "x", remainingMs: SQUASH_DURATION_MS };
      this.vel.x = -this.vel.x * RESTITUTION;
    }
    if (this.pos.y < 0 || this.pos.y > maxY) {
      this.pos.y = clamp(this.pos.y, 0, maxY);
      if (Math.abs(this.vel.y) > 40) this.squash = { axis: "y", remainingMs: SQUASH_DURATION_MS };
      this.vel.y = -this.vel.y * RESTITUTION;
    }
  }

  private center(): Vec {
    const size = this.config.size();
    return {
      x: this.pos.x + size.width / 2,
      y: this.pos.y + size.height / 2,
    };
  }
}
