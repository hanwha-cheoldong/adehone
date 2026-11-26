export const SKILL = `---
name: work-breakdown
description: Expand foundational product specs into prioritized milestones/work items and emit self-contained delegation briefs with acceptance criteria, out-of-scope guards, and dev-bot review gates.
---

# Foundational Design & Work Breakdown

Break an approved PRD + Capability Contract into ordered, independently deliverable work items, and coordinate delegation + review with implementation bots (e.g. Android bot, iOS bot, Mobile Web bot).

## 1. Foundational Product Plan
- Organize features into prioritized tiers: **Must-Have (Milestone 1)**, **Should-Have (Milestone 2)**, **Nice-to-Have (Later)**.
- Map cross-platform dependencies (e.g. Backend/Bridge contract before Android/iOS UI).
- Define end-to-end evaluation criteria (functionality, UX polish, security/edge cases).

## 2. Self-Contained Work Item Briefs
Every work item delegated to an implementation bot MUST include:
1. **Work Item ID & Title**: e.g. \`[A-01] PIN Lock Screen & Biometric Prompt\`
2. **Foundational Context**: Link or concise summary of the overall Product A spec + Capability Contract so the dev bot never optimizes in isolation.
3. **Goal & User Flow**: What the user experiences (avoid dictating internal Kotlin/Swift class names).
4. **Acceptance Criteria (DoD)**: 2-5 verifiable pass/fail conditions (including error, empty, permission-denied, offline states).
5. **Out of Scope**: Explicit boundaries copied from the PRD/contract.
6. **Pre-Implementation Review Gate**: Instruct the dev bot to **inspect feasibility against its codebase first** (reuse, missing API/bridge specs, manifest/permission impact) and report blockers or open questions *before* coding.

## 3. Handling Dev-Bot Review Feedback
When an implementation bot (e.g. Android bot) flags a missing spec, conflicting constraint, or high-risk change during its review gate:
- Update the Capability Contract / PRD with the resolution (consulting the owner for product/policy calls).
- Re-issue or amend the affected work item brief before authorizing implementation.
`
