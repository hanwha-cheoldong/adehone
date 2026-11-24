export const SKILL = `---
name: android-compose-patterns
description: Android Jetpack Compose patterns — Hilt ViewModel + single StateFlow, Event Sink, Type-Safe Navigation, WindowInsets/edge-to-edge, AndroidView/WebView lifecycle, recomposition, and TalkBack accessibility.
---

# Android Jetpack Compose Patterns

## State Management & Lifecycle

- Inject ViewModels with \`hiltViewModel()\` and expose a single immutable \`data class\` screen state as \`StateFlow\`.
- Always collect state lifecycle-aware in Compose with \`collectAsStateWithLifecycle()\`.
- Split every screen into a stateful route wrapper (injects ViewModel) and a stateless \`*Content(state, onEvent)\` composable for \`@Preview\` and UI tests.
- For screens with multiple user actions, use a \`sealed interface\` Event Sink (\`onEvent(event: ScreenEvent)\`) instead of passing many callback lambdas.

\`\`\`kotlin
sealed interface ItemListEvent {
    data class Search(val query: String) : ItemListEvent
    data class Delete(val itemId: String) : ItemListEvent
    data object Refresh : ItemListEvent
}
\`\`\`

## Edge-to-Edge, WindowInsets & Adaptive UI

- Enable \`enableEdgeToEdge()\` in \`ComponentActivity\` and handle system bars and software keyboard cleanly with \`Modifier.safeDrawingPadding()\`, \`Modifier.systemBarsPadding()\`, and \`Modifier.imePadding()\`.
- Support phones, foldables, and tablets using Material 3 adaptive layouts (\`WindowSizeClass\`) rather than hardcoded pixel breakpoints.

## Type-Safe Navigation (Navigation 2.8+)

- Define routes with \`@Serializable data object\` / \`@Serializable data class\`.
- Pass navigation lambdas (\`onNavigateToDetail: (String) -> Unit\`) into screens; never pass \`NavController\` deep into child composables.
- Use \`dialog<Route>\` / \`ModalBottomSheet\` destinations instead of imperative show/hide flags.

## AndroidView & WebView Interop

- When hosting a \`WebView\` or legacy \`View\` via \`AndroidView\`, create and configure it in \`factory\`, keep \`update\` idempotent, and use \`onRelease\` + \`DisposableEffect\`/\`LifecycleEventEffect\` to forward \`onPause\`/\`onResume\`/\`destroy\`.
- Never hold an \`Activity\` \`LocalContext.current\` reference inside long-lived objects or ViewModels.

## Recomposition & Performance

- Provide stable \`key\`s in \`LazyColumn\` / \`LazyRow\` (\`items(list, key = { it.id })\`).
- Memoize derived computations with \`remember(key) { ... }\` and rapid scroll/input reads with \`derivedStateOf { ... }\`.
- Avoid inline object allocations or unstable mutable collections in parameters; prefer \`@Immutable\` / \`@Stable\` models and read-only lists.
- Keep side effects in \`LaunchedEffect(key)\` or ViewModel—never trigger network or DB calls directly in composition.

## Accessibility (TalkBack & WCAG 2.2)

- Provide meaningful \`contentDescription\` on non-decorative \`Image\`/\`Icon\`s (\`null\` for decorative ones) and use \`Modifier.semantics { ... }\` for custom interactive controls and live announcements.
- Keep interactive touch targets at least \`48.dp x 48.dp\` and maintain text contrast (>= 4.5:1 normal, >= 3:1 large/UI).
- Security exception: on secure PIN/password keypads, harden accessibility (\`importantForAccessibility\`) per security policy so sensitive digits are not read aloud.
`
