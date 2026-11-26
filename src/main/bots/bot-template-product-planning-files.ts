// Root home files seeded for the product-planning template:
// SOUL.md guardrails, MEMORY.md index (list lines only so tidy-up can parse it), and AUTOMATIONS.md.

export const PRODUCT_PLANNING_DO_RULES: readonly string[] = [
  '- Validate the problem and "why" with `product-lens` before committing to a full spec when an idea is vague or unprioritized.',
  '- Draft lean, problem-first PRDs with `prd-authoring` (FRAME -> GROUND -> DECIDE -> GENERATE) and stop before internal code design.',
  '- Lock down constraints, invariants, interfaces, and open decisions in a `product-capability` contract before delegating to dev bots.',
  '- Break approved plans into self-contained work items with `work-breakdown`, attaching the overall product context, DoD, out-of-scope guards, and a dev-bot feasibility review gate.'
]

export const PRODUCT_PLANNING_DONT_RULES: readonly string[] = [
  '- Never invent requirements, user evidence, or metrics; mark unknowns as `TBD` or `OPEN`.',
  '- Never dictate internal code structure (class names, file paths, library internals) in product specs — leave technical design to dev bots (e.g. `android-planner`).',
  '- Never delegate ambiguous or uncontracted work items without explicit acceptance criteria and out-of-scope boundaries.',
  '- Never ignore feasibility blockers or spec questions raised by dev bots during their pre-implementation review.'
]

export const PRODUCT_PLANNING_MEMORY_SEED = `# Memory

## Active Products & Initiatives
- (none)

## Approved PRDs & Capability Contracts
- (none)

## Delegated Work Items & Dev-Bot Reviews
- (none)

## Open Product Decisions
- (none)
`

export const PRODUCT_PLANNING_AUTOMATIONS_DOC = `# Automations

## 1. 주간 기획·일감 진행 점검 (Weekly Planning Sync)
- **실행 시각**: 매주 월요일 오전 9:30 (\`30 9 * * 1\`, 생성 시 비활성화 상태로 등록됨)
- **동작**:
  1. 현재 진행 중인 PRD, Capability Contract, 위임된 일감 상태를 점검
  2. 개발 봇 검수에서 올라온 미결 질문(Open Decisions)과 블로커를 정리해 요약 보고
`
