import { ECC_LICENSE_FILES } from './ecc-license'

export const SKILL = `---
name: kotlin-coroutines-flows
description: Idiomatic Kotlin, structured concurrency, Coroutines, Flow/StateFlow/SharedFlow patterns, dispatcher injection, and cancellation-safe error handling for Android.
---

# Kotlin Idioms, Coroutines & Flows

## Idiomatic Kotlin & Coding Style

- Follow official Kotlin code style (\`kotlin.code.style=official\`), enforced via \`ktlint\` / \`detekt\`.
- Prefer \`val\` over \`var\`; use immutable \`data class\` + \`copy()\` for state updates.
- Use \`sealed interface\` / \`sealed class\` with exhaustive \`when\` expressions.
- Never use \`!!\`; use safe calls (\`?.\`), Elvis (\`?:\`), \`requireNotNull\`, or \`checkNotNull\`.
- Expose read-only \`List\`/\`Map\`/\`Set\` in public APIs, never \`MutableList\`.
- Prefer top-level functions and extension functions over Java-style static utility classes.

## Structured Concurrency

- Always launch in lifecycle/structured scopes (\`viewModelScope\`, \`coroutineScope\`, \`supervisorScope\`); **never use \`GlobalScope\`**.
- Use \`coroutineScope { async { ... } }\` for parallel decomposition and \`supervisorScope\` when child failures should not cancel siblings.
- Inject \`CoroutineDispatcher\`s (\`IO\`, \`Default\`, \`Main\`) for testability and wrap blocking/IO calls with \`withContext(ioDispatcher)\`.
- **Never swallow \`CancellationException\`**:
  \`\`\`kotlin
  try {
      fetchData()
  } catch (e: CancellationException) {
      throw e
  } catch (e: Exception) {
      handleError(e)
  }
  \`\`\`

## Flow, StateFlow & SharedFlow

- Expose UI state via \`stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), initialValue)\` to survive configuration changes without keeping upstream active indefinitely.
- Combine multiple streams with \`combine(...)\`; for search/filter inputs use \`debounce(300)\` + \`distinctUntilChanged()\` + \`flatMapLatest\`.
- Use \`SharedFlow\` (or \`Channel\`) for one-time UI effects (navigation, snackbar) collected inside \`LaunchedEffect\`.
- Never mutate a collection inside \`StateFlow\`—always emit a new copy via \`_state.update { it.copy(items = it.items + newItem) }\`.
`

export const SKILL_FILES = ECC_LICENSE_FILES
