export const SKILL = `---
name: mobile-web-webview-bridge
description: Frontend WebView JS bridge client adapter for Android JavascriptInterface and iOS WKScriptMessageHandler, with origin checks and timeout handling.
---

# Mobile Web ↔ Native WebView Bridge Guide

## 1. Unified Client Adapter
Abstract platform differences behind a single typed client:
- **iOS (\`WKWebView\`)**: \`window.webkit?.messageHandlers?.<channel>?.postMessage(envelope)\`
- **Android (\`JavascriptInterface\`)**: \`window.<AndroidBridge>?.postMessage(JSON.stringify(envelope))\`
- **Browser Fallback**: Detect standalone mobile browser mode cleanly and return a structured \`BRIDGE_UNAVAILABLE\` error instead of throwing uncaught exceptions.

## 2. Envelope, Timeouts & Security
- **Structured Envelope**: Send \`{ id, action, payload }\` and resolve pending promises via \`{ id, ok, data, error }\` callbacks.
- **Timeouts & Cleanup**: Always attach a timeout per pending request and clean up listeners/pending maps on component unmount.
- **Origin & Message Validation**: For \`window.postMessage\` / iframe communication, always specify an explicit \`targetOrigin\` (never \`'*'\`) and verify \`event.origin\` before handling incoming messages.
`
