export const SKILL = `---
name: swift-code-review
description: Swift and iOS code reviewer — severity-ranked checks for safety, error handling, Swift Concurrency, ARC memory management, protocol-oriented design, SwiftUI, and Xcode/SPM hygiene.
---

# Swift & iOS Code Review

Inspect \`git diff\` (and surrounding context) and report only high-confidence findings ranked by severity.

## Review Checklist

### CRITICAL (Must Fix — Blocks Merge)
- **Safety**:
  - Force unwrapping (\`!\`), \`try!\`, or \`as!\` in production code paths
  - Hardcoded API keys/secrets/tokens, committed \`.p12\`/\`.mobileprovision\`/\`AuthKey_*.p8\`, or sensitive data in \`UserDefaults\` instead of Keychain
  - \`NSAllowsArbitraryLoads = true\`, unvalidated \`SecTrust\`, or missing certificate pinning on sensitive endpoints
  - Unvalidated \`WKWebView\` origins/iframes, raw string interpolation into \`evaluateJavaScript\`, SQL/command injection, or unvalidated deep links
  - Objective-C format-string bugs (\`NSLog(userInput)\` instead of \`NSLog(@"%@", userInput)\`), unsafe C string functions (\`strcpy\`/\`sprintf\`), or missing nullability (\`nonnull\`/\`nullable\`) causing Swift \`!\` crashes
- **Error Handling & Architecture**:
  - Empty \`catch {}\` blocks or \`try?\` discarding critical errors; \`fatalError()\` for recoverable conditions
  - \`Domain\` importing \`SwiftUI\`, \`UIKit\`, \`SwiftData\`, or \`WebKit\`, or leaking \`NSObject\`/\`@objc\` into pure-Swift \`Domain\`

### HIGH (Should Fix Before Merge)
- **Concurrency**: Shared mutable state without actor isolation; \`@Sendable\` violations; synchronous I/O or \`Thread.sleep\` on \`@MainActor\`; unstructured \`Task {}\` without cancellation; actor reentrancy assumptions across \`await\`; \`withCheckedContinuation\` resumed zero or multiple times from Objective-C callbacks.
- **Memory Management (ARC)**: Strong \`self\` capture in escaping closures or Objective-C blocks (missing \`__weak typeof(self)\`); non-\`weak\` delegates (\`strong\`/\`retain\` in ObjC); \`WKScriptMessageHandler\` not removed on teardown.
- **Code Quality & Protocols**: Functions > 50 lines; deep nesting (> 4 levels); \`Any\`/\`AnyObject\` abuse; missing \`Sendable\`/\`Equatable\`/\`Hashable\` conformances; \`default:\` hiding evolving enum cases instead of \`@unknown default\`.

### MEDIUM
- **Performance & Best Practices**: \`var\` where \`let\` suffices; \`class\` where \`struct\` suffices; \`print()\`/\`NSLog()\` in production instead of \`os.Logger\`; \`@objcMembers\` overuse; missing \`private\`/\`fileprivate\` access control; unjustified \`// swiftlint:disable\`; missing \`id\` in SwiftUI \`List\`/\`ForEach\`.

### LOW
- **Xcode / SPM**: Unused dependencies, inconsistent \`Package.resolved\`/\`Podfile.lock\`, missing \`///\` doc comments on \`public\` APIs.

## Report Format

\`\`\`text
[SEVERITY] Short title
File: Sources/.../File.swift:42
Issue: What is wrong and why it matters.
Fix: Concrete minimal fix.

## Review Summary
| Severity | Count | Status |
|----------|-------|--------|
| CRITICAL | 0     | pass   |
| HIGH     | 0     | pass   |
| MEDIUM   | 0     | info   |
| LOW      | 0     | note   |

Verdict: APPROVE (no CRITICAL/HIGH) | BLOCK (fix CRITICAL/HIGH first)
\`\`\`
`
