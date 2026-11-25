export const SKILL = `---
name: ios-swiftui-patterns
description: Modern SwiftUI architecture patterns — @Observable state management, @Environment DI, NavigationStack, UIViewRepresentable/WKWebView lifecycle, render performance, and VoiceOver/Dynamic Type accessibility.
---

# iOS SwiftUI Patterns

## State Management & @Observable

Choose the simplest wrapper that fits:

| Wrapper | Use Case |
|---------|----------|
| \`@State\` | View-local value types (toggles, sheet presentation) or owned \`@Observable\` ViewModel |
| \`@Binding\` | Two-way reference to parent's \`@State\` |
| \`@Bindable\` | Two-way binding to an \`@Observable\` model property |
| \`@Environment\` | Shared dependencies injected via \`.environment()\` |

- Prefer \`@Observable\` (Observation framework) over \`ObservableObject\` / \`@Published\` so SwiftUI tracks property-level reads and skips unnecessary body re-evaluations.
- Annotate UI-bound ViewModels with \`@MainActor\` and keep business logic in Domain UseCases.
- Trigger initial async loads with \`.task { await viewModel.load() }\` or \`.task(id: query)\` so SwiftUI automatically cancels the task when the view disappears or \`id\` changes.

## View Composition & Navigation

- Extract subviews to limit invalidation scope and keep \`View.body\` shallow and readable.
- Use type-safe \`NavigationStack(path: $router.path)\` with \`Hashable\` route enums and \`.navigationDestination(for: Route.self)\`.
- Use \`.sheet(item:)\` / \`.fullScreenCover(item:)\` driven by optional \`Identifiable\` state rather than boolean flags.

## UIViewRepresentable & WKWebView Lifecycle

- When wrapping \`WKWebView\` or Swift/Objective-C UIKit views (\`UIView\`/\`UIViewController\`) via \`UIViewRepresentable\` / \`UIViewControllerRepresentable\`:
  - Create and configure the view in \`makeUIView(context:)\`, keep \`updateUIView(_:context:)\` idempotent (avoid reloading URLs on every SwiftUI re-render), and use \`Coordinator\` with \`weak\` delegate references to avoid retain cycles.
  - Implement \`static func dismantleUIView(_:coordinator:)\` to remove \`WKScriptMessageHandler\`s, KVO observers, and Objective-C delegates cleanly.

## Performance & Layout

- Always provide stable \`id\`s in \`List\` / \`LazyVStack\` / \`ForEach\` (\`Identifiable\` or explicit \`id:\`).
- Avoid expensive formatting, sorting, or object allocations inside \`body\`; precompute in the ViewModel or cache formatters.
- Respect Safe Area insets (\`.safeAreaInset\`) and support Dark Mode with semantic/asset catalog colors.

## Accessibility (VoiceOver & Dynamic Type)

- Support Dynamic Type: use semantic font styles (\`.body\`, \`.headline\`) or \`@ScaledMetric\` instead of hardcoded pixel sizes.
- Provide concise \`.accessibilityLabel(...)\` and \`.accessibilityHint(...)\` on icon-only buttons, and hide decorative images with \`.accessibilityHidden(true)\`.
- Maintain at least \`44x44 pt\` tap targets (\`.contentShape(Rectangle())\`).
- Security exception: on secure PIN/password keypads, disable spoken digit feedback per security policy so sensitive digits are not leaked via VoiceOver.
`
