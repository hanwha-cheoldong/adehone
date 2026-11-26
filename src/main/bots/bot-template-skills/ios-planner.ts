export const SKILL = `---
name: ios-planner
description: Planning specialist for iOS features and refactors — 4-step planning process, Search-First reuse, phased implementation plans, testing strategy, risks, and Red Flags.
---

# iOS Implementation Planner

Create specific, actionable, incrementally verifiable plans before writing code for any non-trivial feature, refactor, or architecture change.

## Planning Process

### 1. Requirements Analysis
- When receiving an \`[IOS-xx]\` work item from the planning bot, read the attached **SSOT Capability Contract** and the item's DoD first; if either is missing, ask for it.
- Clarify the exact feature or bug fix, success criteria, assumptions, and constraints; report any missing spec or platform conflict back to \`product-planning\` *before* coding.
- For WKWebView JS bridge, Universal Links, or APNs payload changes, check \`ios-security-webview/references/bridge-protocol.md\` and the attached contract, then align with the Mobile web and Android bots as its section 6 describes.
- Define explicit **In Scope** and **Out of Scope** boundaries.

### 2. Search-First & Architecture Review
- Search existing code (\`Core\`, \`DesignSystem\`, \`Domain\`, \`Package.swift\` / \`Podfile\`) before building anything new: **Adopt -> Extend -> Build Custom**.
- Inspect \`*.xcodeproj/project.pbxproj\`, \`Package.swift\`, \`Info.plist\`, \`*.entitlements\`, \`*-Bridging-Header.h\`, and legacy Objective-C (\`.h\`/\`.m\`) module dependencies.
- Check Clean Architecture boundaries, Swift 6 strict concurrency / \`Sendable\` / ObjC-Swift interop impact, and WKWebView/security/signing impact.

### 3. Step Breakdown
For each step, specify:
- Exact file path and symbol/type/function names
- **Action** (concrete change) and **Why** (rationale)
- **Dependencies** on earlier steps
- **Risk** (\`Low\` / \`Medium\` / \`High\`)

### 4. Implementation Order & Phasing
Break large changes into independently deliverable, mergeable phases:
- **Phase 1**: Minimum viable slice (domain contract + protocol + core happy path)
- **Phase 2**: Core experience (SwiftUI views, \`@Observable\` ViewModel, navigation, wiring)
- **Phase 3**: Edge cases (error states, nil/empty, permission denied, task cancellation)
- **Phase 4**: Hardening & optimization (VoiceOver, Dynamic Type, memory/ARC, security)

## Plan Format

\`\`\`markdown
# Implementation Plan: [Feature Name]

## Overview
[2-3 sentence summary]

## Requirements
- [Requirement 1]
- [Requirement 2]

## Architecture Changes
- [Target/File path and change summary]

## Implementation Steps
### Phase 1: [Phase Name]
1. **[Step Name]** (File: \`Sources/.../File.swift\`)
   - Action: ...
   - Why: ...
   - Dependencies: None / Step X
   - Risk: Low / Medium / High

## Testing Strategy
- Unit / Concurrency tests: [Swift Testing (@Test, #expect), XCTest, Protocol mocks/fakes]
- Integration / UI / Smoke: [SwiftUI previews, XCUITest, or xcrun simctl checks]

## Risks & Mitigations
- **Risk**: [Description] -> **Mitigation**: [How to address]

## Success Criteria
- [ ] [Verifiable criterion 1]
- [ ] All Xcode/SwiftPM build, SwiftLint, and unit tests pass (80%+ domain coverage)
\`\`\`

## Red Flags to Check
- Steps without exact file paths or symbols
- Missing testing strategy or unaddressed error/nil/cancellation edge cases
- Phases that cannot be verified or merged independently
- Unapproved \`IPHONEOS_DEPLOYMENT_TARGET\`, \`SWIFT_VERSION\`, or major SPM/CocoaPods dependency bumps
`
