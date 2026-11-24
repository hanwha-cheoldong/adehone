export const SKILL = `---
name: android-clean-architecture
description: Clean Architecture patterns for Android and KMP — module structure, dependency inversion, pure-Kotlin domain, UseCases, Repositories, Mappers, and Hilt/Koin DI.
---

# Android Clean Architecture

## Module Structure & Dependency Rules

\`\`\`text
project/
├── app/            # Android entry point, DI wiring, Application class
├── core/           # Shared primitives, dispatchers, base error types
├── domain/         # Pure Kotlin: UseCases, domain models, repository interfaces
├── data/           # Repository impls, DataSources, Room/SQLDelight, Ktor/Retrofit
├── presentation/   # Screens, ViewModels, UI state/events, navigation
├── design-system/  # Reusable Compose components, theme, typography
└── feature/        # Optional feature modules for larger apps
\`\`\`

\`\`\`text
app -> presentation, domain, data, core
presentation -> domain, design-system, core
data -> domain, core
domain -> core (or no dependencies)
core -> (nothing)
\`\`\`

**Critical**: \`domain\` must NEVER import Android framework classes (\`Context\`, \`Bundle\`, \`Uri\`), Room, Ktor, Retrofit, or Compose. Keep it pure Kotlin.

## Domain Layer

- **UseCase Pattern**: One business operation per UseCase with \`operator fun invoke\`:
  \`\`\`kotlin
  class GetItemsByCategoryUseCase(
      private val repository: ItemRepository
  ) {
      suspend operator fun invoke(category: String): Result<List<Item>> =
          repository.getItemsByCategory(category)
  }

  class ObserveUserProgressUseCase(
      private val repository: UserRepository
  ) {
      operator fun invoke(userId: String): Flow<UserProgress> =
          repository.observeProgress(userId)
  }
  \`\`\`
- **Domain Models**: Plain immutable Kotlin \`data class\` / \`enum class\` without DB or network annotations.
- **Repository Interfaces**: Declared in \`domain\`, implemented in \`data\`.

## Data Layer & Mappers

- Coordinate local (Room/SQLDelight) and remote (Ktor/Retrofit) data sources inside \`RepositoryImpl\`.
- Keep mappers (\`Entity.toDomain()\`, \`Dto.toEntity()\`) as extension functions in \`data\`; never leak DB entities or network DTOs into \`domain\` or \`presentation\`.

## Dependency Injection (Hilt / Koin)

- Prefer constructor injection everywhere.
- **Android-only (Hilt)**: \`@HiltViewModel\`, \`@Inject constructor(...)\`, \`@Module\` / \`@InstallIn\`.
- **KMP (Koin)**: \`module { single<ItemRepository> { ItemRepositoryImpl(get(), get()) }; factory { GetItemsUseCase(get()) }; viewModelOf(::ItemListViewModel) }\`.
`
