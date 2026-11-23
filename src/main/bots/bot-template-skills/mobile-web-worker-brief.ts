export const SKILL = `---
name: mobile-web-worker-brief
description: Standard mobile web worker delegation brief format (BRIEF.md) with viewport targets, bridge contracts, and build/test DoD.
---

# Mobile Web Worker Brief Template

Always structure worker delegation specs with these sections so the worker has clear boundaries and Definition of Done.

\`\`\`markdown
## 1. Goal & Track
- Track: [A | B | C]
- Summary: <1-2 sentences of what must change>

## 2. Target Files & Viewports
- Routes / Components: <affected pages, shared UI, hooks>
- Target Viewports: <e.g. 390x844 iOS Safari, 360x800 Android WebView, safe-area + virtual keyboard>

## 3. Contracts & Constraints
- WebView JS Bridge (if any): <envelope { id, action, payload }, iOS WKWebView / Android JavascriptInterface adapter>
- Security & Storage: <no unescaped HTML injection, strict postMessage origin check, no secrets in localStorage/bundles>
- Guardrails: <no major dependency/CSP/cookie policy changes without approval>

## 4. Definition of Done (Verification)
- Build & Types: production build, typecheck, and lint pass
- Tests: relevant unit/component/E2E tests pass
- Mobile check: verify touch targets (>=44px), safe-area padding, and no horizontal overflow
\`\`\`
`
