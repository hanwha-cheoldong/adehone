export const SKILL = `---
name: ios-clean-architecture
description: Clean Architecture and protocol-oriented patterns for iOS — layer boundaries, pure-Swift domain, UseCases, Repositories, Mappers, Value Types, and Protocol-based DI.
---

# iOS Clean Architecture & Protocol-Oriented Design

## Module / Folder Structure & Dependency Rules

\`\`\`text
Project/
├── App/            # iOS entry point (@main App), DI container/wiring, SceneDelegate
├── Core/           # Shared primitives, Logger, base error types, Keychain/Crypto helpers
├── Domain/         # Pure Swift: UseCases, domain structs/enums, repository protocols
├── Data/           # Repository impls, DataSources, SwiftData/Actor storage, URLSession/APIs
├── Presentation/   # SwiftUI Views, @Observable ViewModels, Navigation routes/coordinators
└── DesignSystem/   # Reusable SwiftUI components, colors, typography, spacing tokens
\`\`\`

\`\`\`text
App -> Presentation, Domain, Data, Core
Presentation -> Domain, DesignSystem, Core
Data -> Domain, Core
Domain -> Core (or Foundation only)
Core -> (Foundation / OS frameworks only)
\`\`\`

**Critical**: \`Domain\` must NEVER import \`SwiftUI\`, \`UIKit\`, \`SwiftData\`, \`CoreData\`, or \`WebKit\`. Keep it pure Swift with \`Sendable\` value types and protocols.

## Domain Layer

- **UseCase Pattern**: One focused business operation per UseCase with \`callAsFunction\`:
  \`\`\`swift
  protocol FetchItemsUseCase: Sendable {
      func callAsFunction(category: String) async throws -> [Item]
  }

  struct DefaultFetchItemsUseCase: FetchItemsUseCase {
      private let repository: any ItemRepository

      init(repository: any ItemRepository) {
          self.repository = repository
      }

      func callAsFunction(category: String) async throws -> [Item] {
          try await repository.fetchItems(category: category)
      }
  }
  \`\`\`
- **Value Types & State Modeling**: Prefer immutable \`struct\` models conforming to \`Identifiable\`, \`Equatable\`, \`Sendable\`, and \`enum\` with associated values for distinct states (\`idle\`, \`loading\`, \`loaded(T)\`, \`failed(AppError)\`).
- **Repository Protocols**: Declared in \`Domain\` (\`protocol ItemRepository: Sendable\`), implemented in \`Data\`.

## Data Layer & Mappers

- Coordinate local (Actor/SwiftData/Keychain) and remote (\`URLSession\`) data sources inside \`*RepositoryImpl\`.
- Keep mappers (\`dto.toDomain()\`, \`entity.toDomain()\`) inside \`Data\`; never leak network DTOs or persistence entities into \`Domain\` or \`Presentation\`.

## Protocol-Based Dependency Injection

- Define small, focused protocols (\`Sendable\`) for external boundaries (network, file system, Keychain, biometrics).
- Inject protocols via initializer parameters with production defaults or explicit composition root wiring in \`App\`:
  \`\`\`swift
  @Observable
  @MainActor
  final class ItemListViewModel {
      private let fetchItems: any FetchItemsUseCase

      init(fetchItems: any FetchItemsUseCase = DefaultFetchItemsUseCase(repository: DefaultItemRepository())) {
          self.fetchItems = fetchItems
      }
  }
  \`\`\`

## Objective-C & Legacy Interop Boundaries

- Keep \`Domain\` pure Swift—never inherit from \`NSObject\` or add \`@objc\`/\`@objcMembers\` to domain entities or UseCases.
- Wrap legacy Objective-C managers (\`.h\`/\`.m\`) behind Swift repository/service adapters in \`Data\` or \`Core\` implementing \`Domain\` protocols.
- Add explicit nullability (\`NS_ASSUME_NONNULL_BEGIN\`/\`END\`, \`nullable\`/\`nonnull\`) and \`NS_SWIFT_NAME\` on Objective-C headers so Swift callers never receive implicitly unwrapped optionals (\`!\`).
`
