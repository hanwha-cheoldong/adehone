// Our own SKILL.md and optional extra files (e.g. references/) for each template skill.
import type { BotTemplateSkill } from '../../shared/bots/bot-templates'
import * as androidCloseOut from './bot-template-skills/android-close-out'
import * as androidDeskBrief from './bot-template-skills/android-desk-brief'
import * as androidDevelopment from './bot-template-skills/android-development'
import * as androidGradleR8 from './bot-template-skills/android-gradle-r8'
import * as androidIntake from './bot-template-skills/android-intake'
import * as androidWebviewBridge from './bot-template-skills/android-webview-bridge'
import * as androidWorkerBrief from './bot-template-skills/android-worker-brief'
import * as bugReproduction from './bot-template-skills/bug-reproduction'
import * as ciFailureTriage from './bot-template-skills/ci-failure-triage'
import * as dependencyUpgrade from './bot-template-skills/dependency-upgrade'
import * as feedbackThemes from './bot-template-skills/feedback-themes'
import * as incidentTimeline from './bot-template-skills/incident-timeline'
import * as iosCloseOut from './bot-template-skills/ios-close-out'
import * as iosDeskBrief from './bot-template-skills/ios-desk-brief'
import * as iosDevelopment from './bot-template-skills/ios-development'
import * as iosIntake from './bot-template-skills/ios-intake'
import * as iosWkwebviewBridge from './bot-template-skills/ios-wkwebview-bridge'
import * as iosWorkerBrief from './bot-template-skills/ios-worker-brief'
import * as iosXcodeSigning from './bot-template-skills/ios-xcode-signing'
import * as issueTriage from './bot-template-skills/issue-triage'
import * as mobileWebCloseOut from './bot-template-skills/mobile-web-close-out'
import * as mobileWebDeskBrief from './bot-template-skills/mobile-web-desk-brief'
import * as mobileWebDevelopment from './bot-template-skills/mobile-web-development'
import * as mobileWebIntake from './bot-template-skills/mobile-web-intake'
import * as mobileWebPerformancePwa from './bot-template-skills/mobile-web-performance-pwa'
import * as mobileWebWebviewBridge from './bot-template-skills/mobile-web-webview-bridge'
import * as mobileWebWorkerBrief from './bot-template-skills/mobile-web-worker-brief'
import * as prReviewChecklist from './bot-template-skills/pr-review-checklist'
import * as releaseNotesStyle from './bot-template-skills/release-notes-style'
import * as releaseReadiness from './bot-template-skills/release-readiness'
import * as securityChecklist from './bot-template-skills/security-checklist'
import * as specFormat from './bot-template-skills/spec-format'
import * as statusBrief from './bot-template-skills/status-brief'
import * as workspaceHygiene from './bot-template-skills/workspace-hygiene'

export type BotTemplateSkillFile = { path: string; text: string }

type SkillModule = {
  SKILL: string
  SKILL_FILES?: Readonly<Record<string, string>>
}

const BOT_TEMPLATE_SKILL_MODULES: Record<BotTemplateSkill, SkillModule> = {
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
  'workspace-hygiene': workspaceHygiene,
  'ios-intake': iosIntake,
  'ios-worker-brief': iosWorkerBrief,
  'ios-close-out': iosCloseOut,
  'ios-desk-brief': iosDeskBrief,
  'ios-development': iosDevelopment,
  'ios-wkwebview-bridge': iosWkwebviewBridge,
  'ios-xcode-signing': iosXcodeSigning,
  'mobile-web-intake': mobileWebIntake,
  'mobile-web-worker-brief': mobileWebWorkerBrief,
  'mobile-web-close-out': mobileWebCloseOut,
  'mobile-web-desk-brief': mobileWebDeskBrief,
  'mobile-web-development': mobileWebDevelopment,
  'mobile-web-webview-bridge': mobileWebWebviewBridge,
  'mobile-web-performance-pwa': mobileWebPerformancePwa
}

function normalizeSkillRelativePath(skill: BotTemplateSkill, rawPath: string): string {
  const normalized = rawPath
    .replace(/\\/g, '/')
    .replace(/^(\.\/)+/, '')
    .replace(/^\/+/, '')
  const segments = normalized.split('/')
  if (
    !normalized ||
    normalized === 'SKILL.md' ||
    segments.some((segment) => segment === '' || segment === '.' || segment === '..')
  ) {
    throw new Error(`Invalid template skill file path "${rawPath}" in "${skill}"`)
  }
  return normalized
}

/** Returns SKILL.md followed by any extra files (e.g. references/*.md) for a template skill. */
export function botTemplateSkillFiles(skill: BotTemplateSkill): readonly BotTemplateSkillFile[] {
  const mod = BOT_TEMPLATE_SKILL_MODULES[skill]
  const extras = Object.entries(mod.SKILL_FILES ?? {}).map(([rawPath, text]) => ({
    path: normalizeSkillRelativePath(skill, rawPath),
    text
  }))
  return [{ path: 'SKILL.md', text: mod.SKILL }, ...extras]
}
