export const SKILL = `---
name: ios-worker-brief
description: Standard iOS worker delegation brief format (BRIEF.md) with target modules, WKWebView bridge contracts, and Xcode verification DoD.
---

# iOS Worker Brief Template

Always structure worker delegation specs with these sections so the worker has clear boundaries and Definition of Done.

\`\`\`markdown
## 1. Goal & Track
- Track: [A | B | C]
- Summary: <1-2 sentences of what must change>

## 2. Target Files & Modules
- Modules / Targets: <e.g. App, CoreSecurity, WebBridge>
- Touchpoints: <known files or symbols>

## 3. Contracts & Constraints
- WKWebView JS Bridge (if any): <message handler name, request/response JSON shape, origin allowlist>
- Info.plist / Entitlements: <any required usage descriptions, ATS, Keychain access groups, or "No changes allowed">
- Guardrails: <no Deployment Target bump, no hardcoded secrets, keep main-thread UI updates>

## 4. Definition of Done (Verification)
- Build: \`xcodebuild ... build\` passes
- Tests / Lint: \`xcodebuild ... test\` and \`swiftlint\` pass
- Diff check: verify \`Info.plist\`, Entitlements, and no \`*.p12\`/\`*.mobileprovision\`/\`*.p8\` committed
\`\`\`
`
