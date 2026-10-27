import { useEffect, useRef, useState } from 'react';
import { launch, openNode, root } from '../os/fs';
import { usePrefs } from '../os/store';

const GAME_IDS = ['minesweeper', 'snake', 'pong', 'breakout', 'tetris'];

export function Terminal() {
  const [lines, setLines] = useState<string[]>(['WinFolio [Version 0.95]', 'Type help to begin.']);
  const [value, setValue] = useState('');
  const hist = useRef<string[]>([]);
  const hi = useRef(0);
  const box = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => { input.current?.focus(); }, []);
  useEffect(() => { box.current?.scrollTo(0, box.current.scrollHeight); }, [lines]);

  const run = (raw: string) => {
    const [cmd = '', ...args] = raw.trim().split(/\s+/);
    const out: string[] = ['C:\\> ' + raw];
    switch (cmd.toLowerCase().replace(/^\//, '')) {
      case 'help': out.push('help  ls  open <name>  about  date  whoami  wallpaper  clear  sudo  rm  play <game>'); break;
      case 'ls': out.push(root.children.map((n) => n.name).join('   ')); break;
      case 'about': out.push('WinFolio 95. A desktop-style portfolio, built for fun.'); break;
      case 'date': out.push(new Date().toString()); break;
      case 'whoami': out.push('guest'); break;
      case 'wallpaper': usePrefs.getState().next(); out.push('Wallpaper changed.'); break;
      case 'sudo': out.push('Nice try. You are not in the sudoers file. This incident will not be reported.'); break;
      case 'rm': out.push('rm: refusing to delete anything. (The blue screen is not ported yet.)'); break;
      case 'open': {
        const name = args.join(' ').toLowerCase();
        const n = root.children.find((c) => c.name.toLowerCase() === name);
        if (n) { openNode(n); out.push('Opening ' + n.name + '...'); } else out.push('Usage: open <name>. Try ls.');
        break;
      }
      case 'play': {
        const g = (args[0] ?? '').toLowerCase();
        if (GAME_IDS.includes(g)) { launch(g); out.push('Starting ' + g + '...'); } else out.push('Usage: play ' + GAME_IDS.join('|'));
        break;
      }
      case 'clear': setLines([]); return;
      case '': return;
      default: out.push(`'${cmd}' is not recognized as a command. Type help.`);
    }
    setLines((l) => [...l, ...out]);
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const v = value.trim();
      if (v) { hist.current.push(v); hi.current = hist.current.length; }
      run(value); setValue('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault(); hi.current = Math.max(0, hi.current - 1); setValue(hist.current[hi.current] ?? '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault(); hi.current = Math.min(hist.current.length, hi.current + 1); setValue(hist.current[hi.current] ?? '');
    }
  };

  return (
    <div className="term" ref={box} style={{ height: '100%', overflow: 'auto', boxSizing: 'border-box' }} onClick={() => input.current?.focus()}>
      {lines.map((l, i) => <div key={i}>{l}</div>)}
      <div className="ln">
        <span>C:\&gt;</span>
        <input ref={input} value={value} spellCheck={false} autoCapitalize="off" autoComplete="off" aria-label="Command"
          onChange={(e) => setValue(e.target.value)} onKeyDown={onKey} />
      </div>
    </div>
  );
}
