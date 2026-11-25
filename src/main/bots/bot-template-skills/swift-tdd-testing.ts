export const SKILL = `---
name: swift-tdd-testing
description: TDD workflow and Swift/iOS testing patterns using Swift Testing (@Test, #expect), XCTest, Protocol-based DI mocks/fakes, async/actor testing, and 80%+ code coverage.
---

# Swift TDD & Testing Patterns

## TDD Cycle (Tests Before Code)

1. **RED**: Write a failing test specifying the expected behavior, error path, and edge cases.
2. **GREEN**: Implement the minimal code needed to make the test pass.
3. **REFACTOR**: Clean up while keeping \`xcodebuild test\` / \`swift test\` green.
4. **COVERAGE**: Verify 80%+ coverage on domain/business logic (\`swift test --enable-code-coverage\` or \`xcodebuild test -enableCodeCoverage YES\`).

## Test Stack

- **Swift Testing** (\`import Testing\`): Default for new tests—use \`@Test\`, \`#expect\`, \`#require\`, and parameterized \`@Test(arguments:)\`.
- **XCTest (Swift & Objective-C)**: Use for legacy Objective-C classes (\`.m\` test cases or Swift tests via bridging/module import), \`XCUITest\`, or performance benchmarks (\`measure {}\`).
- **Test Isolation**: Each Swift Testing struct gets a fresh instance per test (\`init\` setup, \`deinit\` teardown on classes/actors). Never share mutable global state across tests.

## Protocol-Based DI & Mocks/Fakes

Abstract external boundaries (file system, \`URLSession\`, Keychain, \`LAContext\`, legacy Objective-C managers) behind small \`Sendable\` protocols and inject lightweight Fakes/Mocks in tests:

\`\`\`swift
import Testing

@Test("Loads items and updates state")
@MainActor
func loadsItems() async throws {
    let repo = FakeItemRepository(items: [Item.fixture()])
    let viewModel = ItemListViewModel(fetchItems: DefaultFetchItemsUseCase(repository: repo))

    await viewModel.load()

    #expect(viewModel.items.count == 1)
    #expect(viewModel.error == nil)
}

@Test("Validates email format", arguments: ["invalid", "", "a@"])
func rejectsInvalidEmail(input: String) {
    #expect(throws: ValidationError.invalidEmail) {
        try EmailAddress(input)
    }
}
\`\`\`

## What to Cover
- Happy path, empty states, \`nil\`/invalid inputs, network/Keychain/permission failures, actor concurrency, task cancellation, and boundary conditions.
- Avoid testing private implementation details or brittle UI-only timing; test observable state transitions and domain invariants.
`
