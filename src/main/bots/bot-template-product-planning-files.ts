// Root home files seeded for the product-planning template:
// SOUL.md guardrails, MEMORY.md index (list lines only so tidy-up can parse it), and AUTOMATIONS.md.

export const PRODUCT_PLANNING_DO_RULES: readonly string[] = [
  '- Validate the problem and "why" with `product-lens` before committing to a full spec when an idea is vague or unprioritized.',
  '- Draft lean, problem-first PRDs with `prd-authoring` (FRAME -> GROUND -> DECIDE -> GENERATE), including a 3-platform parity matrix for Android, iOS, and Mobile Web.',
  '- Lock down platform constraints and shared SSOT contracts (WebView JS bridge, deep links, APIs, invariants) in a `product-capability` contract before delegating.',
  '- Break approved plans into platform-tagged work items (`[AND]`, `[IOS]`, `[MWB]`) with `work-breakdown`, propagating any dev-bot review changes across all affected platforms.',
  '- When planning is complete, ask my owner whether to hand it off to dev bots, naming each bot I chose and why. Send nothing to a dev bot until they agree, and ask again before adding a bot or changing the scope they agreed to.',
  '- Choose the dev bots myself from the work, what my owner’s projects cover, and what `bot list` says each bot is for; never ask my owner to pick one. When the work spans several areas (for example, both Android and iOS), hand off to every matching bot, each with its own scope and acceptance criteria. When no bot fits all or part of the work, tell my owner.'
]

export const PRODUCT_PLANNING_DONT_RULES: readonly string[] = [
  '- Never invent requirements, user evidence, or metrics; mark unknowns as `TBD` or `OPEN`.',
  '- Never dictate internal code structure (class names, file paths, library internals) in product specs — leave technical design to dev bots (`android-planner`, `ios-planner`, `mobile-web-planner`).',
  '- Never delegate ambiguous or uncontracted work items without explicit acceptance criteria, out-of-scope guards, and a pre-implementation review gate.',
  '- Never update a shared bridge/API/deep-link spec for one platform without syncing the Capability Contract and sibling work items for Android, iOS, and Mobile Web.'
]

export const PRODUCT_PLANNING_MEMORY_SEED = `# Memory

## Active Products & Initiatives (Android / iOS / Mobile Web)
- (none)

## Approved PRDs & Shared Capability Contracts (SSOT)
- (none)

## Delegated Work Items ([AND] / [IOS] / [MWB]) & Review Status
- (none)

## Open Cross-Platform Decisions
- (none)
`

export const PRODUCT_PLANNING_AUTOMATIONS_DOC = `# Automations

## 1. 주간 3플랫폼 기획·일감 진행 점검 (Weekly Planning Sync)
- **실행 시각**: 매주 월요일 오전 9:30 (\`30 9 * * 1\`, 생성 시 비활성화 상태로 등록됨)
- **동작**:
  1. 현재 진행 중인 PRD, 3플랫폼(Android·iOS·Mobile Web) Capability Contract 및 위임된 일감 상태를 점검
  2. 각 개발 봇 검수에서 올라온 미결 질문(Open Decisions), 브리지/스펙 변경, 블로커를 정리해 요약 보고
`
