import { useCallback, useEffect, useRef, useState } from 'react';
import { useOS } from './store';

const LINES = ['WinFolio BIOS v0.95', 'Memory test: 640K OK', 'Detecting creativity... OK', 'Loading desktop...'];

/** Fake BIOS, then a logo with a progress bar. Click or press a key to skip. Plays once per session. */
export function Boot() {
  const [log, setLog] = useState('');
  const [logo, setLogo] = useState(false);
  const done = useRef(false);

  const finish = useCallback(() => {
    if (done.current) return;
    done.current = true;
    try { sessionStorage.setItem('seen', '1'); } catch { /* ignore */ }
    const os = useOS.getState();
    os.setBooted(true);
    os.open({
      id: 'welcome', appId: 'doc', title: 'Welcome', icon: '👋', w: 380, h: 220,
      props: { variant: 'doc', body: 'Double-click an icon to open it. Right-click the desktop for options. Try the Command Prompt and the Games folder.' },
    });
  }, []);

  useEffect(() => {
    const timers = LINES.map((s, i) => window.setTimeout(() => setLog((l) => l + s + '\n'), 300 * i));
    timers.push(window.setTimeout(() => setLogo(true), 1500));
    timers.push(window.setTimeout(finish, 4100));
    const k = window.setTimeout(() => addEventListener('keydown', finish), 50);
    return () => { timers.forEach(clearTimeout); clearTimeout(k); removeEventListener('keydown', finish); };
  }, [finish]);

  const coarse = matchMedia('(pointer:coarse)').matches;
  return (
    <div id="boot" className={logo ? 'logo' : ''} onClick={finish}>
      <div id="bl">{log}</div>
      <div id="logo">
        <h1>WinFolio 95</h1>
        <div id="pb"><i style={{ width: logo ? '100%' : 0 }} /></div>
        <div>Starting your desktop…</div>
      </div>
      <div id="skip">{coarse ? 'Tap to skip' : 'Click or press any key to skip'}</div>
    </div>
  );
}
