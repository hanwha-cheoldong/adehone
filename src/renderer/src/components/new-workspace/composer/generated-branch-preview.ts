import {
  formatConventionalBranch,
  resolveBranchParts,
  type BranchWorkType
} from '../../../../../shared/git/branches/conventional-branch-name'
import {
  getBranchPrefixIssue,
  normalizeBranchPrefix,
  selectBranchPrefixInput
} from '../../../../../shared/git/branches/branch-prefix'
import {
  resolveBranchTicket,
  type BranchTicketSource
} from '../../../../../shared/git/branches/branch-ticket'
import { isSafeGitRefName } from '../../../../../shared/git/status/git-status-upstream-ref'
import { containsEmoji } from '../../../../../shared/text/emoji-shortcode-catalog'
import type { BranchPrefixStrategy } from '../../../../../shared/ui-chrome/ui-chrome-types'

export type GeneratedBranchPreviewInput = {
  name: string
  type: BranchWorkType | undefined
  ticketSource: BranchTicketSource
  prefixStrategy: BranchPrefixStrategy
  customPrefix: string
  /** Absent when only the workspace host knows it. */
  gitUsername: string | undefined
}

export type GeneratedBranchPreview =
  | { kind: 'expected' | 'random-name'; branch: string }
  | { kind: 'invalid-prefix'; prefix: string }

export function isAcceptableTypedBranchName(branchName: string): boolean {
  return !branchName.startsWith('-') && isSafeGitRefName(`refs/heads/${branchName}`)
}

const UNKNOWN_GIT_USERNAME = '<git-username>'
const FALLBACK_MARKER = 'workspace-random-value'

/** The host's own composition, without its collision suffix; null when only the host can tell. */
export function previewGeneratedBranch(
  input: GeneratedBranchPreviewInput
): GeneratedBranchPreview | null {
  // The host turns emoji into shortcodes with a dataset the window does not load.
  if (containsEmoji(input.name)) {
    return null
  }
  // The host picks the random value at create, so the preview only marks where it goes.
  const parts = resolveBranchParts(
    { name: input.name, type: input.type, ticket: resolveBranchTicket(input.ticketSource) },
    () => FALLBACK_MARKER
  )
  const isRandomName = parts.description === FALLBACK_MARKER
  const composed = String(formatConventionalBranch(parts))
  const branch = isRandomName ? composed.replace(FALLBACK_MARKER, 'workspace-<random>') : composed
  const rawPrefix = selectBranchPrefixInput(
    { branchPrefix: input.prefixStrategy, branchPrefixCustom: input.customPrefix },
    input.gitUsername || UNKNOWN_GIT_USERNAME
  )
  const prefix = rawPrefix ? normalizeBranchPrefix(rawPrefix) : ''
  if (input.prefixStrategy === 'custom' && getBranchPrefixIssue(prefix) !== null) {
    return { kind: 'invalid-prefix', prefix }
  }
  return {
    kind: isRandomName ? 'random-name' : 'expected',
    branch: prefix ? `${prefix}/${branch}` : branch
  }
}
