export const SKILL = `---
name: ios-development
description: iOS development guide for Swift, SwiftUI, UIKit, Swift Concurrency, transport encryption, Keychain/Face ID, MDM/MAM, and APNs push notifications.
---

# iOS Development

Follow modern Apple platform best practices (Swift 5.9+/6, SwiftUI, UIKit interop, Swift Concurrency \`async/await\`/\`@MainActor\`, Observation/Combine) and avoid deprecated APIs (\`UIWebView\`, \`NSURLConnection\`, \`SecRandomCopyBytes\` misuse, storing secrets in \`UserDefaults\`).

## 1. Architecture & UI
- **State & Concurrency**: Use unidirectional data flow with \`@Observable\` or \`ObservableObject\`, mark UI-bound types/methods \`@MainActor\`, and avoid retain cycles (\`[weak self]\`) in closures/delegates.
- **Layout & Accessibility**: Support Dynamic Type, Safe Area insets, Dark Mode, and VoiceOver labels.

## 2. Transport & Payload Encryption
- **ATS & TLS**: Enforce App Transport Security (TLS 1.2/1.3). Never set \`NSAllowsArbitraryLoads = true\` globally.
- **Certificate Pinning**: Pin SPKI/certificate hashes in \`URLSessionDelegate\` (\`urlSession(_:didReceive:completionHandler:)\`) with at least one backup pin and rotation plan. Never accept untrusted \`SecTrust\` unconditionally.
- **Application Payload E2EE**: Use CryptoKit (\`Curve25519\`/\`P256\` key agreement, \`AES.GCM\` with unique 96-bit nonce and authenticated AAD). Store keys in Keychain with appropriate \`kSecAttrAccessible\` (e.g., \`kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly\`), never in \`UserDefaults\` or plaintext files.

## 3. Native Device APIs
- **Biometrics**: Use \`LocalAuthentication\` (\`LAContext\`) paired with Keychain \`SecAccessControl\` (\`.biometryCurrentSet\`) for cryptographic assurance. Handle \`LAError.userCancel\`, \`biometryLockout\`, and fallback explicitly.
- **Passkeys / Sign in with Apple**: Prefer \`AuthenticationServices\` (\`ASAuthorizationController\`) and validate identity tokens/nonces on the backend.
- **APNs Push**: Handle \`UNUserNotificationCenterDelegate\`, validate push payload signatures/schemas before routing deep links, and never include sensitive PII in unencrypted push payloads without Notification Service Extension decryption.
`
