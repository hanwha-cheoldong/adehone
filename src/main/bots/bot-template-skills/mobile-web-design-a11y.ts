export const SKILL = `---
name: mobile-web-design-a11y
description: ECC Web Design Quality & Accessibility for Mobile Web — anti-template UI standards, 100dvh/safe-area ergonomics, >=44px touch targets, WCAG 2.2 AA, and 400% zoom reflow.
---

# Mobile Web Design Quality, Ergonomics & Accessibility

Aligned with ECC \`rules/web/design-quality.md\`, \`frontend-design-direction\`, \`frontend-a11y\`, and \`accessibility\`.

## 1. Anti-Template Design Quality
Do not ship generic template-looking UI:
- Pick an intentional visual direction, typography pairing, and semantic color system (avoid default gray-on-white boilerplate or uniform card grids with no hierarchy).
- Design explicit **active/pressed**, **focus-visible**, **loading**, and **empty** states (touch devices lack hover, so pressed/active feedback is essential).
- Maintain stable layout dimensions for cards, sheets, and toolbars so dynamic content never causes layout shifts.

## 2. Mobile Viewport, Safe Area & Touch Ergonomics
- **Dynamic Viewport**: Prefer \`100dvh\` / \`svh\` over \`100vh\` so iOS Safari/Android browser toolbars and virtual keyboards never clip sticky footers or primary CTAs.
- **Safe Area Insets**: Configure \`viewport-fit=cover\` and apply \`env(safe-area-inset-top)\`, \`env(safe-area-inset-bottom)\`, \`env(safe-area-inset-left)\`, \`env(safe-area-inset-right)\` to fixed headers, bottom navigation, and action sheets. Coordinate with native Android/iOS hosts when embedded in a WebView so insets are not double-applied.
- **Touch Targets & Spacing**: Keep interactive targets at least \`44x44px\` (project standard; WCAG 2.2 AA requires \`24x24\`, and \`44x44\` is AAA) with adequate spacing between adjacent controls; apply \`touch-action: manipulation\` to prevent 300ms/double-tap delay issues.
- **Mobile Input Ergonomics**: Set \`font-size >= 16px\` on text inputs to prevent unwanted iOS Safari auto-zoom, and use semantic \`inputMode\` (\`numeric\`, \`decimal\`, \`email\`, \`tel\`) and \`autoComplete\` attributes.
- **Scroll & Sheet Hygiene**: Prevent background body scroll when modals/bottom sheets open, use \`overscroll-behavior: contain\` on scrollable drawers, and avoid horizontal overflow at \`320px\` and \`375px\`.

## 3. Accessibility (WCAG 2.2 AA)
- **Reflow & Zoom**: Support responsive reflow up to **400% zoom** (and \`320px\` CSS width) without horizontal scrolling or loss of function.
- **Contrast & Typography**: Meet WCAG AA contrast (\`>= 4.5:1\` normal text, \`>= 3:1\` large text/UI components); verify long localized labels wrap cleanly without truncation on narrow viewports.
- **Landmarks, Labels & Focus**: Use semantic HTML (\`<main>\`, \`<nav>\`, \`<button>\`), explicit \`label\`/\`aria-label\` on icon-only buttons, logical focus order, focus trapping inside modals/drawers, and \`prefers-reduced-motion\` fallbacks for animations.
`
