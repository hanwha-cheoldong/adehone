export const SKILL = `---
name: android-close-out
description: Verify Android worker output directly with Gradle builds, unit tests, Manifest/R8/diff checks, and optional adb smoke tests before reporting.
---

# Close-Out: Direct Android Verification & Reporting

Never accept a worker's completion claim on faith. Run verification yourself before reporting to the owner.

## 1. Build & Unit Test Verification
- Run \`./gradlew testDebugUnitTest assembleDebug\` in the workspace and confirm exit code \`0\`.
- Run \`./gradlew lintDebug\` when Manifest, resources, permissions, or WebView/security code changed.

## 2. Android-Specific Diff Checklist
Inspect \`git diff\` and verify:
- **Manifest**: Any new Activity, Service, Receiver, Provider, or permission is declared in \`AndroidManifest.xml\` with appropriate \`android:exported\` and permissions.
- **ProGuard / R8**: Any new \`@JavascriptInterface\`, reflection target, or serialization model (Gson / Kotlinx.serialization / Moshi) has \`@Keep\` or explicit rules in \`proguard-rules.pro\`.
- **Secrets & Hardcoding**: No hardcoded API keys, internal URLs, test tokens, \`*.jks\`, or \`local.properties\` leaked into the diff.

## 3. Emulator / Device Smoke Test (when connected)
If \`adb devices\` lists an online emulator or device:
- Install: \`adb install -r app/build/outputs/apk/debug/app-debug.apk\`
- Launch the app and inspect \`adb logcat -d | grep -E "FATAL EXCEPTION|AndroidRuntime"\` for crashes.

## 4. Final Report
Report to the owner with:
- Command results (build, test, lint, and adb smoke test if run)
- Modified files and key diff summary
- Any UI/UX or device-specific points needing manual verification
`
