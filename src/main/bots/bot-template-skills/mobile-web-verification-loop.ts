import {
  MOBILE_WEB_BUNDLE_BUDGET,
  MOBILE_WEB_CORE_WEB_VITALS
} from './mobile-web-performance-budget'

export const SKILL = `---
name: mobile-web-verification-loop
description: 6-phase verification gate for Mobile Web — build & bundle budget, typecheck & lint, unit & mobile-viewport E2E tests, XSS/CSP/bridge security scan, Core Web Vitals & a11y diff review, and browser/WebView acceptance.
---

# Mobile Web 6-Phase Verification Loop

Run all verification phases after completing a feature or refactor and before reporting done or opening a PR.

## Phase 1: Build & Bundle Verification
- Run the production build (e.g., \`pnpm build\`) and confirm exit code \`0\`.
- Check gzipped bundle output against the budget for the page type, and flag unexpected chunk spikes:

${MOBILE_WEB_BUNDLE_BUDGET}

## Phase 2: Typecheck & Lint
- Run typecheck (e.g., \`pnpm typecheck\` / \`tsc --noEmit\`) and linter (\`pnpm lint\` / \`oxlint\` / \`eslint\`) and confirm zero errors.

## Phase 3: Unit & Mobile Viewport Tests
- Run affected unit/component tests (\`pnpm test\`), bridge contract tests, and Playwright E2E in the project's mobile and cross-browser projects (Chrome, Safari/WebKit, Firefox), and confirm all pass.
- Check the viewport width matrix \`320\`/\`375\`/\`390\`/\`768\`/\`1024\`/\`1440\`/\`1920\` for overflow, and review visual-regression diffs (see \`mobile-web-tdd-testing\`).
- Report coverage against the project gate (at least 80%). List anything the project cannot run as \`N/A\` with the reason, never as PASS.

## Phase 4: Security & Bridge Diff Scan
Scan \`git diff\` for high-risk patterns:
- **Secrets**: \`.env*\`, API keys, private keys, or tokens in client bundles or logs.
- **XSS & CSP**: \`innerHTML\`, \`dangerouslySetInnerHTML\`, \`v-html\`, \`{@html}\`, \`'unsafe-inline'\` / \`'unsafe-eval'\` added to script sources, \`javascript:\`/\`data:\` URLs from user input, inline scripts, or unapproved CSP/CORS/cookie changes.
- **Form Submissions**: for each new or changed submission endpoint, apply the rate-limit check in \`mobile-web-code-review\`. Without server evidence, this phase is \`UNVERIFIED\`, not \`PASS\`.
- **Requests, Third Parties & Headers**: state-changing forms or cookie-authenticated requests without CSRF protection, CDN scripts without SRI, and weakened HSTS / \`X-Content-Type-Options\` / framing / \`Referrer-Policy\` / \`Permissions-Policy\` headers.
- **Client Env Exposure**: private values behind public prefixes (\`NEXT_PUBLIC_*\`, \`VITE_*\`, \`REACT_APP_*\`).
- **WebView Bridge Parity**: \`postMessage('*')\`, missing \`event.origin\` validation, missing timeout/cleanup, or drift from the Capability Contract and \`mobile-web-webview-bridge/references/bridge-protocol.md\`.

## Phase 5: Diff Review & Core Web Vitals / A11y Check
Run \`git diff --stat\` and verify against \`mobile-web-code-review\`:
- \`100dvh\`/\`svh\` & \`env(safe-area-inset-*)\`, \`>= 44x44px\` touch targets, \`font-size >= 16px\` inputs, explicit image dimensions, and WCAG 2.2 AA landmarks/focus/contrast.

## Phase 6: Target Acceptance (Mobile Browser / WebView)
Report live target verification **separately** from automated checks:
- Verify rendered UI across mobile (\`375px\`/\`390x844\`) and desktop (\`1440px\`) viewports with a browser or Playwright, checking \`axe-core\` and Core Web Vitals:

${MOBILE_WEB_CORE_WEB_VITALS}

- If a WebView bridge feature was changed, ask the Android and iOS bots for an end-to-end smoke check on real hosts (protocol section 6), or mark \`SKIPPED (no live WebView host)\` with exact manual steps).

## Verification Report Format
\`\`\`text
Verification Report: PASS / FAIL / UNVERIFIED
- Build & Bundle Budget: PASS/FAIL
- Typecheck & Lint: PASS/FAIL
- Tests (Unit / Mobile E2E): PASS/FAIL (X passed)
- Security & Bridge Diff Scan: PASS/FAIL/UNVERIFIED
- Code Review & Vitals/A11y Check: PASS/FAIL
- Target Acceptance (Mobile Viewport / WebView): PASS/FAIL/SKIPPED
- Modified Files & Summary: ...
- Server Owner Confirmation Needed: None / ...
- Cross-Bot Sync Needed (Android / iOS / Product Planning): None / ...
\`\`\`

A check that did not run is \`N/A\` or \`SKIPPED\` with its reason, never \`PASS\`. When a build or typecheck fails, switch to \`mobile-web-build-resolver\`.

## Status Report Formats
- **Daily check** (under 10 lines): branch and short SHA; build / typecheck / lint PASS or FAIL with new warnings; test failures if run; open PRs and blockers.
- **Weekly tech-debt summary** (when asked): bundle and Core Web Vitals changes against the last measurement, dependency advisories and updates awaiting owner approval, and one or two recommended next actions. Write \`not measured\` instead of estimating.
`
