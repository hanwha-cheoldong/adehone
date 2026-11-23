export const SKILL = `---
name: android-desk-brief
description: Daily morning and weekly Android engineering report formats summarizing build health, commits, priorities, and technical debt.
---

# Desk Brief: Daily & Weekly Reporting

## Daily Morning Brief (아침 브리핑)
Use after the daily morning build/lint healthcheck:
- **전일 요약**: 전일 커밋 및 완료된 \`worker-brief\` 요약
- **빌드 / 린트 상태**: \`./gradlew assembleDebug\` 및 \`lintDebug\` 결과 (정상 / 경고 N건 / 에러 요약)
- **오늘의 우선순위 (Top 1–3)**: \`MEMORY.md\` 기준 오늘 우선 처리할 작업

## Weekly Brief (주간 브리핑)
Use for weekly engineering summaries:
- **주간 완료 내역**: 머지된 기능 및 해결된 이슈 목록
- **기술 부채 리포트**: 누적 lint 경고, 미작성 테스트, R8/WebView/보안 점검 항목, 의존성 업데이트 필요 항목
- **다음 주 마일스톤 제안**: 우선순위별 다음 주 목표
`
