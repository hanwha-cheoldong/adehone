export const SKILL = `---
name: ios-security-webview
description: Enterprise iOS security and platform guide — transport/E2EE encryption, hardened WKWebView JS bridge, native/JS Device APIs, MDM/MAM, secure keypad, and APNs push notifications.
---

# iOS Enterprise Security, WKWebView Bridge & Device APIs

Reference this skill when implementing or reviewing Swift or Objective-C encryption, \`WKWebView\` ↔ Native JS bridges, native Device APIs, MDM/MAM compliance, secure keypads, or APNs push notifications. Never use deprecated \`UIWebView\` or \`NSURLConnection\`. See \`references/device-apis.md\` for the full 11-API native/JS specification.

## 1. Transport & Payload Encryption (구간 암호화)
- **ATS & TLS**: Enforce App Transport Security (TLS 1.2/1.3). Never set \`NSAllowsArbitraryLoads = true\` globally.
- **Certificate Pinning**: Pin SPKI/certificate hashes in \`URLSessionDelegate\` (\`urlSession(_:didReceive:completionHandler:)\`) with at least one backup pin and a rotation plan. Never accept untrusted \`SecTrust\` unconditionally.
- **Payload E2EE**: Use \`CryptoKit\` (\`Curve25519\`/\`P256\` key agreement, \`AES.GCM\` with 256-bit key, unique 96-bit nonce, and authenticated AAD). Store keys/tokens in **Keychain Services** with strict \`kSecAttrAccessible\` (e.g., \`kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly\`), never in \`UserDefaults\` or plaintext files. Zero out sensitive \`Data\` buffers after use.

## 2. WKWebView ↔ Native JS Bridge Hardening
- **Origin Allowlist**: Verify both \`webView.url\` and \`message.frameInfo.securityOrigin\` against an explicit \`https://\` allowlist before executing any native action. Reject \`http://\` and untrusted iframes (\`!message.frameInfo.isMainFrame\`).
- **Configuration & Lifecycle**: Disable unnecessary file access (\`allowFileAccessFromFileURLs = false\`), isolate content worlds (\`WKContentWorld.defaultClient\`), and remove \`WKScriptMessageHandler\`s in \`deinit\` / \`dismantleUIView\` (or use a weak proxy) to prevent retain cycles.
- **Structured Envelope**: Standardize messages as \`{ id, action, payload }\` -> \`{ id, ok, data, error: { code, message } }\`. Decode \`message.body\` into strict Swift \`Decodable\` structs rather than raw \`[String: Any]\` casts, and dispatch \`evaluateJavaScript\` on \`@MainActor\` with safely JSON-encoded payloads (never string-interpolate untrusted values into JS).
- **Navigation Guard**: Validate navigation requests in \`WKNavigationDelegate\` (\`decidePolicyFor\`), allowing only \`https://\` or allowlisted app schemes, and never bypass TLS errors in \`didReceive challenge\`.

## 3. MDM & MAM
- **Screen Capture/Recording**: Observe \`UIScreen.capturedDidChangeNotification\` (\`UIScreen.isCaptured\`) and \`UIApplication.userDidTakeScreenshotNotification\` to blur/mask sensitive views; mark sensitive fields \`isSecureTextEntry = true\` and clear snapshots on \`willResignActive\`.
- **Jailbreak/Tamper Detection**: Combine local heuristics (suspicious paths, sandbox write checks, \`dyld\`/Frida checks) with server-verified **App Attest** (\`DCAppAttestService\`). Never log bypass details in release builds.
- **MAM**: Support Managed App Configuration (\`UserDefaults.standard.dictionary(forKey: "com.apple.configuration.managed")\`, read-only), foreground PIN/biometric re-lock, \`NSFileProtectionComplete\` on sensitive files, \`NSURLIsExcludedFromBackupKey\` for local caches, pasteboard restrictions on sensitive inputs, and remote wipe / Keychain token revocation.

## 4. Secure Keypad (보안 키패드)
- Render an in-app randomized SwiftUI/UIKit keypad with \`autocorrectionType = .no\`, \`textContentType = nil\` (no AutoFill/QuickType), hardened VoiceOver (no spoken digits), and obscured snapshot protection.
- Encrypt input in the native layer before returning cipher/token; never pass plaintext PINs to \`WKWebView\` DOM or logs, and zero out input buffers immediately.

## 5. Push Notifications (APNs)
- Handle \`UNUserNotificationCenterDelegate\` and \`application(_:didRegisterForRemoteNotificationsWithDeviceToken:)\`.
- Decrypt encrypted push payloads inside a **Notification Service Extension** (\`UNNotificationServiceExtension\`); never include sensitive PII in unencrypted APNs payloads.
- Validate push deep-link targets against an explicit allowlist before routing, sync device tokens when authenticated, and unregister/delete tokens on logout or remote wipe.
`

