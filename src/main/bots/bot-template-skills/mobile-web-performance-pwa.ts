export const SKILL = `---
name: mobile-web-performance-pwa
description: Mobile web performance (Core Web Vitals, bundle splitting, images, 3G/4G resilience) and PWA service worker caching guardrails.
---

# Mobile Web Performance & PWA Guardrails

1. **Core Web Vitals**: Optimize LCP (preload hero assets, avoid render-blocking scripts), CLS (reserve explicit \`aspect-ratio\` / dimensions on images and skeletons), and INP (keep main-thread handlers light, debounce expensive work).
2. **Bundle & Asset Discipline**: Lazy-load heavy routes/modals, tree-shake icon/utility imports, and serve modern responsive images (\`srcset\`, WebP/AVIF).
3. **Network & Offline Resilience**: Design for flaky mobile networks with graceful loading/retry states, request cancellation (\`AbortController\`), and idempotent mutations.
4. **Service Worker / Cache Safety**: Never cache authenticated API responses or HTML shells with stale-while-revalidate unless explicitly scoped and versioned; always provide a clean cache-busting update path.
`
