export const SKILL = `---
name: mobile-web-close-out
description: Post-worker verification checklist for mobile web changes: build/typecheck/lint/test execution, viewport/safe-area review, and XSS/CSP/bridge diff check.
---

# Mobile Web Close-Out Verification

Run these checks directly before reporting any mobile web work as complete:

1. **Build, Typecheck & Lint**: Run the project's build, typecheck, and lint commands and confirm zero errors.
2. **Tests**: Run affected unit, component, or mobile-viewport E2E tests and confirm all pass.
3. **Viewport & Touch Ergonomics**: Check diff for fixed \`100vh\` (prefer \`100dvh\`), missing \`env(safe-area-inset-*)\` on bottom/top bars, horizontal overflow, or small touch targets (< 44x44px).
4. **Security & Bridge Diff**: Inspect for \`dangerouslySetInnerHTML\`/\`innerHTML\` XSS risks, loose \`postMessage('*')\` targets or missing \`event.origin\` checks, and unintended CSP/cookie changes.
5. **Secret Hygiene**: Confirm no \`.env*\` secrets or API tokens were staged or bundled.

Report results concisely: changed files, exact commands run with pass/fail status, and any manual device/browser check needed.
`
