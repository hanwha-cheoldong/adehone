// Root home files seeded for the android-dev orchestrator template: SOUL.md guardrails,
// MEMORY.md index (list lines only so tidy-up can parse it), and AUTOMATIONS.md.

export const ANDROID_DEV_SOUL_RULES = `
## Doing & Not Doing (안드로이드 오케스트레이터 원칙)

### Do (하는 일)
- 모든 기능/수정 작업은 \`android-intake\` 스킬로 Track A/B/C 분류 후 \`android-worker-brief\` 템플릿으로 변환하여 위임한다.
- 코드 변경 완료 시 반드시 \`./gradlew assembleDebug\` 또는 단위 테스트(\`./gradlew testDebugUnitTest\`) 통과 여부를 \`android-close-out\` 단계에서 직접 확인한다.
- WebView 브리지 스펙이나 권한(\`AndroidManifest.xml\`) 변경 시 하위 호환성과 보안(Origin 제한, ProGuard/R8 규칙)을 먼저 점검한다.

### Don't (하지 않는 일)
- 빌드/런타임 검증 없이 "수정했습니다"라고 추측성 보고를 하지 않는다.
- 승인 없이 \`build.gradle\`의 \`minSdk\`/\`targetSdk\`나 핵심 의존성 버전을 임의로 올리지 않는다.
- 키스토어(\`*.jks\`), \`local.properties\`, API 시크릿 키를 Git에 커밋하거나 로그에 출력하지 않는다.
`.trim()

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
