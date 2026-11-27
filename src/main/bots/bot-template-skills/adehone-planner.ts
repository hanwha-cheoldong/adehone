import { ECC_LICENSE_FILES } from './ecc-license'

export const SKILL = `---
name: adehone-planner
description: Planning for Adehone (Electron desktop app, with a mobile app in the same repository) features and bug fixes. Use before editing code for any non-trivial change, and whenever you receive a work item from the product planning bot.
---

# Adehone Planner

Plan before editing. The plan is short for a small bug and phased for a large feature.

## 0. Read the Repository's Rules First
Paths below are relative to the Adehone workspace you are working in, not your bot home. The workspace's documents win over this skill.

1. \`AGENTS.md\` (language, checks, repository rules, Electron UI validation, code style).
2. The documents it points to that your change touches, under \`docs/agents-md-refs/\`, plus \`docs/STYLEGUIDE.md\` (UI) and \`.github/CONTRIBUTING.md\`.
3. \`.github/pull_request_template.md\` if the work ends in a pull request.

If a document is missing in this workspace, say which one and ask; do not fill the gap from memory. Reply in Korean unless asked for another language.

## 1. Intake
- **Product planning work item:** read the **contract**, the **done criteria**, and the **excluded scope**. If any of the three is missing, ask for it. Before editing code, report feasibility problems and open questions, then wait for answers to anything that blocks the design.
- The identifier format of work items sent to you is not decided yet. Do not require or invent one.
- Items tagged \`[AND]\`, \`[IOS]\`, or \`[MWB]\` (and items for any other platform bot) belong to those bots. Say so and do not implement them. An Adehone change that affects the mobile app inside this repository is still in your scope; confirm with the owner when ownership is unclear.
- **Bug:** write down the reproduction and the observed versus expected behaviour before looking for a cause. If you cannot reproduce it, say so; do not present a guess as the cause.

## 2. Search First
- Find existing components, IPC methods, stores, process wrappers, and utilities before adding any. Prefer extend over build, as \`AGENTS.md\` asks.
- Read the callers of what you will change, and the neighbouring code whose conventions you will follow.

## 3. Impact Check (fill every row)
| Area | Question |
|---|---|
| macOS / Linux / Windows | Shortcuts, paths, shells, processes, native modules? Read \`docs/agents-md-refs/cross-platform-support.md\` before touching them. |
| Remote hosts | Does it work when files, processes, and git live on a remote or SSH host? What happens on an older host or paired client? |
| Mobile | Does the mobile app use this contract, data, or UI string? |
| Folder workspaces | Does it assume the workspace is a git worktree? |
| Git / review | If it touches \`git\`, \`gh\`, or review behaviour, read \`docs/agents-md-refs/git-workflow.md\`; do not assume GitHub is the only provider. |
| Security boundary | New or changed IPC, preload, window options, URLs, permissions, CSP, or fuses? |

"Not affected" needs a one-line reason.

## 4. Plan Format
\`\`\`markdown
# Plan: [name]
## Goal and done criteria
## Out of scope
## Feasibility problems and open questions
## Impact (table above)
## Steps
1. [file and symbol] — change, why, depends on, risk (Low/Medium/High)
## How each done criterion will be proved
## Needs owner approval
\`\`\`

Split large work into phases that each leave the app releasable. The proof column describes what you will run and observe; adding a committed test is the exception, not the plan.

## Needs Owner Approval
- Major upgrades of Electron or a key dependency.
- Relaxing a security setting (context isolation, sandbox, CSP, \`webSecurity\`, fuses, permission handling).
- Running a release, publish, or signing step.
- Pushing, or merging a pull request.
`

export const SKILL_FILES = ECC_LICENSE_FILES
