export const SKILL = `---
name: android-development
description: Android development guide grounded in Google's official Android Skills, plus enterprise transport encryption, native/JS-bridge device APIs, MDM, MAM, secure keypad, and push notifications.
---

# Android Development

Follow modern Android best practices (Kotlin, Jetpack Compose, Coroutines/Flow, Material 3, edge-to-edge, R8/ProGuard) and reference Google's official Android Skills (\`github.com/android/skills\` / \`android skills add\`) for Jetpack, AGP, Navigation, R8, Adaptive UI, AppFunctions, and \`android\`/\`adb\` CLI workflows.

Avoid deprecated patterns (legacy XML when Compose is used, \`AsyncTask\`, \`NetworkInfo\`, unencrypted \`SharedPreferences\`, \`FLAG_MUTABLE\` \`PendingIntent\` without need, or disabling TLS checks).

## 1. Google Official Android Skills Alignment

- **Architecture & UI**: Unidirectional data flow (UI -> ViewModel -> Repository/UseCase), Jetpack Compose with \`StateFlow\`/\`collectAsStateWithLifecycle()\`, edge-to-edge (\`enableEdgeToEdge()\`), and adaptive layouts for phones, foldables, and tablets.
- **Build & Shrink**: Keep AGP and AndroidX BOM up to date, verify R8 rules (\`@Keep\` on reflection/JNI/\`@JavascriptInterface\` targets), and audit APK/AAB size and permissions.
- **Verification**: Run Gradle unit/lint checks and verify behavior on an emulator/device via \`adb\` or Android CLI before reporting done.

## 2. Transport & Payload Encryption (구간 암호화)

### Network Layer (TLS & Pinning)
- Enforce HTTPS (TLS 1.2/1.3) via \`network_security_config.xml\` with \`cleartextTrafficPermitted="false"\`.
- Apply Certificate Pinning (\`OkHttp CertificatePinner\` or \`<pin-set>\` in \`network_security_config.xml\`) with at least one backup pin and an explicit expiration/rotation plan.
- Never implement permissive \`TrustManager\` or \`HostnameVerifier { _, _ -> true }\`.

### Application Payload Layer (E2EE)
- **Key Exchange**: Perform session key agreement using ECDH (e.g., X25519 / P-256) or wrap an ephemeral AES key with the server's RSA-OAEP (SHA-256) public key. Never hardcode symmetric keys in APK/SO or JS.
- **Symmetric Encryption**: Use \`AES/GCM/NoPadding\` (256-bit key, unique random 96-bit IV per request/message, 128-bit auth tag) with AAD binding request metadata (timestamp, nonce, endpoint). Never use \`AES/ECB\` or static IVs.
- **Replay & Memory Hygiene**: Include a monotonic nonce + timestamp in signed/authenticated payloads; zero out sensitive \`ByteArray\`/\`CharArray\` buffers immediately after use and never log plaintext or keys.

## 3. Device APIs (Native Kotlin & WebView JS Bridge)

### JS Bridge Contract & Hardening
When exposing native Device APIs to a WebView:
- Only attach bridges to allowlisted \`https://\` origins (\`WebViewCompat.addWebMessageListener\` preferred over \`addJavascriptInterface\` when targeting modern WebView; if using \`@JavascriptInterface\`, annotate methods with \`@Keep\` and verify \`webView.url\` origin on the main thread before execution).
- Use a structured envelope: \`{ id, action, payload }\` -> \`{ id, ok, data, error: { code, message } }\`.
- Dispatch heavy/blocking work off the main thread and return results on the main thread; validate every parameter from JS as untrusted input.

### Covered Device APIs

1. **생체 인증 (Biometric Authentication)**
   - *Native*: \`androidx.biometric:biometric\` (\`BiometricPrompt\`). Check \`BiometricManager.from(context).canAuthenticate(BIOMETRIC_STRONG or DEVICE_CREDENTIAL)\` first. For cryptographic assurance, bind a \`BiometricPrompt.CryptoObject\` backed by an Android Keystore key with \`setUserAuthenticationRequired(true)\`.
   - *JS*: \`authenticateBiometric({ reason })\` -> returns \`{ authenticated, errorCode }\` (handle user cancel, lockout, and not-enrolled states explicitly).

2. **소셜 로그인 SDK (Social Login SDK)**
   - *Native*: Prefer \`androidx.credentials:credentials\` (Credential Manager) for Google Sign-In / Passkeys, and OAuth 2.0 PKCE via Custom Tabs for third-party providers (Kakao, Naver, etc.). Never embed OAuth \`client_secret\` in the app; verify \`state\`/\`nonce\` and validate ID tokens on the backend.
   - *JS*: \`socialLogin({ provider })\` -> triggers native SDK / Custom Tab flow and returns authorization code or ID token.

3. **EncryptedSharedPreferences / Android Keystore**
   - *Native*: Generate hardware-backed keys in \`AndroidKeyStore\` via \`KeyGenParameterSpec\` (\`PURPOSE_ENCRYPT | PURPOSE_DECRYPT\`, \`BLOCK_MODE_GCM\`, \`ENCRYPTION_PADDING_NONE\`, StrongBox when available). For structured/key-value secrets, prefer DataStore + Tink/Keystore AEAD (or \`EncryptedSharedPreferences\` with \`MasterKey\` in existing codebases). Never store tokens or PII in plain \`SharedPreferences\`.
   - *JS*: \`secureStorage.set/get/remove(key, value)\` -> restrict keys to an explicit namespace/allowlist; never expose raw Keystore aliases to JS.

4. **CameraX / Photo Picker**
   - *Native*: Use \`CameraX\` (\`ProcessCameraProvider\`, \`Preview\`, \`ImageCapture\`, \`ImageAnalysis\`) bound to \`LifecycleOwner\` with \`CAMERA\` runtime permission + rationale. For picking existing photos/videos, use Android Photo Picker (\`PickVisualMedia\` / \`PickMultipleVisualMedia\`) so no broad storage/media permissions are required. Strip/normalize EXIF and validate MIME/size before upload.
   - *JS*: \`openCamera(options)\` / \`pickMedia(options)\` -> returns a temporary \`FileProvider\`/app-scoped URI or compressed image payload; clean up temp files after upload.

5. **FusedLocationProviderClient**
   - *Native*: Use \`LocationServices.getFusedLocationProviderClient(context)\` with \`getCurrentLocation(Priority.PRIORITY_BALANCED_POWER_ACCURACY, cancellationToken)\` (or \`HIGH_ACCURACY\` when needed). Handle \`ACCESS_FINE_LOCATION\` vs \`ACCESS_COARSE_LOCATION\`, location-disabled state, and timeouts.
   - *JS*: \`getLocation({ accuracy, timeoutMs })\` -> returns \`{ lat, lng, accuracy, timestamp }\` or structured permission/timeout error.

6. **Vibrator / HapticFeedback**
   - *Native*: Use \`VibratorManager\` (API 31+) with \`Vibrator\` fallback and \`VibrationEffect.createOneShot\` / \`createPredefined\`, or Compose \`LocalHapticFeedback\`. Declare \`VIBRATE\` permission in \`AndroidManifest.xml\`.
   - *JS*: \`vibrate({ type | durationMs })\` -> cap duration to prevent abuse.

7. **FCM (Push Token) & 알림 설정 (Notification Settings)**
   - *Native*: Retrieve token via \`FirebaseMessaging.getInstance().token\`. Request \`POST_NOTIFICATIONS\` on API 33+, create \`NotificationChannel\`s on startup, and check \`NotificationManagerCompat.areNotificationsEnabled()\`. Deep-link to \`Settings.ACTION_APP_NOTIFICATION_SETTINGS\`.
   - *JS*: \`getPushToken()\`, \`getNotificationSettings()\`, \`openNotificationSettings()\`.

8. **Intent / Custom Tabs / 외부 앱 호출 (External App Launch)**
   - *Native*: Use \`CustomTabsIntent.Builder()\` for in-app web/OAuth pages. For external apps, declare target packages/schemes in \`<queries>\` (API 30+), use \`Intent.ACTION_VIEW\`, and catch \`ActivityNotFoundException\`. Never pass raw untrusted \`intent://\` URIs from a WebView directly to \`startActivity\` (validate scheme/host/package against an allowlist to prevent intent redirection).
   - *JS*: \`openExternalUrl({ url })\` / \`openCustomTab({ url })\` -> validate \`https://\` or allowlisted app schemes.

9. **ShareSheet (Intent.ACTION_SEND)**
   - *Native*: Use \`Intent(Intent.ACTION_SEND)\` wrapped with \`Intent.createChooser(intent, title)\`. Share local files only via \`FileProvider\` with \`FLAG_GRANT_READ_URI_PERMISSION\` and minimal \`file_paths.xml\` scope.
   - *JS*: \`share({ title, text, url })\`.

10. **뒤로가기 (OnBackPressed) & 웹뷰 제어 (WebView Control)**
    - *Native*: Register \`OnBackPressedCallback\` via \`OnBackPressedDispatcher\` (and enable predictive back \`android:enableOnBackInvokedCallback="true"\`). When hosting a WebView, check \`webView.canGoBack()\` or notify SPA history before exiting. Harden \`WebSettings\`: \`allowFileAccess = false\`, \`allowContentAccess = false\`, \`mixedContentMode = MIXED_CONTENT_NEVER_ALLOW\`, \`safeBrowsingEnabled = true\`.
    - *JS*: \`onBackPressed\` event dispatch / \`setBackHandlerMode('native' | 'web')\`.

11. **App Info / 네트워크 상태 (App Info & Network Status)**
    - *Native*: Read version via \`PackageManager.getPackageInfo\` + \`PackageInfoCompat.getLongVersionCode\`. Monitor connectivity via \`ConnectivityManager.registerDefaultNetworkCallback\` checking \`NET_CAPABILITY_INTERNET\` and \`NET_CAPABILITY_VALIDATED\` (and \`TRANSPORT_WIFI\` / \`TRANSPORT_CELLULAR\`). Never use deprecated \`NetworkInfo\`.
    - *JS*: \`getAppInfo()\` -> \`{ packageName, versionName, versionCode, osVersion }\`; \`getNetworkStatus()\` -> \`{ connected, type }\`.

## 4. MDM (Mobile Device Management)

- **Capture 방지 (Screen Capture & Recording Prevention)**:
  - Set \`window.addFlags(WindowManager.LayoutParams.FLAG_SECURE)\` on Activities, Dialogs, and BottomSheets displaying sensitive data.
  - Call \`setRecentsScreenshotEnabled(false)\` on API 33+ for sensitive screens.
  - Register \`Activity.ScreenCaptureCallback\` (API 34+) and \`WindowManager.addScreenRecordingCallback\` (API 35+) to mask/blur sensitive UI or notify the user/session.
- **탈옥/루팅 방지 (Root, Hook & Tamper Detection)**:
  - Combine multiple signals: \`su\` binary/Magisk/KernelSU paths, \`Build.TAGS\` containing \`test-keys\`, writable system partitions, Frida/Xposed port & memory map checks, and **Google Play Integrity API** (verified server-side as the authoritative attestation).
  - Never log detection heuristics or bypass reasons in release builds; enforce policy cleanly (block sensitive actions, wipe session, or show compliance notice).

## 5. MAM (Mobile Application Management)

- Support managed app configuration via \`RestrictionsManager\` (\`app_restrictions.xml\`) for enterprise settings (server URL, policy flags).
- Enforce app-level PIN/biometric lock on foreground return (\`ProcessLifecycleOwner\` idle timeout) and clear cached views on background.
- Prevent data exfiltration: \`android:allowBackup="false"\`, strict \`dataExtractionRules\`, disable clipboard copy/paste on sensitive inputs, keep files in internal \`filesDir\`/\`noBackupFilesDir\`, and support remote wipe / token revocation on policy violation.

## 6. 보안 키패드 가이드 (Secure Keypad)

- Never use standard IME keyboards for PIN, security password, or financial/identity numbers when a secure keypad is required; if a system \`EditText\` is used for general passwords, set \`TYPE_TEXT_VARIATION_PASSWORD\` and \`IME_FLAG_NO_PERSONALIZED_LEARNING\`.
- Render a custom in-app randomized/shuffled keypad (Compose/View) with:
  - \`FLAG_SECURE\` enabled while active.
  - \`importantForAutofill="no"\` and \`importantForAccessibility\` / \`accessibilityLiveRegion\` hardened so key presses are not read aloud or scraped.
  - Visual touch feedback without persistent key-press popups.
- Encrypt input inside the native layer (using the session/E2EE key) before returning an encrypted cipher/token to the caller or JS bridge—never pass plaintext PINs into WebView DOM or logs, and zero out the input buffer immediately after submission.

## 7. 푸시 (Push Notifications)

- **Payload Strategy**: Prefer FCM \`data\` messages over \`notification\`-only messages when consistent foreground/background handling, encrypted payloads, or custom routing is required.
- **Channels & Permissions**: Create \`NotificationChannel\`s with explicit importance/sound/vibration; gate on \`POST_NOTIFICATIONS\` (API 33+).
- **Deep Links & Security**: Use \`PendingIntent.FLAG_IMMUTABLE\` (never \`FLAG_MUTABLE\` for notification taps). Validate deep-link URIs/targets against an allowlist before navigating to prevent intent/route injection.
- **Token Lifecycle**: Handle \`FirebaseMessagingService.onNewToken\`, sync tokens with backend when authenticated, and delete/unbind the token on logout or MAM remote wipe.
`
