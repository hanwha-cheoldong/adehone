import { BOT_NAME_MAX_LENGTH, botFolderName } from '../bot-types'
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
  'android-planner':
    '4-step planning process, Search-First reuse, phased steps, testing strategy, and risk mitigations.',
  'android-clean-architecture':
    'Clean Architecture module boundaries, pure-Kotlin domain, UseCases, Repositories, Mappers, and Hilt DI.',
  'android-compose-patterns':
    'Android Jetpack Compose state management, Event Sink, Type-Safe Navigation, WindowInsets, and TalkBack a11y.',
  'kotlin-coroutines-flows':
    'Idiomatic Kotlin, structured concurrency, StateFlow/SharedFlow, dispatcher injection, and cancellation safety.',
  'kotlin-tdd-testing':
    'TDD workflow with JUnit/Kotest, MockK, Fake repositories, runTest, Turbine Flow testing, and Kover coverage.',
  'kotlin-code-review':
    'Severity-ranked Kotlin/Android code review for architecture, security, coroutines, Compose, and Gradle.',
  'gradle-build-resolver':
    'Surgical Gradle/Kotlin build error resolution, dependency conflict debugging, SDK guardrails, and R8 rules.',
  'android-verification-loop':
    '6-phase verification gate (build, lint/static, tests/Kover, security grep, diff review, adb acceptance).',
  'android-security-webview':
    'Transport/E2EE encryption, hardened WebView JS bridge, 11 Device APIs, MDM/MAM, secure keypad, and FCM push.',
  'android-java-legacy':
    'Legacy Android Java maintenance, Java-Kotlin interop, memory leak fixes, JUnit+Mockito tests, and Desugaring.',
  'ios-planner':
    '4-step planning process, Search-First reuse, phased steps, testing strategy, and risk mitigations.',
  'ios-clean-architecture':
    'Clean Architecture layer boundaries, pure-Swift Domain, UseCases, Repositories, ObjC adapters, and Protocol DI.',
  'ios-swiftui-patterns':
    'Modern SwiftUI @Observable state, @Environment DI, NavigationStack, WKWebView/UIKit lifecycle, and VoiceOver a11y.',
  'swift-concurrency-actors':
    'Idiomatic Swift, Swift 6/6.2 strict concurrency (@MainActor, Sendable, @concurrent), ObjC interop, and actor persistence.',
  'swift-tdd-testing':
    'TDD workflow with Swift Testing (@Test, #expect), XCTest (Swift/ObjC), Protocol DI mocks/fakes, and 80%+ coverage.',
  'swift-code-review':
    'Severity-ranked Swift/ObjC iOS code review for safety, concurrency, ARC memory, protocols, SwiftUI, and Xcode.',
  'xcode-build-resolver':
    'Surgical Xcode/SwiftPM build error resolution, Bridging Header/Sendable/SPM fixes, deployment target, and signing guardrails.',
  'ios-verification-loop':
    '6-phase verification gate (build, SwiftLint/format, tests/coverage, security grep, diff review, simctl acceptance).',
  'ios-security-webview':
    'Transport/E2EE encryption, hardened WKWebView JS bridge, 11 Device APIs, MDM/MAM, secure keypad, and APNs push.',
  'mobile-web-planner':
    '4-step planning process, Search-First reuse, [MWB] contract intake, WebView bridge alignment, and Red Flags.',
  'mobile-web-patterns':
    'ECC frontend patterns: component composition, separated server/client/URL/form state, SWR, and AbortController.',
  'mobile-web-design-a11y':
    'Anti-template UI quality, 100dvh/safe-area ergonomics, >=44px touch targets, WCAG 2.2 AA, and 400% zoom reflow.',
  'mobile-web-tdd-testing':
    'Vitest/Testing Library TDD, Playwright mobile viewports (320-1920px), touch checks, and bridge contract tests.',
  'mobile-web-code-review':
    'Severity-ranked Mobile Web review for XSS/CSP/origin security, bridge parity, 100dvh/safe-area, and Core Web Vitals.',
  'mobile-web-build-resolver':
    'Minimal-change build/typecheck/bundler fixes, stop after 3 failed attempts, and owner approval for major upgrades.',
  'mobile-web-verification-loop':
    '6-phase verification gate (build/bundle budget, typecheck/lint, unit/E2E, security/bridge diff, Vitals/a11y, acceptance).',
  'mobile-web-webview-bridge':
    'Unified JS bridge client for Android/iOS (11 Device APIs), origin checks, browser fallback, and cross-bot sync.',
  'mobile-web-performance-pwa':
    'Core Web Vitals targets, bundle budgets, image/font loading, compositor-only motion, and safe PWA caching.',
  'product-lens':
    'Validate the why before building: product diagnostic (PRODUCT-BRIEF.md), user journey audit, and ICE prioritization.',
  'prd-authoring':
    '4-phase gated PRD workflow (FRAME -> GROUND -> DECIDE -> GENERATE) with a 3-platform parity matrix (Android, iOS, Mobile Web).',
  'product-capability':
    'Translate PRD intent into a 3-platform Capability Contract locking shared WebView bridge, API, deep-link, and policy constraints.',
  'work-breakdown':
    'Break foundational specs into [AND]/[IOS]/[MWB] work briefs with dependency ordering and cross-bot review synchronization.'
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

/** The folder for a new bot. A template's bot still under the name the template proposed (`shownName`,
 *  in the client's language, numbered as freeBotName numbers it) is filed under the template's English
 *  name, so a translated name doesn't leave it in `bot`; any other name files under itself. */
export function templateBotFolderName(
  botName: string,
  template: Pick<BotTemplate, 'name'> | null,
  shownName: string | undefined
): string {
  const numbering =
    shownName && botName.startsWith(shownName) ? botName.slice(shownName.length) : null
  return botFolderName(
    template && numbering !== null && /^( \d+)?$/.test(numbering)
      ? template.name + numbering
      : botName,
    template?.name
  )
}
