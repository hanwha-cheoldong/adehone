// Translates known template/proposal SOUL.md headings and lines for the read-only preview.
import {
  ADEHONE_DEV_DO_RULES,
  ADEHONE_DEV_DONT_RULES
} from '../../../../../shared/bots/adehone-dev-soul-rules'
import { botTemplateText } from '../../../../../shared/bots/bot-template-text'

type Translate = (key: string, fallback: string, values?: Record<string, unknown>) => string

const STARTED_FROM_TEMPLATE = /^Started from the (.+) template\.$/

const entry = (key: string, text: string): [string, { key: string; fallback: string }] => [
  text,
  { key, fallback: text }
]

const ruleEntries = (keyPrefix: string, rules: readonly string[]) =>
  rules.map((rule, index) => entry(`${keyPrefix}.${index}`, rule.slice('- '.length)))

const KNOWN_LINES: ReadonlyMap<string, { key: string; fallback: string }> = new Map([
  entry(
    'bots.soul.readOnlyStart',
    'Change anything (comments, labels, pull requests, posts anywhere but here) until my owner says I can. I start by reading and reporting only.'
  ),
  ...ruleEntries('bots.templates.adehone-dev.soulDo', ADEHONE_DEV_DO_RULES),
  ...ruleEntries('bots.templates.adehone-dev.soulDont', ADEHONE_DEV_DONT_RULES),
  entry(
    'bots.templates.android-dev.soulDo.0',
    'Plan every non-trivial feature or refactor with `android-planner` (Requirements -> Search-First & Architecture Review -> Phased Steps -> Testing Strategy & Risks) before editing code.'
  ),
  entry(
    'bots.templates.android-dev.soulDo.0',
    'Classify every feature or fix into Track A/B/C with the `android-intake` skill and convert it into an `android-worker-brief` template before delegating.'
  ),
  entry(
    'bots.templates.android-dev.soulDo.1',
    'Follow `android-clean-architecture` (`domain` pure Kotlin), `android-compose-patterns`, `kotlin-coroutines-flows`, and `kotlin-tdd-testing` (tests before code, Turbine/MockK, 80%+ domain coverage).'
  ),
  entry(
    'bots.templates.android-dev.soulDo.1',
    'Follow `android-clean-architecture` (`domain` pure Kotlin), `compose-patterns`, `kotlin-coroutines-flows`, and `kotlin-tdd-testing` (tests before code, Turbine/MockK, 80%+ domain coverage).'
  ),
  entry(
    'bots.templates.android-dev.soulDo.2',
    'Before reporting done or opening a PR, run the 6-phase `android-verification-loop` (`assembleDebug`, `lintDebug`, `ktlintCheck`/`detekt`, `testDebugUnitTest`, security scan, `adb` acceptance) and `kotlin-code-review`.'
  ),
  entry(
    'bots.templates.android-dev.soulDo.2',
    'After code changes, verify `./gradlew assembleDebug` or unit tests (`./gradlew testDebugUnitTest`) pass directly in the `android-close-out` step.'
  ),
  entry(
    'bots.templates.android-dev.soulDo.3',
    'Before changing WebView bridge specs, encryption, or `AndroidManifest.xml` permissions, verify backward compatibility and `android-security-webview` + `gradle-build-resolver` R8 keep rules.'
  ),
  entry(
    'bots.templates.android-dev.soulDo.3',
    'Before changing WebView bridge specs or `AndroidManifest.xml` permissions, check backward compatibility and security (origin restrictions, ProGuard/R8 rules) first.'
  ),
  entry(
    'bots.templates.android-dev.soulDont.0',
    'Never claim something is fixed without passing `android-verification-loop` build/test checks first.'
  ),
  entry(
    'bots.templates.android-dev.soulDont.0',
    'Never claim something is fixed without verifying the build or runtime first.'
  ),
  entry(
    'bots.templates.android-dev.soulDont.1',
    'Never use `GlobalScope`, swallow `CancellationException`, add `!!` assertions, or import Android/DB/network frameworks inside `domain`.'
  ),
  entry(
    'bots.templates.android-dev.soulDont.2',
    'Never bump `minSdk`/`targetSdk` in `build.gradle` or core dependency versions without explicit owner approval.'
  ),
  entry(
    'bots.templates.android-dev.soulDont.2',
    'Never bump `minSdk`/`targetSdk` in `build.gradle` or core dependency versions without approval.'
  ),
  entry(
    'bots.templates.android-dev.soulDont.3',
    'Never commit keystores (`*.jks`), `local.properties`, or API secret keys to Git, or print sensitive values in logs.'
  ),
  entry(
    'bots.templates.android-dev.soulDont.3',
    'Never commit keystores (`*.jks`), `local.properties`, or API secret keys to Git, or print them in logs.'
  ),
  entry(
    'bots.templates.ios-dev.soulDo.0',
    'Plan every non-trivial feature or refactor with `ios-planner` (Requirements -> Search-First & Architecture Review -> Phased Steps -> Testing Strategy & Risks) before editing code.'
  ),
  entry(
    'bots.templates.ios-dev.soulDo.0',
    'Classify every feature or fix into Track A/B/C with the `ios-intake` skill and convert it into an `ios-worker-brief` template before delegating.'
  ),
  entry(
    'bots.templates.ios-dev.soulDo.1',
    'Follow `ios-clean-architecture` (`Domain` pure Swift), `ios-swiftui-patterns` (`@Observable`), `swift-concurrency-actors` (`Sendable`/actors), and `swift-tdd-testing` (tests before code, Swift Testing, 80%+ domain coverage).'
  ),
  entry(
    'bots.templates.ios-dev.soulDo.2',
    'Before reporting done or opening a PR, run the 6-phase `ios-verification-loop` (`xcodebuild`/`swift build`, `swiftlint`, `xcodebuild test`, security scan, `simctl` acceptance) and `swift-code-review`.'
  ),
  entry(
    'bots.templates.ios-dev.soulDo.2',
    'After code changes, verify `xcodebuild` build or unit tests (`xcodebuild test` / `swift test`) pass directly in the `ios-close-out` step.'
  ),
  entry(
    'bots.templates.ios-dev.soulDo.3',
    'Before changing WKWebView bridge specs, encryption, `Info.plist`, or `*.entitlements`, verify backward compatibility and `ios-security-webview` + `xcode-build-resolver` guardrails.'
  ),
  entry(
    'bots.templates.ios-dev.soulDo.3',
    'Before changing WKWebView bridge specs, `Info.plist`, or Entitlements, check backward compatibility and security (origin restrictions, ATS, Keychain access groups) first.'
  ),
  entry(
    'bots.templates.ios-dev.soulDont.0',
    'Never claim something is fixed without passing `ios-verification-loop` build/test checks first.'
  ),
  entry(
    'bots.templates.ios-dev.soulDont.0',
    'Never claim something is fixed without verifying the build or simulator/test run first.'
  ),
  entry(
    'bots.templates.ios-dev.soulDont.1',
    'Never use force unwraps (`!`, `try!`, `as!`), store secrets in `UserDefaults`, block `@MainActor` with sync I/O, or import UI/DB/WebKit frameworks inside `Domain`.'
  ),
  entry(
    'bots.templates.ios-dev.soulDont.2',
    'Never bump `IPHONEOS_DEPLOYMENT_TARGET`, `SWIFT_VERSION`, or major SPM/CocoaPods dependency versions without explicit owner approval.'
  ),
  entry(
    'bots.templates.ios-dev.soulDont.2',
    'Never bump iOS deployment target, Xcode project settings, or SwiftPM/CocoaPods dependency versions without approval.'
  ),
  entry(
    'bots.templates.ios-dev.soulDont.3',
    'Never commit `.p12`, `.mobileprovision`, `AuthKey_*.p8`, or API secret keys to Git, or print sensitive values in logs.'
  ),
  entry(
    'bots.templates.ios-dev.soulDont.3',
    'Never commit `.p12`, `.mobileprovision`, `AuthKey_*.p8`, or API secret keys to Git, or print them in logs.'
  ),
  entry(
    'bots.templates.mobile-web-dev.soulDo.0',
    'Plan every non-trivial feature or refactor with `mobile-web-planner` (Requirements & `[MWB]` Contract Intake -> Search-First & Architecture/Bridge Review -> Phased Steps -> Testing Strategy & Risks) before editing code.'
  ),
  entry(
    'bots.templates.mobile-web-dev.soulDo.0',
    'Classify every feature or fix into Track A/B/C with the `mobile-web-intake` skill and convert it into a `mobile-web-worker-brief` template before delegating.'
  ),
  entry(
    'bots.templates.mobile-web-dev.soulDo.1',
    'Follow `mobile-web-patterns` (separated server/client/URL/form state, `AbortController`), `mobile-web-design-a11y` (`100dvh`/safe-area, `>=44px` touch targets, WCAG 2.2 AA), `mobile-web-performance-pwa`, and `mobile-web-tdd-testing`.'
  ),
  entry(
    'bots.templates.mobile-web-dev.soulDo.2',
    'After code changes, verify build, typecheck, lint, and unit/E2E tests pass directly in the `mobile-web-close-out` step.'
  ),
  entry(
    'bots.templates.mobile-web-dev.soulDo.2',
    'Before reporting done or opening a PR, run the 6-phase `mobile-web-verification-loop` (build & bundle budget, typecheck/lint, unit & mobile-viewport E2E, security/bridge scan, Vitals/a11y diff, live acceptance) and `mobile-web-code-review`.'
  ),
  entry(
    'bots.templates.mobile-web-dev.soulDo.3',
    'Before changing responsive layouts, WebView JS bridge clients, or CSP/cookie policies, check iOS Safari/Android WebView compatibility, safe-area insets, and XSS/origin security first.'
  ),
  entry(
    'bots.templates.mobile-web-dev.soulDo.3',
    'Before changing WebView JS bridge contracts, deep links, or CSP/cookie policies, align with `product-planning` (`product-capability` SSOT), `android-dev` (`android-security-webview`), and `ios-dev` (`ios-security-webview`) via `mobile-web-webview-bridge`.'
  ),
  entry(
    'bots.templates.mobile-web-dev.soulDo.4',
    'When a build or typecheck fails, load `mobile-web-build-resolver` before editing. When asked to review a change, load `mobile-web-code-review` first, and check the framework (`mobile-web-patterns` Framework Gate) before applying React or Vue rules.'
  ),
  entry(
    'bots.templates.mobile-web-dev.soulDont.0',
    'Never claim something is fixed without passing `mobile-web-verification-loop` build, test, and mobile viewport checks first.'
  ),
  entry(
    'bots.templates.mobile-web-dev.soulDont.0',
    'Never claim something is fixed without verifying the production build and mobile viewport behavior first.'
  ),
  entry(
    'bots.templates.mobile-web-dev.soulDont.1',
    'Never inject untrusted strings into `innerHTML`/`dangerouslySetInnerHTML`, use `postMessage(..., "*")` without `event.origin` checks, or store sensitive tokens in `localStorage`.'
  ),
  entry(
    'bots.templates.mobile-web-dev.soulDont.2',
    'Never upgrade framework/bundler major versions or alter CSP/CORS/cookie security headers without approval.'
  ),
  entry(
    'bots.templates.mobile-web-dev.soulDont.2',
    'Never upgrade framework/bundler major versions or relax CSP/CORS/cookie security headers without explicit owner approval.'
  ),
  entry(
    'bots.templates.mobile-web-dev.soulDont.3',
    'Never commit `.env*` secrets, API tokens, or private keys to Git, or expose them in client bundles/logs.'
  ),
  entry(
    'bots.templates.product-planning.soulDo.0',
    'Validate the problem and "why" with `product-lens` before committing to a full spec when an idea is vague or unprioritized.'
  ),
  entry(
    'bots.templates.product-planning.soulDo.1',
    'Draft lean, problem-first PRDs with `prd-authoring` (FRAME -> GROUND -> DECIDE -> GENERATE), including a 3-platform parity matrix for Android, iOS, and Mobile Web.'
  ),
  entry(
    'bots.templates.product-planning.soulDo.2',
    'Lock down platform constraints and shared SSOT contracts (WebView JS bridge, deep links, APIs, invariants) in a `product-capability` contract before delegating.'
  ),
  entry(
    'bots.templates.product-planning.soulDo.3',
    'Break approved plans into platform-tagged work items (`[AND]`, `[IOS]`, `[MWB]`) with `work-breakdown`, propagating any dev-bot review changes across all affected platforms.'
  ),
  entry(
    'bots.templates.product-planning.soulDont.0',
    'Never invent requirements, user evidence, or metrics; mark unknowns as `TBD` or `OPEN`.'
  ),
  entry(
    'bots.templates.product-planning.soulDont.1',
    'Never dictate internal code structure (class names, file paths, library internals) in product specs — leave technical design to dev bots (`android-planner`, `ios-planner`, `mobile-web-planner`).'
  ),
  entry(
    'bots.templates.product-planning.soulDont.1',
    'Never dictate internal code structure (class names, file paths, library internals) in product specs — leave technical design to dev bots (`android-planner`, `ios-planner`, etc.).'
  ),
  entry(
    'bots.templates.product-planning.soulDont.2',
    'Never delegate ambiguous or uncontracted work items without explicit acceptance criteria, out-of-scope guards, and a pre-implementation review gate.'
  ),
  entry(
    'bots.templates.product-planning.soulDont.3',
    'Never update a shared bridge/API/deep-link spec for one platform without syncing the Capability Contract and sibling work items for Android, iOS, and Mobile Web.'
  )
])

