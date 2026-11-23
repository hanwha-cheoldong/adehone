import { BOT_NAME_MAX_LENGTH } from '../bot-types'
import {
  BOT_CONNECTOR_NAMES,
  BOT_TEMPLATE_CATEGORIES,
  BOT_TEMPLATES,
  type BotTemplate,
  type BotTemplateCategory,
  type BotTemplateSkill
} from './bot-templates'

/** What each of our skills teaches, as the template pages list it. */
export const BOT_TEMPLATE_SKILL_LINES: Record<BotTemplateSkill, string> = {
  'pr-review-checklist':
    'Read a diff for behaviour changes, missing tests and risky edits; cite each finding.',
  'bug-reproduction': 'Write down the exact steps that show the bug before looking for its cause.',
  'ci-failure-triage':
    'Tell a flaky check from a real failure or broken infrastructure, and find the commit that started it.',
  'release-readiness': 'What blocks a release and how to list it: checks, reviews, open blockers.',
  'release-notes-style':
    'Notes for users: new, fixed, changed; leave out refactors and code names.',
  'dependency-upgrade':
    'Upgrade one group at a time, read the changelog, run the tests, one pull request each.',
  'security-checklist':
    'Secrets, injection, auth checks and unsafe defaults to look for in a change.',
  'issue-triage': 'Label, find duplicates, ask for missing repro details in one comment.',
  'feedback-themes':
    'Group feedback into themes with counts and short quotes; link existing issues.',
  'status-brief': 'Changed, blocked, needs a decision: a brief in under ten lines.',
  'spec-format': 'A one-page spec: problem, decision, scope, open questions.',
  'incident-timeline': 'Keep a timestamped timeline, then draft a blameless write-up.',
  'workspace-hygiene':
    'When a workspace is done or abandoned, and what to check before removing it.',
  'android-intake':
    'Classify incoming Android requests into Track A (Quick Fix), B (Feature/Bridge), or C (Architecture).',
  'android-worker-brief':
    'Standard Android BRIEF.md template with target modules, bridge contracts, and DoD.',
  'android-close-out':
    'Direct Gradle build/test, Manifest/R8 diff, and adb smoke-test verification before reporting.',
  'android-desk-brief':
    'Daily morning build/lint brief and weekly Android tech-debt report formats.',
  'android-development':
    'Official Android skills plus transport encryption, native/JS device APIs, MDM, MAM, secure keypad, and push guides.',
  'android-webview-bridge':
    'WebView ↔ Native JS bridge contracts, origin allowlists, WebSettings hardening, and R8 keep rules.',
  'android-gradle-r8':
    'Gradle/AGP version policy, SDK guardrails, R8/ProGuard keep rules, and signing/secret hygiene.',
  'ios-intake':
    'Classify incoming iOS requests into Track A (Quick Fix), B (Feature/Bridge), or C (Architecture).',
  'ios-worker-brief':
    'Standard iOS BRIEF.md template with target modules, WKWebView bridge contracts, and Xcode DoD.',
  'ios-close-out':
    'Direct Xcode build/test, Info.plist/Entitlements diff, and simulator smoke-test verification before reporting.',
  'ios-desk-brief': 'Daily morning Xcode build/lint brief and weekly iOS tech-debt report formats.',
  'ios-development':
    'Swift, SwiftUI, Swift Concurrency, transport encryption, Keychain/Face ID, MDM/MAM, and APNs guides.',
  'ios-wkwebview-bridge':
    'WKWebView ↔ Native JS bridge contracts, origin allowlists, configuration hardening, and handler hygiene.',
  'ios-xcode-signing':
    'Deployment target policy, Info.plist/Entitlements guardrails, SPM/Pods, and signing/secret hygiene.',
  'mobile-web-intake':
    'Classify incoming mobile web requests into Track A (Quick Fix), B (Feature/Bridge), or C (Architecture).',
  'mobile-web-worker-brief':
    'Standard mobile web BRIEF.md template with viewport targets, bridge contracts, and build/test DoD.',
  'mobile-web-close-out':
    'Build/typecheck/lint/test execution, safe-area/viewport check, and XSS/CSP/bridge diff verification.',
  'mobile-web-desk-brief':
    'Daily morning mobile web build/lint brief and weekly bundle/vitals tech-debt report formats.',
  'mobile-web-development':
    'Responsive 100dvh/safe-area layouts, touch ergonomics, iOS/Android WebView quirks, and frontend security.',
  'mobile-web-webview-bridge':
    'Frontend JS bridge client for iOS WKWebView and Android JavascriptInterface with origin checks.',
  'mobile-web-performance-pwa':
    'Core Web Vitals, bundle splitting, flaky network resilience, and PWA service worker cache safety.'
}

/** A template event's name split into its trigger and what it does ("…: review it and post here"). */
export function botTemplateEventParts(name: string): { trigger: string; action: string | null } {
  const at = name.indexOf(': ')
  if (at === -1) {
    return { trigger: name, action: null }
  }
  const action = name.slice(at + 2)
  return { trigger: name.slice(0, at), action: action[0]?.toUpperCase() + action.slice(1) }
}

/** Whether a template matches a search: its name, line, category, connectors and skills. */
export function botTemplateMatches(
  template: BotTemplate,
  query: string,
  categoryLabel: (category: BotTemplateCategory) => string,
  // Why: translated pages still find a template by the words they show, and by its English.
  shownText: (english: string) => string = (english) => english
): boolean {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  if (words.length === 0) {
    return true
  }
  const text = [
    template.name,
    template.line,
    shownText(template.name),
    shownText(template.line),
    categoryLabel(template.category),
    ...template.connectors.map((kind) => BOT_CONNECTOR_NAMES[kind]),
    ...template.skills
  ]
    .join(' ')
    .toLowerCase()
  return words.every((word) => text.includes(word))
}

/** The catalog in its category order, each category with the templates the search kept. */
export function botTemplateGroups(
  matches: (template: BotTemplate) => boolean
): { category: BotTemplateCategory; templates: BotTemplate[] }[] {
  return BOT_TEMPLATE_CATEGORIES.map((category) => ({
    category,
    templates: BOT_TEMPLATES.filter(
      (template) => template.category === category && matches(template)
    )
  })).filter((group) => group.templates.length > 0)
}

/** The template's name, or "Name 2", "Name 3"… when a bot already has it. */
export function freeBotName(name: string, taken: readonly string[]): string {
  const used = new Set(taken.map((entry) => entry.trim().toLowerCase()))
  if (!used.has(name.toLowerCase())) {
    return name
  }
  for (let index = 2; ; index++) {
    // Kept within the name limit, so a long name still makes a bot.
    const candidate = `${name.slice(0, BOT_NAME_MAX_LENGTH - ` ${index}`.length)} ${index}`
    if (!used.has(candidate.toLowerCase())) {
      return candidate
    }
  }
}
