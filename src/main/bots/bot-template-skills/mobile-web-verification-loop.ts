export const SKILL = `---
name: mobile-web-verification-loop
description: 6-phase verification gate for Mobile Web — build & bundle budget, typecheck & lint, unit & mobile-viewport E2E tests, XSS/CSP/bridge security scan, Core Web Vitals & a11y diff review, and browser/WebView acceptance.
---

# Mobile Web 6-Phase Verification Loop

Run all verification phases after completing a feature or refactor and before reporting done or opening a PR.

## Phase 1: Build & Bundle Verification
- Run the production build (e.g., \`pnpm build\`) and confirm exit code \`0\`.
- Check bundle output against ECC \`rules/web/performance.md\` budgets (Landing < 150KB JS / 30KB CSS; App < 300KB JS / 50KB CSS gzipped) and flag unexpected chunk spikes.

## Phase 2: Typecheck & Lint
- Run typecheck (e.g., \`pnpm typecheck\` / \`tsc --noEmit\`) and linter (\`pnpm lint\` / \`oxlint\` / \`eslint\`) and confirm zero errors.

## Phase 3: Unit & Mobile Viewport Tests
- Run affected unit/component tests (\`pnpm test\`), bridge contract tests, and Playwright E2E in the project's mobile and cross-browser projects (Chrome, Safari/WebKit, Firefox), and confirm all pass.
- Check the viewport width matrix \`320\`/\`375\`/\`390\`/\`768\`/\`1024\`/\`1440\`/\`1920\` for overflow, and review visual-regression diffs (see \`mobile-web-tdd-testing\`).
- Report coverage against the project gate (at least 80%). List anything the project cannot run as \`N/A\` with the reason, never as PASS.

## Phase 4: Security & Bridge Diff Scan
Scan \`git diff\` for high-risk patterns:
- **Secrets**: \`.env*\`, API keys, private keys, or tokens in client bundles or logs.
- **XSS & CSP**: \`innerHTML\`, \`dangerouslySetInnerHTML\`, \`javascript:\`/\`data:\` URLs from user input, inline scripts, or unapproved CSP/CORS/cookie changes.
- **Requests, Third Parties & Headers**: state-changing forms or cookie-authenticated requests without CSRF protection, CDN scripts without SRI, and weakened HSTS / \`X-Content-Type-Options\` / framing / \`Referrer-Policy\` / \`Permissions-Policy\` headers.
- **Client Env Exposure**: private values behind public prefixes (\`NEXT_PUBLIC_*\`, \`VITE_*\`, \`REACT_APP_*\`).
- **WebView Bridge Parity**: \`postMessage('*')\`, missing \`event.origin\` validation, missing timeout/cleanup, or drift from the Capability Contract and \`mobile-web-webview-bridge/references/bridge-protocol.md\`.

## Phase 5: Diff Review & Core Web Vitals / A11y Check
Run \`git diff --stat\` and verify against \`mobile-web-code-review\`:
- \`100dvh\`/\`svh\` & \`env(safe-area-inset-*)\`, \`>= 44x44px\` touch targets, \`font-size >= 16px\` inputs, explicit image dimensions, and WCAG 2.2 AA landmarks/focus/contrast.

## Phase 6: Target Acceptance (Mobile Browser / WebView)
Report live target verification **separately** from automated checks:
- Verify rendered UI across mobile (\`375px\`/\`390x844\`) and desktop (\`1440px\`) viewports with a browser or Playwright, checking Core Web Vitals (\`LCP < 2.5s\`, \`INP < 200ms\`, \`CLS < 0.1\`) and \`axe-core\`.
- If a WebView bridge feature was changed, ask the Android and iOS bots for an end-to-end smoke check on real hosts (protocol section 6), or mark \`SKIPPED (no live WebView host)\` with exact manual steps).

## Verification Report Format
\`\`\`text
Verification Report: PASS / FAIL
- Build & Bundle Budget: PASS/FAIL
- Typecheck & Lint: PASS/FAIL
- Tests (Unit / Mobile E2E): PASS/FAIL (X passed)
- Security & Bridge Diff Scan: PASS/FAIL
- Code Review & Vitals/A11y Check: PASS/FAIL
- Target Acceptance (Mobile Viewport / WebView): PASS/FAIL/SKIPPED
- Modified Files & Summary: ...
- Cross-Bot Sync Needed (Android / iOS / Product Planning): None / ...
\`\`\`

## Status Report Formats
- **Daily check** (under 10 lines): branch and short SHA; build / typecheck / lint PASS or FAIL with new warnings; test failures if run; open PRs and blockers.
- **Weekly tech-debt summary** (when asked): bundle and Core Web Vitals changes against the last measurement, dependency advisories and updates awaiting owner approval, and one or two recommended next actions. Write \`not measured\` instead of estimating.
`
