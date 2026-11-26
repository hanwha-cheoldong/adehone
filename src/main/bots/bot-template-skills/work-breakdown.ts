export const SKILL = `---
name: work-breakdown
description: Expand foundational specs into 3-platform milestones and self-contained work briefs ([AND], [IOS], [MWB]) with dependency ordering and cross-bot review sync.
---

# Foundational Design & 3-Platform Work Breakdown

Break an approved PRD + Capability Contract into ordered, independently deliverable work items across **Android, iOS, and Mobile Web**, and coordinate delegation + review with each platform's dev bot.

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
7. **Pre-Implementation Review Gate**: Instruct the dev bot (\`android-planner\`, \`ios-planner\`, \`mobile-web-planner\`) to **inspect feasibility against its codebase first** (reuse, missing API/bridge specs, Manifest/Info.plist/CSP impact) and report blockers or open questions *before* coding.
8. **WebView Bridge Sync**: For hybrid WebView features, cross-link the \`[MWB]\`, \`[AND]\`, and \`[IOS]\` sibling items and list the actions and events each implements, using the names in \`product-capability/references/bridge-protocol.md\` or the contract's recorded differences, plus the fallback behavior and the end-to-end check on real hosts.

## 3. Delivery & Cross-Bot Review Feedback Synchronization
Deliver each item with \`orca bot list\` and \`orca orchestration send --to bot:<name> --type handoff --subject "[MWB-01] <title>" --body "<brief>"\` (use the Orca CLI form your own instructions give). If a platform bot is not listed, give your owner the brief to relay.

When any dev bot (Android, iOS, or Mobile Web) flags a missing spec, bridge mismatch, or platform constraint during its pre-implementation review:
- Resolve the decision (consulting the owner for product/policy calls) and update the **SSOT Capability Contract** first.
- **Propagate the update** to all affected sibling work items across Android, iOS, and Mobile Web before authorizing implementation so platforms never drift.
`
