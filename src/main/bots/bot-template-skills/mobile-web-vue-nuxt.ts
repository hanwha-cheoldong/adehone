export const MOBILE_WEB_VUE_NUXT_PATH = 'references/vue-nuxt.md'

export const MOBILE_WEB_VUE_NUXT = `# Vue / Nuxt

Apply only when the project uses Vue or Nuxt. Check the installed major version and follow the project's existing API style (Composition or Options), store, router, and test setup. Do not migrate them as part of another task.

## 1. Security
- \`v-html\` only with HTML sanitized by a vetted allowlist sanitizer at the same call site. Never build templates from user input.
- Validate the scheme of user-controlled \`:href\` / \`:src\` / redirect targets.
- Nuxt: everything in \`runtimeConfig.public\` reaches the client, so no secrets there. Validate input and check authorization in every \`server/api\` and \`server/routes\` handler.

## 2. Reactivity and Components
- \`ref()\` needs \`.value\` in script. Do not replace a whole \`reactive()\` object or destructure it without \`toRefs\`.
- Destructured props are reactive only from Vue 3.5; watch them through a getter. Before 3.5, read \`props.x\`.
- Never mutate props; emit an event or use \`v-model\` (\`defineModel\` from 3.4).
- Use \`computed\` for derived values instead of a watcher that copies state.
- Composables are named \`useX\`, keep no side effects at module scope, and clean up timers, listeners, and requests.
- \`v-for\` needs a stable \`:key\` (not the index when items reorder, insert, or delete). Do not put \`v-if\` on the same element as \`v-for\`.
- Route params can change while a component stays mounted; read them through \`computed\` or a watcher.

## 3. Performance
- Lazy-load routes and heavy components (\`defineAsyncComponent\`; Nuxt \`Lazy\` prefix with \`v-if\`).
- \`shallowRef\` for large data that is replaced as a whole; \`v-memo\` / \`v-once\` only where profiling shows a need; give \`<KeepAlive>\` a \`max\`.

## 4. Nuxt SSR
- Keep server and first client render identical: no time, random, browser API, or storage values in SSR template state. Use \`onMounted\`, \`import.meta.client\`, \`<ClientOnly>\`, or \`.client.vue\`.
- Load page data with \`useFetch\` / \`useAsyncData\` (stable key, side-effect free handler); use \`$fetch\` for user-triggered writes.
- Set rendering and caching per route group with \`routeRules\`; never cache authenticated responses publicly.

## 5. Checks
Use the project's scripts first. Template types need \`vue-tsc --noEmit\` (Nuxt: \`nuxi typecheck\`); component tests use the project's runner, usually Vitest with Vue Testing Library or Vue Test Utils.
`
