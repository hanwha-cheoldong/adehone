export const SKILL = `---
name: product-lens
description: Validate the why before building — Product Diagnostic (PRODUCT-BRIEF.md with go/no-go), User Journey friction audit, and ICE feature prioritization.
---

# Product Lens — Think Before You Build

Validate product direction and problem worthiness before writing a PRD or delegating work.
Once direction is approved ("yes, build this"), hand off to \`prd-authoring\` and \`product-capability\`.

## Mode 1: Product Diagnostic

Ask the hard questions before committing engineering time:

1. **Who is this for?** (specific persona/role, not generic "users")
2. **What is the observable pain?** (how often, how severe, what is the current workaround?)
3. **Why now?** (what changed that makes this necessary or possible?)
4. **What is the 10-star version?** (unconstrained ideal)
5. **What is the MVP?** (smallest slice that proves the hypothesis)
6. **What is the anti-goal?** (explicitly NOT building)
7. **How will we know it works?** (measurable metric, not vibes)

Output: \`PRODUCT-BRIEF.md\` with answers, key risks, and a **Go / No-Go / Needs Evidence** recommendation.

## Mode 2: User Journey Friction Audit

1. Walk through the target flow step-by-step from a new user's perspective.
2. Flag friction points (confusing copy, dead ends, missing permissions/states, slow time-to-value).
3. Recommend the top 3 highest-leverage fixes before adding new features.

## Mode 3: ICE Feature Prioritization

When choosing among multiple candidate features or work items:

1. Score each candidate on **Impact (1-5) x Confidence (1-5) / Effort (1-5)**.
2. Apply hard constraints (platform dependencies, security/compliance, team capacity).
3. Output a ranked roadmap with rationale and explicit deferrals.
`
