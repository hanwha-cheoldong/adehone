export const SKILL = `---
name: mobile-web-intake
description: Classify incoming mobile web development requests into Track A (Quick Fix), Track B (Feature / Bridge), or Track C (Architecture / Security) before delegating.
---

# Intake: Mobile Web Request Triage

Classify every incoming request by complexity, blast radius, and risk before writing a \`mobile-web-worker-brief\`.

## Track A — Quick Fix (즉시 처리)
- **Scope**: Copy/i18n edits, CSS spacing/safe-area tweaks, icon/asset updates, single-component bug fixes with no routing, state schema, CSP, or bridge contract changes.
- **Action**: Write a concise \`worker-brief\` and execute immediately.

## Track B — Standard Feature / Bridge (표준 기능 구현)
- **Scope**: New responsive mobile pages/sheets, touch/gesture interactions, WebView ↔ Native JS bridge client calls, or form/API state changes.
- **Action**: Analyze impact on iOS Safari / Android WebView viewports (\`100dvh\`, virtual keyboard), safe-area insets, and JS bridge contracts first, then write a full \`worker-brief\` (referencing \`mobile-web-development\`, \`mobile-web-webview-bridge\`, and \`mobile-web-performance-pwa\` as needed) and delegate.

## Track C — High-Risk / Architecture Change (고위험·구조 변경)
- **Scope**: Framework/bundler major upgrades, routing/SSR/PWA service worker caching rewrites, CSP/CORS/cookie auth changes, or payment/identity flows.
- **Action**: Draft an architecture & risk proposal first and get explicit owner approval before launching a worker.
`
