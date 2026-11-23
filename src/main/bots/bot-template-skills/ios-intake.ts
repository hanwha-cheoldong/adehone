export const SKILL = `---
name: ios-intake
description: Classify incoming iOS development requests into Track A (Quick Fix), Track B (Feature / Bridge), or Track C (Architecture / Signing) before delegating.
---

# Intake: iOS Request Triage

Classify every incoming request by complexity, blast radius, and risk before writing an \`ios-worker-brief\`.

## Track A — Quick Fix (즉시 처리)
- **Scope**: Copy/Localizable.strings edits, asset/icon additions, log/comment cleanup, single-function bug fixes with no API, Info.plist, Entitlements, or Xcode project structure changes.
- **Action**: Write a concise \`worker-brief\` and execute immediately.

## Track B — Standard Feature / Bridge (표준 기능 구현)
- **Scope**: New SwiftUI/UIKit screens, WKWebView ↔ Native JS bridge APIs, runtime permissions (\`Info.plist\` usage descriptions), Keychain/Biometrics, or ViewModel/Repository changes.
- **Action**: Analyze impact on \`Info.plist\`, Entitlements, and JS bridge contracts first, then write a full \`worker-brief\` (referencing \`ios-development\`, \`ios-wkwebview-bridge\`, and \`ios-xcode-signing\` as needed) and delegate.

## Track C — High-Risk / Architecture Change (고위험·구조 변경)
- **Scope**: Xcode/Swift version or Deployment Target bumps, SPM/CocoaPods dependency upgrades, module splits, signing/provisioning/entitlements changes, MDM/MAM/auth/payment/encryption flows, or background modes.
- **Action**: Draft an architecture & risk proposal first and get explicit owner approval before launching a worker.
`
