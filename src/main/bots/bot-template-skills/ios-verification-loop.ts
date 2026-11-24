export const SKILL = `---
name: ios-verification-loop
description: 6-phase verification loop for iOS — Xcode/SwiftPM build, SwiftLint/swift-format, unit tests & coverage, security grep scan, diff review, and iOS Simulator acceptance with PASS/FAIL report.
---

# iOS 6-Phase Verification Loop

Run all verification phases after completing a feature or refactor and before reporting done or opening a PR.

## Phase 1: Build Verification
- Run \`xcodebuild -scheme <Scheme> -destination 'generic/platform=iOS Simulator' build\` (or \`swift build\` for SwiftPM) and confirm exit code \`0\`.
- If the build fails, STOP and fix using \`xcode-build-resolver\`.

## Phase 2: Lint & Formatting
- Run \`swiftlint lint --quiet\` when \`swiftlint\` is installed / configured.
- Run \`swift-format lint -r .\` when configured in the project.

## Phase 3: Unit Tests & Coverage
- Run \`xcodebuild -scheme <Scheme> -destination 'platform=iOS Simulator,name=<Device>' -enableCodeCoverage YES test\` (or \`swift test --enable-code-coverage\`) and confirm all tests pass.
- Target 80%+ code coverage on domain and business logic.

## Phase 4: Security & Anti-Pattern Scan
Scan \`git diff\` for high-risk patterns:
- **Secrets & Signing**: Hardcoded keys/tokens, \`.p12\`, \`.mobileprovision\`, \`AuthKey_*.p8\`, \`UserDefaults\` storing secrets, \`print()\`/\`NSLog()\` logging sensitive data.
- **ATS & Network**: \`NSAllowsArbitraryLoads = true\`, unconditional \`SecTrust\` acceptance, missing certificate pinning, deprecated \`NSURLConnection\` / \`UIWebView\`.
- **WKWebView & Entitlements**: Missing \`https://\` origin/mainFrame validation, string interpolation in \`evaluateJavaScript\`, unapproved \`Info.plist\` or \`*.entitlements\` additions.
- **Swift & ObjC Safety**: \`!\` force unwraps, \`try!\`, \`as!\`, empty \`catch {}\`, \`fatalError()\` in recoverable paths, ObjC \`strcpy\`/\`sprintf\`/format-string bugs, or missing nullability on bridged headers.

## Phase 5: Diff Review
Run \`git diff --stat\` and verify against \`swift-code-review\`:
- Pure-Swift \`Domain\` boundaries, Swift 6 concurrency/\`Sendable\` safety, \`[weak self]\`/\`__weak\` ARC hygiene, Bridging Header scope, and SwiftUI accessibility.

## Phase 6: Target Acceptance (iOS Simulator)
Report simulator acceptance **separately** from local build/unit checks. Check \`xcrun simctl list devices booted\`:
- If a booted simulator is available, install and launch the built \`.app\` (\`xcrun simctl install booted <App.app>\` / \`xcrun simctl launch booted <bundle-id>\`), verify the changed flow, and inspect recent crash logs if any.
- If no simulator is booted or available, mark as \`SKIPPED (no booted simulator)\`.

## Verification Report Format
\`\`\`text
Verification Report: PASS / FAIL
- Build (xcodebuild / swift build): PASS/FAIL
- Lint & Format (swiftlint, swift-format): PASS/FAIL/N/A
- Tests & Coverage (xcodebuild test / swift test): PASS/FAIL (X passed)
- Security Scan & Diff Review: PASS/FAIL
- Target Acceptance (simctl): PASS/FAIL/SKIPPED
- Modified Files & Summary: ...
- Manual Verification Needed: ...
\`\`\`
`
