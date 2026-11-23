export const SKILL = `---
name: android-intake
description: Classify incoming Android development requests into Track A (Quick Fix), Track B (Feature / Bridge), or Track C (Architecture / Migration) before delegating.
---

# Intake: Android Request Triage

Classify every incoming request by complexity, blast radius, and risk before writing a \`worker-brief\`.

## Track A — Quick Fix (즉시 처리)
- **Scope**: Copy/string resource edits, drawable/icon additions, log/comment cleanup, single-function bug fixes with no API, Manifest, or Gradle changes.
- **Action**: Write a concise \`worker-brief\` and execute immediately.

## Track B — Standard Feature / Bridge (표준 기능 구현)
- **Scope**: New Compose/Fragment screens, WebView ↔ Native JS bridge APIs, runtime permissions, Device API integrations, or ViewModel/Repository changes.
- **Action**: Analyze impact on \`AndroidManifest.xml\`, ProGuard/R8 rules, and JS bridge contracts first, then write a full \`worker-brief\` (referencing \`android-development\`, \`android-webview-bridge\`, and \`android-gradle-r8\` as needed) and delegate.

## Track C — High-Risk / Architecture Change (고위험·구조 변경)
- **Scope**: Gradle/AGP upgrades, \`minSdk\`/\`targetSdk\` changes, module splits, R8/ProGuard global rule changes, MDM/MAM/auth/payment/encryption flows, or background services.
- **Action**: Draft an architecture & risk proposal first and get explicit owner approval before launching a worker.
`
