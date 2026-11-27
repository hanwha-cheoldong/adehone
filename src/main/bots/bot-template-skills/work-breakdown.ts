export const SKILL = `---
name: work-breakdown
description: Expand foundational specs into 3-platform milestones and self-contained work briefs ([AND], [IOS], [MWB]) with dependency ordering and cross-bot review sync.
---

# Foundational Design & 3-Platform Work Breakdown

Break an approved PRD + Capability Contract into ordered, independently deliverable work items across **Android, iOS, and Mobile Web**, and coordinate handoff + review with the dev bots that cover it.

## 1. Foundational Product Plan & Dependency Order
- Organize features into prioritized tiers: **Must-Have (Milestone 1)**, **Should-Have (Milestone 2)**, **Nice-to-Have (Later)**.
- Sequence cross-platform dependencies explicitly:
  1. Lock shared contracts first (Backend API, WebView JS Bridge spec, Deep Link schema).
  2. Delegate platform work items with clear IDs: \`[AND-xx]\` (Android), \`[IOS-xx]\` (iOS), \`[MWB-xx]\` (Mobile Web).
  3. Define end-to-end cross-platform verification (e.g. Mobile Web caller <-> Android/iOS native bridge handler).

## 2. Self-Contained Work Item Briefs
Every work item delegated to a platform dev bot MUST include:
1. **Work Item ID & Target Bot**: e.g. \`[AND-01]\`, \`[IOS-01]\`, \`[MWB-01]\`
2. **Foundational Context**: Concise summary of the overall product spec plus the SSOT Capability Contract so each bot sees the full 3-platform picture. Quote the contract sections the item needs, or give an absolute path only when the bot runs on the same computer.
3. **Goal & User Flow**: What the user experiences on that platform (avoid dictating internal Kotlin/Swift/TS class names).
4. **Shared Contract Reference**: Exact bridge/API/deep-link contract version this item implements or consumes, with its text attached as above.
5. **Acceptance Criteria (DoD)**: 2-5 verifiable pass/fail conditions (including error, empty, permission-denied, offline/network-loss states).
6. **Out of Scope**: Explicit boundaries copied from the PRD/contract.
7. **Pre-Implementation Review Gate**: Instruct the dev bot to **inspect feasibility against its codebase first** (reuse, missing API/bridge specs, Manifest/Info.plist/CSP impact) and report blockers or open questions *before* coding.
8. **WebView Bridge Sync**: For hybrid WebView features, cross-link the \`[MWB]\`, \`[AND]\`, and \`[IOS]\` sibling items and list the actions and events each implements, using the names in \`product-capability/references/bridge-protocol.md\` or the contract's recorded differences, plus the fallback behavior and the end-to-end check on real hosts.

## 3. Handoff & Cross-Bot Review Feedback Synchronization
Planning is complete when the owner has approved the plan and every work item brief meets section 2. Then:
1. **Choose the bots yourself.** Run \`orca bot list\` (use the Orca CLI form your own instructions give) and match each bot's purpose against the work and what the owner's projects cover. Do not ask the owner to pick a bot.
2. **Cover every area.** When the work spans several areas, choose every matching bot: work covering both Android and iOS goes to both the Android and the iOS bot. Each bot gets its own brief with its own scope and acceptance criteria.
3. **Report gaps.** When no listed bot fits all or part of the work, tell the owner which part has no bot and keep its brief for them. Never send it to a bot that does not fit.
4. **Ask before sending.** Ask the owner whether to hand off, naming each chosen bot, why you chose it, and the scope it gets. Send nothing to a dev bot until they agree; silence or an answer to another question is not agreement. Ask again before adding a bot or changing the scope they agreed to.
5. **Hand off.** After they agree, send each brief with \`orca orchestration send --to bot:<name> --type handoff --subject "[MWB-01] <title>" --body "<brief>"\`.

When any dev bot (Android, iOS, or Mobile Web) flags a missing spec, bridge mismatch, or platform constraint during its pre-implementation review:
- Resolve the decision (consulting the owner for product/policy calls) and update the **SSOT Capability Contract** first.
- **Propagate the update** to all affected sibling work items across Android, iOS, and Mobile Web before authorizing implementation so platforms never drift.
`
