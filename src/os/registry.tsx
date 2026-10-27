import type { ComponentType } from 'react';
import type { WinState } from './store';
import { Explorer } from '../apps/Explorer';
import { Doc } from '../apps/Doc';
import { Terminal } from '../apps/Terminal';
import { Display } from '../apps/Display';
import { Minesweeper } from '../games/Minesweeper';
import { Snake } from '../games/Snake';
import { Pong } from '../games/Pong';
import { Breakout } from '../games/Breakout';
import { Tetris } from '../games/Tetris';

export interface AppDef { component: ComponentType<{ win: WinState }>; face?: boolean }

/** Add a new app: write a component, add one line here, and (optionally) a node in fs.ts. */
export const APPS: Record<string, AppDef> = {
  explorer: { component: Explorer },
  doc: { component: Doc },
  terminal: { component: Terminal },
  display: { component: Display, face: true },
  minesweeper: { component: Minesweeper, face: true },
  snake: { component: Snake, face: true },
  pong: { component: Pong, face: true },
  breakout: { component: Breakout, face: true },
  tetris: { component: Tetris, face: true },
};
