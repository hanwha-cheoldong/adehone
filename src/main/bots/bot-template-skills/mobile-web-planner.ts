export const SKILL = `---
name: mobile-web-planner
description: Planning specialist for Mobile Web features and refactors — 4-step planning process, Search-First reuse, 3-platform Capability Contract intake ([MWB]), WebView bridge alignment, testing strategy, and Red Flags.
---

# Mobile Web Implementation Planner

Create specific, actionable, incrementally verifiable plans before writing code for any non-trivial feature, refactor, or architecture change.

## Planning Process

### 1. Requirements & Product Contract Intake
- When receiving a \`[MWB-xx]\` work item from the planning bot, read the attached **SSOT Capability Contract** and the item's DoD before designing. If either is missing, ask for it.
- Clarify the exact feature or bug fix, target viewports (from the \`320\`/\`375\`/\`390\`/\`768\`/\`1024\`/\`1440\`/\`1920\` width matrix), standalone browser vs. in-app WebView scope, and explicit **In Scope** / **Out of Scope** boundaries.
- If a requirement depends on native capabilities (biometrics, secure storage, camera, push, back-button, deep links), check \`mobile-web-webview-bridge/references/bridge-protocol.md\` and the contract, then confirm gaps with the Android, iOS, and planning bots (protocol section 6) *before* coding.

### 2. Search-First & Architecture Review
- Search existing components, hooks, design tokens, and bridge adapters before building anything new: **Adopt -> Extend -> Build Custom**.
- Inspect \`package.json\`, routing config, state stores, CSP/cookie headers, \`viewport\` meta tags, and existing WebView bridge clients.
- Check server/client state boundaries, SSR/hydration constraints, bundle budget impact, and XSS/origin security.

### 3. Step Breakdown
For each step, specify:
- Exact file path and symbol/component/hook names
- **Action** (concrete change) and **Why** (rationale)
- **Dependencies** on earlier steps (or sibling \`[AND-xx]\` / \`[IOS-xx]\` native bridge items)
- **Risk** (\`Low\` / \`Medium\` / \`High\`)

### 4. Implementation Order & Phasing
Break large changes into independently deliverable, mergeable phases:
- **Phase 1**: Minimum viable slice (types/schemas, API or WebView bridge client contract, core happy path)
- **Phase 2**: Core experience (mobile-first responsive UI, state/URL sync, navigation)
- **Phase 3**: Edge cases (error states, empty/loading, offline/flaky network, bridge unavailable fallback, virtual keyboard/safe-area)
- **Phase 4**: Hardening & optimization (Core Web Vitals, bundle splitting, WCAG 2.2 AA a11y, CSP/XSS audit)

## Plan Format

\`\`\`markdown
# Implementation Plan: [Feature Name]

## Overview
[2-3 sentence summary]

## Requirements & Cross-Platform Links
- Source Contract / Work Item: [PRD / Capability Contract / MWB-xx]
- Native Bridge Dependencies: [AND-xx / IOS-xx or None]
- [Requirement 1]

## Architecture Changes
- [File/Module path and change summary]

## Implementation Steps
### Phase 1: [Phase Name]
1. **[Step Name]** (File: \`src/.../File.tsx\`)
   - Action: ...
   - Why: ...
   - Dependencies: None / Step X
   - Risk: Low / Medium / High

## Testing Strategy
- Unit / Component tests: [Vitest/Jest, Testing Library, Bridge mocks, MSW]
- E2E / Visual QA: [Playwright mobile and cross-browser projects, viewport matrix, screenshots, touch, axe-core]

## Risks & Mitigations
- **Risk**: [Description] -> **Mitigation**: [How to address]

## Success Criteria
- [ ] [Verifiable criterion 1]
- [ ] Build, typecheck, lint, unit/E2E tests, and 6-phase \`mobile-web-verification-loop\` pass
\`\`\`

## Red Flags to Check
- Steps without exact file paths or symbols
- Unverified WebView JS bridge contracts or missing standalone-browser fallback
- Missing mobile viewport/touch/safe-area or network-loss edge cases
- Unapproved major framework/bundler upgrades or CSP/CORS/cookie relaxations
`
