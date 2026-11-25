// Our own SKILL.md and optional extra files (e.g. references/) for each template skill.
import type { BotTemplateSkill } from '../../shared/bots/bot-templates'
import * as androidCleanArchitecture from './bot-template-skills/android-clean-architecture'
import * as androidComposePatterns from './bot-template-skills/android-compose-patterns'
import * as androidJavaLegacy from './bot-template-skills/android-java-legacy'
import * as androidPlanner from './bot-template-skills/android-planner'
import * as androidSecurityWebview from './bot-template-skills/android-security-webview'
import * as androidVerificationLoop from './bot-template-skills/android-verification-loop'
import * as bugReproduction from './bot-template-skills/bug-reproduction'
import * as ciFailureTriage from './bot-template-skills/ci-failure-triage'
import * as dependencyUpgrade from './bot-template-skills/dependency-upgrade'
import * as feedbackThemes from './bot-template-skills/feedback-themes'
import * as gradleBuildResolver from './bot-template-skills/gradle-build-resolver'
import * as incidentTimeline from './bot-template-skills/incident-timeline'
import * as iosCleanArchitecture from './bot-template-skills/ios-clean-architecture'
import * as iosPlanner from './bot-template-skills/ios-planner'
import * as iosSecurityWebview from './bot-template-skills/ios-security-webview'
import * as iosSwiftuiPatterns from './bot-template-skills/ios-swiftui-patterns'
import * as iosVerificationLoop from './bot-template-skills/ios-verification-loop'
import * as issueTriage from './bot-template-skills/issue-triage'
import * as kotlinCodeReview from './bot-template-skills/kotlin-code-review'
import * as kotlinCoroutinesFlows from './bot-template-skills/kotlin-coroutines-flows'
import * as kotlinTddTesting from './bot-template-skills/kotlin-tdd-testing'
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
import * as swiftCodeReview from './bot-template-skills/swift-code-review'
import * as swiftConcurrencyActors from './bot-template-skills/swift-concurrency-actors'
import * as swiftTddTesting from './bot-template-skills/swift-tdd-testing'
import * as workspaceHygiene from './bot-template-skills/workspace-hygiene'
import * as xcodeBuildResolver from './bot-template-skills/xcode-build-resolver'

export type BotTemplateSkillFile = { path: string; text: string }

type SkillModule = {
  SKILL: string
  SKILL_FILES?: Readonly<Record<string, string>>
}

const BOT_TEMPLATE_SKILL_MODULES: Record<BotTemplateSkill, SkillModule> = {
  'android-planner': androidPlanner,
  'android-clean-architecture': androidCleanArchitecture,
  'android-compose-patterns': androidComposePatterns,
  'kotlin-coroutines-flows': kotlinCoroutinesFlows,
  'kotlin-tdd-testing': kotlinTddTesting,
  'kotlin-code-review': kotlinCodeReview,
  'gradle-build-resolver': gradleBuildResolver,
  'android-verification-loop': androidVerificationLoop,
  'android-security-webview': androidSecurityWebview,
  'android-java-legacy': androidJavaLegacy,
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
  'ios-planner': iosPlanner,
  'ios-clean-architecture': iosCleanArchitecture,
  'ios-swiftui-patterns': iosSwiftuiPatterns,
  'swift-concurrency-actors': swiftConcurrencyActors,
  'swift-tdd-testing': swiftTddTesting,
  'swift-code-review': swiftCodeReview,
  'xcode-build-resolver': xcodeBuildResolver,
  'ios-verification-loop': iosVerificationLoop,
  'ios-security-webview': iosSecurityWebview,
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
