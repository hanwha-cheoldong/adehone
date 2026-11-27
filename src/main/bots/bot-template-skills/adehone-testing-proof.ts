export const SKILL = `---
name: adehone-testing-proof
description: How to prove an Adehone change works by running it, when a committed test is justified, and how to check the UI without showing windows. Use for any bug fix or feature before saying it works.
---

# Adehone Testing and Proof

Repository paths are relative to the Adehone workspace. Read "Tests are the exception" and "Electron UI Validation" in \`AGENTS.md\`; they win over this skill.

## Prove by Running
Pick the cheapest run that exercises the real behaviour: a CLI command, a script, a component screenshot, or the app. For a bug, show the failure before the fix and its absence after. Record the command, the environment, and what you observed.

## Committed Tests Are the Exception
Default to no new committed test. Add one only for logic where a silent regression is costly, as \`AGENTS.md\` lists, and follow \`docs/agents-md-refs/test-antipatterns.md\`. A test you add calls real code, hardcodes expectations, and fails when the fix is reverted. There is no test-first requirement and no coverage target.

While iterating, run only what you touched, with the commands in \`AGENTS.md\`.

## UI and App Checks
1. **Presentational change:** use the repository's component fixture screenshots (\`docs/agents-md-refs/component-fixtures.md\`) when available.
2. **Real app state, IPC, terminals, or window chrome:** run the app **hidden, in the background**, with \`ORCA_BACKGROUND_LAUNCH=1\`, and inspect the hidden renderer through CDP screenshots. Set a fixed viewport and a known state.
3. If an \`electron\` skill is available to you, follow it. **If it is not installed**, follow the repository's \`AGENTS.md\` and \`docs/\` and use Playwright over CDP against the hidden renderer. If you cannot confirm that the launch stays hidden, do not launch; mark the UI **UNVERIFIED (미확인)** with the reason.

Rules:
- Never show a window, bring it to the front, focus the app, or activate it through the OS.
- Do not use computer-use to check Orca/Adehone UI.
- Native-focus and visible-window tests belong on an isolated display or CI, not the user's desktop.
- Rebuild changed launch-policy code before running the app; an old build wrapper is not safe.
- Use an isolated profile where the repository provides one, and close what you started.
- A remote debugging port gives full control of the app: use it only for your local run.

## Playwright's Electron API
Playwright documents its Electron automation (\`_electron\`) as **experimental**: https://playwright.dev/docs/api/class-electron. The repository's own way of checking the UI comes first. Launching through this API does not by itself keep windows hidden.

## Reporting
State what ran and where. A platform, remote host, mobile app, or folder workspace you did not run is **UNVERIFIED**, never passed. Code reading and passing unit tests are not UI or platform proof.
`
