import { ECC_LICENSE_FILES } from './ecc-license'

export const SKILL = `---
name: adehone-electron-security
description: Electron security review for Adehone, covering the 20 items of the official checklist, secrets, and packaging/signing/auto-update review. Use when a change touches windows, webviews, preload, IPC, URLs, permissions, CSP, protocols, fuses, dependencies, or packaging.
---

# Adehone Electron Security Review

Repository paths are relative to the Adehone workspace.

## How to Review
1. Check the diff against \`references/electron-security-checklist.md\`. For a security audit, walk all 20 items.
2. Read the current code for each item you judge: window options, session handlers, navigation policy, and packaging config. Do not judge from memory or from file names.
3. Give each item one verdict: **PASS** (cite file and line), **FAIL** (cite the line and a concrete attack or failure), **DIFFERS** (existing code departs from the item; say what you saw and any mitigation you found), **UNVERIFIED** (say why), or **N/A** (say why).
4. **Existing differences are reported, not fixed.** Do not change security-related app code that your task did not ask you to change.
5. Separate what your change introduces from what was already there.

## Never Without Explicit Owner Approval
- Relax context isolation, sandbox, CSP, \`webSecurity\`, fuses, or permission handling, in production or in a "temporary" development workaround that ships.
- Upgrade Electron or a key dependency across a major version.

## Also Check on Every Security-Relevant Diff
- **Secrets:** no tokens, keys, certificates, or signing material in code, fixtures, logs, screenshots, or reports. When you find one, report the file and line without printing the value.
- **Command execution:** renderer or repository data must not become a shell string. Use the workspace's process wrappers with argument arrays.
- **Paths:** resolve, then check containment, including symbolic links where it matters.
- **HTML and URLs:** no unsanitized HTML injection; allowlist URL schemes before opening or loading.
- **Dependencies:** a new dependency needs a reason, a maintained source, and attention to install scripts and native code.

## Packaging, Signing, Auto-update
Review only, following \`references/packaging-signing-update-review.md\`. Never run a release, publish, signing, or notarization step.
`

export const SKILL_FILES: Readonly<Record<string, string>> = {
  ...ECC_LICENSE_FILES,
  'references/electron-security-checklist.md': `# Electron Security Checklist (20 items)

Our own summary of what to check. The authority is the official page, which changes with Electron releases: https://www.electronjs.org/docs/latest/tutorial/security (numbering as read on 2026-11-27). Re-read it when you can and report differences. Defaults depend on the Electron version, so read the version in the workspace's \`package.json\`, and an explicit option beats a default.

Base: https://www.electronjs.org/docs/latest/tutorial/security

| # | What to check | Official section |
|---|---|---|
| 1 | Content not shipped inside the app loads over encrypted transports (HTTPS, WSS). | \`#1-only-load-secure-content\` |
| 2 | No window, view, or webview showing remote content has Node.js integration, including in subframes or workers. | \`#2-do-not-enable-nodejs-integration-for-remote-content\` |
| 3 | Context isolation is on in every renderer. | \`#3-enable-context-isolation\` |
| 4 | The process sandbox is on; look for options that silently turn it off. | \`#4-enable-process-sandboxing\` |
| 5 | Every session that can load remote content decides permissions explicitly and denies by default; check the permission check handler as well as the request handler, and new partitions. | \`#5-handle-session-permission-requests-from-remote-content\` |
| 6 | \`webSecurity\` is not turned off. | \`#6-do-not-disable-websecurity\` |
| 7 | A restrictive Content Security Policy applies to the app's pages in production. Check what the built app actually sends or embeds, not only the source template or a comment. | \`#7-define-a-content-security-policy\` |
| 8 | \`allowRunningInsecureContent\` is not enabled. | \`#8-do-not-enable-allowrunninginsecurecontent\` |
| 9 | \`experimentalFeatures\` is not enabled. | \`#9-do-not-enable-experimental-features\` |
| 10 | \`enableBlinkFeatures\` is not used. | \`#10-do-not-use-enableblinkfeatures\` |
| 11 | \`<webview>\` elements do not set \`allowpopups\` unless a reviewed need exists. | \`#11-do-not-use-allowpopups-for-webviews\` |
| 12 | A \`will-attach-webview\` handler forces safe options, removes unexpected preload settings, and rejects untrusted sources. | \`#12-verify-webview-options-before-creation\` |
| 13 | Navigation is blocked or limited to an allowlist, comparing parsed origins rather than string prefixes; consider redirects and subframes. | \`#13-disable-or-limit-navigation\` |
| 14 | New windows are denied by default through \`setWindowOpenHandler\`. | \`#14-disable-or-limit-creation-of-new-windows\` |
| 15 | \`shell.openExternal\` never receives unvalidated input; the scheme and destination are checked. | \`#15-do-not-use-shellopenexternal-with-untrusted-content\` |
| 16 | The Electron version is still supported and current. Report how far behind it is; upgrading a major version needs owner approval. | \`#16-use-a-current-version-of-electron\` |
| 17 | Every IPC handler that returns data or acts with privilege verifies the sending frame before doing so. | \`#17-validate-the-sender-of-all-ipc-messages\` |
| 18 | Local content is served through a custom protocol with limited file access instead of \`file://\`. | \`#18-avoid-usage-of-the-file-protocol-and-prefer-usage-of-custom-protocols\` |
| 19 | Fuses that the app does not need are reviewed in the packaging configuration and, when possible, on the packaged binary. No configuration found is a finding to report. | \`#19-check-which-fuses-you-can-change\` |
| 20 | Untrusted content gets no Electron API: no raw \`ipcRenderer\`, no generic channel bridge, no callbacks that leak the event object. | \`#20-do-not-expose-electron-apis-to-untrusted-web-content\` |

Append the section anchor to the base URL to open an item.

## Report Format
\`| # | Verdict (PASS/FAIL/DIFFERS/UNVERIFIED/N/A) | Evidence (file:line or reason) | Introduced by this change? |\`
`,
  'references/packaging-signing-update-review.md': `# Packaging, Signing, and Auto-update Review

Review guidance only. **Do not run** release, publish, signing, or notarization commands, and do not change release workflows without owner approval. Read the workspace's packaging configuration, release workflows, and package scripts to see what applies.

- **Secrets:** certificates, private keys, passwords, and publish tokens are never committed or printed. Check new files, CI logs, and error messages.
- **Signing:** signing and notarization stay required for release builds; no change quietly disables them or makes them optional.
- **macOS:** hardened runtime stays on; each new or broader entitlement has a reason. Run the repository's entitlement verification script if it has one and it only reads.
- **Windows and Linux:** installer signing, install location, elevation, and file permissions are unchanged or explained. Nested and native binaries are covered.
- **Auto-update:** the feed uses HTTPS, package signature or integrity verification stays on, and channel selection cannot be controlled by untrusted input. Consider downgrade and a partly applied update.
- **Contents:** packaged files exclude tests, environment files, source secrets, and debug endpoints.
- **Fuses and integrity:** see checklist item 19.
- **Long-running processes:** a process that survives an update must still work with the new version.

Report what you only read as **reviewed, not executed**. Packaging behaviour on a platform you did not build and run on is UNVERIFIED.
`
}
