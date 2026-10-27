import { memo } from 'react';
import type { PointerEvent as RPointerEvent } from 'react';
import { useOS, type WinState } from './store';
import { APPS } from './registry';

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

function WindowFrame({ win }: { win: WinState }) {
  const active = useOS((s) => s.activeId === win.id);
  const { focus, close, toggleMin, toggleMax, move, resize } = useOS.getState();
  const def = APPS[win.appId];
  const Body = def.component;

  const onTitleDown = (e: RPointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button') || win.maximized) return;
    const el = e.currentTarget;
    const sx = e.clientX - win.x, sy = e.clientY - win.y;
    el.setPointerCapture(e.pointerId);
    const onMove = (m: PointerEvent) =>
      move(win.id, clamp(m.clientX - sx, 60 - win.w, window.innerWidth - 60), Math.max(0, m.clientY - sy));
    const up = () => { el.removeEventListener('pointermove', onMove); el.removeEventListener('pointerup', up); };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', up);
  };
  const onResizeDown = (e: RPointerEvent<HTMLElement>) => {
    e.stopPropagation(); focus(win.id);
    const el = e.currentTarget;
    const sx = e.clientX, sy = e.clientY, sw = win.w, sh = win.h;
    el.setPointerCapture(e.pointerId);
    const onMove = (m: PointerEvent) => resize(win.id, Math.max(200, sw + m.clientX - sx), Math.max(120, sh + m.clientY - sy));
    const up = () => { el.removeEventListener('pointermove', onMove); el.removeEventListener('pointerup', up); };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', up);
  };

  const cls = ['win', 'raised', active && 'act', win.maximized && 'max', win.minimized && 'min'].filter(Boolean).join(' ');
  return (
    <div className={cls} role="dialog" aria-label={win.title}
      style={{ left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z }}
      onPointerDown={() => focus(win.id)}>
      <div className="tb" onPointerDown={onTitleDown} onDoubleClick={() => toggleMax(win.id)}>
        <span className="ti">{win.icon} {win.title}</span>
        <span className="tbb">
          <button className="btn" aria-label="Minimize" onClick={() => toggleMin(win.id)}>_</button>
          <button className="btn" aria-label="Maximize" onClick={() => toggleMax(win.id)}>▫</button>
          <button className="btn" aria-label="Close" onClick={() => close(win.id)}>✕</button>
        </span>
      </div>
      <div className={'body sunk' + (def.face ? ' face' : '')}><Body win={win} /></div>
      <i className="rz" onPointerDown={onResizeDown} />
    </div>
  );
}
export const Window = memo(WindowFrame);
