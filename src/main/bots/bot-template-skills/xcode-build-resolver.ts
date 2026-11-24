export const SKILL = `---
name: xcode-build-resolver
description: Swift/Xcode build resolver and signing/entitlements specialist — surgical build error resolution, Swift 6 concurrency fixes, SPM/CocoaPods troubleshooting, and deployment target/secret guardrails.
---

# Xcode & Swift Build Resolver

Fix Swift compilation errors, Xcode build failures, SPM/CocoaPods dependency issues, and signing/entitlements problems with **minimal, surgical changes**.

## 1. Surgical Build Fix Workflow
1. Run diagnostics:
   - Xcode project/workspace: \`xcodebuild -list\` then \`xcodebuild -scheme <Scheme> -destination 'generic/platform=iOS Simulator' build 2>&1 | tail -60\`
   - SwiftPM package: \`swift build 2>&1\`
   - Lint: \`if command -v swiftlint >/dev/null 2>&1; then swiftlint lint --quiet 2>&1; fi\`
2. Separate project/dependency resolution errors from Swift compiler errors. Fix **configuration/dependency errors first**, then compiler errors in dependency order.
3. Apply the smallest fix for one error at a time—do not refactor unrelated code or add \`// swiftlint:disable\` without approval.
4. Re-run the build after each fix, then run \`xcodebuild test\` or \`swift test\`.
5. **Stop conditions**: Stop and report if the same error persists after 3 attempts, introduces more errors, or requires architectural or version-bump decisions.

## 2. Common Swift, Objective-C & Concurrency Fix Patterns
- **Missing symbol / import**: Add missing \`import Module\`, check target membership in \`project.pbxproj\` / \`Package.swift\`, or expose headers in \`*-Bridging-Header.h\` / \`module.modulemap\`.
- **ObjC/Swift circular header includes**: Use \`@class Foo;\` / \`@protocol Bar;\` forward declarations in \`.h\` files and import concrete headers in \`.m\` files.
- **\`Sendable\` / actor isolation error**: Add \`Sendable\` (\`NS_SWIFT_SENDABLE\` in ObjC) conformance to value types, mark UI callers \`@MainActor\`, use \`await\` across actor boundaries, or scope \`@preconcurrency import\` to adapter files.
- **Type-checker timeout**: Break complex SwiftUI \`body\` expressions into smaller computed properties or subviews with explicit types.

## 3. SPM & CocoaPods Troubleshooting
- SwiftPM: \`swift package resolve\`, \`swift package show-dependencies\`, or \`swift package reset && swift package resolve\`.
- CocoaPods: \`pod install --repo-update\` only when \`Podfile\` changed; keep \`Package.resolved\` / \`Podfile.lock\` in sync and avoid local absolute paths in \`project.pbxproj\`.
- Clean derived state if stale: \`xcodebuild clean -scheme <Scheme>\`.

## 4. Deployment Target, Info.plist, Entitlements & Signing Guardrails
- Never raise \`IPHONEOS_DEPLOYMENT_TARGET\`, \`SWIFT_VERSION\`, or major SPM/CocoaPods versions without explicit owner approval.
- Keep privacy usage descriptions (\`NSCameraUsageDescription\`, \`NSFaceIDUsageDescription\`, etc.) minimal and accurate, and audit \`*.entitlements\` diffs (\`keychain-access-groups\`, \`aps-environment\`, \`associated-domains\`).
- Never commit \`.p12\`, \`.mobileprovision\`, \`AuthKey_*.p8\`, \`ExportOptions.plist\` secrets, or hardcoded API keys.
`
