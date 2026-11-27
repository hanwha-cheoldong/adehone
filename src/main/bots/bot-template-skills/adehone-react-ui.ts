import { ECC_LICENSE_FILES } from './ecc-license'

export const SKILL = `---
name: adehone-react-ui
description: React renderer work in Adehone following its design system, with React state, effect, accessibility, and performance rules. Use when creating or changing any UI, hook, or renderer state.
---

# Adehone React UI

Repository paths are relative to the Adehone workspace.

## Design System First
Read \`docs/STYLEGUIDE.md\` before UI work, and the deep-dive documents it lists for the area you touch. Its rules are not repeated here.
- Use the tokens and the shared UI primitives it names. Do not invent colors, font sizes, or shadow levels.
- Find the nearest sibling component and match it.
- Check light and dark, keyboard use, and platform-aware shortcuts and labels.
- User-visible text goes through the app's localization; read how neighbouring components do it and run the localization checks the repository provides. The mobile app has its own catalogs.

## State and Effects
- Derive values during render; do not mirror props or state with an effect.
- Keep state at the lowest component that needs it; use the existing store patterns for shared state, with selectors narrow enough not to re-render on unrelated updates.
- Effects clean up listeners, timers, observers, and IPC subscriptions, and guard against results that arrive after the input changed.
- Never mutate state in place. Use stable ids as list keys.
- Hooks stay at the top level with complete dependencies. Fix the code instead of silencing the rule.

## Waiting, Errors, and Remote Latency
- Cover loading, empty, error, and disconnected states. Remote hosts add latency; the style guide's feedback timing and no-overclaim copy rules apply.

## Accessibility
- Real buttons and inputs with names or labels, visible focus, focus returned after dialogs close, and meaning never carried by color alone.

## Performance
- Run independent async work in parallel.
- Memoize only for a demonstrated cost or a dependency that must stay stable.
- For long or high-frequency lists, follow the virtualization the app already uses.
- Defer heavy, rarely used modules the way neighbouring code does.
- Measure before claiming an improvement.

## Seeing the UI
Prove the change with \`adehone-testing-proof\` (if installed) or the repository's UI validation rules. Do not report how something looks or behaves from reading code.
`

export const SKILL_FILES = ECC_LICENSE_FILES
