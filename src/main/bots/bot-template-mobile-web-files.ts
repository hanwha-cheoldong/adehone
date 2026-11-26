// Root home files seeded for the mobile-web-dev template:
// SOUL.md guardrails, MEMORY.md index (list lines only so tidy-up can parse it), and AUTOMATIONS.md.

export const MOBILE_WEB_DEV_DO_RULES: readonly string[] = [
  '- Plan every non-trivial feature or refactor with `mobile-web-planner` (Requirements & `[MWB]` Contract Intake -> Search-First & Architecture/Bridge Review -> Phased Steps -> Testing Strategy & Risks) before editing code.',
  '- Follow `mobile-web-patterns` (separated server/client/URL/form state, `AbortController`), `mobile-web-design-a11y` (`100dvh`/safe-area, `>=44px` touch targets, WCAG 2.2 AA), `mobile-web-performance-pwa`, and `mobile-web-tdd-testing`.',
  '- Before reporting done or opening a PR, run the 6-phase `mobile-web-verification-loop` (build & bundle budget, typecheck/lint, unit & mobile-viewport E2E, security/bridge scan, Vitals/a11y diff, live acceptance) and `mobile-web-code-review`.',
  '- Before changing WebView JS bridge contracts, deep links, or CSP/cookie policies, align with `product-planning` (`product-capability` SSOT), `android-dev` (`android-security-webview`), and `ios-dev` (`ios-security-webview`) via `mobile-web-webview-bridge`.',
  '- When a build or typecheck fails, load `mobile-web-build-resolver` before editing. When asked to review a change, load `mobile-web-code-review` first, and check the framework (`mobile-web-patterns` Framework Gate) before applying React or Vue rules.'
]

export const MOBILE_WEB_DEV_DONT_RULES: readonly string[] = [
  '- Never claim something is fixed without passing `mobile-web-verification-loop` build, test, and mobile viewport checks first.',
  '- Never inject untrusted strings into `innerHTML`/`dangerouslySetInnerHTML`, use `postMessage(..., "*")` without `event.origin` checks, or store sensitive tokens in `localStorage`.',
  '- Never upgrade framework/bundler major versions or relax CSP/CORS/cookie security headers without explicit owner approval.',
  '- Never commit `.env*` secrets, API tokens, or private keys to Git, or expose them in client bundles/logs.'
]

export const MOBILE_WEB_DEV_MEMORY_SEED = `# Memory

## Project Fixed Specs
- Framework & state: (e.g. React / Next.js / Vue + TanStack Query / Zustand / URL search params)
- Styling & viewport: (e.g. Tailwind CSS / 100dvh + env(safe-area-inset-*) / >=44px touch targets)
- Native WebView bridge: (e.g. mobile-web-webview-bridge <-> android-security-webview & ios-security-webview)
- Browser & WebView support: (e.g. iOS Safari 16+ / WKWebView / Android Chrome & WebView)

## Common Verification Commands
- Production build & bundle check: \`pnpm build\`
- Typecheck & lint: \`pnpm typecheck && pnpm lint\`
- Unit & component tests: \`pnpm test\`
- Mobile E2E & viewport check: \`pnpm test:e2e\` (widths 320 / 375 / 390 / 768 / 1024 / 1440 / 1920 + touch/safe-area/axe-core)

## Cross-Bot Collaboration (Product Planning · Android · iOS)
- Active [MWB] items & SSOT Capability Contracts: (none)
- Shared WebView bridge / deep-link sync status: (none)

## Active Work & Tech Debt
- Active feature branches: (none)
- Open issues / tech debt: (none)
`

export const MOBILE_WEB_DEV_AUTOMATIONS_DOC = `# Automations

## 1. 일일 빌드·타입체크·린트 헬스체크 (Daily Morning Check)
- **실행 시각**: 평일 오전 9:00 (\`0 9 * * 1-5\`, 생성 시 비활성화 상태로 등록됨)
- **동작**:
  1. \`git fetch\` 후 현재 작업 브랜치에서 프로덕션 빌드, 타입체크, 린트 실행
  2. 빌드·정적 분석 결과 및 최신 커밋 요약을 간결한 아침 상태로 보고

## 2. PR 자동 검증 및 코드 리뷰 파이프라인 (PR Trigger)
- **트리거**: 풀 리퀘스트 생성/업데이트 시
- **동작**:
  1. \`mobile-web-verification-loop\` 6단계 검증(빌드/번들 예산, 타입체크/린트, 단위 및 모바일 뷰포트 E2E 테스트, XSS/CSP/WebView 브리지 보안 스캔, Core Web Vitals/접근성 점검) 실행
  2. \`mobile-web-code-review\` 기준으로 심각도별(CRITICAL/HIGH/MEDIUM/LOW) 리뷰 및 PASS/FAIL 리포트 게시
`
