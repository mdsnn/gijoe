import { useEffect, useState } from 'react';
import { useOS } from './store';
import { launch, openNode, root } from './fs';
import { restart } from './Desktop';

export function Taskbar() {
  const wins = useOS((s) => s.wins);
  const activeId = useOS((s) => s.activeId);
  const [open, setOpen] = useState(false);
  const [time, setTime] = useState(() => new Date());

  useEffect(() => { const t = setInterval(() => setTime(new Date()), 15000); return () => clearInterval(t); }, []);
  useEffect(() => {
    const close = (e: PointerEvent) => { if (!(e.target as HTMLElement).closest('.menu,#start')) setOpen(false); };
    addEventListener('pointerdown', close);
    return () => removeEventListener('pointerdown', close);
  }, []);

  const onTask = (id: string) => {
    const { wins: w, toggleMin, focus } = useOS.getState();
    if (w[id].minimized) { toggleMin(id); focus(id); }
    else if (activeId === id) toggleMin(id);
    else focus(id);
  };
  const pick = (fn: () => void) => () => { setOpen(false); fn(); };

  return (
    <>
      <div id="tbar" className="raised">
        <button id="start" className="btn" aria-haspopup="true" onClick={() => setOpen((o) => !o)}>
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
            <g stroke="#000" strokeWidth="1">
              <rect x="1" y="1" width="5.5" height="5.5" fill="#ff4d6d" /><rect x="7.5" y="1" width="5.5" height="5.5" fill="#4be06a" />
              <rect x="1" y="7.5" width="5.5" height="5.5" fill="#4bb8ff" /><rect x="7.5" y="7.5" width="5.5" height="5.5" fill="#ffd84a" />
            </g>
          </svg>
          Start
        </button>
        <div id="tasks">
          {Object.values(wins).map((w) => (
            <button key={w.id} className={'btn' + (!w.minimized && activeId === w.id ? ' on' : '')} onClick={() => onTask(w.id)}>
              {w.icon} {w.title}
            </button>
          ))}
        </div>
        <div id="clock" className="sunk" aria-label="Clock">{time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</div>
      </div>
      {open && (
        <div id="sm" className="menu raised">
          {root.children.map((n) => <button key={n.name} onClick={pick(() => openNode(n))}>{n.icon} {n.name}</button>)}
          <button onClick={pick(() => launch('display'))}>🖼️ Display Properties</button>
          <hr />
          <button onClick={pick(restart)}>⏻ Shut Down…</button>
        </div>
      )}
    </>
  );
}
