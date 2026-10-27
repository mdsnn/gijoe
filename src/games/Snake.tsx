import type { WinState } from '../os/store';
import { GameCanvas, best, overlay, type Game } from './kit';

type V = [number, number];
interface S { b: V[]; d: V; n: V; f: V; a: number; sc: number; dead: boolean; shown: number }

const DIRS: Record<string, V> = {
  ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
  w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0],
};
const init = (): S => ({ b: [[10, 10], [9, 10], [8, 10]], d: [1, 0], n: [1, 0], f: [15, 10], a: 0, sc: 0, dead: false, shown: -1 });
const hits = (b: V[], p: V) => b.some((c) => c[0] === p[0] && c[1] === p[1]);

const snake: Game<S> = {
  init,
  key(s, k) {
    if (s.dead && (k === ' ' || k === 'Enter')) { Object.assign(s, init()); return; }
    const m = DIRS[k];
    if (m && (m[0] + s.d[0] !== 0 || m[1] + s.d[1] !== 0)) s.n = m;
  },
  swipe(s, dx, dy) {
    this.key!(s, Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'ArrowRight' : 'ArrowLeft') : (dy > 0 ? 'ArrowDown' : 'ArrowUp'));
  },
  update(s, dt, _keys, setScore) {
    if (!s.dead) {
      s.a += dt;
      const step = Math.max(0.05, 0.13 - s.sc * 0.003);
      while (s.a > step) {
        s.a -= step; s.d = s.n;
        const h: V = [s.b[0][0] + s.d[0], s.b[0][1] + s.d[1]];
        if (h[0] < 0 || h[1] < 0 || h[0] > 19 || h[1] > 19 || hits(s.b, h)) { s.dead = true; break; }
        s.b.unshift(h);
        if (h[0] === s.f[0] && h[1] === s.f[1]) {
          s.sc++;
          do { s.f = [Math.floor(Math.random() * 20), Math.floor(Math.random() * 20)]; } while (hits(s.b, s.f));
        } else s.b.pop();
      }
    }
    if (s.sc !== s.shown) { s.shown = s.sc; setScore(`Score ${s.sc}   Best ${best('snake', s.sc)}`); }
  },
  draw(cx, s) {
    cx.fillStyle = '#0a1a0a'; cx.fillRect(0, 0, 320, 320);
    cx.fillStyle = '#ff4d4d'; cx.fillRect(s.f[0] * 16 + 2, s.f[1] * 16 + 2, 12, 12);
    s.b.forEach((c, i) => { cx.fillStyle = i ? '#4be06a' : '#b9ff7a'; cx.fillRect(c[0] * 16 + 1, c[1] * 16 + 1, 14, 14); });
    if (s.dead) overlay(cx, 320, 320, 'Game over. Space restarts.');
  },
};

export function Snake({ win }: { win: WinState }) {
  return <GameCanvas winId={win.id} game={snake} width={320} height={320} tip="Arrow keys or WASD, or swipe." />;
}
