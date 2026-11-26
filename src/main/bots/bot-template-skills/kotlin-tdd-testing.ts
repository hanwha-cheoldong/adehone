import { ECC_LICENSE_FILES } from './ecc-license'

export const SKILL = `---
name: kotlin-tdd-testing
description: TDD workflow and Kotlin/Android testing patterns using JUnit 4/5, Kotest, MockK, Fake repositories, kotlinx-coroutines-test, Turbine for Flows, and Kover 80%+ coverage.
---

# Kotlin TDD & Testing Patterns

## TDD Cycle (Tests Before Code)

1. **RED**: Write a failing test specifying the expected behavior and edge cases.
2. **GREEN**: Implement the minimal code needed to make the test pass.
3. **REFACTOR**: Clean up while keeping \`./gradlew testDebugUnitTest\` green.
4. **COVERAGE**: Verify 80%+ coverage on domain/business logic via \`./gradlew koverHtmlReport\` (when configured).

## Test Stack

- **Unit Tests**: JUnit 4/5 or **Kotest** (\`StringSpec\`, \`FunSpec\`, \`BehaviorSpec\`)
- **Test Doubles**: Prefer lightweight **Fake** repositories for domain/ViewModel tests; use **MockK** (\`mockk()\`, \`coEvery\`, \`coVerify\`) for external boundaries.
- **Coroutines**: \`kotlinx-coroutines-test\` (\`runTest\`, \`StandardTestDispatcher\`, \`UnconfinedTestDispatcher\`) with injected dispatchers.
- **Flows / StateFlow**: **Turbine** (\`flow.test { awaitItem(); cancelAndIgnoreRemainingEvents() }\`).

## ViewModel & Flow Example (Turbine + runTest)

\`\`\`kotlin
@Test
fun \`loading state emitted then data\`() = runTest {
    val repo = FakeItemRepository().apply { addItem(testItem) }
    val viewModel = ItemListViewModel(GetItemsUseCase(repo))

    viewModel.state.test {
        assertEquals(ItemListState(isLoading = false), awaitItem())
        viewModel.load()
        assertEquals(ItemListState(isLoading = true), awaitItem())
        assertEquals(ItemListState(items = listOf(testItem)), awaitItem())
        cancelAndIgnoreRemainingEvents()
    }
}
\`\`\`

## What to Cover
- Happy path, empty states, null/invalid inputs, network/IO failures, coroutine cancellation, and boundary conditions.
- Avoid brittle UI-only assertions or mock-call choreography; test real behavior and state transitions.
`

export const SKILL_FILES = ECC_LICENSE_FILES
