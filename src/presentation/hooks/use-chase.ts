import { computeActState, type ActState } from "@/presentation/chase/chase-acts";
import { FleeEngine } from "@/presentation/chase/flee-engine";
import { Size, Vec, clampToBounds, distance } from "@/presentation/chase/geometry";
import { phyllotaxisPosition } from "@/presentation/chase/phyllotaxis";
import { PointerTracker } from "@/presentation/chase/pointer-tracker";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";

export type ChaseMode = "viewport" | "container";

export interface UseChaseOptions {
  mode: ChaseMode;
  active?: boolean;
}

export interface ThreatEvent {
  clientX: number;
  clientY: number;
}

export interface UseChaseResult {
  containerRef: RefObject<HTMLDivElement>;
  noButtonRef: RefObject<HTMLButtonElement>;
  bubbleRef: RefObject<HTMLDivElement>;
  setCloneRef: (index: number) => (el: HTMLButtonElement | null) => void;
  fled: boolean;
  dodges: number;
  act: ActState;
  clones: number[];
  reducedMotion: boolean;
  handleNoThreat: (event: ThreatEvent) => void;
  stop: () => void;
}

const PREDICTION_MS = 180;
const TREMOR_RADIUS = 200;
const CLONE_DRIFT_SPEED = 26;
const CLONE_SIZE: Size = { width: 128, height: 56 };
const CLONE_SPAWN_INTERVAL_MS = 200;
const CLONE_SPAWN_BURST = 5;
const CLONE_ABSOLUTE_CAP = 400;
const CLONE_FILL_FACTOR = 1.15;

const viewportSize = (): Size => ({
  width: window.visualViewport?.width ?? window.innerWidth,
  height: window.visualViewport?.height ?? window.innerHeight,
});

