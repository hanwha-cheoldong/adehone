export const SKILL = `---
name: product-capability
description: Translate PRD intent into an implementation-ready Capability Contract exposing constraints, invariants, interfaces, and unresolved decisions before dev bots start.
---

# Product Capability Contract

Turn product intent (PRD, roadmap note, or discussion) into explicit engineering constraints so implementation bots (Android, iOS, Mobile Web, Backend) can review feasibility without guessing hidden assumptions.

## Non-Negotiable Rules

- Never invent product truth; mark unresolved decisions explicitly as \`OPEN\`.
- Separate **user-visible promises** from **implementation details**.
- Distinguish **fixed policy** (security, compliance, SLA) from **open preference**.
- If a requirement conflicts with existing platform/repo constraints, call it out directly.

## Capability Contract Format

\`\`\`markdown
# Capability Contract: [Product / Feature Name]

## Source PRD / Context
- Reference: [path or link to PRD / foundational spec]

## User-Visible Promises & Acceptance Criteria
- [Promise 1 + verifiable criterion]

## Platform & Cross-Cutting Constraints
- **Fixed Policies**: [auth, encryption, permissions, data retention, offline/retry]
- **Interfaces / Contracts**: [API endpoints, WebView JS bridge contracts, deep links, push payloads]
- **Invariants**: [states that must never occur, backward compatibility rules]

## Open Decisions (Blocking vs Non-Blocking)
- [ ] [Decision] — Blocking for: [Android / iOS / Web / Backend]

## Out of Scope / Non-Goals
- [Explicitly excluded]
\`\`\`

Once blocking decisions are resolved (or flagged for dev-bot triage), hand off to \`work-breakdown\` to slice into self-contained work items.
`
