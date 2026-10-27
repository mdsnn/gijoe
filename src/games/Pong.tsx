import type { WinState } from '../os/store';
import { GameCanvas, overlay, type Game } from './kit';

interface S { p: number; c: number; x: number; y: number; vx: number; vy: number; a: number; b: number; end: boolean; shown: string }
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const init = (): S => ({ p: 100, c: 100, x: 200, y: 130, vx: 200, vy: 90, a: 0, b: 0, end: false, shown: '' });

const pong: Game<S> = {
  init,
  key(s, k) { if (s.end && (k === ' ' || k === 'Enter')) Object.assign(s, init()); },
  move(s, _x, y) { s.p = clamp(y - 28, 0, 204); },
  update(s, dt, k, setScore) {
    if (!s.end) {
      const dy = ((k.ArrowDown || k.s) ? 1 : 0) - ((k.ArrowUp || k.w) ? 1 : 0);
      s.p = clamp(s.p + dy * 300 * dt, 0, 204);
      s.c = clamp(s.c + clamp(s.y - 28 - s.c, -170 * dt, 170 * dt), 0, 204);
      s.x += s.vx * dt; s.y += s.vy * dt;
      if (s.y < 4 || s.y > 256) { s.vy = -s.vy; s.y = clamp(s.y, 4, 256); }
      if (s.vx < 0 && s.x < 24 && s.x > 10 && s.y > s.p - 4 && s.y < s.p + 60) { s.vx = Math.min(520, -s.vx * 1.06); s.vy += (s.y - s.p - 28) * 5; s.x = 24; }
      if (s.vx > 0 && s.x > 376 && s.x < 390 && s.y > s.c - 4 && s.y < s.c + 60) { s.vx = -Math.min(520, s.vx * 1.06); s.vy += (s.y - s.c - 28) * 3; s.x = 376; }
      if (s.x < 0 || s.x > 400) {
        const left = s.x < 0;
        if (left) s.b++; else s.a++;
        s.x = 200; s.y = 130; s.vx = left ? -200 : 200; s.vy = (Math.random() < 0.5 ? -1 : 1) * 90;
        if (s.a >= 7 || s.b >= 7) s.end = true;
      }
    }
    const l = `You ${s.a} : ${s.b} CPU`;
    if (l !== s.shown) { s.shown = l; setScore(l); }
  },
  draw(cx, s) {
    cx.fillStyle = '#000'; cx.fillRect(0, 0, 400, 260);
    cx.fillStyle = '#555'; for (let y = 0; y < 260; y += 20) cx.fillRect(198, y, 4, 10);
    cx.fillStyle = '#fff'; cx.fillRect(12, s.p, 10, 56); cx.fillRect(378, s.c, 10, 56); cx.fillRect(s.x - 4, s.y - 4, 8, 8);
    if (s.end) overlay(cx, 400, 260, (s.a > s.b ? 'You win!' : 'CPU wins.') + ' Space restarts.');
  },
};

export function Pong({ win }: { win: WinState }) {
  return <GameCanvas winId={win.id} game={pong} width={400} height={260} tip="W/S or arrow keys, or drag. First to 7." />;
}
