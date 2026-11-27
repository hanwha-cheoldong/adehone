import {
  assertBranchPrefixValid,
  getBranchPrefixIssue,
  normalizeBranchPrefix,
  selectBranchPrefixInput,
  type BranchPrefixSettings
} from '../../../../shared/git/branches/branch-prefix'
import {
  createFallbackBranchDescription,
  formatConventionalBranch,
  parseBranchWorkType,
  resolveBranchParts,
  splitBranchWorkType,
  type ConventionalBranchParts
} from '../../../../shared/git/branches/conventional-branch-name'
import { sanitizeWorktreeBranchName } from '../paths/worktree-logic'
import {
  resolveBranchTicket,
  type BranchTicketSource
} from '../../../../shared/git/branches/branch-ticket'
import { containsEmoji } from '../../../../shared/text/emoji-shortcode-catalog'

/** Expose a normalized prefix so callers avoid double-prefixing and invalid slash combinations. */
export function getConfiguredBranchPrefix(
  settings: Parameters<typeof selectBranchPrefixInput>[0],
  gitUsername: string | null
): string | null {
  const raw = selectBranchPrefixInput(settings, gitUsername)
  return raw ? normalizeBranchPrefix(raw) || null : null
}

// The folder sanitizer calls a name of only unknown emoji `workspace`; for a branch it describes nothing.
function branchSeedName(name: string): string {
  const sanitized = sanitizeWorktreeBranchName(name)
  return sanitized === 'workspace' && containsEmoji(name) && !splitBranchWorkType(name).description
    ? ''
    : sanitized
}

/** What every collision candidate of one create is built from; call once, so a random value holds. */
export function createBranchNameSeed(
  request: BranchTicketSource & { name: string; branchType?: string }
): ConventionalBranchParts {
  return resolveBranchParts(
    {
      // IPC input is renderer data, so the type is read again instead of trusted.
      type: request.branchType ? parseBranchWorkType(request.branchType) : undefined,
      ticket: resolveBranchTicket(request),
      name: branchSeedName(request.name)
    },
    createFallbackBranchDescription
  )
}

function requireConventionalBranch(parts: ConventionalBranchParts): string {
  const branch = formatConventionalBranch(parts)
  if (branch === null) {
    throw new Error(`Cannot build a branch name from "${parts.description}"`)
  }
  return branch
}

export function computeBranchName(
  parts: ConventionalBranchParts,
  settings: Parameters<typeof selectBranchPrefixInput>[0],
  gitUsername: string | null
): string {
  const branch = requireConventionalBranch(parts)
  const prefix = getConfiguredBranchPrefix(settings, gitUsername)
  return prefix ? `${prefix}/${branch}` : branch
}

/** Validate prefix settings early so creation errors identify configuration rather than opaque Git failures. */
export function computeValidatedBranchName(
  parts: ConventionalBranchParts,
  settings: BranchPrefixSettings,
  gitUsername: string | null
): string {
  const branch = requireConventionalBranch(parts)
  const prefix = getConfiguredBranchPrefix(settings, gitUsername)
  if (prefix === null) {
    return branch
  }
  if (getBranchPrefixIssue(prefix) !== null) {
    // Git username lookup can return error payloads; skip invalid derived prefixes but reject custom ones.
    if (settings.branchPrefix === 'git-username') {
      return branch
    }
    assertBranchPrefixValid(prefix)
  }
  return `${prefix}/${branch}`
}

/** Replace Git's raw refusal of a typed branch name with one the user can act on; other failures pass through. */
export function explicitBranchNameError(branchName: string, error: unknown): unknown {
  const output =
    error instanceof Error
      ? `${error.message}\n${'stderr' in error ? String(error.stderr) : ''}`
      : ''
  return /not a valid branch name/i.test(output)
    ? new Error(
        `Git does not accept "${branchName}" as a branch name. Edit the branch name and try again.`,
        { cause: error }
      )
    : error
}
