interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  phase: number;
  phaseSpeed: number;
  life: number;
  maxLife: number;
}

const COLORS = ["#EC4899", "#A855F7", "#F59E0B", "#FDE68A", "#F472B6"];
const PARTICLE_COUNT = 180;
const GRAVITY = 1400;
const DRAG = 0.35;
const MAX_DT = 0.032;

const spawnParticles = (x: number, y: number): Particle[] => {
  const particles: Particle[] = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 300 + Math.random() * 900;
    const maxLife = 1.6 + Math.random() * 1.4;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 350,
      width: 6 + Math.random() * 8,
      height: 4 + Math.random() * 6,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * Math.PI,
      rotationSpeed: (Math.random() - 0.5) * 12,
      phase: Math.random() * Math.PI,
      phaseSpeed: 6 + Math.random() * 8,
      life: maxLife,
      maxLife,
    });
  }
  return particles;
};

const drawParticles = (
  ctx: CanvasRenderingContext2D,
  particles: Particle[]
): void => {
  for (const p of particles) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.globalAlpha = Math.min(1, p.life / 0.5);
    ctx.fillStyle = p.color;
    const width = p.width * Math.max(0.15, Math.abs(Math.sin(p.phase)));
    ctx.fillRect(-width / 2, -p.height / 2, width, p.height);
    ctx.restore();
  }
};

export const burstConfetti = (originX: number, originY: number): void => {
  const canvas = document.createElement("canvas");
  canvas.style.cssText =
    "position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:2147483000";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.remove();
    return;
  }
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  ctx.scale(dpr, dpr);

  let particles = spawnParticles(originX, originY);
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (reducedMotion) {
    for (const p of particles) {
      p.x += p.vx * 0.12;
      p.y += p.vy * 0.12;
    }
    drawParticles(ctx, particles);
    window.setTimeout(() => canvas.remove(), 1200);
    return;
  }

  let last = performance.now();
  const tick = (now: number): void => {
    const dt = Math.min(MAX_DT, (now - last) / 1000);
    last = now;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    particles = particles.filter((p) => p.life > 0);
    for (const p of particles) {
      p.vx -= p.vx * DRAG * dt;
      p.vy += GRAVITY * dt - p.vy * DRAG * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rotation += p.rotationSpeed * dt;
      p.phase += p.phaseSpeed * dt;
      p.life -= dt;
    }
    drawParticles(ctx, particles);
    if (particles.length > 0) {
      window.requestAnimationFrame(tick);
    } else {
      canvas.remove();
    }
  };
  window.requestAnimationFrame(tick);
};
