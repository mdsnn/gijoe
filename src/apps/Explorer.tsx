import { useState } from 'react';
import type { WinState } from '../os/store';
import { openNode, resolve } from '../os/fs';
import { IconBtn } from '../os/IconBtn';

export function Explorer({ win }: { win: WinState }) {
  const path = (win.props?.path as string[] | undefined) ?? ['Desktop'];
  const folder = resolve(path);
  const [sel, setSel] = useState('');
  if (!folder) return <div className="page">This folder is empty.</div>;
  return (
    <div className="grid">
      {folder.children.map((n) => (
        <IconBtn key={n.name} icon={n.icon} label={n.name} selected={sel === n.name}
          onSelect={() => setSel(n.name)} onOpen={() => openNode(n, path)} />
      ))}
    </div>
  );
}
