// Our own SKILL.md for each template skill, written into a template bot's home.
import type { BotTemplateSkill } from '../../shared/bots/bot-templates'
import { SKILL as androidCloseOut } from './bot-template-skills/android-close-out'
import { SKILL as androidDeskBrief } from './bot-template-skills/android-desk-brief'
import { SKILL as androidDevelopment } from './bot-template-skills/android-development'
import { SKILL as androidGradleR8 } from './bot-template-skills/android-gradle-r8'
import { SKILL as androidIntake } from './bot-template-skills/android-intake'
import { SKILL as androidWebviewBridge } from './bot-template-skills/android-webview-bridge'
import { SKILL as androidWorkerBrief } from './bot-template-skills/android-worker-brief'
import { SKILL as bugReproduction } from './bot-template-skills/bug-reproduction'
import { SKILL as ciFailureTriage } from './bot-template-skills/ci-failure-triage'
import { SKILL as dependencyUpgrade } from './bot-template-skills/dependency-upgrade'
import { SKILL as feedbackThemes } from './bot-template-skills/feedback-themes'
import { SKILL as incidentTimeline } from './bot-template-skills/incident-timeline'
import { SKILL as issueTriage } from './bot-template-skills/issue-triage'
import { SKILL as prReviewChecklist } from './bot-template-skills/pr-review-checklist'
import { SKILL as releaseNotesStyle } from './bot-template-skills/release-notes-style'
import { SKILL as releaseReadiness } from './bot-template-skills/release-readiness'
import { SKILL as securityChecklist } from './bot-template-skills/security-checklist'
import { SKILL as specFormat } from './bot-template-skills/spec-format'
import { SKILL as statusBrief } from './bot-template-skills/status-brief'
import { SKILL as workspaceHygiene } from './bot-template-skills/workspace-hygiene'

export const BOT_TEMPLATE_SKILL_TEXT: Record<BotTemplateSkill, string> = {
  'android-close-out': androidCloseOut,
  'android-desk-brief': androidDeskBrief,
  'android-development': androidDevelopment,
  'android-gradle-r8': androidGradleR8,
  'android-intake': androidIntake,
  'android-webview-bridge': androidWebviewBridge,
  'android-worker-brief': androidWorkerBrief,
  'bug-reproduction': bugReproduction,
  'ci-failure-triage': ciFailureTriage,
  'dependency-upgrade': dependencyUpgrade,
  'feedback-themes': feedbackThemes,
  'incident-timeline': incidentTimeline,
  'issue-triage': issueTriage,
  'pr-review-checklist': prReviewChecklist,
  'release-notes-style': releaseNotesStyle,
  'release-readiness': releaseReadiness,
  'security-checklist': securityChecklist,
  'spec-format': specFormat,
  'status-brief': statusBrief,
  'workspace-hygiene': workspaceHygiene
}
