export const SKILL = `---
name: ios-xcode-signing
description: Xcode project, Info.plist, Entitlements, SwiftPM/CocoaPods policy, and iOS signing/secret hygiene.
---

# iOS Xcode & Signing Guardrails

1. **Deployment Target & Build Settings**: Never raise \`IPHONEOS_DEPLOYMENT_TARGET\`, \`SWIFT_VERSION\`, or major SPM/CocoaPods versions without explicit owner approval.
2. **Info.plist & Entitlements**: Keep privacy usage descriptions (\`NSCameraUsageDescription\`, \`NSFaceIDUsageDescription\`, etc.) minimal and accurate. Audit \`*.entitlements\` diffs for unintended capabilities (e.g., \`keychain-access-groups\`, \`aps-environment\`, \`associated-domains\`).
3. **Signing & Secret Hygiene**: Never commit \`.p12\`, \`.mobileprovision\`, \`AuthKey_*.p8\`, \`ExportOptions.plist\` secrets, or hardcoded API keys. Use Xcode automatic signing or CI-injected environment variables/Keychain.
4. **Build Reproducibility**: Keep \`Package.resolved\` / \`Podfile.lock\` consistent with declared dependencies and avoid local absolute paths in \`project.pbxproj\`.
`
