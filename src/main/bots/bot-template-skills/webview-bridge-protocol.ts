// One source for the wire contract: each bot only gets its own skills, so every side installs a copy.
export const WEBVIEW_BRIDGE_PROTOCOL_PATH = 'references/bridge-protocol.md'

export const WEBVIEW_BRIDGE_PROTOCOL = `# WebView Bridge Protocol (baseline v1)

The same file is installed for the Product planning, Android, iOS, and Mobile web template bots. Read your own copy; you cannot rely on reading another bot's skills.

## 0. Which contract wins
1. The product's approved Capability Contract (SSOT).
2. A bridge already shipped in the codebase. Do not rename or reshape it to match this file; record it in the Capability Contract.
3. This baseline, for new bridges or anything the two above leave unspecified.

Record every difference from this baseline in the Capability Contract.

## 1. Channel names and delivery

| Direction | Android (preferred) | Android (fallback) | iOS |
|---|---|---|---|
| Web -> native | \`window.AppBridge.postMessage(json)\` via \`addWebMessageListener\` | \`window.AppBridge.postMessage(json)\` via \`@JavascriptInterface\` | \`window.webkit.messageHandlers.AppBridge.postMessage(json)\` |
| Native -> web | \`replyProxy.postMessage(json)\`, received by \`window.AppBridge.onmessage\` (\`event.data\`) | \`evaluateJavascript\` calling \`window.__appBridgeReceive(quotedJson)\` | \`callAsyncJavaScript("window.__appBridgeReceive?.(message)", arguments: ["message": json], in: nil, in: .page)\` |

- Both directions carry **one JSON string**. Native never concatenates untrusted values into script source: Android quotes the whole string with \`JSONObject.quote\`; iOS passes it through \`arguments\`.
- Android preferred path: check \`WebViewFeature.WEB_MESSAGE_LISTENER\`, set explicit \`allowedOriginRules\`, and reject \`isMainFrame == false\`.
- Android fallback: \`@JavascriptInterface\` objects are visible to **every frame**, and checking \`webView.url\` does not identify the caller. Use it only where untrusted iframes cannot load.
- Android preferred path can push events only after the page has sent a message (that message supplies \`replyProxy\`). Drop the stored proxy on navigation.
- iOS: register the handler in the **\`.page\`** content world. A handler in an isolated world is invisible to page JavaScript. Verify \`message.frameInfo.isMainFrame\` and \`securityOrigin\` on every message.
- \`window.__appBridgeReceive\` is callable by any script on the page, so replies are not proof of anything. Validate their shape, and make servers verify tokens and security decisions.

## 2. Envelopes

\`\`\`text
Request   { "id": string, "action": string, "payload": object }       // payload is {} when empty
Success   { "id": string, "ok": true,  "data": object }
Failure   { "id": string, "ok": false, "error": { "code": string, "message": string } }
Event     { "event": string, "data": object }                        // native-initiated, no id
\`\`\`

- \`id\` is unique per document load. Each request gets exactly one reply with the same \`id\`.
- Unknown extra fields are ignored. Removing or retyping a field is a breaking change and raises \`bridgeVersion\`.

## 3. Error codes

| Code | Raised by | Meaning |
|---|---|---|
| \`BRIDGE_UNAVAILABLE\` | Web | No native host (standalone browser) |
| \`TIMEOUT\` | Web | No reply in time; the native action may still complete |
| \`ABORTED\` | Web | Caller cancelled or the page is going away |
| \`UNSUPPORTED_ACTION\` | Native | This app version does not implement the action |
| \`INVALID_PAYLOAD\` | Native | Payload failed validation |
| \`ORIGIN_NOT_ALLOWED\` | Native | Caller origin or frame rejected (reply only if safe to) |
| \`PERMISSION_DENIED\` | Native | OS permission denied or restricted |
| \`USER_CANCELLED\` | Native | The user dismissed the system UI |
| \`LOCKED_OUT\` | Native | Biometric lockout |
| \`NOT_AVAILABLE\` | Native | Hardware or feature missing, disabled, or not enrolled |
| \`INTERNAL_ERROR\` | Either | Anything else; never include secrets or stack traces |

Time limits: 10s by default. Actions that wait on the user (\`authenticateBiometric\`, \`socialLogin\`, \`openCamera\`, \`pickMedia\`, \`share\`, and any call that shows a permission prompt) get 5 minutes. Do not auto-retry a timed-out call that changes state.

## 4. Actions (the 11 Device APIs)

\`action\` is exactly the string in this table.

| # | action | payload | data on success |
|---|---|---|---|
| 1 | \`authenticateBiometric\` | \`{ reason }\` | \`{ authenticated: true }\` (failures use \`error.code\`) |
| 2 | \`socialLogin\` | \`{ provider, state, nonce }\` | \`{ provider, authorizationCode?, idToken? }\` (server verifies) |
| 3 | \`secureStorage.set\` | \`{ key, value }\` | \`{}\` |
| 3 | \`secureStorage.get\` | \`{ key }\` | \`{ value: string \\| null }\` |
| 3 | \`secureStorage.remove\` | \`{ key }\` | \`{}\` |
| 4 | \`openCamera\` | \`{ maxDimension?, quality? }\` | \`{ items: [{ fileId, mimeType, size }] }\` |
| 4 | \`pickMedia\` | \`{ accept: ("image" \\| "video")[], multiple? }\` | \`{ items: [{ fileId, mimeType, size }] }\` |
| 5 | \`getLocation\` | \`{ accuracy: "coarse" \\| "balanced" \\| "high", timeoutMs }\` | \`{ lat, lng, accuracy, timestamp }\` (meters, epoch ms) |
| 6 | \`vibrate\` | \`{ style: "light" \\| "medium" \\| "heavy" \\| "success" \\| "warning" \\| "error" }\` | \`{}\` |
| 7 | \`getPushToken\` | \`{}\` | \`{ token: string \\| null, provider: "fcm" \\| "apns" }\` |
| 7 | \`getNotificationSettings\` | \`{}\` | \`{ status: "granted" \\| "denied" \\| "notDetermined" }\` |
| 7 | \`openNotificationSettings\` | \`{}\` | \`{}\` |
| 8 | \`openExternalUrl\` | \`{ url }\` (leaves the app) | \`{}\` |
| 8 | \`openInAppBrowser\` | \`{ url }\` (Custom Tabs / SFSafariViewController) | \`{}\` |
| 9 | \`share\` | \`{ title?, text?, url? }\` | \`{ completed: boolean \\| null }\` (\`null\`: OS cannot tell) |
| 10 | \`setBackHandlerMode\` | \`{ mode: "native" \\| "web" }\` | \`{}\` |
| 11 | \`getAppInfo\` | \`{}\` | \`{ platform: "android" \\| "ios", appVersion, buildNumber, bridgeVersion: 1, actions: string[] }\` |
| 11 | \`getNetworkStatus\` | \`{}\` | \`{ online, type: "wifi" \\| "cellular" \\| "ethernet" \\| "none" \\| "unknown" }\` |

- Feature-detect with \`getAppInfo().actions\`; never infer support from the app version or user agent.
- \`secureStorage\` keys are allowlisted natively.
- URLs are validated natively against a scheme and host allowlist.
- **File bytes:** \`fileId\` is an opaque handle, not a loadable URL. How its bytes reach the web or server (for example, a native upload action returning a server asset id) is an \`OPEN\` decision to lock in the Capability Contract before building actions 4. Add any new action it needs there. Do not return \`content://\` or \`file://\` paths.

## 5. Events

| event | data | Rule |
|---|---|---|
| \`onBackPressed\` | \`{}\` | Sent only while mode is \`web\`. The web closes the top overlay or navigates back, and sets \`native\` once nothing is left to handle. |

Native resets the mode to \`native\` on every new document load so a crashed or stale page cannot trap the user. While mode is \`web\`, iOS disables \`allowsBackForwardNavigationGestures\` and routes its own back control to this event. Add new events to the Capability Contract before emitting them.

## 6. Keeping the bots in sync

Raise a mismatch or contract change before coding it:

1. Run \`orca bot list\` (use the Orca CLI form your own instructions give) and pick the bot by what it is for; names can differ from template names.
2. Send \`orca orchestration send --to bot:<name> --type question|handoff|status --subject "<title>" --body "<message>"\`. Use \`question\` when you need an answer, \`handoff\` when the job moves to them, and \`status\` for information only.
3. Write a self-contained body: contract version, action or event, current and proposed payload/data/error codes, affected platforms, what blocks, and what you need back. Quote the text itself, or give an absolute path only when that bot runs on the same computer.
4. The planning bot owns the Capability Contract; send contract changes there. If there is no planning bot, ask your owner to approve them.
5. If a bot is not listed (not created, or on another computer), give your owner the message to relay.

A sent message is not agreement. Keep the item marked blocked until the answer or an updated contract arrives.
`
