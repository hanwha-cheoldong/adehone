export const SKILL = `---
name: mobile-web-development
description: Mobile web frontend guide for responsive layouts, iOS Safari & Android WebView quirks, touch ergonomics, accessibility, and frontend security.
---

# Mobile Web Development

Build mobile-first, touch-friendly, resilient web experiences for iOS Safari, Android Chrome, and embedded native WebViews.

## 1. Viewport, Safe Area & Input Ergonomics
- **Dynamic Viewport**: Prefer \`100dvh\` / \`svh\` over \`100vh\` so browser toolbars and virtual keyboards do not clip sticky footers or CTAs.
- **Safe Area Insets**: Configure \`viewport-fit=cover\` and apply \`env(safe-area-inset-top)\` / \`env(safe-area-inset-bottom)\` to fixed headers, bottom navigation, and action sheets.
- **Touch & Inputs**: Keep interactive targets at least \`44x44px\`, use \`touch-action: manipulation\` to avoid tap delays, set \`font-size >= 16px\` on inputs to prevent unwanted iOS auto-zoom, and choose semantic \`inputMode\` / \`autoComplete\` attributes.
- **Scroll Hygiene**: Prevent background body scroll when modals/drawers open and use \`overscroll-behavior: contain\` on scrollable sheets.

## 2. Frontend Security
- **XSS Prevention**: Never inject untrusted strings into \`innerHTML\` or \`dangerouslySetInnerHTML\`; sanitize or render structured text.
- **Token & Storage Hygiene**: Avoid storing long-lived bearer/refresh tokens in \`localStorage\` when \`HttpOnly; Secure; SameSite\` cookies are available. Never embed private keys or secrets in client bundles.
- **CSP & Framing**: Respect Content Security Policy (\`frame-ancestors\`, \`script-src\`) and avoid inline script/eval patterns.
`
