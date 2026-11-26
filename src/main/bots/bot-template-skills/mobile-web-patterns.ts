import {
  MOBILE_WEB_REACT_PERFORMANCE,
  MOBILE_WEB_REACT_PERFORMANCE_PATH
} from './mobile-web-react-performance'
import {
  MOBILE_WEB_NOTICES_PATH,
  MOBILE_WEB_THIRD_PARTY_NOTICES
} from './mobile-web-third-party-notices'
import { MOBILE_WEB_VUE_NUXT, MOBILE_WEB_VUE_NUXT_PATH } from './mobile-web-vue-nuxt'

export const SKILL = `---
name: mobile-web-patterns
description: Frontend patterns for Mobile Web — framework detection with React/Next.js and Vue/Nuxt guides, component composition, separated server/client/URL/form state, SWR/optimistic data fetching, AbortController resilience, and TypeScript discipline.
---

# Mobile Web Frontend Patterns

Modern frontend architecture patterns for resilient mobile web apps and hybrid WebView surfaces.

## 0. Framework Gate
Before writing or reviewing framework code, identify the framework from \`package.json\` and the changed files, and follow the project's existing conventions and libraries first.

| Project uses | Also read |
|---|---|
| React or Next.js | \`references/react-performance.md\` |
| Vue or Nuxt | \`references/vue-nuxt.md\` |
| Anything else (Svelte, Angular, Solid, plain JavaScript, ...) | No framework guide is installed |

- Apply a framework's rules and libraries only to that framework. Library and hook names below and in other \`mobile-web-*\` skills are examples, never a reason to add React to another project.
- When no framework guide is installed, say so in your plan, review, or report (for example, "no dedicated Svelte guide; reviewed against the project's own conventions and the framework-neutral rules"). Security, accessibility, viewport, performance budget, and bridge rules still apply.

## 1. Component Composition
- **Compound Components**: Parent owns shared state via context; children consume it cleanly without prop drilling (e.g., \`<Tabs>\`, \`<BottomSheet>\`, \`<FilterBar>\`).
- **Render Props / Slots**: Keep keyboard handling, ARIA, touch-gesture logic, and focus trapping in the headless layer while allowing flexible markup.
- **Container / Presentational Split**: Container components own data fetching and bridge/side effects; presentational components stay pure and easy to test across viewports.

## 2. State Management Separation
Keep each state concern in its proper layer:
- **Server State**: TanStack Query, SWR, or tRPC — never duplicate server cache into client stores.
- **Client UI State**: Zustand, Jotai, signals, or local state — derive computed values instead of storing redundant derived state.
- **URL as State**: Persist shareable/back-navigable state (filters, sort order, pagination, active tab, search query) in URL search params or route segments so mobile back-navigation and WebView history stay consistent.
- **Form State**: React Hook Form (or framework equivalent) with schema validation (e.g., Zod) and inline error feedback.

## 3. Data Fetching & Flaky Mobile Network Resilience
- **Stale-While-Revalidate**: Return cached data immediately and revalidate in the background via established libraries.
- **Optimistic Updates**: Snapshot previous state -> apply optimistic update -> roll back on failure -> show clear inline error/retry feedback.
- **Parallel Loading**: Fetch independent queries in parallel (\`Promise.all\` / parallel hooks) and avoid parent-child request waterfalls on high-latency 3G/4G connections.
- **Request Cancellation**: Wire \`AbortController\` on route changes, search-as-you-type, and component unmount to avoid race conditions and wasted mobile bandwidth.

## 4. TypeScript & Coding Style
- Define explicit request/response interfaces for API payloads and WebView bridge envelopes; avoid \`any\` and unvalidated \`as\` casts at trust boundaries.
- Keep components and hooks small, single-purpose, and free of duplicated logic.
`

export const SKILL_FILES: Readonly<Record<string, string>> = {
  [MOBILE_WEB_REACT_PERFORMANCE_PATH]: MOBILE_WEB_REACT_PERFORMANCE,
  [MOBILE_WEB_VUE_NUXT_PATH]: MOBILE_WEB_VUE_NUXT,
  [MOBILE_WEB_NOTICES_PATH]: MOBILE_WEB_THIRD_PARTY_NOTICES
}
