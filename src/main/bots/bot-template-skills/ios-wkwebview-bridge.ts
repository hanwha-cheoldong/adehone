export const SKILL = `---
name: ios-wkwebview-bridge
description: WKWebView ↔ Native JS bridge contracts, origin allowlists, WKWebViewConfiguration hardening, and script message handler hygiene.
---

# iOS WKWebView JS Bridge Guide

## 1. Security & Configuration
- **Origin Allowlist**: Verify \`webView.url\` and \`message.frameInfo.securityOrigin\` against an explicit \`https://\` allowlist before executing any native action. Reject \`http://\` and untrusted iframes (\`!message.frameInfo.isMainFrame\`).
- **Configuration**: Disable unnecessary file access (\`allowFileAccessFromFileURLs = false\`), use \`WKContentWorld.page\` or isolated \`.defaultClient\` appropriately, and register handlers via \`WKUserContentController.add(_:name:)\` (removing them on teardown to prevent retain cycles).

## 2. Bridge Envelope & Threading
- **Structured Envelope**: Standardize messages as \`{ id, action, payload }\` -> \`{ id, ok, data, error: { code, message } }\`.
- **Input Validation**: Treat all \`message.body\` fields from JS as untrusted; decode into strict Swift \`Decodable\` structs rather than raw \`[String: Any]\` casts.
- **Main Thread**: Dispatch \`evaluateJavaScript\` callbacks on \`@MainActor\` / \`DispatchQueue.main\` and safely JSON-encode response payloads (never string-interpolate untrusted values into JS).
`
