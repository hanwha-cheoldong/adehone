export const SKILL = `---
name: product-capability
description: Translate PRD intent into an implementation-ready 3-platform Capability Contract (Android, iOS, Mobile Web) locking down shared bridge/API contracts, invariants, and open decisions.
---

# Product Capability Contract (Android · iOS · Mobile Web)

Turn product intent (PRD, roadmap note, or discussion) into explicit engineering constraints and a **Single Source of Truth (SSOT)** contract so Android, iOS, and Mobile Web bots can review feasibility without guessing hidden assumptions.

## Non-Negotiable Rules

- Never invent product truth; mark unresolved decisions explicitly as \`OPEN\`.
- Separate **user-visible promises** from **implementation details**.
- Distinguish **fixed policy** (security, compliance, SLA) from **open preference**.
- Lock down **shared cross-platform contracts** (WebView JS bridge, deep links, API schemas, push payloads) in one place before splitting work to platform bots.
- If a requirement conflicts with existing platform constraints (e.g. iOS WKWebView origin rules, Android permissions/R8, Mobile Web viewport/CSP), call it out directly.

## Capability Contract Format

\`\`\`markdown
# Capability Contract: [Product / Feature Name]

## Source PRD / Context
- Reference: [path or link to PRD / foundational spec]

## User-Visible Promises & Acceptance Criteria
- [Promise 1 + verifiable criterion]

## 3-Platform Parity & Exceptions
- **Android**: [permissions, back-navigation, lifecycle, minSdk/security constraints]
- **iOS**: [Info.plist/entitlements, WKWebView lifecycle, Safe Area, OS constraints]
- **Mobile Web**: [viewport/100dvh, touch ergonomics, offline/PWA, CSP/origin rules]

## Shared Contracts (SSOT)
- **WebView JS Bridge**: [method names, request/response schemas, error codes, fallback/versioning]
- **Deep Links / Routing**: [URL schemes, universal/app links, fallback behavior]
- **API & Push Payloads**: [endpoints, auth headers, FCM/APNs payload parity]
- **Fixed Policies & Invariants**: [encryption, session rules, states that must never occur]

## Open Decisions (Blocking vs Non-Blocking)
- [ ] [Decision] — Blocking for: [Android / iOS / Mobile Web / Backend]

## Out of Scope / Non-Goals
- [Explicitly excluded]
\`\`\`

Once blocking decisions are resolved (or flagged for dev-bot triage), hand off to \`work-breakdown\` to slice into platform-specific work items.
`
