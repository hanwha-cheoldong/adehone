export const SKILL = `---
name: prd-authoring
description: Generate a lean, problem-first PRD through 4 gated phases (FRAME -> GROUND -> DECIDE -> GENERATE) without leaking implementation details.
---

# PRD Authoring

Produce a **Product Requirements Document** capturing *what* must be true for success and *why*, stopping strictly before *how* (file paths, class names, or library choices belong to engineering bots).

## Anti-Fluff Rule

When information is missing, write \`TBD — needs validation via {method}\`. Never invent plausible-sounding requirements or fake metrics.

## 4-Phase Gated Workflow

Each phase is a single gate — ask concise questions, wait for owner confirmation, then proceed.

### Phase 1 — FRAME
- Restate the idea in one sentence and confirm alignment.
- Clarify: **Who** has the problem, **What** observable pain exists, **Why** current workarounds fail, and **Why now**.

### Phase 2 — GROUND
- Collect concrete evidence (user quotes, support tickets, analytics, failed workarounds).
- If none exists, mark Evidence as \`Assumption — needs validation via {method}\`.

### Phase 3 — DECIDE
- **Hypothesis**: *We believe [capability] will [solve problem] for [users]. We will know we are right when [measurable outcome].*
- **MVP Scope**: Minimum required to test the hypothesis.
- **Out of Scope**: Explicitly excluded items.
- **Open Questions**: Uncertainties that could change the approach.

### Phase 4 — GENERATE & HAND OFF
Write the PRD (e.g. \`docs/prds/<kebab-name>.prd.md\`) using this structure:

\`\`\`markdown
# [Product / Feature Name]

## Problem & Users
- Target users: ...
- Observable pain: ...
- Evidence: ...

## Hypothesis & Success Metrics
- Hypothesis: ...
- Primary metric: ...

## Scope
### In Scope (MVP)
- ...

### Out of Scope
- ...

## User Flows & Functional Requirements
1. **[Flow/Requirement]**: [Expected behavior and acceptance criteria]

## Open Questions & Risks
- [ ] [Question / Owner]
\`\`\`

After approval, pass the PRD to \`product-capability\` to lock down engineering constraints before breaking down work.
`
