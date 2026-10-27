import { useEffect, useRef, useState } from 'react';
import { useOS } from '../os/store';

export type Keys = Record<string, boolean>;

/** A game is plain data and functions. State lives in a mutable object, never in React state. */
export interface Game<S> {
  init(): S;
  update(s: S, dt: number, keys: Keys, setScore: (t: string) => void): void;
  draw(cx: CanvasRenderingContext2D, s: S): void;
  key?(s: S, k: string): void;
  swipe?(s: S, dx: number, dy: number): void;
  click?(s: S): void;
  tap?(s: S): void;
  move?(s: S, x: number, y: number): void;
}

export const best = (k: string, v: number): number => {
  try {
    const o = Number(localStorage.getItem('hs_' + k)) || 0;
    if (v > o) localStorage.setItem('hs_' + k, String(v));
    return Math.max(o, v);
  } catch { return v; }
};

export const overlay = (cx: CanvasRenderingContext2D, w: number, h: number, t: string) => {
  cx.fillStyle = 'rgba(0,0,0,.6)'; cx.fillRect(0, 0, w, h);
  cx.fillStyle = '#fff'; cx.font = '18px monospace'; cx.textAlign = 'center'; cx.fillText(t, w / 2, h / 2);
};

interface Props<S> { game: Game<S>; winId: string; width: number; height: number; tip: string }

/**
 * Shared game shell: requestAnimationFrame loop with delta time, keyboard and pointer input,
 * automatic pause when the window is unfocused or minimized, and cleanup on close.
 */
export function GameCanvas<S>({ game, winId, width, height, tip }: Props<S>) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState('');
  const reset = useRef<() => void>(() => {});
  const active = useOS((s) => s.activeId === winId && !s.wins[winId]?.minimized);
  const activeRef = useRef(active);
  activeRef.current = active;
  const holder = useRef<HTMLDivElement>(null);
  const kRef = useRef(1);
  const [box, setBox] = useState({ w: width, h: height });

  // Scale the canvas to fill the window (keeps aspect ratio, grows when maximized).
  useEffect(() => {
    const el = holder.current!;
    const fit = () => {
      const cw = el.clientWidth - 6, ch = el.clientHeight - 6;
      if (cw <= 0 || ch <= 0) return;
      const sc = Math.max(0.4, Math.min(cw / width, ch / height));
      setBox({ w: Math.floor(width * sc), h: Math.floor(height * sc) });
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [width, height]);

  // Crisp rendering: backing store = CSS size x devicePixelRatio, drawing stays in logical units.
  useEffect(() => {
    const cv = canvas.current!;
    const dpr = window.devicePixelRatio || 1;
    cv.width = Math.round(box.w * dpr);
    cv.height = Math.round(box.h * dpr);
    kRef.current = cv.width / width;
  }, [box, width]);

  useEffect(() => {
    const cv = canvas.current!;
    const cx = cv.getContext('2d')!;
    const keys: Keys = {};
    let s = game.init(), paused = false, last = 0, raf = 0, sx = 0, sy = 0;
    reset.current = () => { s = game.init(); paused = false; last = 0; setScore(''); };

    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (t - (last || t)) / 1000); last = t;
      const on = activeRef.current;
      if (!on) for (const k in keys) delete keys[k];
      if (on && !paused) game.update(s, dt, keys, setScore);
      cx.setTransform(kRef.current, 0, 0, kRef.current, 0, 0);
      game.draw(cx, s);
      if (!on || paused) {
        cx.fillStyle = 'rgba(0,0,0,.55)'; cx.fillRect(0, 0, width, height);
        cx.fillStyle = '#fff'; cx.font = '16px monospace'; cx.textAlign = 'center';
        cx.fillText(on ? 'Paused' : 'Click the window to play', width / 2, height / 2);
      }
    };
    const kd = (e: KeyboardEvent) => {
      if (!activeRef.current) return;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
      if (e.key === 'p' || e.key === 'P') { paused = !paused; return; }
      keys[e.key] = true;
      if (game.key && !(e.repeat && e.key === ' ')) game.key(s, e.key);
    };
    const ku = (e: KeyboardEvent) => { delete keys[e.key]; };
    const mv = (e: PointerEvent) => {
      if (!game.move) return;
      const r = cv.getBoundingClientRect();
      game.move(s, ((e.clientX - r.left) * width) / r.width, ((e.clientY - r.top) * height) / r.height);
    };
    const down = (e: PointerEvent) => { sx = e.clientX; sy = e.clientY; mv(e); game.tap?.(s); };
    const hover = (e: PointerEvent) => { if (e.buttons || e.pointerType === 'mouse') mv(e); };
    const up = (e: PointerEvent) => {
      const d = Math.hypot(e.clientX - sx, e.clientY - sy);
      if (d > 20) game.swipe?.(s, e.clientX - sx, e.clientY - sy); else game.click?.(s);
    };
    addEventListener('keydown', kd); addEventListener('keyup', ku);
    cv.addEventListener('pointerdown', down); cv.addEventListener('pointerup', up); cv.addEventListener('pointermove', hover);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('keydown', kd); removeEventListener('keyup', ku);
      cv.removeEventListener('pointerdown', down); cv.removeEventListener('pointerup', up); cv.removeEventListener('pointermove', hover);
    };
  }, [game, width, height]);

  return (
    <div className="gm">
      <div className="mh sunk"><span>{score}</span><button className="btn" onClick={() => reset.current()}>New game</button></div>
      <div className="gv" ref={holder}>
        <canvas ref={canvas} className="sunk" style={{ width: box.w, height: box.h }} />
      </div>
      <div className="gt">{tip} P pauses.</div>
    </div>
  );
}
