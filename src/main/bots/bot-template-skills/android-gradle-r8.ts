export const SKILL = `---
name: android-gradle-r8
description: Sub-skill for Android Gradle/AGP configuration, SDK version guardrails, R8/ProGuard keep rules, and signing/secret hygiene.
---

# Android Gradle & R8/ProGuard

Reference this sub-skill when touching Gradle scripts, dependencies, serialization models, or R8 rules.

## 1. Gradle & SDK Guardrails
- Never bump \`minSdk\`, \`targetSdk\`, \`compileSdk\`, AGP, or core dependency versions without explicit owner approval (Track C).
- Keep dependencies declared in version catalogs (\`gradle/libs.versions.toml\`) where present; avoid duplicate transitive versions.
- Never commit \`*.jks\`, \`*.keystore\`, \`local.properties\`, \`google-services.json\` secrets, or signing passwords.

## 2. R8 / ProGuard Rules
- Keep \`minifyEnabled true\` and \`shrinkResources true\` verified on release-like builds when modifying keep rules.
- Add \`@Keep\` or targeted \`-keep\` rules in \`proguard-rules.pro\` for:
  - \`@JavascriptInterface\` classes and methods
  - Serialization DTOs (Gson, Moshi, Kotlinx.serialization \`@Serializable\`)
  - Reflection / JNI / Parcelable / Enum entries referenced by name
- Prefer narrow package/annotation rules over broad \`-keep class ** { *; }\`.

## 3. Build & Verification Commands
- Debug build: \`./gradlew assembleDebug\`
- Unit tests: \`./gradlew testDebugUnitTest\`
- Lint: \`./gradlew lintDebug\`
`
