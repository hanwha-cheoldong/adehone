import type { BotTemplate } from '../bot-templates'

export const BOT_TEMPLATES_MOBILE_CODING: readonly BotTemplate[] = [
  {
    id: 'android-dev',
    category: 'coding',
    name: 'Android development',
    line: 'Plans, builds, tests, and reviews Android features with Kotlin/Compose workflows and mobile security guides.',
    firstChat:
      'Point it at an Android workspace or give it a task. It follows structured Android workflows (planner, Clean Architecture, Jetpack Compose, Coroutines/Flows, TDD/Turbine, code review, verification loop) plus enterprise WebView/security guides.',
    mascot: 'AND',
    watches: 'Android workspaces, tasks, and pull requests you hand it',
    does: 'Plans and implements Clean Architecture, Compose, Coroutines/Flows, TDD tests, Gradle fixes, and hardened WebView/security code.',
    reports: 'Here, weekdays at 9 AM and after verification-loop checks',
    connectors: ['github'],
    schedules: [
      {
        id: 'daily-morning-check',
        when: 'Weekdays at 9 AM',
        what: 'Daily Gradle build, lint & static analysis healthcheck',
        rrule: '0 9 * * 1-5',
        prompt:
          'Run git fetch, ./gradlew assembleDebug, ./gradlew lintDebug, and configured ktlintCheck/detekt on the active Android workspace, then post a concise morning status summary.'
      }
    ],
    events: [
      {
        id: 'pr-verify',
        name: 'When a pull request is opened or updated: run 6-phase verification loop and Kotlin code review',
        source: 'github',
        event: 'pull_request',
        prompt:
          'Verify the Android pull request using android-verification-loop and kotlin-code-review: run Gradle build/tests/lint/ktlint/detekt, scan security & R8/WebView diffs, and post the PASS/FAIL report here.'
      }
    ],
    skills: [
      'android-planner',
      'android-clean-architecture',
      'android-compose-patterns',
      'kotlin-coroutines-flows',
      'kotlin-tdd-testing',
      'kotlin-code-review',
      'gradle-build-resolver',
      'android-verification-loop',
      'android-security-webview',
      'android-java-legacy'
    ],
    example: [
      'Planned phased Clean Architecture feature, wrote Turbine/MockK tests first, and passed 6-phase verification.',
      'Flagged domain Android import, swallowed CancellationException, and missing FLAG_SECURE on PIN screen.'
    ]
  },
  {
    id: 'ios-dev',
    category: 'coding',
    name: 'iOS development',
    line: 'Plans, builds, tests, and reviews iOS features with Swift/SwiftUI, Objective-C interop, and mobile security guides.',
    firstChat:
      'Point it at an iOS workspace or give it a task. It follows structured iOS workflows (planner, Clean Architecture, SwiftUI/UIKit, Swift Concurrency/Actors, Objective-C interop, Swift Testing TDD, code review, verification loop) plus enterprise WKWebView/security guides.',
    mascot: 'APL',
    watches: 'iOS workspaces, tasks, and pull requests you hand it',
    does: 'Plans and implements Clean Architecture, SwiftUI/UIKit, Swift Concurrency/Actors, Objective-C interop, TDD tests, Xcode build fixes, and hardened WKWebView/security code.',
    reports: 'Here, weekdays at 9 AM and after verification-loop checks',
    connectors: ['github'],
    schedules: [
      {
        id: 'daily-morning-check',
        when: 'Weekdays at 9 AM',
        what: 'Daily Xcode/Swift build, SwiftLint & static analysis healthcheck',
        rrule: '0 9 * * 1-5',
        prompt:
          'Run git fetch, xcodebuild build-for-testing (or swift build), and swiftlint/swift-format on the active iOS workspace, then post a concise morning status summary.'
      }
    ],
    events: [
      {
        id: 'pr-verify',
        name: 'When a pull request is opened or updated: run 6-phase verification loop and Swift code review',
        source: 'github',
        event: 'pull_request',
        prompt:
          'Verify the iOS pull request using ios-verification-loop and swift-code-review: run Xcode/SwiftPM build, tests, SwiftLint, scan security & Info.plist/Entitlements/WKWebView diffs, and post the PASS/FAIL report here.'
      }
    ],
    skills: [
      'ios-planner',
      'ios-clean-architecture',
      'ios-swiftui-patterns',
      'swift-concurrency-actors',
      'swift-tdd-testing',
      'swift-code-review',
      'xcode-build-resolver',
      'ios-verification-loop',
      'ios-security-webview'
    ],
    example: [
      'Planned phased Clean Architecture feature, wrote Swift Testing mocks first, and passed 6-phase verification.',
      'Flagged domain SwiftUI import, force-unwrap (!), and missing origin check on WKScriptMessageHandler.'
    ]
  },
  {
    id: 'mobile-web-dev',
    category: 'coding',
    name: 'Mobile web development',
    line: 'Plans, builds, tests, and reviews responsive mobile web, PWA, and hybrid WebView features with ECC web & bridge guides.',
    firstChat:
      'Point it at a mobile web workspace or hand it a [MWB] work item from Product planning. It follows structured ECC workflows (planner, web patterns, design/a11y, TDD & Playwright mobile E2E, code review, 6-phase verification loop) plus Android/iOS WebView bridge guides.',
    mascot: 'MWB',
    watches:
      'Mobile web workspaces, [MWB] tasks, WebView bridge specs, and pull requests you hand it',
    does: 'Plans and implements responsive 100dvh/safe-area UI, WCAG 2.2 AA a11y, Core Web Vitals/PWA, TDD/Playwright tests, and Android/iOS WebView JS bridge clients.',
    reports: 'Here, weekdays at 9 AM and after verification-loop checks',
    connectors: ['github'],
    schedules: [
      {
        id: 'daily-morning-check',
        when: 'Weekdays at 9 AM',
        what: 'Daily build, typecheck & lint healthcheck',
        rrule: '0 9 * * 1-5',
        prompt:
          'Run git fetch, production build, typecheck, and lint on the active mobile web workspace, then post a concise morning status summary.'
      }
    ],
    events: [
      {
        id: 'pr-verify',
        name: 'When a pull request is opened or updated: run 6-phase verification loop and mobile web code review',
        source: 'github',
        event: 'pull_request',
        prompt:
          'Verify the mobile web pull request using mobile-web-verification-loop and mobile-web-code-review: run build/bundle budget, typecheck/lint, unit & mobile-viewport E2E tests, scan XSS/CSP/WebView bridge diffs, and post the PASS/FAIL report here.'
      }
    ],
    skills: [
      'mobile-web-planner',
      'mobile-web-patterns',
      'mobile-web-design-a11y',
      'mobile-web-tdd-testing',
      'mobile-web-code-review',
      'mobile-web-build-resolver',
      'mobile-web-verification-loop',
      'mobile-web-webview-bridge',
      'mobile-web-performance-pwa'
    ],
    example: [
      'Planned [MWB-04] with mobile-web-planner, aligned 11-API WebView bridge with Android/iOS bots, and passed 6-phase verification.',
      'Flagged 100vh keyboard clipping, missing safe-area-inset-bottom, and postMessage(*) origin bypass.'
    ]
  }
]
