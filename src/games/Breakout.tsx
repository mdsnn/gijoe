import type { WinState } from '../os/store';
import { GameCanvas, best, overlay, type Game } from './kit';

interface S { p: number; x: number; y: number; vx: number; vy: number; launched: boolean; br: number[]; sc: number; lv: number; li: number; end: boolean; shown: string }
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const COLORS = ['#ff4d6d', '#ff9a3d', '#ffd84a', '#4be06a', '#4bb8ff'];
const init = (): S => ({ p: 200, x: 200, y: 294, vx: 0, vy: 0, launched: false, br: Array(50).fill(1), sc: 0, lv: 1, li: 3, end: false, shown: '' });
const launch = (s: S) => {
  s.launched = true;
  const sp = 250 + s.lv * 30, vx = sp * 0.4 * (Math.random() < 0.5 ? -1 : 1);
  s.vx = vx; s.vy = -Math.sqrt(sp * sp - vx * vx);
};

const breakout: Game<S> = {
  init,
  key(s, k) { if (k === ' ' || k === 'Enter') { if (s.end) Object.assign(s, init()); else if (!s.launched) launch(s); } },
  tap(s) { if (s.end) Object.assign(s, init()); else if (!s.launched) launch(s); },
  move(s, x) { s.p = clamp(x, 32, 368); },
  update(s, dt, k, setScore) {
    if (!s.end) {
      s.p = clamp(s.p + (((k.ArrowRight || k.d) ? 1 : 0) - ((k.ArrowLeft || k.a) ? 1 : 0)) * 380 * dt, 32, 368);
      if (!s.launched) { s.x = s.p; s.y = 294; }
      else {
        const ox = s.x, oy = s.y;
        s.x += s.vx * dt; s.y += s.vy * dt;
        if (s.x < 5) { s.x = 5; s.vx = Math.abs(s.vx); }
        if (s.x > 395) { s.x = 395; s.vx = -Math.abs(s.vx); }
        if (s.y < 5) { s.y = 5; s.vy = Math.abs(s.vy); }
        if (s.vy > 0 && s.y >= 295 && s.y <= 306 && Math.abs(s.x - s.p) <= 37) {
          const a = clamp((s.x - s.p) / 32, -1, 1) * 1.1, sp = Math.min(480, Math.hypot(s.vx, s.vy) * 1.02);
          s.vx = sp * Math.sin(a); s.vy = -sp * Math.cos(a); s.y = 294;
        }
        const c = Math.floor(s.x / 40), r = Math.floor((s.y - 30) / 18);
        if (r >= 0 && r < 5 && c >= 0 && c < 10 && s.br[r * 10 + c]) {
          s.br[r * 10 + c] = 0; s.sc += 10 * (5 - r);
          if (Math.floor(ox / 40) !== c && Math.floor((oy - 30) / 18) === r) s.vx = -s.vx; else s.vy = -s.vy;
          if (!s.br.some((v) => v)) { s.lv++; s.br = Array(50).fill(1); s.launched = false; s.vx = 0; s.vy = 0; }
        }
        if (s.y > 330) { s.li--; s.launched = false; s.vx = 0; s.vy = 0; if (s.li <= 0) s.end = true; }
      }
    }
    const l = `Score ${s.sc}   Lives ${s.li}   Level ${s.lv}   Best ${best('breakout', s.sc)}`;
    if (l !== s.shown) { s.shown = l; setScore(l); }
  },
  draw(cx, s) {
    cx.fillStyle = '#0a0a1a'; cx.fillRect(0, 0, 400, 320);
    s.br.forEach((a, i) => { if (a) { cx.fillStyle = COLORS[Math.floor(i / 10)]; cx.fillRect((i % 10) * 40 + 2, 30 + Math.floor(i / 10) * 18 + 2, 36, 14); } });
    cx.fillStyle = '#c0c0c0'; cx.fillRect(s.p - 32, 300, 64, 10); cx.fillStyle = '#fff'; cx.fillRect(s.p - 32, 300, 64, 3);
    cx.beginPath(); cx.arc(s.x, s.y, 5, 0, 7); cx.fill();
    if (!s.launched && !s.end) { cx.fillStyle = '#fff'; cx.font = '13px monospace'; cx.textAlign = 'center'; cx.fillText('Space or click to launch', 200, 230); }
    if (s.end) overlay(cx, 400, 320, 'Game over. Space restarts.');
  },
};

export function Breakout({ win }: { win: WinState }) {
  return <GameCanvas winId={win.id} game={breakout} width={400} height={320} tip="A/D or arrow keys, or drag. Space launches." />;
}
