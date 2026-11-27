# electron-desktop-architecture-skill attribution

The built-in `adehone-dev` bot template skill `adehone-electron-architecture`
(`src/main/bots/bot-template-skills/adehone-electron-architecture.ts`) adapts parts of
[electron-desktop-architecture-skill](https://github.com/DeveYou/electron-desktop-architecture-skill)
(MIT License, Copyright (c) 2026 Electron Desktop Architecture Skill contributors); see `LICENSE-MIT`.

- Reference commit: `6f078ed`. Source file: `references/ipc.md`.
- Adapted in our own wording: the four-part IPC contract (shared, main, preload, renderer), sender,
  input, and authorization checks, per-window capability scope, safe errors and single channel
  ownership, the preload subscription shape, and long-running or large-payload handling.
- It is a supporting reference only; Electron's official documentation wins. Nothing from its scripts
  is included or run.
- Installed bots receive the notice in `adehone-electron-architecture/references/deveyou-license.md`.
