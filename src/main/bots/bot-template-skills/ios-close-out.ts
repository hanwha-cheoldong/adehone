export const SKILL = `---
name: ios-close-out
description: Post-worker verification checklist for iOS changes: Xcode build/test execution, Info.plist/Entitlements/bridge diff review, and simulator smoke test.
---

# iOS Close-Out Verification

Run these checks directly before reporting any iOS work as complete:

1. **Build & Unit Tests**: Run \`xcodebuild build\` and \`xcodebuild test\` (or \`swift test\` for Swift packages) and confirm zero errors.
2. **Lint**: Run \`swiftlint\` (if configured) and confirm no new errors.
3. **Info.plist & Entitlements Diff**: Inspect \`git diff\` on \`Info.plist\`, \`*.entitlements\`, and \`project.pbxproj\` to ensure no unintended permissions, ATS exceptions, or signing changes.
4. **WKWebView Bridge & Security Check**: If bridge code changed, verify origin allowlist checks, \`@MainActor\` / main-thread dispatch, and absence of sensitive logs.
5. **Secret Hygiene**: Confirm no \`.p12\`, \`.mobileprovision\`, \`AuthKey_*.p8\`, or API keys were staged or printed.

Report results concisely: changed files, exact commands run with pass/fail status, and any manual simulator/device test needed.
`
