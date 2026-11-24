// Root home files seeded for the android-dev template:
// SOUL.md guardrails, MEMORY.md index (list lines only so tidy-up can parse it), and AUTOMATIONS.md.

export const ANDROID_DEV_DO_RULES: readonly string[] = [
  '- Plan every non-trivial feature or refactor with `android-planner` (Requirements -> Search-First & Architecture Review -> Phased Steps -> Testing Strategy & Risks) before editing code.',
  '- Follow `android-clean-architecture` (`domain` pure Kotlin), `compose-patterns`, `kotlin-coroutines-flows`, and `kotlin-tdd-testing` (tests before code, Turbine/MockK, 80%+ domain coverage).',
  '- Before reporting done or opening a PR, run the 6-phase `android-verification-loop` (`assembleDebug`, `lintDebug`, `ktlintCheck`/`detekt`, `testDebugUnitTest`, security scan, `adb` acceptance) and `kotlin-code-review`.',
  '- Before changing WebView bridge specs, encryption, or `AndroidManifest.xml` permissions, verify backward compatibility and `android-security-webview` + `gradle-build-resolver` R8 keep rules.'
]

export const ANDROID_DEV_DONT_RULES: readonly string[] = [
  '- Never claim something is fixed without passing `android-verification-loop` build/test checks first.',
  '- Never use `GlobalScope`, swallow `CancellationException`, add `!!` assertions, or import Android/DB/network frameworks inside `domain`.',
  '- Never bump `minSdk`/`targetSdk` in `build.gradle` or core dependency versions without explicit owner approval.',
  '- Never commit keystores (`*.jks`), `local.properties`, or API secret keys to Git, or print sensitive values in logs.'
]

export const ANDROID_DEV_MEMORY_SEED = `# Memory

## Project Fixed Specs
- Architecture pattern: (e.g. Clean Architecture — app / presentation / domain / data / core)
- UI stack: (e.g. Jetpack Compose / Material 3 / Compose Navigation 2.8+ / WebView hybrid)
- DI & async: (e.g. Hilt or Koin / Coroutines + StateFlow / WhileSubscribed(5_000))
- Testing & static analysis: (e.g. JUnit or Kotest / MockK / Turbine / ktlint / detekt / Kover)
- SDK & Gradle: (e.g. minSdk / targetSdk / compileSdk / AGP version / libs.versions.toml)

## Common Verification Commands
- Debug build: \`./gradlew assembleDebug\`
- Unit tests: \`./gradlew testDebugUnitTest\`
- Lint & static analysis: \`./gradlew lintDebug\`, \`./gradlew ktlintCheck\`, \`./gradlew detekt\`
- Auto-format: \`./gradlew ktlintFormat\`
- Coverage report: \`./gradlew koverHtmlReport\`
- Device smoke test: \`adb install -r app/build/outputs/apk/debug/app-debug.apk\`

## Active Work & Tech Debt
- Active feature branches: (none)
- Open issues / tech debt: (none)
`

export const ANDROID_DEV_AUTOMATIONS_DOC = `# Automations

## 1. 일일 Gradle 빌드·정적 분석 헬스체크 (Daily Morning Check)
- **실행 시각**: 평일 오전 9:00 (\`0 9 * * 1-5\`, 생성 시 비활성화 상태로 등록됨)
- **동작**:
  1. \`git fetch\` 후 현재 작업 브랜치에서 \`./gradlew assembleDebug\`, \`./gradlew lintDebug\`, 설정된 \`ktlintCheck\`/\`detekt\` 실행
  2. 빌드·정적 분석 결과 및 최신 커밋 요약을 간결한 아침 상태로 보고

## 2. PR 자동 검증 및 코드 리뷰 파이프라인 (PR Trigger)
- **트리거**: 풀 리퀘스트 생성/업데이트 시
- **동작**:
  1. \`android-verification-loop\` 6단계 검증(\`assembleDebug\`, \`lintDebug\`/\`ktlintCheck\`/\`detekt\`, \`testDebugUnitTest\`, 보안 diff 스캔, R8/WebView 점검) 실행
  2. \`kotlin-code-review\` 기준으로 심각도별(CRITICAL/HIGH/MEDIUM/LOW) 리뷰 및 PASS/FAIL 리포트 게시
`
