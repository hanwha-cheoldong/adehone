export const SKILL = `---
name: swift-concurrency-actors
description: Idiomatic Swift, Swift 6/6.2 strict concurrency (@MainActor, Sendable, @concurrent, structured concurrency), and actor-based thread-safe persistence patterns.
---

# Swift Idioms, Concurrency & Actor Persistence

## Idiomatic Swift & Coding Style

- Follow [Apple API Design Guidelines](https://www.swift.org/documentation/api-design-guidelines/) and enforce style with **SwiftLint** / **SwiftFormat** (\`swift-format\`).
- Prefer \`let\` over \`var\` and \`struct\` (value semantics) over \`class\` unless reference identity is required.
- Never use force unwrapping (\`!\`), force try (\`try!\`), or force cast (\`as!\`) in production code; use \`guard let\`, \`if let\`, or \`??\`.
- Use typed throws (\`throws(DomainError)\`) where appropriate, and never silently swallow errors in empty \`catch {}\` blocks.
- Use \`os.Logger\` for structured diagnostics—never \`print()\` or log sensitive PII/tokens in production.

## Swift 6 / 6.2 Strict Concurrency

- Enable Swift 6 strict concurrency checking. Make data crossing isolation boundaries \`Sendable\`.
- **Default Isolation**: In Swift 6.2 Approachable Concurrency, \`async\` functions stay on the caller's actor by default (reducing accidental background offloading). Mark CPU-heavy background work explicitly with \`@concurrent\` (or detached/actor work) so \`@MainActor\` never blocks on synchronous I/O.
- **Isolated Conformances**: When a \`@MainActor\` type conforms to a non-isolated protocol, use isolated conformance (\`extension Model: @MainActor Exportable\`) where supported.
- **Structured Concurrency**: Prefer \`async let\` and \`withTaskGroup\` / \`withThrowingTaskGroup\` over unstructured \`Task {}\`. Always propagate cancellation (\`try Task.checkCancellation()\`) and store/cancel long-lived tasks on teardown.

## Actor-Based Persistence & Shared State

Use Swift \`actor\`s instead of locks or \`DispatchQueue\`s for shared mutable state and local persistence:

\`\`\`swift
public actor LocalRepository<T: Codable & Identifiable & Sendable> where T.ID == String {
    private var cache: [String: T] = [:]
    private let fileURL: URL

    public init(directory: URL = .documentsDirectory, filename: String = "data.json") {
        self.fileURL = directory.appendingPathComponent(filename)
        self.cache = Self.loadSynchronously(from: fileURL)
    }

    public func save(_ item: T) throws {
        cache[item.id] = item
        let data = try JSONEncoder().encode(Array(cache.values))
        try data.write(to: fileURL, options: [.atomic, .completeFileProtection])
    }

    public func find(by id: String) -> T? { cache[id] }
    public func loadAll() -> [T] { Array(cache.values) }
}
\`\`\`

- **Actor Reentrancy**: Never assume cached state before an \`await\` suspension point is unchanged after \`await\` resumes; re-check state or coalesce in-flight tasks.
- **Memory Management**: Use \`[weak self]\` in escaping closures and \`weak\` for delegates to prevent retain cycles.

## Objective-C Interop & Legacy Concurrency

- **Bridging Completion Handlers**: Wrap Objective-C completion-handler APIs with \`withCheckedContinuation\` / \`withCheckedThrowingContinuation\`; ensure every code path resumes the continuation **exactly once**.
- **Strict Concurrency Interop**: Annotate thread-safe Objective-C value/immutable types with \`NS_SWIFT_SENDABLE\` where appropriate, or isolate \`@preconcurrency import\` to adapter files in \`Data\`/\`Core\`.
- **Objective-C ARC & Safety**: Always use \`__weak typeof(self) weakSelf = self;\` before blocks capturing \`self\`, check \`strongSelf\` inside, declare delegates as \`@property (nonatomic, weak)\`, use \`instancetype\` + \`NS_DESIGNATED_INITIALIZER\`, and propagate errors via \`NSError * _Nullable * _Nullable\`.
- **Logging**: Replace legacy \`NSLog(...)\` in production paths with \`os_log\` / \`os.Logger\` and never pass unvalidated user strings as format strings.
`
