export const SKILL = `---
name: ios-desk-brief
description: Daily morning iOS build/lint brief and weekly tech-debt report formats.
---

# iOS Desk Brief Formats

## Daily Morning Check (평일 오전 브리핑)
Keep under 10 lines:
- **Branch / Head**: \`<branch>\` (\`<short-sha>\`)
- **Build (\`xcodebuild\`)**: PASS / FAIL (note any new warnings)
- **Lint (\`swiftlint\`)**: PASS / FAIL (count new issues)
- **Open PRs / Blockers**: 1-line summary each, or "None"

## Weekly Tech-Debt Summary
- **Outdated SPM/Pods**: list major/security updates pending owner approval
- **Deprecation / Concurrency Warnings**: Swift 6 strict concurrency or deprecated UIKit/iOS APIs spotted
- **Recommended Next Action**: 1-2 concrete items
`
