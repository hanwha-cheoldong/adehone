export const SKILL = `---
name: mobile-web-code-review
description: Severity-ranked Mobile Web code review (CRITICAL/HIGH/MEDIUM/LOW) covering XSS/CSP/origin security, WebView bridge parity, 100dvh/safe-area, Core Web Vitals, and accessibility.
---

# Mobile Web Code Review

Review changed files systematically and classify every finding by severity (**CRITICAL**, **HIGH**, **MEDIUM**, **LOW**) with exact \`file:line\` references and concrete fixes.

## Severity Checklist

### CRITICAL (Must Fix Before Merge)
- **XSS & Injection**: Unsanitized \`innerHTML\`, \`outerHTML\`, \`document.write\`, \`dangerouslySetInnerHTML\`, or dynamic \`eval\` / \`new Function\`; user-controlled \`href\`/\`src\`/redirect targets without scheme validation (\`javascript:\`, \`data:\`).
- **WebView Bridge & Origin Bypass**: \`window.postMessage(..., '*')\` without explicit \`targetOrigin\`, missing \`event.origin\` allowlist check, or trusting unvalidated bridge payloads.
- **Secrets & Token Exposure**: Hardcoded API keys/tokens, \`.env*\` committed, private values behind client prefixes (\`NEXT_PUBLIC_*\`, \`VITE_*\`, \`REACT_APP_*\`), or long-lived refresh/auth tokens stored in \`localStorage\` when \`HttpOnly; Secure; SameSite\` cookies or native \`secureStorage\` bridge should be used.
- **Security Header Weakening**: Unapproved relaxation of CSP (\`script-src\`, \`frame-ancestors\`), CORS, cookie security flags, HSTS, \`X-Content-Type-Options\`, \`Referrer-Policy\`, or \`Permissions-Policy\`.
- **CSRF & Server Entry Points**: State-changing forms or cookie-authenticated requests without CSRF protection; server actions without input validation and authorization checks.
- **Hook Rules** (React): Conditional or non-component hook calls, and direct state mutation.

### HIGH (Fix Before Merge Unless Explicitly Waived)
- **Third-Party Scripts**: CDN scripts or styles without SRI, or new blocking third-party scripts.
- **Hook & Render Correctness** (React): Missing effect dependencies or cleanup, stale closures, effects used for derived state, \`key={index}\` on lists that reorder or change, and server-only data crossing into client components.
- **Semantics & Keyboard**: Click handlers on non-interactive elements, inputs without labels, or color as the only error signal.
- **Mobile Viewport & Layout Regressions**: Fixed \`100vh\` clipping under mobile keyboards/toolbars instead of \`100dvh\`/\`svh\`; missing \`env(safe-area-inset-*)\` on sticky bars; horizontal overflow at \`320px\`/\`375px\`.
- **Touch & Input Defects**: Interactive targets smaller than \`44x44px\`, missing \`font-size >= 16px\` on inputs (causing iOS zoom), or missing \`BRIDGE_UNAVAILABLE\` fallback when opened in a standalone mobile browser.
- **Bridge Contract Drift**: Method names, request/response envelopes, or error codes diverging from the Capability Contract or \`mobile-web-webview-bridge/references/bridge-protocol.md\`.
- **Error & Network Handling**: Unhandled promise rejections, missing \`AbortController\` cleanup, or missing error/retry states on flaky mobile networks.

### MEDIUM (Should Fix)
- **Core Web Vitals & Bundle Bloat**: Missing image \`width\`/\`height\` (CLS risk), eager-loading below-the-fold media, importing entire icon/utility libraries without tree-shaking, or animating layout properties (\`top\`/\`left\`/\`width\`) instead of \`transform\`/\`opacity\`.
- **State & Fetching Anti-Patterns**: Duplicating server state in client stores, parent-child fetch waterfalls, or storing shareable filter/tab state only in local component state instead of URL params.
- **Accessibility Gaps**: Missing accessible names on icon buttons, broken focus traps in modals/sheets, or missing \`prefers-reduced-motion\` support.

### LOW (Nit / Polish)
- \`target="_blank"\` links relying on implicit opener isolation instead of \`rel="noopener noreferrer"\`.
- Dead code, unused CSS/props, minor naming or component decomposition improvements.

## Output Format
Report findings grouped by severity with \`file:line\`, **Why it matters**, and **Suggested fix**, ending with a clear **PASS / FAIL** verdict.
`
