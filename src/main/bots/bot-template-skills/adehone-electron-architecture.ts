export const SKILL = `---
name: adehone-electron-architecture
description: Electron process structure, preload, and IPC contracts in Adehone. Use when adding or changing anything that crosses main, preload, renderer, utility processes, or a remote host.
---

# Adehone Electron Architecture and IPC

Repository paths are relative to the Adehone workspace. Read its \`AGENTS.md\` first; follow the structure the code already has, and extend it. Do not introduce a parallel layout or IPC style from this guide.

## Process Roles
| Process | Owns | Must not |
|---|---|---|
| Main | App lifecycle, windows, OS access, privileged operations, authorization | Trust a renderer because it is "our UI"; block the event loop with synchronous work |
| Preload | A small, named capability surface through \`contextBridge\` | Hold business logic or hand out Electron objects |
| Renderer | UI and view state | Import \`electron\` or Node built-ins, or assume local file or process access |
| Utility / child processes | Isolated or heavy work | Receive unvalidated input from a renderer by relay |

Before deciding where code goes, find how the nearest existing feature does it (search \`src/main\`, \`src/preload\`, \`src/renderer\`, \`src/shared\` or the current equivalents). Platform and process wrappers that already exist are the way to spawn processes; the cross-platform document names them.

## IPC Contract
Follow \`references/ipc-contract.md\` for every new or changed channel. In short:

1. **Shared:** serializable types or schemas, one definition used by both sides.
2. **Main:** a named handler that checks the sender, validates the input, authorizes the operation on that resource, then returns a plain result.
3. **Preload:** one specific method per capability.
4. **Renderer:** calls that method; no channel names or Electron types in UI code.

**Never** expose raw \`ipcRenderer\`, \`send\`/\`invoke\`/\`on\` that accept a channel name from the page, or the Electron event object. This holds for debugging helpers too.

## Beyond One Process
- **Remote hosts:** decide which side runs the operation. A local path, shell, or process assumption in main breaks remote and SSH workspaces. Find the existing remote route for the nearest similar feature.
- **Mobile and older peers:** a changed request, response, or stored shape can reach an older mobile app or host. Keep it backward compatible or say what breaks.
- **Folder workspaces:** a workspace may not be a git repository.
- **Lifecycle:** remove listeners and handlers you add, handle a destroyed window, and do not register one channel twice.
- **Cost:** IPC is a hot path. Avoid per-keystroke or per-line round trips and repeated large payloads.

Report an existing handler or window that does not meet these points; do not rewrite it as a side effect of another task.
`

export const SKILL_FILES: Readonly<Record<string, string>> = {
  'references/ipc-contract.md': `# IPC Contract Checklist

A supporting reference. Electron's own documentation is the authority: https://www.electronjs.org/docs/latest/tutorial/ipc and https://www.electronjs.org/docs/latest/tutorial/security. The workspace's existing conventions decide names, folders, and the validation library; add no dependency for this.

## Trust Boundary
Treat every message from a renderer or guest page as untrusted input, even from the app's own window. A static type is not a runtime check.

## For Each Channel
- [ ] **Sender:** the handler confirms the message came from a window and frame allowed to use this capability. Check \`event.senderFrame\` (it can be null), and for the app window that it is the expected \`webContents\` and its main frame where subframes must not call. Compare parsed origins or exact document identity, never a string prefix.
- [ ] **Window scope:** a capability granted to one window is not automatically granted to popouts, guests, or plugin frames.
- [ ] **Input:** received as \`unknown\`, then validated at runtime (shape, types, size limits, no unexpected fields).
- [ ] **Authorization:** paths, workspace ids, and URLs are checked against what this caller may touch. Resolve paths before checking containment.
- [ ] **Operation:** the handler calls a specific operation. It never takes a command, channel, module, or function name from the caller and dispatches it.
- [ ] **Output:** only the fields the caller needs, structured-cloneable, no secrets.
- [ ] **Errors:** a safe, serializable error for the renderer; details are logged in main without secrets.
- [ ] **Registration:** one owner per channel, and authorization that stays correct when the window is recreated.

## Preload
\`\`\`ts
// A named capability: the page cannot choose the channel.
contextBridge.exposeInMainWorld('example', {
  setTheme: (theme: Theme) => ipcRenderer.invoke('example:set-theme', theme),
  onThemeChanged: (listener: (theme: Theme) => void) => {
    const forward = (_event: unknown, theme: Theme) => listener(theme)
    ipcRenderer.on('example:theme-changed', forward)
    return () => ipcRenderer.removeListener('example:theme-changed', forward)
  }
})
\`\`\`
- Forward the payload only, never the event.
- Return an unsubscribe function and use it.
- A sandboxed preload can load only a limited set of modules; keep it bundled the way the build already does.

## Events and Long Work
- Long operations return an id, report progress through a scoped subscription, and can be cancelled.
- If a missed event would leave stale UI, provide a way to resynchronize.
- Avoid repeatedly cloning large payloads across IPC.
`,
  'references/deveyou-license.md': `# Third-party notice

Parts of this skill (the four-part IPC contract; sender, input, and authorization checks; per-window scope, safe errors, and channel ownership; the preload subscription shape; and long-running or large-payload handling) are adapted, in our own wording and checked against Electron's documentation, from
electron-desktop-architecture-skill, commit 6f078ed, https://github.com/DeveYou/electron-desktop-architecture-skill

MIT License

Copyright (c) 2026 Electron Desktop Architecture Skill contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`
}
