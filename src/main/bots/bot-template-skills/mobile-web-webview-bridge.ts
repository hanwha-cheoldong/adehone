import { MOBILE_WEB_BRIDGE_CLIENT } from './mobile-web-bridge-client'
import { WEBVIEW_BRIDGE_PROTOCOL, WEBVIEW_BRIDGE_PROTOCOL_PATH } from './webview-bridge-protocol'

export const SKILL = `---
name: mobile-web-webview-bridge
description: Frontend WebView JS bridge client for Android (addWebMessageListener / JavascriptInterface) and iOS (WKScriptMessageHandler) — shared wire protocol for 11 Device APIs, origin checks, timeouts, fallback, and Android/iOS bot collaboration.
---

# Mobile Web ↔ Native WebView Bridge Guide

Implement and maintain the web side of the bridge to the Android and iOS native shells.

- \`references/bridge-protocol.md\` — wire contract shared with the Android and iOS bots: channel names, envelopes, \`action\` strings, payloads, error codes, events, and how to sync. **Read it before any bridge change.**
- \`references/bridge-client.ts\` — reference client implementing that contract.
- \`references/device-apis.md\` — native counterpart and standalone-browser fallback for each of the 11 Device APIs.

## 1. One Typed Adapter
- Components never touch \`window.AppBridge\` or \`window.webkit\` directly; all calls go through one client.
- Reuse the project's existing client. If there is none, adapt \`references/bridge-client.ts\`.
- Calls resolve to \`{ id, ok, data }\` or \`{ id, ok: false, error }\`; they do not throw for expected failures. Handle \`BRIDGE_UNAVAILABLE\`, \`UNSUPPORTED_ACTION\`, \`PERMISSION_DENIED\`, \`USER_CANCELLED\`, and \`TIMEOUT\` in the UI.
- Validate each action's \`data\` with a schema (for example, Zod) before using it.

## 2. Standalone Browser and Older App Versions
- With no native host, return \`BRIDGE_UNAVAILABLE\` and use the web fallback in \`references/device-apis.md\` only where the product contract allows it.
- Inside a host, check \`getAppInfo().data.actions\` before showing a native-only feature, so newer web releases keep working in older apps.

## 3. Lifecycle
- Create one client per document. Unsubscribe event listeners when components unmount, and call \`cancelPending()\` on \`pagehide\`.
- Use \`setBackHandlerMode('web')\` only while an overlay or nested route needs back handling, and restore \`native\` when it closes.

## 4. Origin and Security
- For \`window.postMessage\` / iframe communication, set an explicit \`targetOrigin\` (never \`'*'\`) and check \`event.origin\` against an allowlist.
- Never keep native-supplied tokens or PII in \`localStorage\` / \`sessionStorage\`; use \`secureStorage\` or \`HttpOnly; Secure; SameSite\` cookies.
- Keep CSP strict: any script on an allowed page can call the bridge, so XSS reaches native features.

## 5. Collaboration with the Native Bots
1. Start from the Capability Contract attached to the \`[MWB]\` work item. If it is missing, ask the planning bot for it.
2. Before adding or changing an \`action\`, payload field, error code, or event, send the proposal as described in section 6 of \`references/bridge-protocol.md\`.
3. Report platform differences you find (origin handling, hardware back vs. swipe-back, safe-area double padding, file transfer) to the planning bot before merging.
4. Mock-based tests prove only the web side. Mark native integration as unverified until it has run against a real Android and iOS host.
`

export const SKILL_FILES: Readonly<Record<string, string>> = {
  [WEBVIEW_BRIDGE_PROTOCOL_PATH]: WEBVIEW_BRIDGE_PROTOCOL,
  'references/bridge-client.ts': MOBILE_WEB_BRIDGE_CLIENT,
  'references/device-apis.md': `# Mobile Web — Native Counterparts and Browser Fallbacks

Action names, payloads, and results are in \`bridge-protocol.md\`; this file does not repeat them.

| # | Device API | Android | iOS | Standalone browser fallback |
|---|---|---|---|---|
| 1 | 생체 인증 | \`BiometricPrompt\` | \`LAContext\` | \`BRIDGE_UNAVAILABLE\`; WebAuthn passkey only if contracted |
| 2 | 소셜 로그인 & Passkeys | Credential Manager / Custom Tabs | \`ASAuthorizationController\` / \`ASWebAuthenticationSession\` | Web OAuth with PKCE if contracted; no \`client_secret\` in the bundle |
| 3 | 보안 저장소 | \`AndroidKeyStore\` + DataStore/Tink | Keychain Services | None. Never downgrade secrets to \`localStorage\`; use \`HttpOnly\` session cookies |
| 4 | 카메라 & 미디어 피커 | CameraX / \`PickVisualMedia\` | \`AVFoundation\` / \`PHPickerViewController\` | \`<input type="file" accept="image/*">\` (\`capture="environment"\` to prefer the camera) |
| 5 | 위치 정보 | \`FusedLocationProviderClient\` | \`CLLocationManager\` | \`navigator.geolocation\` with timeout and denial handling |
| 6 | 햅틱 | \`VibratorManager\` | \`UIFeedbackGenerator\` | No-op |
| 7 | 푸시 & 알림 설정 | FCM | APNs / \`UNUserNotificationCenter\` | Web Push only if PWA push is in scope |
| 8 | 외부 URL / 인앱 브라우저 | \`Intent.ACTION_VIEW\` / \`CustomTabsIntent\` | \`UIApplication.open\` / \`SFSafariViewController\` | \`window.open(url, '_blank', 'noopener,noreferrer')\` after validating \`https:\` |
| 9 | 공유 시트 | \`Intent.ACTION_SEND\` | \`UIActivityViewController\` | \`navigator.share\`, then clipboard copy |
| 10 | 뒤로가기 제어 | \`OnBackPressedDispatcher\` | Navigation bar / swipe-back | Router history |
| 11 | 앱 정보 & 네트워크 | \`PackageInfoCompat\` / \`ConnectivityManager\` | \`Bundle.main\` / \`NWPathMonitor\` | \`navigator.onLine\` + build-time version |
`
}
