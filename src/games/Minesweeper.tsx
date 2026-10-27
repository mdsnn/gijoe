import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

const R = 9, C = 9, M = 10;
interface Cell { m: boolean; o: boolean; f: boolean; n: number }
type Phase = 'idle' | 'play' | 'won' | 'lost';
const COL = ['', '#00f', '#080', '#f00', '#008', '#800', '#088', '#000', '#808080'];

const fresh = (): Cell[] => Array.from({ length: R * C }, () => ({ m: false, o: false, f: false, n: 0 }));
const nb = (i: number): number[] => {
  const r = Math.floor(i / C), c = i % C, a: number[] = [];
  for (let dr = -1; dr < 2; dr++) for (let dc = -1; dc < 2; dc++) {
    const rr = r + dr, cc = c + dc;
    if ((dr || dc) && rr >= 0 && rr < R && cc >= 0 && cc < C) a.push(rr * C + cc);
  }
  return a;
};
function place(g: Cell[], safe: number) {
  const bad = [...nb(safe), safe];
  let k = 0;
  while (k < M) { const i = Math.floor(Math.random() * R * C); if (!bad.includes(i) && !g[i].m) { g[i].m = true; k++; } }
  g.forEach((x, i) => { x.n = nb(i).filter((j) => g[j].m).length; });
}
function reveal(g: Cell[], i: number) {
  const st = [i];
  while (st.length) {
    const j = st.pop()!, x = g[j];
    if (x.o || x.f) continue;
    x.o = true;
    if (!x.n) nb(j).forEach((k) => st.push(k));
  }
}

export function Minesweeper() {
  const [g, setG] = useState<Cell[]>(fresh);
  const [phase, setPhase] = useState<Phase>('idle');
  const [flagMode, setFlagMode] = useState(false);
  const [t, setT] = useState(0);
  const wrap = useRef<HTMLDivElement>(null);
  const [cell, setCell] = useState(24);

  // Cells grow with the window (24px minimum, 72px maximum).
  useEffect(() => {
    const el = wrap.current!;
    const fit = () => setCell(Math.max(24, Math.min(72, Math.floor(Math.min((el.clientWidth - 24) / C, (el.clientHeight - 120) / R)))));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (phase !== 'play') return;
    const id = setInterval(() => setT((x) => Math.min(999, x + 1)), 1000);
    return () => clearInterval(id);
  }, [phase]);

  const hit = (i: number, flag: boolean) => {
    if (phase === 'won' || phase === 'lost') return;
    const ng = g.map((c) => ({ ...c })), x = ng[i];
    if (flag || flagMode) { if (!x.o) x.f = !x.f; setG(ng); return; }
    if (x.f || x.o) return;
    let next: Phase = phase;
    if (phase === 'idle') { place(ng, i); next = 'play'; }
    if (x.m) { ng.forEach((y) => { if (y.m) y.o = true; }); next = 'lost'; }
    else { reveal(ng, i); if (ng.every((y) => y.m || y.o)) next = 'won'; }
    setG(ng); setPhase(next);
  };
  const reset = () => { setG(fresh()); setPhase('idle'); setT(0); };
  const flags = g.filter((c) => c.f).length;
  const pad = (n: number) => String(Math.max(0, n)).padStart(3, '0');

  return (
    <div className="msw" ref={wrap}>
    <div className="ms" style={{ '--cell': cell + 'px' } as CSSProperties}>
      <div className="mh sunk">
        <span className="lcd">{pad(M - flags)}</span>
        <button className="btn" aria-label="New game" onClick={reset}>{phase === 'lost' ? '😵' : phase === 'won' ? '😎' : '🙂'}</button>
        <span className="lcd">{pad(t)}</span>
      </div>
      <div className="mg sunk">
        {g.map((c, i) => (
          <button key={i} className={c.o ? 'o' : ''} style={{ color: COL[c.n] }} aria-label="cell"
            onClick={() => hit(i, false)} onContextMenu={(e) => { e.preventDefault(); hit(i, true); }}>
            {c.f && !c.o ? '🚩' : c.o ? (c.m ? '💣' : c.n || '') : ''}
          </button>
        ))}
      </div>
      <label><input type="checkbox" checked={flagMode} onChange={(e) => setFlagMode(e.target.checked)} /> 🚩 flag mode (for touch)</label>
    </div>
    </div>
  );
}
