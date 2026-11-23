export const SKILL = `---
name: android-webview-bridge
description: Sub-skill for Android WebView ↔ Native JS bridge contracts, origin allowlists, WebSettings hardening, back navigation, and R8 keep rules.
---

# Android WebView & JS Bridge

Reference this sub-skill whenever implementing or reviewing hybrid WebView features.

## 1. Bridge Transport & Origin Security
- Prefer \`WebViewCompat.addWebMessageListener\` with explicit \`allowedOriginRules\` over \`addJavascriptInterface\`.
- If using \`@JavascriptInterface\`, annotate every exposed method with \`@Keep\`, attach only on allowlisted \`https://\` origins, and validate \`webView.url\` origin on the main thread before executing native actions.
- Use a consistent JSON envelope: \`{ id, action, payload }\` -> \`{ id, ok, data, error: { code, message } }\`.
- Treat all JS inputs as untrusted: validate types, bounds, URL schemes, and storage key allowlists.

## 2. WebSettings Hardening
- \`javaScriptEnabled = true\` only for trusted app origins.
- \`allowFileAccess = false\`, \`allowContentAccess = false\`, \`allowFileAccessFromFileURLs = false\`, \`allowUniversalAccessFromFileURLs = false\`.
- \`mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW\`.
- \`safeBrowsingEnabled = true\`.
- Never override \`WebViewClient.onReceivedSslError\` with \`handler.proceed()\`.

## 3. Navigation, Lifecycle & External Intents
- Handle \`OnBackPressedDispatcher\` cleanly: delegate to SPA/JS history or \`webView.canGoBack()\` before calling \`finish()\`.
- Forward \`onPause()\`, \`onResume()\`, and \`destroy()\` to avoid leaked timers/audio.
- Block arbitrary \`intent://\` URIs in \`shouldOverrideUrlLoading\`; allow only \`https://\` or explicitly allowlisted app schemes with \`ActivityNotFoundException\` handling.
`
