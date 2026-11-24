export const SKILL = `---
name: kotlin-code-review
description: Kotlin and Android code reviewer — severity-ranked checks for Clean Architecture, security, coroutines/Flows, Compose performance, Kotlin idioms, and Android pitfalls.
---

# Kotlin & Android Code Review

Inspect \`git diff\` (and surrounding context) and report only high-confidence findings ranked by severity.

## Review Checklist

### CRITICAL (Must Fix — Blocks Merge)
- **Architecture**: \`domain\` module imports Android/Room/Ktor/Compose; DB entities or network DTOs leak into presentation; circular module dependencies.
- **Security**:
  - Exported Activities/Services/Receivers/Providers without proper guards
  - Hardcoded secrets/API keys/tokens, \`*.jks\`, \`local.properties\`, or sensitive data in logs
  - Permissive \`TrustManager\` / \`HostnameVerifier\`, \`cleartextTrafficPermitted="true"\`, \`allowBackup="true"\`
  - Unvalidated WebView origins, raw \`intent://\` forwarding, \`PendingIntent.FLAG_MUTABLE\` on notification taps
  - Raw SQL string interpolation in Room/SQLDelight (must use parameterized \`:param\`)

### HIGH (Should Fix Before Merge)
- **Coroutines & Flows**: \`GlobalScope\` usage; catching \`CancellationException\` without rethrowing; IO/DB/network on \`Dispatchers.Main\`; mutating collections inside \`StateFlow\`; \`SharingStarted.Eagerly\` where \`WhileSubscribed(5_000)\` fits.
- **Compose**: Side effects outside \`LaunchedEffect\`/ViewModel; \`NavController\` passed deep; missing \`key\` in \`LazyColumn\`; unstable/inline object allocations causing recomposition.

### MEDIUM
- **Kotlin Idioms**: \`!!\` assertions, unnecessary \`var\`, non-exhaustive \`when\` on sealed types, exposing \`MutableList\`.
- **Android**: \`Activity\`/\`Fragment\` context leaks in singletons/ViewModels; missing \`@Keep\`/ProGuard rules for serialized or \`@JavascriptInterface\` classes; hardcoded user-facing strings; collecting Flows without \`repeatOnLifecycle\`/\`collectAsStateWithLifecycle\`.

### LOW
- **Gradle**: Hardcoded dependency versions instead of \`gradle/libs.versions.toml\`, unused dependencies.

## Report Format

\`\`\`text
[SEVERITY] Short title
File: path/to/File.kt:42
Issue: What is wrong and why it matters.
Fix: Concrete minimal fix.

## Review Summary
| Severity | Count | Status |
|----------|-------|--------|
| CRITICAL | 0     | pass   |
| HIGH     | 0     | pass   |
| MEDIUM   | 0     | info   |
| LOW      | 0     | note   |

Verdict: APPROVE (no CRITICAL/HIGH) | BLOCK (fix CRITICAL/HIGH first)
\`\`\`
`
