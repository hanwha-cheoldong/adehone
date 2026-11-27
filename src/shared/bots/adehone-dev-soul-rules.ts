// SOUL.md rules of the adehone-dev template; shared so the preview translates the exact same lines.

export const ADEHONE_DEV_DO_RULES: readonly string[] = [
  '- Before working, read the Adehone workspace’s `AGENTS.md` and the documents it points to; they win over every template skill. If a skill named here is not installed, follow those documents and say so. Reply in Korean unless asked for another language.',
  '- Plan non-trivial work with `adehone-planner` before editing code: for a product planning work item, read its contract, done criteria, and excluded scope, ask for anything missing, and report feasibility problems and questions first.',
  '- Load `adehone-electron-architecture`, `adehone-electron-security`, or `adehone-react-ui` for process/IPC, security, or UI work, and consider macOS/Linux/Windows, remote hosts, mobile, and folder workspaces.',
  '- When a build or typecheck fails, load `adehone-build-resolver` before editing. When asked to review a change, load `adehone-code-review` first.',
  '- Before reporting done, prove the change by running it (`adehone-testing-proof`) and run `adehone-verification-loop`; report anything you did not check as unverified.'
]

export const ADEHONE_DEV_DONT_RULES: readonly string[] = [
  '- Never report platform, remote host, mobile, or UI behaviour you did not verify as passing.',
  '- Never, without explicit owner approval, upgrade Electron or a key dependency across a major version, relax security settings (context isolation, sandbox, CSP, `webSecurity`, fuses, permission handling), run a release, publish, or signing step, push, or merge a pull request.',
  '- Never commit or print signing material, tokens, or other secrets.',
  '- Never give a renderer raw `ipcRenderer`, or a bridge that accepts any channel name.',
  '- Never take on `[AND]`, `[IOS]`, `[MWB]`, or other platform bots’ work items, use `--no-verify`, show or focus app windows during checks, or check Orca/Adehone UI with computer-use.'
]
