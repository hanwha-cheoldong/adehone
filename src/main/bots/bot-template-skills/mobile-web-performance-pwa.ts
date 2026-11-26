export const SKILL = `---
name: mobile-web-performance-pwa
description: ECC Web Performance & PWA guardrails for Mobile Web — Core Web Vitals targets, bundle budgets, image/font loading, compositor-only motion, and safe Service Worker caching.
---

# Mobile Web Performance & PWA Guardrails

Aligned with ECC \`rules/web/performance.md\`.

## 1. Core Web Vitals Targets
- **LCP** < \`2.5s\`
- **INP** < \`200ms\`
- **CLS** < \`0.1\`
- **FCP** < \`1.5s\`
- **TBT** < \`200ms\`

## 2. Bundle Budget (gzipped)
- **Landing page**: JS < \`150KB\`, CSS < \`30KB\`
- **App page**: JS < \`300KB\`, CSS < \`50KB\`
- **Microsite**: JS < \`80KB\`, CSS < \`15KB\`
- Dynamically import heavy libraries/routes, tree-shake icon/utility imports, and inline only justified critical above-the-fold CSS.

## 3. Image & Font Optimization
- Always set explicit \`width\` and \`height\` (or \`aspect-ratio\`) on images and skeletons to prevent CLS.
- Use \`loading="eager"\` + \`fetchpriority="high"\` for hero media only; \`loading="lazy"\` for below-the-fold assets.
- Serve AVIF or WebP with responsive \`srcset\` sized to rendered dimensions.
- Limit to max 2 font families with \`font-display: swap\`, subsetting, and preloading only critical weights.

## 4. Animation & Network Resilience
- Animate compositor-friendly properties only (\`transform\`, \`opacity\`); apply \`will-change\` narrowly and remove when done.
- Avoid scroll-handler churn; use \`IntersectionObserver\` and passive listeners.
- Design for 3G/4G mobile networks with graceful loading/retry states, \`AbortController\` cancellation, and idempotent mutations.

## 5. Service Worker & Cache Safety
- Never cache authenticated API responses or HTML shells with stale-while-revalidate unless explicitly scoped and versioned.
- Always provide a clean cache-busting update path and avoid serving stale JS bundles that mismatch native WebView bridge versions.
`