export const SKILL_FILES: Readonly<Record<string, string>> = {
  'references/device-apis.md': `# iOS Device APIs (Native Swift & WKWebView JS Bridge)

1. **생체 인증 (Biometric Authentication)**
   - *Native*: \`LocalAuthentication\` (\`LAContext\`) paired with Keychain \`SecAccessControl\` (\`.biometryCurrentSet\`). Handle \`LAError.userCancel\`, \`biometryLockout\`, and passcode fallback explicitly.
   - *JS*: \`authenticateBiometric({ reason })\` -> \`{ authenticated, errorCode }\`.

2. **소셜 로그인 & Passkeys (Social Login)**
   - *Native*: \`AuthenticationServices\` (\`ASAuthorizationController\` for Sign in with Apple / Passkeys; \`ASWebAuthenticationSession\` with OAuth 2.0 PKCE for third-party providers). Never embed \`client_secret\`; validate \`state\`/\`nonce\` and identity tokens server-side.
   - *JS*: \`socialLogin({ provider })\`.

3. **Keychain Services / Secure Storage**
   - *Native*: \`SecItemAdd\`/\`SecItemCopyMatching\`/\`SecItemDelete\` with \`kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly\` (or CryptoKit AEAD over Data Protection files). Never store tokens/PII in \`UserDefaults\`.
   - *JS*: \`secureStorage.set/get/remove(key, value)\` with explicit namespace/key allowlist.

4. **Camera & Photo Picker**
   - *Native*: \`AVFoundation\` (\`AVCaptureSession\`) with \`NSCameraUsageDescription\` and runtime \`AVCaptureDevice.requestAccess(for: .video)\`; \`PhotosUI\` (\`PHPickerViewController\` / \`PhotosPicker\`) without broad photo library permissions. Strip EXIF and validate MIME/size.
   - *JS*: \`openCamera(options)\` / \`pickMedia(options)\` -> temporary file handle; clean up temp files after upload.

5. **CoreLocation**
   - *Native*: \`CLLocationManager\` with \`NSLocationWhenInUseUsageDescription\`, \`CLLocationUpdate.liveUpdates()\` or \`requestLocation()\`. Handle authorization changes, reduced accuracy, and timeouts.
   - *JS*: \`getLocation({ accuracy, timeoutMs })\` -> \`{ lat, lng, accuracy, timestamp }\`.

6. **Haptics (CoreHaptics / UIFeedbackGenerator)**
   - *Native*: \`UIImpactFeedbackGenerator\` / \`UINotificationFeedbackGenerator\` or SwiftUI \`.sensoryFeedback(...)\`.
   - *JS*: \`vibrate({ style })\`.

7. **APNs & Notification Settings**
   - *Native*: \`UNUserNotificationCenter.current()\`, \`requestAuthorization(options: [.alert, .badge, .sound])\`, \`getNotificationSettings()\`, \`UIApplication.openNotificationSettingsURLString\`.
   - *JS*: \`getPushToken()\`, \`getNotificationSettings()\`, \`openNotificationSettings()\`.

8. **External URL / SFSafariViewController**
   - *Native*: \`SFSafariViewController\` for in-app web auth/content; \`UIApplication.shared.open(_:)\` with explicit scheme allowlist and Universal Links validation.
   - *JS*: \`openExternalUrl({ url })\` / \`openSafariView({ url })\`.

9. **ShareSheet (UIActivityViewController)**
   - *Native*: \`UIActivityViewController\` (or SwiftUI \`ShareLink\`) with explicit \`popoverPresentationController\` anchor on iPad.
   - *JS*: \`share({ title, text, url })\`.

10. **WKWebView Navigation & Back Control**
    - *Native*: Coordinate \`webView.canGoBack\` / \`allowsBackForwardNavigationGestures\` and SPA history with native navigation bars.
    - *JS*: \`onBackPressed\` event / \`setBackHandlerMode('native' | 'web')\`.

11. **App Info & Network Status**
    - *Native*: \`Bundle.main.infoDictionary\` (\`CFBundleShortVersionString\`, \`CFBundleVersion\`); \`Network.NWPathMonitor\` for connectivity and interface type. Never use deprecated \`SCNetworkReachability\` synchronously on main thread.
    - *JS*: \`getAppInfo()\`, \`getNetworkStatus()\`.
`
}
