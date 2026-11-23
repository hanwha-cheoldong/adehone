// Root home files seeded for the android-dev orchestrator template: SOUL.md guardrails,
// MEMORY.md index (list lines only so tidy-up can parse it), and AUTOMATIONS.md.

export const ANDROID_DEV_DO_RULES: readonly string[] = [
  '- Classify every feature or fix into Track A/B/C with the `android-intake` skill and convert it into an `android-worker-brief` template before delegating.',
  '- After code changes, verify `./gradlew assembleDebug` or unit tests (`./gradlew testDebugUnitTest`) pass directly in the `android-close-out` step.',
  '- Before changing WebView bridge specs or `AndroidManifest.xml` permissions, check backward compatibility and security (origin restrictions, ProGuard/R8 rules) first.'
]

export const ANDROID_DEV_DONT_RULES: readonly string[] = [
  '- Never claim something is fixed without verifying the build or runtime first.',
  '- Never bump `minSdk`/`targetSdk` in `build.gradle` or core dependency versions without approval.',
  '- Never commit keystores (`*.jks`), `local.properties`, or API secret keys to Git, or print them in logs.'
]

export const ANDROID_DEV_MEMORY_SEED = `# Memory

## 프로젝트 고정 스펙
- 아키텍처 패턴: (예: MVVM + Clean Architecture)
- UI 스택: (예: Jetpack Compose / XML / WebView 하이브리드 브리지)
- DI & 비동기: (예: Hilt or Koin / Coroutines + StateFlow)
- SDK & Gradle: (예: minSdk / targetSdk / compileSdk / AGP 버전)

## 자주 쓰는 검증 명령어
- 디버그 빌드: \`./gradlew assembleDebug\`
- 단위 테스트: \`./gradlew testDebugUnitTest\`
- 린트 검사: \`./gradlew lintDebug\`
- 디바이스 스모크: \`adb install -r app/build/outputs/apk/debug/app-debug.apk\`

## 진행 중인 작업 & 기술 부채
- 진행 중인 피처 브랜치: (없음)
- 미해결 이슈 / 기술 부채: (없음)
`

export const ANDROID_DEV_AUTOMATIONS_DOC = `# Automations

## 1. 일일 빌드·의존성 헬스체크 (Daily Morning Check)
- **실행 시각**: 평일 오전 9:00 (\`0 9 * * 1-5\`, 생성 시 비활성화 상태로 등록됨)
- **동작**:
  1. \`git fetch\` 후 현재 작업 브랜치에서 클린 빌드(\`./gradlew assembleDebug\`) 및 \`./gradlew lintDebug\` 실행
  2. 경고/에러 또는 최신 커밋 내역을 요약해 \`android-desk-brief\` 양식으로 아침 브리핑 생성

## 2. PR / 작업 완료 자동 검증 파이프라인 (Post-Worker / PR Trigger)
- **트리거**: 풀 리퀘스트 생성/업데이트 또는 워커 작업 완료 시
- **동작**:
  1. \`./gradlew testDebugUnitTest\` 실행
  2. R8/ProGuard 규칙 누락 여부 및 WebView 브리지 인터페이스 변경점 Diff 추출
  3. \`android-close-out\` 체크리스트를 채워 결과 보고
`
