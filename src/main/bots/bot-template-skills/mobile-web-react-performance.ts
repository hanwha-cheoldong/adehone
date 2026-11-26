export const MOBILE_WEB_REACT_PERFORMANCE_PATH = 'references/react-performance.md'

export const MOBILE_WEB_REACT_PERFORMANCE = `# React / Next.js Performance

Apply only when the project uses React. Measure (React DevTools Profiler, bundle analyzer) before adding optimizations that cost readability, and report anything you did not measure as unmeasured.

**React Compiler:** if the project enables it, do not ask for manual \`memo\` / \`useMemo\` / \`useCallback\`. The other rules still apply.

## 1. Waterfalls and Bundle (check first)
- Independent \`await\`s run with \`Promise.all\`; run cheap synchronous checks before the first \`await\`, and move an \`await\` into the branch that needs it.
- In Server Components, split sibling fetches into sibling components or start them together, with \`<Suspense>\` close to the data and reserved space to avoid layout shift.
- Lazy-load heavy, below-the-fold, or role-specific components (\`React.lazy\`, \`next/dynamic\`); import statically analyzable paths and avoid large barrel imports; load analytics and widgets after hydration.
- Next.js: authenticate and authorize inside every Server Action, keep no per-request mutable state at module scope, and pass Client Components only the fields they use.

## 2. Unnecessary Re-renders

| Look for | Why it costs | Fix |
|---|---|---|
| Object, array, or function created in JSX and passed to a \`memo\` child | New identity every render, so \`memo\` never skips | Hoist constants to module scope; pass a state setter directly; otherwise \`useMemo\` / \`useCallback\` |
| \`items ?? []\` or an object default value in props | Same | A module-level constant |
| Derived data kept in state and synced by \`useEffect\` | Extra render, one frame of stale UI | Compute during render; \`useMemo\` only if it is measurably expensive |
| Context \`value={{ ... }}\` created inline, or one context mixing fast and slow values | Every consumer re-renders | Memoize the value; split contexts or use a store with selectors |
| Subscribing to a whole store, or to a value used only inside a handler | Re-renders on unrelated changes | Select the narrowest or derived value; read it inside the handler |
| Component defined inside another component | Remounts every render and loses state | Move it to module scope |
| State lifted higher than its users | Large subtrees re-render while typing | Move state down, or pass the expensive subtree as \`children\` |
| Effect dependency that is a fresh object or array | Effect runs every render | Depend on primitives |

Do not memoize cheap primitive calculations, or components whose props change every render anyway.

## 3. Interaction and Rendering
- Keep typing responsive with \`useTransition\` or \`useDeferredValue\` when an update drives an expensive render.
- Virtualize long lists, or use \`content-visibility: auto\` with \`contain-intrinsic-size\`.
- Keep values that change often but are not rendered in a ref.
- Use SWR or TanStack Query (or the project's data library) so identical requests are shared and cancellable.

## Review Output
For each finding give \`file:line\`, which interaction triggers the cost, and the concrete fix. Rank a render issue by what it affects (list size, input frequency), not by pattern alone.
`
