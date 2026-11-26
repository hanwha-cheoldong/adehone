# ECC

Parts of the built-in `ios-dev` bot template skills (`src/main/bots/bot-template-skills/`) are adapted
from [ECC](https://github.com/affaan-m/ECC), MIT licensed; see `LICENSE-MIT`. Compared against ECC
2.2.3 (`4adeee67`). The skills are Orca's own text except for passages like these:

| Orca skill | ECC source |
|---|---|
| `swift-concurrency-actors` | `skills/swift-actor-persistence`, `rules/swift/coding-style.md` |
| `ios-swiftui-patterns`, `ios-clean-architecture` | `skills/swiftui-patterns` |
| `ios-planner` | `agents/planner.md` |
| `swift-code-review` | review report format shared by ECC's reviewer agents |
| `xcode-build-resolver`, `ios-verification-loop` | `agents/swift-build-resolver.md` |
| `swift-tdd-testing` | `rules/swift/testing.md` |

Bots read only their own installed skills; nothing here depends on a local ECC checkout.
Other platforms' templates were not compared.
