export const SKILL = `---
name: android-worker-brief
description: Standard Android BRIEF.md template for delegating work to a coding worker session with clear scope, constraints, and Definition of Done.
---

# Worker Brief: Android Task Specification

Use this structure when writing \`BRIEF.md\` for a worker session so it touches only the intended modules and meets Android verification standards.

\`\`\`markdown
## 1. 작업 목표 및 분류 (Goal & Classification)
- 요청 요약: <한 줄 요약>
- Intake 분류: <Track A / Track B / Track C>

## 2. 수정 대상 및 제약 조건 (Target & Constraints)
- 타겟 모듈/패키지: <예: :app, com.example.bridge>
- 아키텍처 준수사항: <예: ViewModel에서 Context 직접 참조 금지, StateFlow + collectAsStateWithLifecycle 사용>
- WebView / 네이티브 연동 규격: <브리지 메서드명, Request/Response JSON 스키마, Origin 검증>
- 보안 / 난독화 체크: <@Keep, proguard-rules.pro, AndroidManifest.xml 권한/컴포넌트, FLAG_SECURE>
- 참조 스킬: <android-development / android-webview-bridge / android-gradle-r8>

## 3. 완료 조건 (Definition of Done)
- [ ] \`./gradlew assembleDebug\` 에러 0건
- [ ] 신규/수정 로직에 대한 Unit Test 작성 및 \`./gradlew testDebugUnitTest\` 통과
- [ ] 변경된 파일 목록 및 핵심 diff 요약 제출
\`\`\`
`
