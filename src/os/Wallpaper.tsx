import { useEffect, useState } from 'react';
import { usePrefs } from './store';
import { W } from './wallpapers';

/** Two stacked layers crossfade (CSS transition) whenever the wallpaper index changes. */
export function Wallpaper() {
  const wp = usePrefs((s) => s.wp);
  const rotate = usePrefs((s) => s.rotate);
  const next = usePrefs((s) => s.next);
  const [layers, setLayers] = useState<{ bg: [string, string]; on: 0 | 1 }>({ bg: [W[wp], ''], on: 0 });

  useEffect(() => {
    setLayers((l) => {
      if (l.bg[l.on] === W[wp]) return l;
      const o = (1 - l.on) as 0 | 1;
      const bg: [string, string] = [l.bg[0], l.bg[1]];
      bg[o] = W[wp];
      return { bg, on: o };
    });
  }, [wp]);

  useEffect(() => {
    if (!rotate) return;
    const t = setInterval(() => { if (!document.hidden) next(); }, 15000);
    return () => clearInterval(t);
  }, [rotate, next]);

  return (
    <>
      <div className={'wp' + (layers.on === 0 ? ' on' : '')} style={{ background: layers.bg[0] }} />
      <div className={'wp' + (layers.on === 1 ? ' on' : '')} style={{ background: layers.bg[1] }} />
    </>
  );
}
