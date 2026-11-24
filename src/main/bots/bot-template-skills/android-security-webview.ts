export const SKILL = `---
name: android-security-webview
description: Enterprise Android security and platform guide — transport/E2EE encryption, hardened WebView JS bridge, native/JS Device APIs, MDM/MAM, secure keypad, and FCM push notifications.
---

# Android Enterprise Security, WebView Bridge & Device APIs

Reference this skill when implementing or reviewing encryption, WebView ↔ Native JS bridges, native Device APIs, MDM/MAM compliance, secure keypads, or push notifications. See \`references/device-apis.md\` for the full 11-API native/JS specification.

## 1. Transport & Payload Encryption (구간 암호화)
- **TLS & Pinning**: Enforce HTTPS (TLS 1.2/1.3) via \`network_security_config.xml\` with \`cleartextTrafficPermitted="false"\`. Apply \`OkHttp CertificatePinner\` or \`<pin-set>\` with a backup pin and rotation plan. Never use permissive \`TrustManager\` or \`HostnameVerifier { _, _ -> true }\`.
- **Payload E2EE**: Use ECDH (X25519 / P-256) or RSA-OAEP (SHA-256) key wrapping; never hardcode symmetric keys. Encrypt payloads with \`AES/GCM/NoPadding\` (256-bit key, unique 96-bit IV, 128-bit tag) + AAD (timestamp, nonce, endpoint). Zero out sensitive \`ByteArray\`/\`CharArray\` buffers after use.

## 2. WebView ↔ Native JS Bridge Hardening
- Prefer \`WebViewCompat.addWebMessageListener\` with explicit \`allowedOriginRules\` over \`addJavascriptInterface\`.
- If using \`@JavascriptInterface\`, annotate every exposed method with \`@Keep\`, attach only on allowlisted \`https://\` origins, and verify \`webView.url\` origin on the main thread before execution.
- Use a structured JSON envelope: \`{ id, action, payload }\` -> \`{ id, ok, data, error: { code, message } }\`. Treat all JS input as untrusted and dispatch blocking work off the main thread.
- Harden \`WebSettings\`: \`allowFileAccess = false\`, \`allowContentAccess = false\`, \`allowFileAccessFromFileURLs = false\`, \`allowUniversalAccessFromFileURLs = false\`, \`mixedContentMode = MIXED_CONTENT_NEVER_ALLOW\`, \`safeBrowsingEnabled = true\`. Never call \`handler.proceed()\` in \`onReceivedSslError\`.
- Block arbitrary \`intent://\` URIs in \`shouldOverrideUrlLoading\`; allow only \`https://\` or allowlisted app schemes with \`ActivityNotFoundException\` handling. Handle \`OnBackPressedDispatcher\` cleanly and forward WebView lifecycle (\`onPause\`/\`onResume\`/\`destroy\`).

## 3. MDM & MAM
- **Screen Capture/Recording**: Apply \`FLAG_SECURE\` on sensitive Activities/Dialogs/BottomSheets, \`setRecentsScreenshotEnabled(false)\` (API 33+), \`Activity.ScreenCaptureCallback\` (API 34+), and \`WindowManager.addScreenRecordingCallback\` (API 35+).
- **Root/Tamper Detection**: Combine local heuristics (\`su\`/Magisk/KernelSU, \`test-keys\`, Frida/Xposed checks) with server-verified **Google Play Integrity API**. Never log bypass details in release builds.
- **MAM**: Support \`RestrictionsManager\` (\`app_restrictions.xml\`), foreground PIN/biometric re-lock (\`ProcessLifecycleOwner\`), \`android:allowBackup="false"\`, strict \`dataExtractionRules\`, clipboard restriction on sensitive inputs, internal \`filesDir\`/\`noBackupFilesDir\`, and remote wipe / token revocation.

## 4. Secure Keypad (보안 키패드)
- Render an in-app randomized keypad with \`FLAG_SECURE\`, \`importantForAutofill="no"\`, hardened \`importantForAccessibility\` (no spoken digits), and no persistent key popups.
- Encrypt input in the native layer before returning cipher/token; never pass plaintext PINs to WebView DOM or logs, and zero out input buffers immediately.

## 5. Push Notifications (FCM)
- Prefer FCM \`data\` messages for consistent foreground/background handling and encrypted payloads.
- Create \`NotificationChannel\`s on startup and request \`POST_NOTIFICATIONS\` on API 33+.
- Use \`PendingIntent.FLAG_IMMUTABLE\` and validate deep-link targets against an allowlist. Sync \`onNewToken\` when authenticated and unbind/delete tokens on logout or remote wipe.
`

