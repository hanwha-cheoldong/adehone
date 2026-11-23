import type { BotTemplate } from '../bot-templates'

export const BOT_TEMPLATES_MOBILE_CODING: readonly BotTemplate[] = [
  {
    id: 'android-dev',
    category: 'coding',
    name: 'Android development',
    line: 'Builds and reviews Android features with official Android skills and mobile security guides.',
    firstChat:
      'Point it at an Android workspace or give it a task. It follows official Android skills along with transport encryption, native/JS device API, MDM/MAM, secure keypad, and push guides.',
    mascot: 'AND',
    watches: 'Android workspaces, tasks, and pull requests you hand it',
    does: 'Implements and reviews Android native, WebView JS bridge, security, MDM/MAM, and device API code.',
    reports: 'Here, weekdays at 9 AM and after worker verification',
    connectors: ['github'],
    schedules: [
      {
        id: 'daily-morning-check',
        when: 'Weekdays at 9 AM',
        what: 'Daily build & lint healthcheck',
        rrule: '0 9 * * 1-5',
        prompt:
          'Run git fetch, ./gradlew assembleDebug, and ./gradlew lintDebug on the active Android workspace, then post a morning summary using the android-desk-brief skill.'
      }
    ],
    events: [
      {
        id: 'pr-verify',
        name: 'When a pull request is opened or updated: run Gradle tests and bridge/R8 checks',
        source: 'github',
        event: 'pull_request',
        prompt:
          'Verify the Android pull request with the android-close-out skill: run ./gradlew testDebugUnitTest, check R8/ProGuard rules and WebView bridge diffs, and report the checklist here.'
      }
    ],
    skills: [
      'android-intake',
      'android-worker-brief',
      'android-close-out',
      'android-desk-brief',
      'android-development',
      'android-webview-bridge',
      'android-gradle-r8'
    ],
    example: [
      'Added BiometricPrompt with CryptoObject and a hardened WebView bridge for biometric auth.',
      'Flagged missing FLAG_SECURE and Play Integrity check on the PIN screen.'
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
