export const SKILL = `---
name: mobile-web-build-resolver
description: Fix Mobile Web build, typecheck, and bundler failures with minimal changes. Use whenever a build, typecheck, or dev server fails (TypeScript, Vite, webpack, Next.js, Nuxt, module resolution, hydration) — includes stop conditions and what needs owner approval.
---

# Mobile Web Build Error Resolver

Get the build green with the smallest change that fixes the cause. No refactoring, renaming, new features, performance work, or style cleanup.

## 1. Collect Before Editing
1. Read \`package.json\`, the lockfile, and the build config. Use the project's package manager and scripts.
2. Run the failing command (production build, plus the typecheck script if there is one) and read the whole output. For TypeScript, check with the project's installed compiler (\`tsc --noEmit\`, \`vue-tsc --noEmit\`, \`svelte-check\`); never auto-install an unpinned one.
3. Find what introduced the error (\`git status\`, \`git diff\`, recent commits). If the cause is a recent intentional change, fix its callers; if intent is unclear (for example, a changed API type), say which side you changed and ask the owner to confirm.

## 2. Fix One Cause at a Time
1. Order: install/configuration errors, then module resolution, then type and compile errors in dependency order.
2. Fix the root cause with one change, then re-run the same command before the next.
3. A new, different error is a new diagnosis. Do not stack unverified fixes.

## 3. Stop and Report
Stop editing and report when any of these happens:
- The **same error is still there after 3 fix attempts**. Count attempts per error, not per file.
- A fix introduces more errors than it removes (revert that fix first).
- The fix needs an architecture change (for example, redesigning a server/client component boundary).
- The fix needs owner approval (section 4) that you do not have.

Never discard or revert someone's change (uncommitted work above all) to get the build green. If the only remaining fix is to undo what they changed, or the change clearly depends on something that needs approval, leave their code as it is and ask.

Report the exact error, each attempt and its result, your best explanation, and the decision you need.

## 4. Needs Owner Approval First
- Upgrading or downgrading a framework, bundler, compiler, or other dependency across a **major** version.
- Adding or removing a runtime dependency, deleting or regenerating the lockfile, or forcing a peer-dependency conflict (\`--force\`, \`--legacy-peer-deps\`).
- Relaxing CSP, CORS, or cookie security settings to make something build or run.

## 5. Never Make It Green by Hiding the Error
No \`@ts-ignore\` / \`@ts-nocheck\`, \`any\` or double casts added only to silence the compiler, turning off \`strict\` or enabling \`skipLibCheck\`, disabling lint rules, \`ignoreBuildErrors\` / \`ignoreDuringBuilds\`, or deleting or skipping tests. A type conversion must also be correct at runtime; say what input would still break it.

## 6. Framework Notes
Apply only the notes for the framework the project actually uses (see \`mobile-web-patterns\`, Framework Gate).
- **React / Next.js**: a hook used in a Server Component needs the hook moved into a \`"use client"\` child; server-only imports (\`fs\`, database clients) must leave client files, and if that needs a boundary redesign, stop. Duplicate React copies cause "Invalid hook call" (check \`npm ls react\` or the package manager's equivalent).
- **Hydration mismatch (React, Nuxt)**: keep the first render deterministic. Move \`Date.now()\`, \`Math.random()\`, \`window\`, and storage reads into an effect or mounted hook instead of suppressing the warning.
- **Vue / Nuxt**: type errors inside templates show up in \`vue-tsc\`, not plain \`tsc\`.
- **Bundlers**: keep \`tsconfig\` path aliases and bundler aliases in step.

## 7. Verify and Report
After the build passes, run typecheck, lint, and tests, then \`mobile-web-verification-loop\`. A passing build alone is not "fixed": list every check you could not run as \`N/A\` or \`SKIPPED\` with the reason.

\`\`\`text
Build Status: SUCCESS / FAILED (stopped: reason)
- Error: <file:line, message>
- Cause: ...
- Fix: <files changed>
- Attempts on this error: N
- Re-run: <command> -> PASS/FAIL
- Not verified: ...
- Needs owner decision: None / ...
\`\`\`
`