export const SKILL_FILES: Readonly<Record<string, string>> = {
  'references/device-apis.md': `# Android Device APIs (Native Kotlin & WebView JS Bridge)

1. **생체 인증 (Biometric Authentication)**
   - *Native*: \`androidx.biometric:biometric\` (\`BiometricPrompt\`). Check \`BiometricManager.canAuthenticate(BIOMETRIC_STRONG or DEVICE_CREDENTIAL)\`; bind \`CryptoObject\` backed by an \`AndroidKeyStore\` key with \`setUserAuthenticationRequired(true)\`.
   - *JS*: \`authenticateBiometric({ reason })\` -> \`{ authenticated, errorCode }\`.

2. **소셜 로그인 SDK (Social Login)**
   - *Native*: \`androidx.credentials:credentials\` (Credential Manager) for Google Sign-In / Passkeys; OAuth 2.0 PKCE via Custom Tabs for third-party providers. Never embed \`client_secret\`; validate \`state\`/\`nonce\` and ID tokens server-side.
   - *JS*: \`socialLogin({ provider })\`.

3. **Android Keystore / Encrypted Storage**
   - *Native*: Hardware-backed \`AndroidKeyStore\` AES-GCM keys (\`StrongBox\` when available) + DataStore/Tink AEAD (or \`EncryptedSharedPreferences\` in existing apps). Never store tokens/PII in plain \`SharedPreferences\`.
   - *JS*: \`secureStorage.set/get/remove(key, value)\` with explicit namespace/key allowlist.

4. **CameraX / Photo Picker**
   - *Native*: \`CameraX\` bound to \`LifecycleOwner\` with runtime \`CAMERA\` permission; Android Photo Picker (\`PickVisualMedia\`) for gallery without broad storage permissions. Strip EXIF and validate MIME/size.
   - *JS*: \`openCamera(options)\` / \`pickMedia(options)\` -> temporary \`FileProvider\` URI; clean up temp files after upload.

5. **FusedLocationProviderClient**
   - *Native*: \`getCurrentLocation(Priority.PRIORITY_BALANCED_POWER_ACCURACY, cancellationToken)\`. Handle fine/coarse permissions, disabled GPS, and timeouts.
   - *JS*: \`getLocation({ accuracy, timeoutMs })\` -> \`{ lat, lng, accuracy, timestamp }\`.

6. **Vibrator / HapticFeedback**
   - *Native*: \`VibratorManager\` (API 31+) with \`Vibrator\` fallback or Compose \`LocalHapticFeedback\`; declare \`VIBRATE\`.
   - *JS*: \`vibrate({ type | durationMs })\` (cap duration).

7. **FCM & Notification Settings**
   - *Native*: \`FirebaseMessaging.getInstance().token\`, \`POST_NOTIFICATIONS\` (API 33+), \`NotificationManagerCompat.areNotificationsEnabled()\`, \`Settings.ACTION_APP_NOTIFICATION_SETTINGS\`.
   - *JS*: \`getPushToken()\`, \`getNotificationSettings()\`, \`openNotificationSettings()\`.

8. **Intent / Custom Tabs / External App Launch**
   - *Native*: \`CustomTabsIntent.Builder()\`, \`<queries>\` (API 30+), \`Intent.ACTION_VIEW\` with \`ActivityNotFoundException\` handling and scheme/package allowlist.
   - *JS*: \`openExternalUrl({ url })\` / \`openCustomTab({ url })\`.

9. **ShareSheet (Intent.ACTION_SEND)**
   - *Native*: \`Intent.createChooser(Intent(Intent.ACTION_SEND), title)\` with \`FileProvider\` + \`FLAG_GRANT_READ_URI_PERMISSION\`.
   - *JS*: \`share({ title, text, url })\`.

10. **OnBackPressed & WebView Control**
    - *Native*: \`OnBackPressedDispatcher\` + predictive back (\`android:enableOnBackInvokedCallback="true"\`), coordinating \`webView.canGoBack()\` / SPA history.
    - *JS*: \`onBackPressed\` event / \`setBackHandlerMode('native' | 'web')\`.

11. **App Info & Network Status**
    - *Native*: \`PackageInfoCompat.getLongVersionCode\`; \`ConnectivityManager.registerDefaultNetworkCallback\` (\`NET_CAPABILITY_INTERNET\` & \`NET_CAPABILITY_VALIDATED\`). Never use deprecated \`NetworkInfo\`.
    - *JS*: \`getAppInfo()\`, \`getNetworkStatus()\`.
`
}
