import { ECC_LICENSE_FILES } from './ecc-license'

export const SKILL = `---
name: adehone-verification-loop
description: Final verification of an Adehone change using the repository's gate plus diff, execution proof, security, and platform checks, with an honest report. Use before reporting done, opening a pull request, or pushing.
---

# Adehone Verification Loop

Repository paths are relative to the Adehone workspace. Read the "Checks" section of \`AGENTS.md\` now: it names the gate and wins over this skill.

## Phases
1. **Scope and diff.** Compare the diff with the done criteria and excluded scope. Look for unrelated edits, leftovers, and secrets (report location, never the value).
2. **Repository gate.** Run the gate \`AGENTS.md\` names, once, when editing is finished, and again after a rebase or fix. For work based on or targeting \`merge\`, run the \`merge\` base gate (\`pnpm check:dev\` there) right before a push. Run it in the foreground with the timeout the document gives. Do not add full-suite, typecheck, or lint runs that it tells you to skip. **Never** use \`--no-verify\`.
3. **Checks the gate may not cover.** Run what your change needs and the repository provides, for example localization catalog checks or a build for packaging-related changes. Read the package scripts to find them.
4. **Execution proof.** Show each done criterion by running it (\`adehone-testing-proof\` if installed, otherwise the UI validation rules in \`AGENTS.md\`).
5. **Review and security.** Run \`adehone-code-review\`, plus \`adehone-electron-security\` for security-relevant diffs, if installed; otherwise review the diff against \`AGENTS.md\`.
6. **Environments.** State macOS, Linux, Windows, remote host, mobile, and folder workspace each as verified (how), not affected (why), or unverified.

If a phase fails, fix it and rerun what the fix could have changed. If a build or typecheck fails, use \`adehone-build-resolver\` if installed and respect its 3-attempt stop.

## Status Words
- **PASS:** you ran it on the current code and saw it succeed.
- **FAIL:** you ran it and it failed.
- **UNVERIFIED (미확인):** you did not or could not run it. Give the reason. It is never a pass.
- **N/A:** it does not apply. Give the reason.

A result from before your last edit is stale.

## Report
\`\`\`markdown
# Verification report
| Check | Status | Evidence (command, environment) or reason |
|---|---|---|
| Scope and diff | | |
| Repository gate | | |
| Extra checks | | |
| Done criterion: ... | | |
| Review / security | | |
| macOS / Linux / Windows | | |
| Remote host / Mobile / Folder workspace | | |

Overall: READY | READY WITH UNVERIFIED ITEMS | NOT READY
Left to do / needs owner:
\`\`\`
\`READY\` requires no FAIL and no unverified item that a done criterion depends on. Ready does not authorize a push or a merge; those need the owner's approval.
`

export const SKILL_FILES = ECC_LICENSE_FILES
