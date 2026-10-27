# WinFolio

A Windows 95 style desktop portfolio. React + TypeScript + Zustand + Vite.

    npm install
    npm run dev        # http://localhost:5173
    npm run build      # typecheck + production build

## Structure

    src/os/store.ts       Zustand: window manager (useOS) and persisted prefs (usePrefs)
    src/os/fs.ts          Virtual file system. Desktop, folders, Start menu and terminal all read it
    src/os/registry.tsx   App registry: appId -> component
    src/os/Window.tsx     Window frame: drag, resize, minimize, maximize, close, focus
    src/os/Desktop.tsx    Icons, context menu (right-click / long-press), window layer
    src/os/Taskbar.tsx    Start menu, task buttons, clock
    src/os/Boot.tsx       BIOS + logo, once per session, skippable
    src/os/Wallpaper.tsx  Crossfading wallpapers (src/os/wallpapers.ts holds the SVG scenes)
    src/apps/             Explorer (folders), Doc (plain / PDF / project views), Terminal, Display
    src/games/kit.tsx     Shared game loop, input, auto-pause. Games are plain objects
    src/games/            Minesweeper, Snake, Pong, Breakout, Tetris

## Adding things

- New app: write a component taking `{ win }`, add it to `src/os/registry.tsx`, add its title and size to `WINDOWS` in `src/os/fs.ts`, and add a node to `root`.
- New game: implement the `Game<S>` interface from `kit.tsx` and render it with `<GameCanvas />`. See `Snake.tsx`.
- New blog post or project: add a `doc(...)` node in `fs.ts`. Moving content to Markdown/JSON files is the next step.

## Not ported yet (still in the single-file prototype)

The BSOD easter egg (`rm -rf /`) and the Blip helper.
