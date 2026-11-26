export const SKILL = `---
name: android-planner
description: Planning specialist for Android features and refactors — 4-step planning process, Search-First reuse, phased implementation plans, testing strategy, risks, and Red Flags.
---

# Android Implementation Planner

Create specific, actionable, incrementally verifiable plans before writing code for any non-trivial feature, refactor, or architecture change.

## Planning Process

### 1. Requirements Analysis
- When receiving an \`[AND-xx]\` work item from the planning bot, read the attached **SSOT Capability Contract** and the item's DoD first; if either is missing, ask for it.
- Clarify the exact feature or bug fix, success criteria, assumptions, and constraints; report any missing spec or platform conflict back to \`product-planning\` *before* coding.
- For WebView JS bridge, deep-link, or push-payload changes, check \`android-security-webview/references/bridge-protocol.md\` and the attached contract, then align with the Mobile web and iOS bots as its section 6 describes.
- Define explicit **In Scope** and **Out of Scope** boundaries.

### 2. Search-First & Architecture Review
- Search existing code (\`core\`, \`design-system\`, \`domain\`, \`gradle/libs.versions.toml\`) before building anything new: **Adopt -> Extend -> Build Custom**.
- Inspect \`settings.gradle.kts\`, \`build.gradle.kts\`, \`AndroidManifest.xml\`, and module dependencies.
- Check Clean Architecture boundariaes, R8/ProGuard rules, and WebView/security impact.

### 3. Step Breakdown
For each step, specify:
- Exact file path and symbol/function names
- **Action** (concrete change) and **Why** (rationale)
- **Dependencies** on earlier steps
- **Risk** (\`Low\` / \`Medium\` / \`High\`)

### 4. Implementation Order & Phasing
Break large changes into independently deliverable, mergeable phases:
- **Phase 1**: Minimum viable slice (data/domain contract + core happy path)
- **Phase 2**: Core experience (UI, ViewModel, navigation, wiring)
- **Phase 3**: Edge cases (error states, null/empty, permission denied, cancellation)
- **Phase 4**: Hardening & optimization (R8, performance, accessibility)

## Plan Format

\`\`\`markdown
# Implementation Plan: [Feature Name]

## Overview
[2-3 sentence summary]

## Requirements
- [Requirement 1]
- [Requirement 2]

## Architecture Changes
- [Module/File path and change summary]

## Implementation Steps
### Phase 1: [Phase Name]
1. **[Step Name]** (File: \`path/to/File.kt\`)
   - Action: ...
   - Why: ...
   - Dependencies: None / Step X
   - Risk: Low / Medium / High

## Testing Strategy
- Unit / Flow tests: [JUnit/Kotest, MockK, runTest, Turbine]
- Integration / UI / Smoke: [Compose UI or adb checks]

## Risks & Mitigations
- **Risk**: [Description] -> **Mitigation**: [How to address]

## Success Criteria
- [ ] [Verifiable criterion 1]
- [ ] All Gradle build, lint/static checks, and unit tests pass (80%+ domain coverage)
\`\`\`

## Red Flags to Check
- Steps without exact file paths or symbols
- Missing testing strategy or unaddressed error/null/cancellation edge cases
- Phases that cannot be verified or merged independently
- Unapproved \`minSdk\`/\`targetSdk\`/AGP or major dependency bumps
`
