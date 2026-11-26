export const SKILL = `---
name: mobile-web-code-review
description: Use for every request to review a diff, change, or pull request in a web project. Severity-ranked Mobile Web review (CRITICAL/HIGH/MEDIUM/LOW) covering XSS/CSP/origin security, form rate limits, React/Vue render performance, WebView bridge parity, 100dvh/safe-area, Core Web Vitals, and accessibility.
---

# Mobile Web Code Review

Review changed files systematically and classify every finding by severity (**CRITICAL**, **HIGH**, **MEDIUM**, **LOW**) with exact \`file:line\` references and concrete fixes.

## Before You Review
Run the Framework Gate in \`mobile-web-patterns\`: read the guide for the project's framework (React/Next.js or Vue/Nuxt). Apply items marked (React) or (Vue) only to that framework. If no guide covers the framework, say so in the report.

## Severity Checklist

### CRITICAL (Must Fix Before Merge)
- **XSS & Injection**: Unsanitized \`innerHTML\`, \`outerHTML\`, \`document.write\`, \`dangerouslySetInnerHTML\`, \`v-html\`, \`{@html}\`, or dynamic \`eval\` / \`new Function\`; user-controlled \`href\`/\`src\`/redirect targets without scheme validation (\`javascript:\`, \`data:\`).
- **WebView Bridge & Origin Bypass**: \`window.postMessage(..., '*')\` without explicit \`targetOrigin\`, missing \`event.origin\` allowlist check, or trusting unvalidated bridge payloads.
- **Secrets & Token Exposure**: Hardcoded API keys/tokens, \`.env*\` committed, private values behind client prefixes (\`NEXT_PUBLIC_*\`, \`VITE_*\`, \`REACT_APP_*\`), or long-lived refresh/auth tokens stored in \`localStorage\` when \`HttpOnly; Secure; SameSite\` cookies or native \`secureStorage\` bridge should be used.
- **Security Header Weakening**: Unapproved relaxation of CSP (\`script-src\`, \`frame-ancestors\`), CORS, cookie security flags, HSTS, \`X-Content-Type-Options\`, \`Referrer-Policy\`, or \`Permissions-Policy\`.
- **Inline Script in CSP**: Adding \`'unsafe-inline'\` or \`'unsafe-eval'\` to \`script-src\` (or to \`default-src\` when it governs scripts) is a relaxation that needs owner approval. See Web Security Checks.
- **CSRF & Server Entry Points**: State-changing forms or cookie-authenticated requests without CSRF protection; server actions without input validation and authorization checks.
- **Hook Rules** (React): Conditional or non-component hook calls, and direct state mutation.

### HIGH (Fix Before Merge Unless Explicitly Waived)
- **Form Abuse Protection**: A submission endpoint (sign-in, sign-up, OTP, password reset, contact, payment, upload) shown to have no rate limit. When you cannot tell, follow Web Security Checks.
- **Third-Party Scripts**: CDN scripts or styles without SRI, or new blocking third-party scripts.
- **Hook & Render Correctness** (React): Missing effect dependencies or cleanup, stale closures, effects used for derived state, \`key={index}\` on lists that reorder or change, and server-only data crossing into client components.
- **Semantics & Keyboard**: Click handlers on non-interactive elements, inputs without labels, or color as the only error signal.
- **Mobile Viewport & Layout Regressions**: Fixed \`100vh\` clipping under mobile keyboards/toolbars instead of \`100dvh\`/\`svh\`; missing \`env(safe-area-inset-*)\` on sticky bars; horizontal overflow at \`320px\`/\`375px\`.
- **Touch & Input Defects**: Interactive targets smaller than \`44x44px\`, missing \`font-size >= 16px\` on inputs (causing iOS zoom), or missing \`BRIDGE_UNAVAILABLE\` fallback when opened in a standalone mobile browser.
- **Bridge Contract Drift**: Method names, request/response envelopes, or error codes diverging from the Capability Contract or \`mobile-web-webview-bridge/references/bridge-protocol.md\`.
- **Error & Network Handling**: Unhandled promise rejections, missing \`AbortController\` cleanup, or missing error/retry states on flaky mobile networks.

### MEDIUM (Should Fix)
- **Unnecessary Re-renders** (React): New object, array, or function props passed to memoized children, inline context values, over-broad store subscriptions, and components defined inside components. Use HIGH when it affects long lists or per-keystroke updates. See the framework guide.
- **Core Web Vitals & Bundle Bloat**: Missing image \`width\`/\`height\` (CLS risk), eager-loading below-the-fold media, importing entire icon/utility libraries without tree-shaking, or animating layout properties (\`top\`/\`left\`/\`width\`) instead of \`transform\`/\`opacity\`.
- **State & Fetching Anti-Patterns**: Duplicating server state in client stores, parent-child fetch waterfalls, or storing shareable filter/tab state only in local component state instead of URL params.
- **Accessibility Gaps**: Missing accessible names on icon buttons, broken focus traps in modals/sheets, or missing \`prefers-reduced-motion\` support.

### LOW (Nit / Polish)
- \`target="_blank"\` links relying on implicit opener isolation instead of \`rel="noopener noreferrer"\`.
- Dead code, unused CSS/props, minor naming or component decomposition improvements.

## Web Security Checks

### Content Security Policy
- Keep scripts on a **nonce** (or hash) policy instead of \`'unsafe-inline'\`, for example \`script-src 'self' 'nonce-{RANDOM}'\`. Adjust origins to the project; do not paste a policy unchanged.
- A nonce must be unpredictable and **new for every response**, set on both the header and each allowed \`<script>\`. A fixed or build-time nonce, or a nonce on cached HTML, protects nothing; use hashes for static pages. Next.js nonces require dynamic rendering.
- CSP2+ browsers ignore \`'unsafe-inline'\` when a nonce or hash is present in that directive, so check the effective policy, including every place headers are set (server, framework config, CDN, \`<meta>\`).

### Forms and Submission Endpoints
Check each new or changed submission for CSRF protection (cookie-authenticated or state-changing), server-side validation, and **rate limiting**.
- Rate limiting is proven only by server, gateway, or infrastructure code or configuration that covers that endpoint. A disabled button, debounce, client-side counter, CAPTCHA widget, or honeypot is not a rate limit.
- When that evidence is not available to you, list it under **Needs server owner confirmation** with the endpoint and the question. It is not passed. Do not build the server side unless asked.

## Output Format
Report findings grouped by severity with \`file:line\`, **Why it matters**, and **Suggested fix**. Then list **Needs server owner confirmation** (or \`None\`) and, when it applies, the missing framework guide. End with one verdict:
- **FAIL**: an unresolved CRITICAL, or a HIGH without an explicit waiver.
- **UNVERIFIED**: no blocking finding, but a required item (such as a rate limit) could not be confirmed. This is not a pass.
- **PASS**: neither of the above.
`
