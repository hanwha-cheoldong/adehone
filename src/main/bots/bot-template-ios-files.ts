// Root home files seeded for the ios-dev template:
// SOUL.md guardrails, MEMORY.md index (list lines only so tidy-up can parse it), and AUTOMATIONS.md.

export const IOS_DEV_DO_RULES: readonly string[] = [
  '- Plan every non-trivial feature or refactor with `ios-planner` (Requirements -> Search-First & Architecture Review -> Phased Steps -> Testing Strategy & Risks) before editing code.',
  '- Follow `ios-clean-architecture` (`Domain` pure Swift), `ios-swiftui-patterns` (`@Observable` only when the deployment target is iOS 17+), `swift-concurrency-actors` (`Sendable`/actors), and `swift-tdd-testing` (tests before code, Swift Testing, 80%+ domain coverage).',
  '- Before reporting done or opening a PR, run the 6-phase `ios-verification-loop` (`xcodebuild`/`swift build`, `swiftlint`, `xcodebuild test`, security scan, `simctl` acceptance) and `swift-code-review`.',
  '- Before changing WKWebView bridge specs, encryption, `Info.plist`, or `*.entitlements`, verify backward compatibility and `ios-security-webview` + `xcode-build-resolver` guardrails.'
]

export const IOS_DEV_DONT_RULES: readonly string[] = [
  '- Never claim something is fixed without passing `ios-verification-loop` build/test checks first.',
  '- Never use force unwraps (`!`, `try!`, `as!`), store secrets in `UserDefaults`, block `@MainActor` with sync I/O, or import UI/DB/WebKit frameworks inside `Domain`.',
  '- Never bump `IPHONEOS_DEPLOYMENT_TARGET`, `SWIFT_VERSION`, or major SPM/CocoaPods dependency versions without explicit owner approval.',
  '- Never build a feature on APIs newer than the deployment target, not even behind `@available`/`#available`, without explicit owner approval. Asked for the "latest" approach, ship what runs on every supported OS and offer the newer one as a choice.',
  '- Never commit `.p12`, `.mobileprovision`, `AuthKey_*.p8`, or API secret keys to Git, or print sensitive values in logs.'
]

export const IOS_DEV_MEMORY_SEED = `# Memory

## Project Fixed Specs
- Architecture pattern: (e.g. Clean Architecture — App / Presentation / Domain / Data / Core)
- UI & legacy stack: (e.g. SwiftUI / @Observable / UIKit / Objective-C interop via Bridging Header / WKWebView)
- Concurrency & persistence: (e.g. Swift 6 strict concurrency / @MainActor / Actors / SwiftData / Keychain)
- Testing & static analysis: (e.g. Swift Testing / XCTest / Protocol DI mocks / SwiftLint / swift-format)
- Deployment & packages: (e.g. IPHONEOS_DEPLOYMENT_TARGET / SWIFT_VERSION / Xcode / SwiftPM or CocoaPods)

## Common Verification Commands
- Simulator build: \`xcodebuild -scheme <Scheme> -destination 'generic/platform=iOS Simulator' build\`
- Unit tests & coverage: \`xcodebuild -scheme <Scheme> -destination 'platform=iOS Simulator,name=iPhone 16' -enableCodeCoverage YES test\`
- SwiftPM build & test: \`swift build\` / \`swift test --enable-code-coverage\`
- Lint & format check: \`swiftlint lint --quiet\` / \`swift-format lint -r .\`
- Simulator smoke test: \`xcrun simctl install booted <App.app> && xcrun simctl launch booted <bundle-id>\`

## Active Work & Tech Debt
- Active feature branches: (none)
- Open issues / tech debt: (none)

## Cross-Bot Collaboration (Product Planning · Mobile Web · Android)
- Active [IOS] items & SSOT Capability Contracts: (none)
- Shared WKWebView bridge / Universal Links sync status: (none)
`

export const IOS_DEV_AUTOMATIONS_DOC = `# Automations

## 1. 일일 Xcode/Swift 빌드·정적 분석 헬스체크 (Daily Morning Check)
- **실행 시각**: 평일 오전 9:00 (\`0 9 * * 1-5\`, 생성 시 비활성화 상태로 등록됨)
- **동작**:
  1. \`git fetch\` 후 현재 작업 브랜치에서 \`xcodebuild build-for-testing\`(또는 \`swift build\`), \`swiftlint\`/\`swift-format\` 실행
  2. 빌드·정적 분석 결과 및 최신 커밋 요약을 간결한 아침 상태로 보고

## 2. PR 자동 검증 및 코드 리뷰 파이프라인 (PR Trigger)
- **트리거**: 풀 리퀘스트 생성/업데이트 시
- **동작**:
  1. \`ios-verification-loop\` 6단계 검증(빌드, \`swiftlint\`/\`swift-format\`, 단위 테스트, 보안 diff 스캔, \`Info.plist\`/Entitlements/WKWebView 점검) 실행
  2. \`swift-code-review\` 기준으로 심각도별(CRITICAL/HIGH/MEDIUM/LOW) 리뷰 및 PASS/FAIL 리포트 게시
`
