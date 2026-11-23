export const SKILL = `---
name: mobile-web-desk-brief
description: Daily morning mobile web build/lint brief and weekly bundle/vitals tech-debt report formats.
---

# Mobile Web Desk Brief Formats

## Daily Morning Check (평일 오전 브리핑)
Keep under 10 lines:
- **Branch / Head**: \`<branch>\` (\`<short-sha>\`)
- **Build / Typecheck / Lint**: PASS / FAIL (note any new warnings)
- **Tests**: PASS / FAIL (count failures if any)
- **Open PRs / Blockers**: 1-line summary each, or "None"

## Weekly Tech-Debt Summary
- **Bundle & Core Web Vitals**: notable JS bundle growth, LCP/INP/CLS regressions
- **Outdated Packages / Security Advisories**: updates pending owner approval
- **Recommended Next Action**: 1-2 concrete items
`
