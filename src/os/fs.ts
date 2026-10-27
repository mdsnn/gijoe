import { useOS } from './store';

export type FolderNode = { type: 'folder'; name: string; icon: string; children: FsNode[] };
export type FileNode = {
  type: 'file'; name: string; icon: string;
  kind: 'doc' | 'pdf' | 'project' | 'app'; ref?: string; body?: string;
};
export type FsNode = FolderNode | FileNode;

const S = 'Replace this with your own writing.';
const doc = (name: string, kind: FileNode['kind'], icon: string, body = S): FileNode => ({ type: 'file', name, kind, icon, body });
const app = (name: string, icon: string, ref: string): FileNode => ({ type: 'file', name, kind: 'app', icon, ref });

/** The virtual file system. Desktop icons, folders, the Start menu and the terminal all read this. */
export const root: FolderNode = {
  type: 'folder', name: 'Desktop', icon: '🖥️',
  children: [
    { type: 'folder', name: 'Projects', icon: '🌐', children: [
      doc('WinFolio', 'project', '🌐', 'This site. Replace with your own project details.'),
      doc('Project Two', 'project', '🌐'),
    ] },
    { type: 'folder', name: 'Blog', icon: '📁', children: [
      doc('llm-api-lifecycle', 'pdf', '📕', 'What actually happens when you call an LLM API.\n\n' + S),
      doc('first-claude-app', 'pdf', '📕', 'Your first app on top of Claude.\n\n' + S),
      doc('model-context', 'pdf', '📕', 'Model context, explained.\n\n' + S),
    ] },
    { type: 'folder', name: 'Games', icon: '🎮', children: [
      app('Minesweeper', '💣', 'minesweeper'),
      app('Snake', '🐍', 'snake'),
      app('Pong', '🏓', 'pong'),
      app('Breakout', '🧱', 'breakout'),
      app('Tetris', '🧩', 'tetris'),
    ] },
    app('Terminal', '⌨️', 'terminal'),
    doc('Contact', 'doc', '✉️', 'Add your email and social links here.'),
    { type: 'folder', name: 'Trash', icon: '🗑️', children: [
      doc('bad_ideas.txt', 'doc', '📄', 'Rewrite everything in a new framework. Again.'),
      doc('final_FINAL_v7.doc', 'doc', '📄', 'It was not final.'),
    ] },
  ],
};

/** Default window sizes and titles for apps that are launched by id. */
export const WINDOWS: Record<string, { title: string; icon: string; w: number; h: number }> = {
  terminal: { title: 'Command Prompt', icon: '⌨️', w: 480, h: 280 },
  minesweeper: { title: 'Minesweeper', icon: '💣', w: 260, h: 340 },
  snake: { title: 'Snake', icon: '🐍', w: 352, h: 450 },
  pong: { title: 'Pong', icon: '🏓', w: 432, h: 390 },
  breakout: { title: 'Breakout', icon: '🧱', w: 432, h: 450 },
  tetris: { title: 'Tetris', icon: '🧩', w: 332, h: 540 },
  display: { title: 'Display Properties', icon: '🖼️', w: 400, h: 330 },
};

export function launch(ref: string) {
  const m = WINDOWS[ref];
  if (m) useOS.getState().open({ id: ref, appId: ref, ...m });
}

export function resolve(path: string[]): FolderNode | undefined {
  let cur: FolderNode = root;
  for (const seg of path.slice(1)) {
    const next = cur.children.find((c): c is FolderNode => c.type === 'folder' && c.name === seg);
    if (!next) return undefined;
    cur = next;
  }
  return cur;
}

export function openNode(n: FsNode, path: string[] = ['Desktop']) {
  const { open } = useOS.getState();
  if (n.type === 'folder') {
    const p = [...path, n.name];
    open({ id: 'f:' + p.join('/'), appId: 'explorer', title: n.name, icon: n.icon, w: 440, h: 280, props: { path: p } });
  } else if (n.kind === 'app' && n.ref) {
    launch(n.ref);
  } else {
    open({ id: 'd:' + n.name, appId: 'doc', title: n.name, icon: n.icon, w: 480, h: 320, props: { variant: n.kind, body: n.body ?? '' } });
  }
}
