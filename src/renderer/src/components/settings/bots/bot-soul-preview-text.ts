// Translates known template/proposal SOUL.md headings and lines for the read-only preview.
import { botTemplateText } from '../../../../../shared/bots/bot-template-text'

type Translate = (key: string, fallback: string, values?: Record<string, unknown>) => string

const STARTED_FROM_TEMPLATE = /^Started from the (.+) template\.$/

const KNOWN_LINES: ReadonlyMap<string, { key: string; fallback: string }> = new Map([
  [
    'Change anything (comments, labels, pull requests, posts anywhere but here) until my owner says I can. I start by reading and reporting only.',
    {
      key: 'bots.soul.readOnlyStart',
      fallback:
        'Change anything (comments, labels, pull requests, posts anywhere but here) until my owner says I can. I start by reading and reporting only.'
    }
  ],
  [
    'Plan every non-trivial feature or refactor with `android-planner` (Requirements -> Search-First & Architecture Review -> Phased Steps -> Testing Strategy & Risks) before editing code.',
    {
      key: 'bots.templates.android-dev.soulDo.0',
      fallback:
        'Plan every non-trivial feature or refactor with `android-planner` (Requirements -> Search-First & Architecture Review -> Phased Steps -> Testing Strategy & Risks) before editing code.'
    }
  ],
  [
    'Classify every feature or fix into Track A/B/C with the `android-intake` skill and convert it into an `android-worker-brief` template before delegating.',
    {
      key: 'bots.templates.android-dev.soulDo.0',
      fallback:
        'Classify every feature or fix into Track A/B/C with the `android-intake` skill and convert it into an `android-worker-brief` template before delegating.'
    }
  ],
  [
    'Follow `android-clean-architecture` (`domain` pure Kotlin), `android-compose-patterns`, `kotlin-coroutines-flows`, and `kotlin-tdd-testing` (tests before code, Turbine/MockK, 80%+ domain coverage).',
    {
      key: 'bots.templates.android-dev.soulDo.1',
      fallback:
        'Follow `android-clean-architecture` (`domain` pure Kotlin), `android-compose-patterns`, `kotlin-coroutines-flows`, and `kotlin-tdd-testing` (tests before code, Turbine/MockK, 80%+ domain coverage).'
    }
  ],
  [
    'Follow `android-clean-architecture` (`domain` pure Kotlin), `compose-patterns`, `kotlin-coroutines-flows`, and `kotlin-tdd-testing` (tests before code, Turbine/MockK, 80%+ domain coverage).',
    {
      key: 'bots.templates.android-dev.soulDo.1',
      fallback:
        'Follow `android-clean-architecture` (`domain` pure Kotlin), `compose-patterns`, `kotlin-coroutines-flows`, and `kotlin-tdd-testing` (tests before code, Turbine/MockK, 80%+ domain coverage).'
    }
  ],
  [
    'Before reporting done or opening a PR, run the 6-phase `android-verification-loop` (`assembleDebug`, `lintDebug`, `ktlintCheck`/`detekt`, `testDebugUnitTest`, security scan, `adb` acceptance) and `kotlin-code-review`.',
    {
      key: 'bots.templates.android-dev.soulDo.2',
      fallback:
        'Before reporting done or opening a PR, run the 6-phase `android-verification-loop` (`assembleDebug`, `lintDebug`, `ktlintCheck`/`detekt`, `testDebugUnitTest`, security scan, `adb` acceptance) and `kotlin-code-review`.'
    }
  ],
  [
    'After code changes, verify `./gradlew assembleDebug` or unit tests (`./gradlew testDebugUnitTest`) pass directly in the `android-close-out` step.',
    {
      key: 'bots.templates.android-dev.soulDo.2',
      fallback:
        'After code changes, verify `./gradlew assembleDebug` or unit tests (`./gradlew testDebugUnitTest`) pass directly in the `android-close-out` step.'
    }
  ],
  [
    'Before changing WebView bridge specs, encryption, or `AndroidManifest.xml` permissions, verify backward compatibility and `android-security-webview` + `gradle-build-resolver` R8 keep rules.',
    {
      key: 'bots.templates.android-dev.soulDo.3',
      fallback:
        'Before changing WebView bridge specs, encryption, or `AndroidManifest.xml` permissions, verify backward compatibility and `android-security-webview` + `gradle-build-resolver` R8 keep rules.'
    }
  ],
  [
    'Before changing WebView bridge specs or `AndroidManifest.xml` permissions, check backward compatibility and security (origin restrictions, ProGuard/R8 rules) first.',
    {
      key: 'bots.templates.android-dev.soulDo.3',
      fallback:
        'Before changing WebView bridge specs or `AndroidManifest.xml` permissions, check backward compatibility and security (origin restrictions, ProGuard/R8 rules) first.'
    }
  ],
  [
    'Never claim something is fixed without passing `android-verification-loop` build/test checks first.',
    {
      key: 'bots.templates.android-dev.soulDont.0',
      fallback:
        'Never claim something is fixed without passing `android-verification-loop` build/test checks first.'
    }
  ],
  [
    'Never claim something is fixed without verifying the build or runtime first.',
    {
      key: 'bots.templates.android-dev.soulDont.0',
      fallback: 'Never claim something is fixed without verifying the build or runtime first.'
    }
  ],
  [
    'Never use `GlobalScope`, swallow `CancellationException`, add `!!` assertions, or import Android/DB/network frameworks inside `domain`.',
    {
      key: 'bots.templates.android-dev.soulDont.1',
      fallback:
        'Never use `GlobalScope`, swallow `CancellationException`, add `!!` assertions, or import Android/DB/network frameworks inside `domain`.'
    }
  ],
  [
    'Never bump `minSdk`/`targetSdk` in `build.gradle` or core dependency versions without explicit owner approval.',
    {
      key: 'bots.templates.android-dev.soulDont.2',
      fallback:
        'Never bump `minSdk`/`targetSdk` in `build.gradle` or core dependency versions without explicit owner approval.'
    }
  ],
  [
    'Never bump `minSdk`/`targetSdk` in `build.gradle` or core dependency versions without approval.',
    {
      key: 'bots.templates.android-dev.soulDont.2',
      fallback:
        'Never bump `minSdk`/`targetSdk` in `build.gradle` or core dependency versions without approval.'
    }
  ],
  [
    'Never commit keystores (`*.jks`), `local.properties`, or API secret keys to Git, or print sensitive values in logs.',
    {
      key: 'bots.templates.android-dev.soulDont.3',
      fallback:
        'Never commit keystores (`*.jks`), `local.properties`, or API secret keys to Git, or print sensitive values in logs.'
    }
  ],
  [
    'Never commit keystores (`*.jks`), `local.properties`, or API secret keys to Git, or print them in logs.',
    {
      key: 'bots.templates.android-dev.soulDont.3',
      fallback:
        'Never commit keystores (`*.jks`), `local.properties`, or API secret keys to Git, or print them in logs.'
    }
  ],
  [
    'Classify every feature or fix into Track A/B/C with the `ios-intake` skill and convert it into an `ios-worker-brief` template before delegating.',
    {
      key: 'bots.templates.ios-dev.soulDo.0',
      fallback:
        'Classify every feature or fix into Track A/B/C with the `ios-intake` skill and convert it into an `ios-worker-brief` template before delegating.'
    }
  ],
  [
    'After code changes, verify `xcodebuild` build or unit tests (`xcodebuild test` / `swift test`) pass directly in the `ios-close-out` step.',
    {
      key: 'bots.templates.ios-dev.soulDo.1',
      fallback:
        'After code changes, verify `xcodebuild` build or unit tests (`xcodebuild test` / `swift test`) pass directly in the `ios-close-out` step.'
    }
  ],
  [
    'Before changing WKWebView bridge specs, `Info.plist`, or Entitlements, check backward compatibility and security (origin restrictions, ATS, Keychain access groups) first.',
    {
      key: 'bots.templates.ios-dev.soulDo.2',
      fallback:
        'Before changing WKWebView bridge specs, `Info.plist`, or Entitlements, check backward compatibility and security (origin restrictions, ATS, Keychain access groups) first.'
    }
  ],
  [
    'Never claim something is fixed without verifying the build or simulator/test run first.',
    {
      key: 'bots.templates.ios-dev.soulDont.0',
      fallback:
        'Never claim something is fixed without verifying the build or simulator/test run first.'
    }
  ],
  [
    'Never bump iOS deployment target, Xcode project settings, or SwiftPM/CocoaPods dependency versions without approval.',
    {
      key: 'bots.templates.ios-dev.soulDont.1',
      fallback:
        'Never bump iOS deployment target, Xcode project settings, or SwiftPM/CocoaPods dependency versions without approval.'
    }
  ],
  [
    'Never commit `.p12`, `.mobileprovision`, `AuthKey_*.p8`, or API secret keys to Git, or print them in logs.',
    {
      key: 'bots.templates.ios-dev.soulDont.2',
      fallback:
        'Never commit `.p12`, `.mobileprovision`, `AuthKey_*.p8`, or API secret keys to Git, or print them in logs.'
    }
  ],
  [
    'Classify every feature or fix into Track A/B/C with the `mobile-web-intake` skill and convert it into a `mobile-web-worker-brief` template before delegating.',
    {
      key: 'bots.templates.mobile-web-dev.soulDo.0',
      fallback:
        'Classify every feature or fix into Track A/B/C with the `mobile-web-intake` skill and convert it into a `mobile-web-worker-brief` template before delegating.'
    }
  ],
  [
    'After code changes, verify build, typecheck, lint, and unit/E2E tests pass directly in the `mobile-web-close-out` step.',
    {
      key: 'bots.templates.mobile-web-dev.soulDo.1',
      fallback:
        'After code changes, verify build, typecheck, lint, and unit/E2E tests pass directly in the `mobile-web-close-out` step.'
    }
  ],
  [
    'Before changing responsive layouts, WebView JS bridge clients, or CSP/cookie policies, check iOS Safari/Android WebView compatibility, safe-area insets, and XSS/origin security first.',
    {
      key: 'bots.templates.mobile-web-dev.soulDo.2',
      fallback:
        'Before changing responsive layouts, WebView JS bridge clients, or CSP/cookie policies, check iOS Safari/Android WebView compatibility, safe-area insets, and XSS/origin security first.'
    }
  ],
  [
    'Never claim something is fixed without verifying the production build and mobile viewport behavior first.',
    {
      key: 'bots.templates.mobile-web-dev.soulDont.0',
      fallback:
        'Never claim something is fixed without verifying the production build and mobile viewport behavior first.'
    }
  ],
  [
    'Never upgrade framework/bundler major versions or alter CSP/CORS/cookie security headers without approval.',
    {
      key: 'bots.templates.mobile-web-dev.soulDont.1',
      fallback:
        'Never upgrade framework/bundler major versions or alter CSP/CORS/cookie security headers without approval.'
    }
  ],
  [
    'Never commit `.env*` secrets, API tokens, or private keys to Git, or expose them in client bundles/logs.',
    {
      key: 'bots.templates.mobile-web-dev.soulDont.2',
      fallback:
        'Never commit `.env*` secrets, API tokens, or private keys to Git, or expose them in client bundles/logs.'
    }
  ]
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
  for (const entry of LABELED_PREFIXES) {
    if (line.startsWith(entry.prefix)) {
      const value = line.slice(entry.prefix.length)
      const label = t(entry.key, entry.labelFallback)
      return `${label}: ${entry.translateValue ? botTemplateText(value, t) : value}`
    }
  }
  return botTemplateText(line, t)
}
