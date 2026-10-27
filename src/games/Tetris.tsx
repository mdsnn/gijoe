import type { WinState } from '../os/store';
import { GameCanvas, best, overlay, type Game } from './kit';

type M = number[][];
interface Cur { t: number; m: M; x: number; y: number }
interface S { g: number[][]; bag: number[]; cur: Cur; nx: number; a: number; sc: number; ln: number; lv: number; end: boolean; shown: string }

const TS: M[] = [
  [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
  [[1, 1], [1, 1]],
  [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
  [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
  [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
  [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
  [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
];
const TC = ['#4bb8ff', '#ffd84a', '#b06bff', '#4be06a', '#ff4d6d', '#4b6bff', '#ff9a3d'];

const rot = (m: M): M => m.map((_, r) => m.map((_, c) => m[m.length - 1 - c][r]));
const fits = (g: number[][], m: M, x: number, y: number) =>
  m.every((row, r) => row.every((v, c) => {
    if (!v) return true;
    const X = x + c, Y = y + r;
    return X >= 0 && X < 10 && Y < 20 && (Y < 0 || !g[Y][X]);
  }));
const nextPiece = (s: S) => {
  if (!s.bag.length) {
    s.bag = [0, 1, 2, 3, 4, 5, 6];
    for (let i = 6; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [s.bag[i], s.bag[j]] = [s.bag[j], s.bag[i]]; }
  }
  return s.bag.pop()!;
};
const spawn = (s: S) => {
  const t = s.nx, m = TS[t];
  s.nx = nextPiece(s);
  s.cur = { t, m, x: Math.floor((10 - m.length) / 2), y: t ? 0 : -1 };
  if (!fits(s.g, m, s.cur.x, s.cur.y)) s.end = true;
};
const step = (s: S, dx: number, dy: number) => {
  if (fits(s.g, s.cur.m, s.cur.x + dx, s.cur.y + dy)) { s.cur.x += dx; s.cur.y += dy; return true; }
  return false;
};
const rotate = (s: S) => {
  const m = rot(s.cur.m);
  for (const k of [0, -1, 1, -2, 2]) if (fits(s.g, m, s.cur.x + k, s.cur.y)) { s.cur.m = m; s.cur.x += k; return; }
};
function lock(s: S) {
  s.cur.m.forEach((row, r) => row.forEach((v, c) => { if (v && s.cur.y + r >= 0) s.g[s.cur.y + r][s.cur.x + c] = s.cur.t + 1; }));
  let n = 0;
  s.g = s.g.filter((row) => { const full = row.every((v) => v); if (full) n++; return !full; });
  while (s.g.length < 20) s.g.unshift(Array(10).fill(0));
  if (n) { s.sc += [0, 100, 300, 500, 800][n] * s.lv; s.ln += n; s.lv = 1 + Math.floor(s.ln / 10); }
  spawn(s);
}
const drop = (s: S) => { while (step(s, 0, 1)); lock(s); s.a = 0; };

const init = (): S => {
  const s: S = { g: Array.from({ length: 20 }, () => Array(10).fill(0)), bag: [], cur: { t: 0, m: TS[0], x: 0, y: 0 }, nx: 0, a: 0, sc: 0, ln: 0, lv: 1, end: false, shown: '' };
  s.nx = nextPiece(s); spawn(s);
  return s;
};

const tetris: Game<S> = {
  init,
  key(s, k) {
    if (s.end) { if (k === ' ' || k === 'Enter') Object.assign(s, init()); return; }
    if (k === 'ArrowLeft' || k === 'a') step(s, -1, 0);
    else if (k === 'ArrowRight' || k === 'd') step(s, 1, 0);
    else if (k === 'ArrowUp' || k === 'w') rotate(s);
    else if (k === ' ') drop(s);
  },
  swipe(s, dx, dy) {
    if (s.end) return;
    if (Math.abs(dx) > Math.abs(dy)) {
      const d = dx > 0 ? 1 : -1;
      for (let i = 0; i < Math.max(1, Math.round(Math.abs(dx) / 24)); i++) step(s, d, 0);
    } else if (dy > 0) drop(s); else rotate(s);
  },
  click(s) { if (s.end) Object.assign(s, init()); else rotate(s); },
  update(s, dt, k, setScore) {
    if (!s.end) {
      s.a += dt;
      const iv = (k.ArrowDown || k.s) ? 0.04 : Math.max(0.07, 0.8 - (s.lv - 1) * 0.07);
      while (s.a > iv && !s.end) { s.a -= iv; if (!step(s, 0, 1)) { lock(s); s.a = 0; } }
    }
    const l = `Score ${s.sc}   Best ${best('tetris', s.sc)}`;
    if (l !== s.shown) { s.shown = l; setScore(l); }
  },
  draw(cx, s) {
    cx.fillStyle = '#000'; cx.fillRect(0, 0, 300, 400); cx.fillStyle = '#10102a'; cx.fillRect(0, 0, 200, 400);
    const cell = (x: number, y: number, t: number, alpha = 1) => {
      cx.globalAlpha = alpha; cx.fillStyle = TC[t]; cx.fillRect(x * 20 + 1, y * 20 + 1, 18, 18);
      cx.fillStyle = 'rgba(255,255,255,.35)'; cx.fillRect(x * 20 + 1, y * 20 + 1, 18, 3); cx.globalAlpha = 1;
    };
    s.g.forEach((row, y) => row.forEach((v, x) => { if (v) cell(x, y, v - 1); }));
    if (!s.end) {
      let gy = s.cur.y;
      while (fits(s.g, s.cur.m, s.cur.x, gy + 1)) gy++;
      s.cur.m.forEach((row, r) => row.forEach((v, c) => {
        if (v) { cell(s.cur.x + c, gy + r, s.cur.t, 0.25); cell(s.cur.x + c, s.cur.y + r, s.cur.t); }
      }));
    }
    cx.fillStyle = '#fff'; cx.font = '13px monospace'; cx.textAlign = 'left';
    cx.fillText('Next', 215, 24); cx.fillText('Lines', 215, 150); cx.fillText(String(s.ln), 215, 168);
    cx.fillText('Level', 215, 200); cx.fillText(String(s.lv), 215, 218);
    TS[s.nx].forEach((row, r) => row.forEach((v, c) => { if (v) { cx.fillStyle = TC[s.nx]; cx.fillRect(220 + c * 16, 40 + r * 16, 15, 15); } }));
    if (s.end) { overlay(cx, 200, 400, 'Game over'); cx.font = '12px monospace'; cx.fillText('Space restarts', 100, 225); }
  },
};

export function Tetris({ win }: { win: WinState }) {
  return <GameCanvas winId={win.id} game={tetris} width={300} height={400} tip="Arrows or WASD to move, Up rotates, Space drops. On touch: tap rotates, swipe moves." />;
}
