import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WALLPAPER_COUNT } from './wallpapers';

export interface WinState {
  id: string; appId: string; title: string; icon: string;
  x: number; y: number; w: number; h: number; z: number;
  minimized: boolean; maximized: boolean;
  props?: Record<string, unknown>;
}
export interface OpenArgs {
  id: string; appId: string; title: string; icon: string;
  w?: number; h?: number; props?: Record<string, unknown>;
}
interface OSState {
  wins: Record<string, WinState>;
  activeId: string | null;
  zTop: number;
  spawned: number;
  booted: boolean;
  open: (a: OpenArgs) => void;
  close: (id: string) => void;
  closeAll: () => void;
  focus: (id: string) => void;
  toggleMin: (id: string) => void;
  toggleMax: (id: string) => void;
  move: (id: string, x: number, y: number) => void;
  resize: (id: string, w: number, h: number) => void;
  setBooted: (b: boolean) => void;
}

const seen = () => { try { return sessionStorage.getItem('seen') === '1'; } catch { return false; } };

export const useOS = create<OSState>((set, get) => ({
  wins: {}, activeId: null, zTop: 10, spawned: 0, booted: seen(),
  open: (a) => {
    const { wins, zTop, spawned } = get();
    const ex = wins[a.id];
    if (ex) { set({ wins: { ...wins, [a.id]: { ...ex, minimized: false, z: zTop + 1 } }, activeId: a.id, zTop: zTop + 1 }); return; }
    const n = spawned % 8;
    const win: WinState = {
      id: a.id, appId: a.appId, title: a.title, icon: a.icon,
      x: 50 + n * 26, y: 24 + n * 26, w: a.w ?? 420, h: a.h ?? 300, z: zTop + 1,
      minimized: false, maximized: false, props: a.props,
    };
    set({ wins: { ...wins, [a.id]: win }, activeId: a.id, zTop: zTop + 1, spawned: spawned + 1 });
  },
  close: (id) => set((s) => {
    const { [id]: _gone, ...rest } = s.wins;
    return { wins: rest, activeId: s.activeId === id ? null : s.activeId };
  }),
  closeAll: () => set({ wins: {}, activeId: null }),
  focus: (id) => set((s) => s.wins[id] ? { wins: { ...s.wins, [id]: { ...s.wins[id], z: s.zTop + 1 } }, activeId: id, zTop: s.zTop + 1 } : s),
  toggleMin: (id) => set((s) => {
    const w = s.wins[id]; if (!w) return s;
    const minimized = !w.minimized;
    return { wins: { ...s.wins, [id]: { ...w, minimized } }, activeId: minimized && s.activeId === id ? null : s.activeId };
  }),
  toggleMax: (id) => set((s) => s.wins[id] ? { wins: { ...s.wins, [id]: { ...s.wins[id], maximized: !s.wins[id].maximized } } } : s),
  move: (id, x, y) => set((s) => s.wins[id] ? { wins: { ...s.wins, [id]: { ...s.wins[id], x, y } } } : s),
  resize: (id, w, h) => set((s) => s.wins[id] ? { wins: { ...s.wins, [id]: { ...s.wins[id], w, h } } } : s),
  setBooted: (booted) => set({ booted }),
}));

interface Prefs {
  wp: number; rotate: boolean;
  setWp: (i: number) => void; next: () => void; setRotate: (b: boolean) => void;
}
/** Persisted in localStorage: wallpaper choice and auto-rotate. */
export const usePrefs = create<Prefs>()(persist((set, get) => ({
  wp: 0, rotate: true,
  setWp: (wp) => set({ wp, rotate: false }),
  next: () => set({ wp: (get().wp + 1) % WALLPAPER_COUNT }),
  setRotate: (rotate) => set({ rotate }),
}), { name: 'winfolio-prefs' }));
