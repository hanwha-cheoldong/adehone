// Root home files seeded for the mobile-web-dev orchestrator template: SOUL.md guardrails,
// MEMORY.md index (list lines only so tidy-up can parse it), and AUTOMATIONS.md.

export const MOBILE_WEB_DEV_DO_RULES: readonly string[] = [
  '- Classify every feature or fix into Track A/B/C with the `mobile-web-intake` skill and convert it into a `mobile-web-worker-brief` template before delegating.',
  '- After code changes, verify build, typecheck, lint, and unit/E2E tests pass directly in the `mobile-web-close-out` step.',
  '- Before changing responsive layouts, WebView JS bridge clients, or CSP/cookie policies, check iOS Safari/Android WebView compatibility, safe-area insets, and XSS/origin security first.'
]

export const MOBILE_WEB_DEV_DONT_RULES: readonly string[] = [
  '- Never claim something is fixed without verifying the production build and mobile viewport behavior first.',
  '- Never upgrade framework/bundler major versions or alter CSP/CORS/cookie security headers without approval.',
  '- Never commit `.env*` secrets, API tokens, or private keys to Git, or expose them in client bundles/logs.'
]

export const MOBILE_WEB_DEV_MEMORY_SEED = `# Memory

## 프로젝트 고정 스펙
- 프레임워크 & 상태관리: (예: React / Next.js / Vue + Zustand or TanStack Query)
- 스타일링 & 반응형: (예: Tailwind CSS / dvh + env(safe-area-inset-*))
- 네이티브 브리지: (예: WebView postMessage / JavaScriptInterface / WKScriptMessageHandler)
- 브라우저 지원 범위: (예: iOS Safari 16+ / Android Chrome & WebView)

## 자주 쓰는 검증 명령어
- 프로덕션 빌드: \`pnpm build\`
- 타입체크 & 린트: \`pnpm typecheck && pnpm lint\`
- 단위/E2E 테스트: \`pnpm test\`
- 모바일 뷰포트 확인: \`390x844 (iOS) / 360x800 (Android) + touch/safe-area 점검\`

## 진행 중인 작업 & 기술 부채
- 진행 중인 피처 브랜치: (없음)
- 미해결 이슈 / 기술 부채: (없음)
`

export const MOBILE_WEB_DEV_AUTOMATIONS_DOC = `# Automations

## 1. 일일 빌드·린트 헬스체크 (Daily Morning Check)
- **실행 시각**: 평일 오전 9:00 (\`0 9 * * 1-5\`, 생성 시 비활성화 상태로 등록됨)
- **동작**:
  1. \`git fetch\` 후 현재 작업 브랜치에서 빌드, 타입체크, 린트 실행
  2. 경고/에러 또는 최신 커밋 내역을 요약해 \`mobile-web-desk-brief\` 양식으로 아침 브리핑 생성

## 2. PR / 작업 완료 자동 검증 파이프라인 (Post-Worker / PR Trigger)
- **트리거**: 풀 리퀘스트 생성/업데이트 또는 워커 작업 완료 시
- **동작**:
  1. 빌드 및 테스트 실행
  2. 모바일 뷰포트(safe-area, \`100dvh\`, 터치 타깃), XSS/CSP, WebView 브리지 변경점 Diff 점검
  3. \`mobile-web-close-out\` 체크리스트를 채워 결과 보고
`