export const useChase = ({ mode, active = true }: UseChaseOptions): UseChaseResult => {
  const containerRef = useRef<HTMLDivElement>(null);
  const noButtonRef = useRef<HTMLButtonElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const cloneRefs = useRef(new Map<number, HTMLButtonElement>());
  const clonePositions = useRef(new Map<number, Vec>());
  const containerOrigin = useRef<Vec>({ x: 0, y: 0 });
  const containerSize = useRef<Size>({ width: 0, height: 0 });
  const tracker = useRef(new PointerTracker());
  const rafId = useRef(0);
  const stopped = useRef(false);
  const fledRef = useRef(false);
  const dodgesRef = useRef(0);

  const [fled, setFled] = useState(false);
  const [dodges, setDodges] = useState(0);
  const [clones, setClones] = useState<number[]>([]);

  const reducedMotion = useMemo(
    () =>
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  const bounds = useCallback(
    (): Size => (mode === "viewport" ? viewportSize() : containerSize.current),
    [mode]
  );

  const buttonSize = useCallback((): Size => {
    const el = noButtonRef.current;
    if (!el) return CLONE_SIZE;
    return { width: el.offsetWidth, height: el.offsetHeight };
  }, []);

  const engine = useMemo(
    () => new FleeEngine({ bounds, size: buttonSize }),
    [bounds, buttonSize]
  );

  const act = useMemo(() => computeActState(dodges), [dodges]);

  const cloneCapacity = useCallback((): number => {
    const area = bounds();
    if (area.width === 0 || area.height === 0) return 0;
    return Math.min(
      CLONE_ABSOLUTE_CAP,
      Math.ceil(
        ((area.width * area.height) / (CLONE_SIZE.width * CLONE_SIZE.height)) *
          CLONE_FILL_FACTOR
      )
    );
  }, [bounds]);

  const refreshContainerBox = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    containerOrigin.current = { x: rect.left, y: rect.top };
    containerSize.current = { width: rect.width, height: rect.height };
  }, []);

  const toLocal = useCallback(
    (clientX: number, clientY: number): Vec =>
      mode === "viewport"
        ? { x: clientX, y: clientY }
        : {
            x: clientX - containerOrigin.current.x,
            y: clientY - containerOrigin.current.y,
          },
    [mode]
  );

  const registerDodge = useCallback(() => {
    dodgesRef.current += 1;
    setDodges(dodgesRef.current);
  }, []);

  const beginFlee = useCallback(
    (threat: Vec) => {
      const el = noButtonRef.current;
      if (!el || fledRef.current) return;
      refreshContainerBox();
      const rect = el.getBoundingClientRect();
      const start = toLocal(rect.left, rect.top);
      engine.reset(start);
      fledRef.current = true;
      setFled(true);
      if (engine.threaten(threat, performance.now())) registerDodge();
      if (reducedMotion) applyTeleport(el, engine, bounds(), buttonSize());
    },
    [engine, refreshContainerBox, toLocal, registerDodge, reducedMotion, bounds, buttonSize]
  );

  const handleNoThreat = useCallback(
    (event: ThreatEvent) => {
      const threat = toLocal(event.clientX, event.clientY);
      if (!fledRef.current) {
        beginFlee(threat);
        return;
      }
      if (engine.threaten(threat, performance.now())) {
        registerDodge();
        if (reducedMotion && noButtonRef.current) {
          applyTeleport(noButtonRef.current, engine, bounds(), buttonSize());
        }
      }
    },
    [beginFlee, engine, toLocal, registerDodge, reducedMotion, bounds, buttonSize]
  );

  const setCloneRef = useCallback(
    (index: number) => (el: HTMLButtonElement | null) => {
      if (el) cloneRefs.current.set(index, el);
      else cloneRefs.current.delete(index);
    },
    []
  );

  const stop = useCallback(() => {
    stopped.current = true;
  }, []);

  useEffect(() => {
    if (!active || act.act !== 3) return;
    refreshContainerBox();
    const spawn = (amount: number): void => {
      setClones((prev) => {
        const capacity = cloneCapacity();
        if (prev.length >= capacity) return prev;
        const next = [...prev];
        const target = Math.min(capacity, prev.length + amount);
        for (let i = prev.length; i < target; i++) {
          if (!clonePositions.current.has(i)) {
            clonePositions.current.set(
              i,
              phyllotaxisPosition(i, bounds(), CLONE_SIZE)
            );
          }
          next.push(i);
        }
        return next;
      });
    };
    spawn(CLONE_SPAWN_BURST);
    const intervalId = window.setInterval(
      () => spawn(1),
      CLONE_SPAWN_INTERVAL_MS
    );
    return () => window.clearInterval(intervalId);
  }, [active, act.act]);

  useEffect(() => {
    if (!active) return;
    stopped.current = false;
    refreshContainerBox();

    const onPointerMove = (event: PointerEvent): void => {
      const coalesced =
        typeof event.getCoalescedEvents === "function"
          ? event.getCoalescedEvents()
          : [];
      const events = coalesced.length > 0 ? coalesced : [event];
      for (const sample of events) {
        const local = toLocal(sample.clientX, sample.clientY);
        tracker.current.push(local.x, local.y, sample.timeStamp || performance.now());
      }
    };
    const onLayoutChange = (): void => refreshContainerBox();

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("resize", onLayoutChange);
    window.addEventListener("scroll", onLayoutChange, { passive: true });
    window.visualViewport?.addEventListener("resize", onLayoutChange);

    let last = performance.now();
    const tick = (now: number): void => {
      if (stopped.current) return;
      const dtMs = now - last;
      last = now;
      const button = noButtonRef.current;
      if (fledRef.current && button && !reducedMotion) {
        const pointer = tracker.current.current();
        const predicted = tracker.current.predict(PREDICTION_MS, now);
        const { frame, dodged } = engine.step({ dtMs, pointer, predicted, now });
        if (dodged) registerDodge();
        const currentAct = computeActState(dodgesRef.current);
        let tremorX = 0;
        let tremorY = 0;
        if (currentAct.tremor && pointer) {
          const dist = distance(pointer, engine.position());
          if (dist < TREMOR_RADIUS) {
            const amp = Math.min(5, 320 / Math.max(dist, 24));
            tremorX = amp * (Math.sin(now * 0.031) + 0.6 * Math.sin(now * 0.017));
            tremorY = amp * (Math.cos(now * 0.027) + 0.6 * Math.sin(now * 0.041));
          }
        }
        button.style.transform = `translate3d(${frame.x + tremorX}px, ${frame.y + tremorY}px, 0) rotate(${frame.rotation}deg) scale(${frame.scaleX * currentAct.scale}, ${frame.scaleY * currentAct.scale})`;
        positionBubble(bubbleRef.current, frame, buttonSize(), bounds());
      }
      if (clonePositions.current.size > 0) {
        const pointer = reducedMotion ? null : tracker.current.current();
        driftClones(
          clonePositions.current,
          cloneRefs.current,
          pointer,
          dtMs,
          bounds(),
          CLONE_SIZE
        );
      }
      rafId.current = window.requestAnimationFrame(tick);
    };
    rafId.current = window.requestAnimationFrame(tick);

    return () => {
      stopped.current = true;
      window.cancelAnimationFrame(rafId.current);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", onLayoutChange);
      window.removeEventListener("scroll", onLayoutChange);
      window.visualViewport?.removeEventListener("resize", onLayoutChange);
    };
  }, [active, engine, mode, reducedMotion]);

  return {
    containerRef,
    noButtonRef,
    bubbleRef,
    setCloneRef,
    fled,
    dodges,
    act,
    clones,
    reducedMotion,
    handleNoThreat,
    stop,
  };
};

