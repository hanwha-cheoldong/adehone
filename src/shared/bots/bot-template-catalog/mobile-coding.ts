import type { BotTemplate } from '../bot-templates'

export const BOT_TEMPLATES_MOBILE_CODING: readonly BotTemplate[] = [
  {
    id: 'android-dev',
    category: 'coding',
    name: 'Android development',
    line: 'Plans, builds, tests, and reviews Android/KMP features with Kotlin/Compose workflows and mobile security guides.',
    firstChat:
      'Point it at an Android or KMP workspace or give it a task. It follows structured Android workflows (planner, Clean Architecture, Compose, Coroutines/Flows, TDD/Turbine, code review, verification loop) plus enterprise WebView/security guides.',
    mascot: 'AND',
    watches: 'Android/KMP workspaces, tasks, and pull requests you hand it',
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
      'compose-patterns',
      'kotlin-coroutines-flows',
      'kotlin-tdd-testing',
      'kotlin-code-review',
      'gradle-build-resolver',
      'android-verification-loop',
      'android-security-webview'
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
    line: 'Builds and reviews iPhone/iOS features with Swift, SwiftUI, and mobile security guides.',
    firstChat:
      'Point it at an iOS workspace or give it a task. It follows modern Swift/SwiftUI best practices along with transport encryption, native/WKWebView JS bridge, Keychain/Biometrics, MDM/MAM, and APNs push guides.',
    mascot: 'APL',
    watches: 'iOS workspaces, tasks, and pull requests you hand it',
    does: 'Implements and reviews Swift/UIKit/SwiftUI, WKWebView JS bridge, security, MDM/MAM, and Apple device API code.',
    reports: 'Here, weekdays at 9 AM and after worker verification',
    connectors: ['github'],
    schedules: [
      {
        id: 'daily-morning-check',
        when: 'Weekdays at 9 AM',
        what: 'Daily build & SwiftLint healthcheck',
        rrule: '0 9 * * 1-5',
        prompt:
          'Run git fetch, xcodebuild build-for-testing (or swift build), and swiftlint on the active iOS workspace, then post a morning summary using the ios-desk-brief skill.'
      }
    ],
    events: [
      {
        id: 'pr-verify',
        name: 'When a pull request is opened or updated: run Xcode tests and bridge/entitlements checks',
        source: 'github',
        event: 'pull_request',
        prompt:
          'Verify the iOS pull request with the ios-close-out skill: run xcodebuild test, check Info.plist, Entitlements, and WKWebView bridge diffs, and report the checklist here.'
      }
    ],
    skills: [
      'ios-intake',
      'ios-worker-brief',
      'ios-close-out',
      'ios-desk-brief',
      'ios-development',
      'ios-wkwebview-bridge',
      'ios-xcode-signing'
    ],
    example: [
      'Added Keychain-backed Face ID (LAContext) auth and a hardened WKScriptMessageHandler bridge.',
      'Flagged missing App Transport Security restriction and unpinned URLSession delegate.'
    ]
  },
  {
    id: 'mobile-web-dev',
    category: 'coding',
    name: 'Mobile web development',
    line: 'Builds and reviews responsive mobile web, PWA, and hybrid WebView frontend features.',
    firstChat:
      'Point it at a mobile web workspace or give it a task. It follows mobile-first responsive UI, touch/viewport ergonomics, Core Web Vitals, hybrid WebView bridge, and frontend security guides.',
    mascot: 'MWB',
    watches: 'Mobile web workspaces, tasks, and pull requests you hand it',
    does: 'Implements and reviews responsive mobile UI, touch interactions, PWA/caching, WebView JS bridge client, and frontend security code.',
    reports: 'Here, weekdays at 9 AM and after worker verification',
    connectors: ['github'],
    schedules: [
      {
        id: 'daily-morning-check',
        when: 'Weekdays at 9 AM',
        what: 'Daily build & lint/typecheck healthcheck',
        rrule: '0 9 * * 1-5',
        prompt:
          'Run git fetch, build, typecheck, and lint on the active mobile web workspace, then post a morning summary using the mobile-web-desk-brief skill.'
      }
    ],
    events: [
      {
        id: 'pr-verify',
        name: 'When a pull request is opened or updated: run build, tests, and mobile viewport/security checks',
        source: 'github',
        event: 'pull_request',
        prompt:
          'Verify the mobile web pull request with the mobile-web-close-out skill: run build/tests, check safe-area/viewport regressions, XSS/CSP, and WebView bridge diffs, and report the checklist here.'
      }
    ],
    skills: [
      'mobile-web-intake',
      'mobile-web-worker-brief',
      'mobile-web-close-out',
      'mobile-web-desk-brief',
      'mobile-web-development',
      'mobile-web-webview-bridge',
      'mobile-web-performance-pwa'
    ],
    example: [
      'Fixed iOS Safari 100dvh keyboard overlap and added safe-area-inset-bottom padding.',
      'Flagged unsanitized postMessage origin check and missing CSP frame-ancestors.'
    ]
  }
]
