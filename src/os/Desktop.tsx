import { useEffect, useRef, useState } from 'react';
import type { MouseEvent as RMouseEvent, PointerEvent as RPointerEvent } from 'react';
import { useOS, usePrefs } from './store';
import { launch, openNode, root } from './fs';
import { Wallpaper } from './Wallpaper';
import { Window } from './Window';
import { IconBtn } from './IconBtn';

export function Desktop() {
  const wins = useOS((s) => s.wins);
  const [sel, setSel] = useState('');
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const timer = useRef(0);
  const start = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const close = (e: PointerEvent) => { if (!(e.target as HTMLElement).closest('.menu')) setMenu(null); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenu(null); };
    addEventListener('pointerdown', close); addEventListener('keydown', esc);
    return () => { removeEventListener('pointerdown', close); removeEventListener('keydown', esc); };
  }, []);

  const show = (x: number, y: number) => setMenu({ x: Math.min(x, innerWidth - 200), y: Math.min(y, innerHeight - 130) });
  const onContext = (e: RMouseEvent) => {
    if ((e.target as HTMLElement).closest('.win')) return;
    e.preventDefault(); show(e.clientX, e.clientY);
  };
  // Touch: press and hold on empty desktop opens the same menu.
  const onDown = (e: RPointerEvent) => {
    if (!(e.target as HTMLElement).closest('.ic')) setSel('');
    if (e.pointerType !== 'touch' || (e.target as HTMLElement).closest('.win,.ic')) return;
    start.current = { x: e.clientX, y: e.clientY };
    timer.current = window.setTimeout(() => show(start.current.x, start.current.y), 550);
  };
  const cancel = () => clearTimeout(timer.current);
  const onMove = (e: RPointerEvent) => {
    if (Math.hypot(e.clientX - start.current.x, e.clientY - start.current.y) > 10) cancel();
  };

  const act = (fn: () => void) => () => { setMenu(null); fn(); };
  return (
    <>
      <div id="desk" onContextMenu={onContext} onPointerDown={onDown} onPointerUp={cancel} onPointerCancel={cancel} onPointerMove={onMove}>
        <Wallpaper />
        <div id="icons">
          {root.children.map((n) => (
            <IconBtn key={n.name} icon={n.icon} label={n.name} selected={sel === n.name}
              onSelect={() => setSel(n.name)} onOpen={() => openNode(n)} />
          ))}
        </div>
        {Object.values(wins).map((w) => <Window key={w.id} win={w} />)}
      </div>
      {menu && (
        <div className="menu raised" style={{ left: menu.x, top: menu.y }}>
          <button onClick={act(() => usePrefs.getState().next())}>Next wallpaper</button>
          <button onClick={act(() => launch('terminal'))}>Open Command Prompt</button>
          <button onClick={act(() => launch('display'))}>Display properties…</button>
          <hr />
          <button onClick={act(restart)}>Restart</button>
        </div>
      )}
    </>
  );
}

export function restart() {
  try { sessionStorage.removeItem('seen'); } catch { /* ignore */ }
  useOS.getState().closeAll();
  useOS.getState().setBooted(false);
}