const applyTeleport = (
  button: HTMLButtonElement,
  engine: FleeEngine,
  boundsSize: Size,
  size: Size
): void => {
  const spot = clampToBounds(
    {
      x: Math.random() * Math.max(1, boundsSize.width - size.width),
      y: Math.random() * Math.max(1, boundsSize.height - size.height),
    },
    size,
    boundsSize,
    8
  );
  engine.moveTo(spot);
  button.style.transition = "opacity 0.2s";
  button.style.transform = `translate3d(${spot.x}px, ${spot.y}px, 0)`;
};

const positionBubble = (
  bubble: HTMLDivElement | null,
  frame: { x: number; y: number },
  size: Size,
  boundsSize: Size
): void => {
  if (!bubble) return;
  const above = frame.y > 72;
  const x = Math.min(
    Math.max(frame.x + size.width / 2, 80),
    Math.max(80, boundsSize.width - 80)
  );
  const y = above ? frame.y - 16 : frame.y + size.height + 16;
  bubble.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, ${above ? "-100%" : "0"})`;
  bubble.style.opacity = "1";
};

const driftClones = (
  positions: Map<number, Vec>,
  refs: Map<number, HTMLButtonElement>,
  pointer: Vec | null,
  dtMs: number,
  boundsSize: Size,
  size: Size
): void => {
  const dt = Math.min(dtMs, 32) / 1000;
  positions.forEach((position, index) => {
    const el = refs.get(index);
    if (!el) return;
    if (pointer) {
      const dx = pointer.x - position.x - size.width / 2;
      const dy = pointer.y - position.y - size.height / 2;
      const dist = Math.hypot(dx, dy);
      if (dist > 40) {
        position.x += (dx / dist) * CLONE_DRIFT_SPEED * dt;
        position.y += (dy / dist) * CLONE_DRIFT_SPEED * dt;
        const clamped = clampToBounds(position, size, boundsSize, 4);
        position.x = clamped.x;
        position.y = clamped.y;
      }
    }
    el.style.transform = `translate3d(${position.x}px, ${position.y}px, 0)`;
  });
};
