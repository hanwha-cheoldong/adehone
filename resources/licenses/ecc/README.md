# ECC attribution

The mobile web bot template skills (`src/main/bots/bot-template-skills/mobile-web-*.ts`) and some
Android and iOS template skills are adapted from [ECC](https://github.com/affaan-m/ECC)
(MIT License, Copyright (c) 2026 Affaan Mustafa); see `LICENSE-MIT`.

- Reference version: 2.2.3 (commit `4adeee67`). Compare by hand when updating; nothing reads ECC at
  runtime, and bots read only their own installed skills.
- `references/react-performance.md` also draws on Vercel Labs `react-best-practices` 1.0.0
  (MIT License, Copyright (c) Vercel Engineering), as adapted in ECC `react-performance`.
- Installed mobile web bots receive the notice in `mobile-web-patterns/references/third-party-notices.md`.

## iOS skills

In the built-in `ios-dev` bot template, the skills are Orca's own text except for passages like these:

| Orca skill | ECC source |
|---|---|
| `swift-concurrency-actors` | `skills/swift-actor-persistence`, `rules/swift/coding-style.md` |
| `ios-swiftui-patterns`, `ios-clean-architecture` | `skills/swiftui-patterns` |
| `ios-planner` | `agents/planner.md` |
| `swift-code-review` | review report format shared by ECC's reviewer agents |
| `xcode-build-resolver`, `ios-verification-loop` | `agents/swift-build-resolver.md` |
| `swift-tdd-testing` | `rules/swift/testing.md` |

## Adehone skills

In the built-in `adehone-dev` bot template, the skills are Orca's own text except for passages like these.
ECC's test-first and coverage-target rules are not included.

| Orca skill | ECC source |
|---|---|
| `adehone-planner` | `agents/planner.md` |
| `adehone-electron-security` | `agents/security-reviewer.md` |
| `adehone-react-ui` | `rules/react/hooks.md`, `rules/react/patterns.md`, `agents/react-reviewer.md` |
| `adehone-build-resolver` | `agents/build-error-resolver.md`, `agents/react-build-resolver.md` |
| `adehone-code-review` | `agents/code-reviewer.md`, `agents/react-reviewer.md`, `agents/typescript-reviewer.md` |
| `adehone-verification-loop` | `skills/verification-loop` |

These skills carry the notice in their own `references/ecc-license.md`.