const LABELED_PREFIXES: readonly {
  prefix: string
  key: string
  labelFallback: string
  translateValue: boolean
}[] = [
  {
    prefix: 'Watches: ',
    key: 'bots.soul.labels.watches',
    labelFallback: 'Watches',
    translateValue: true
  },
  { prefix: 'Does: ', key: 'bots.soul.labels.does', labelFallback: 'Does', translateValue: true },
  {
    prefix: 'Reports: ',
    key: 'bots.soul.labels.reports',
    labelFallback: 'Reports',
    translateValue: true
  },
  {
    prefix: 'Automations to set up once my owner agrees: ',
    key: 'bots.soul.labels.automations',
    labelFallback: 'Automations to set up once my owner agrees',
    translateValue: false
  }
]

export function translateSoulHeading(text: string, level: 1 | 2 | 3, t: Translate): string {
  if (level === 1) {
    return botTemplateText(text, t)
  }
  if (level === 2) {
    if (text === 'How I work') {
      return t('bots.soul.sections.howIWork', 'How I work')
    }
    if (text === 'Never') {
      return t('bots.soul.sections.never', 'Never')
    }
  }
  return text
}

export function translateSoulParagraph(text: string, t: Translate): string {
  return botTemplateText(text, t)
}

export function translateSoulListItem(line: string, t: Translate): string {
  const known = KNOWN_LINES.get(line)
  if (known) {
    return t(known.key, known.fallback)
  }
  const startedFrom = STARTED_FROM_TEMPLATE.exec(line)
  if (startedFrom) {
    return t('bots.soul.startedFromTemplate', 'Started from the {{template}} template.', {
      template: botTemplateText(startedFrom[1], t)
    })
  }
  for (const entryItem of LABELED_PREFIXES) {
    if (line.startsWith(entryItem.prefix)) {
      const value = line.slice(entryItem.prefix.length)
      const label = t(entryItem.key, entryItem.labelFallback)
      return `${label}: ${entryItem.translateValue ? botTemplateText(value, t) : value}`
    }
  }
  return botTemplateText(line, t)
}
