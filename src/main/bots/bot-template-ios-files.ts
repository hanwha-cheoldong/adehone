// Root home files seeded for the ios-dev orchestrator template: SOUL.md guardrails,
// MEMORY.md index (list lines only so tidy-up can parse it), and AUTOMATIONS.md.

export const IOS_DEV_DO_RULES: readonly string[] = [
  '- Classify every feature or fix into Track A/B/C with the `ios-intake` skill and convert it into an `ios-worker-brief` template before delegating.',
  '- After code changes, verify `xcodebuild` build or unit tests (`xcodebuild test` / `swift test`) pass directly in the `ios-close-out` step.',
  '- Before changing WKWebView bridge specs, `Info.plist`, or Entitlements, check backward compatibility and security (origin restrictions, ATS, Keychain access groups) first.'
]

export const IOS_DEV_DONT_RULES: readonly string[] = [
  '- Never claim something is fixed without verifying the build or simulator/test run first.',
  '- Never bump iOS deployment target, Xcode project settings, or SwiftPM/CocoaPods dependency versions without approval.',
  '- Never commit `.p12`, `.mobileprovision`, `AuthKey_*.p8`, or API secret keys to Git, or print them in logs.'
]

export const IOS_DEV_MEMORY_SEED = `# Memory

## 프로젝트 고정 스펙
- 아키텍처 패턴: (예: MVVM + Clean Architecture / TCA)
- UI 스택: (예: SwiftUI / UIKit / WKWebView 하이브리드 브리지)
- DI & 비동기: (예: Swift Concurrency async/await + Observation)
- 배포 타깃 & 패키지: (예: iOS Deployment Target / Xcode / SwiftPM or CocoaPods)

## 자주 쓰는 검증 명령어
- 빌드 확인: \`xcodebuild -scheme <App> -destination 'platform=iOS Simulator,name=iPhone 16' build\`
- 단위 테스트: \`xcodebuild -scheme <App> -destination 'platform=iOS Simulator,name=iPhone 16' test\`
- 린트 검사: \`swiftlint\`
- 시뮬레이터 실행: \`xcrun simctl install booted <App.app>\`

## 진행 중인 작업 & 기술 부채
- 진행 중인 피처 브랜치: (없음)
- 미해결 이슈 / 기술 부채: (없음)
`

export const IOS_DEV_AUTOMATIONS_DOC = `# Automations

## 1. 일일 빌드·린트 헬스체크 (Daily Morning Check)
- **실행 시각**: 평일 오전 9:00 (\`0 9 * * 1-5\`, 생성 시 비활성화 상태로 등록됨)
- **동작**:
  1. \`git fetch\` 후 현재 작업 브랜치에서 \`xcodebuild\` 빌드 및 \`swiftlint\` 실행
  2. 경고/에러 또는 최신 커밋 내역을 요약해 \`ios-desk-brief\` 양식으로 아침 브리핑 생성

## 2. PR / 작업 완료 자동 검증 파이프라인 (Post-Worker / PR Trigger)
- **트리거**: 풀 리퀘스트 생성/업데이트 또는 워커 작업 완료 시
- **동작**:
  1. \`xcodebuild test\` 실행
  2. \`Info.plist\` / Entitlements / WKWebView 브리지 인터페이스 변경점 Diff 추출
  3. \`ios-close-out\` 체크리스트를 채워 결과 보고
`
