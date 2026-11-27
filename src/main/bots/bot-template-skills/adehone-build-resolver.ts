import { ECC_LICENSE_FILES } from './ecc-license'

export const SKILL = `---
name: adehone-build-resolver
description: Fix Adehone build, typecheck, lint-blocking, native module, and dev startup failures with minimal changes. Use as soon as a build or typecheck fails, before editing.
---

# Adehone Build Error Resolver

Fix the cause with the smallest change. No refactoring, renaming, features, or style cleanup. Repository paths are relative to the Adehone workspace.

## 1. Collect Before Editing
1. Check the environment first: the Node and package manager versions that \`package.json\` asks for against what is actually running, and whether dependencies are installed (the mobile app has its own). Many failures end here.
2. Read the package scripts and the config of the failing step. Use the repository's package manager and scripts, and the typecheck command in \`AGENTS.md\` for the affected project.
3. Run the failing command and read the whole output; start at the first error.
4. Find what introduced it (\`git status\`, \`git diff\`, recent commits). If intent is unclear, ask.

## 2. Fix One Cause at a Time
1. Order: environment and install, module resolution, then types in dependency order, then packaging.
2. Make one change, rerun the same command, then continue.
3. Do not hide errors with \`any\`, unchecked casts, \`@ts-ignore\`, \`@ts-nocheck\`, lint disables, loosened compiler options, or raised budgets and ratchet baselines.
4. Do not delete lockfiles or reset caches and dependencies as a guess.

## 3. Stop and Report
Stop editing when any of these happens:
- **The same error remains after 3 fix attempts.** Count per error.
- A fix creates more errors than it removes (undo it first).
- The fix needs an architecture change.
- The fix needs owner approval: a major upgrade of Electron or a key dependency, or relaxing a security setting.
- The fix needs a change to the user's global environment (installing or switching Node, shell settings).

Report the command, the first relevant error, what you tried, what you think the cause is (marked as unconfirmed if so), and the options.

## 4. Finish
Rerun the originally failing command, then \`adehone-verification-loop\` if installed, otherwise the gate in \`AGENTS.md\`. A fix checked on one platform says nothing about the others.
`

export const SKILL_FILES = ECC_LICENSE_FILES
