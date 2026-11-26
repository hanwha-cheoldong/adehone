import { ECC_LICENSE_FILES } from './ecc-license'

export const SKILL = `---
name: android-verification-loop
description: 6-phase verification loop for Android — build, lint/static analysis, unit tests & Kover coverage, security grep scan, diff review, and adb target acceptance with PASS/FAIL report.
---

# Android 6-Phase Verification Loop

Run all verification phases after completing a feature or refactor and before reporting done or opening a PR.

## Phase 1: Build Verification
- Run \`./gradlew assembleDebug\` and confirm exit code \`0\`. If build fails, STOP and fix using \`gradle-build-resolver\`.

## Phase 2: Lint & Static Analysis
- Run \`./gradlew lintDebug\` when Manifest, resources, permissions, or WebView/security code changed.
- Run \`./gradlew ktlintCheck\` and \`./gradlew detekt\` when configured in the project.

## Phase 3: Unit Tests & Coverage
- Run \`./gradlew testDebugUnitTest\` and confirm all tests pass.
- It skips pure Kotlin/JVM modules such as \`domain\`: also run their \`test\` task (e.g. \`./gradlew :domain:test\`).
- Run \`./gradlew koverHtmlReport\` when Kover is configured (target 80%+ on domain/business logic).

## Phase 4: Security & Anti-Pattern Scan
Scan \`git diff\` for high-risk patterns:
- **Secrets & Logs**: Hardcoded keys/tokens, \`*.jks\`, \`local.properties\`, sensitive data in \`Log.*\` / \`println\`.
- **Network & Manifest**: \`cleartextTrafficPermitted="true"\`, \`allowBackup="true"\`, permissive \`TrustManager\`/\`HostnameVerifier\`, unguarded exported components.
- **Intents & WebView**: \`PendingIntent.FLAG_MUTABLE\`, unvalidated \`intent://\`, \`@JavascriptInterface\` without \`@Keep\` or origin checks.
- **Files**: Paths built from external input (including zip entry names) without the \`kotlin-code-review\` path traversal check.
- **Data & Coroutines**: Raw SQL string interpolation, \`GlobalScope\`, swallowed \`CancellationException\`, \`!!\`.

## Phase 5: Diff Review
Run \`git diff --stat\` and verify against \`kotlin-code-review\`:
- Pure-Kotlin \`domain\` boundaries, Compose lifecycle/keys/accessibility, and R8 \`@Keep\` rules.

## Phase 6: Target Acceptance (Emulator / Device)
Report target acceptance **separately** from local Gradle checks. If \`adb devices\` lists an online emulator or device:
- Install: \`adb install -r app/build/outputs/apk/debug/app-debug.apk\`
- Launch the app, verify the changed flow, and check \`adb logcat -d | grep -E "FATAL EXCEPTION|AndroidRuntime"\`.
- If no device/emulator is online, mark as \`SKIPPED (no device)\`.

## Verification Report Format
\`\`\`text
Verification Report: PASS / FAIL
- Build (assembleDebug): PASS/FAIL
- Lint & Static (lintDebug, ktlint, detekt): PASS/FAIL/N/A
- Tests & Coverage (testDebugUnitTest, JVM module tests, kover): PASS/FAIL (X passed)
- Security Scan & Diff Review: PASS/FAIL
- Target Acceptance (adb): PASS/FAIL/SKIPPED
- Modified Files & Summary: ...
- Manual Verification Needed: ...
\`\`\`
`

export const SKILL_FILES = ECC_LICENSE_FILES
