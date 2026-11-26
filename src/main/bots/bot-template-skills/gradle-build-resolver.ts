import { ECC_LICENSE_FILES } from './ecc-license'

export const SKILL = `---
name: gradle-build-resolver
description: Kotlin/Gradle build resolver and R8/ProGuard specialist — surgical build error resolution, dependency conflict debugging, SDK/secret guardrails, and ktlint/detekt fixes.
---

# Gradle Build Resolver & R8/ProGuard

Fix Kotlin compilation errors, Gradle configuration issues, dependency conflicts, and R8/ProGuard rules with **minimal, surgical changes**.

## 1. Surgical Build Fix Workflow
1. Run diagnostics:
   - \`./gradlew assembleDebug 2>&1\` (or module compile task, e.g. \`./gradlew app:compileDebugKotlin\`)
   - \`./gradlew ktlintCheck 2>&1 || true\` and \`./gradlew detekt 2>&1 || true\`
2. Separate Gradle configuration errors from Kotlin compilation errors. Fix **configuration/dependency errors first**, then compilation errors in dependency order.
3. Apply the smallest fix for one error at a time—do not refactor unrelated code or suppress warnings without approval.
4. Re-run \`./gradlew assembleDebug\` after each fix, then \`./gradlew testDebugUnitTest\`.
5. **Stop conditions**: Stop and report if the same error persists after 3 attempts, introduces more errors, or requires architectural/version decisions.

## 2. Dependency & Cache Troubleshooting
- Dependency tree: \`./gradlew dependencies --configuration debugRuntimeClasspath\`
- Conflict insight: \`./gradlew dependencyInsight --dependency <name> --configuration debugRuntimeClasspath\`
- Force refresh: \`./gradlew build --refresh-dependencies\`
- Format fix: \`./gradlew ktlintFormat\`

## 3. Gradle, SDK & Secret Guardrails
- Never bump \`minSdk\`, \`targetSdk\`, \`compileSdk\`, AGP, or core dependency versions without explicit owner approval.
- Keep dependencies declared in \`gradle/libs.versions.toml\` where present.
- Never commit \`*.jks\`, \`*.keystore\`, \`local.properties\`, signing passwords, or secret keys.

## 4. R8 / ProGuard Rules
- Verify \`minifyEnabled true\` and \`shrinkResources true\` on release-like builds when modifying keep rules.
- Add \`@Keep\` or narrow \`-keep\` rules in \`proguard-rules.pro\` for \`@JavascriptInterface\` classes/methods, serialization DTOs (Kotlinx.serialization, Gson, Moshi), reflection/JNI, and name-referenced enums.
- Avoid broad \`-keep class ** { *; }\` rules.
`

export const SKILL_FILES = ECC_LICENSE_FILES
