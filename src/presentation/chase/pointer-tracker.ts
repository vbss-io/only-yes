import { Vec } from "@/presentation/chase/geometry";

interface PointerSample extends Vec {
  t: number;
}

const BUFFER_SIZE = 8;
const MAX_SAMPLE_AGE_MS = 220;
const MAX_SPEED_PX_MS = 6;

export class PointerTracker {
  private samples: PointerSample[] = [];

  push(x: number, y: number, t: number): void {
    this.samples.push({ x, y, t });
    if (this.samples.length > BUFFER_SIZE) this.samples.shift();
  }

  current(): Vec | null {
    const last = this.samples[this.samples.length - 1];
    return last ? { x: last.x, y: last.y } : null;
  }

  velocity(now: number): Vec {
    const fresh = this.samples.filter((s) => now - s.t <= MAX_SAMPLE_AGE_MS);
    if (fresh.length < 2) return { x: 0, y: 0 };
    const first = fresh[0];
    const last = fresh[fresh.length - 1];
    const dt = last.t - first.t;
    if (dt <= 0) return { x: 0, y: 0 };
    return {
      x: clampSpeed((last.x - first.x) / dt),
      y: clampSpeed((last.y - first.y) / dt),
    };
  }

  predict(aheadMs: number, now: number): Vec | null {
    const position = this.current();
    if (!position) return null;
    const v = this.velocity(now);
    return {
      x: position.x + v.x * aheadMs,
      y: position.y + v.y * aheadMs,
    };
  }

  clear(): void {
    this.samples = [];
  }
}

const clampSpeed = (value: number): number =>
  Math.min(MAX_SPEED_PX_MS, Math.max(-MAX_SPEED_PX_MS, value));
