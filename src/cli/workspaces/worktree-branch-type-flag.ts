import {
  BRANCH_WORK_TYPES,
  parseBranchWorkType,
  type BranchWorkType
} from '../../shared/git/branches/conventional-branch-name'
import { WORKTREE_CREATE_BRANCH_TYPE_RUNTIME_CAPABILITY } from '../../shared/remote-runtime/protocol/worktree-runtime-capabilities'
import type { RuntimeStatus } from '../../shared/remote-runtime/session-graph/runtime-session-contracts'
import { getPresentStringFlag } from '../arguments/flags'
import type { RuntimeClient } from '../runtime/client'
import { RuntimeClientError } from '../runtime/connection/types'

export function getBranchTypeFlag(
  flags: Map<string, string | boolean>,
  branchNameOverride: string | undefined
): BranchWorkType | undefined {
  const value = getPresentStringFlag(flags, 'type')
  if (value === undefined) {
    return undefined
  }
  const type = parseBranchWorkType(value)
  if (!type) {
    throw new RuntimeClientError(
      'invalid_argument',
      `--type must be one of ${BRANCH_WORK_TYPES.join(', ')} (or feature, bugfix).`
    )
  }
  if (branchNameOverride !== undefined) {
    throw new RuntimeClientError(
      'invalid_argument',
      '--type shapes a generated branch name; --branch is used exactly as written.'
    )
  }
  return type
}

/** An older host drops the field silently, so refuse before anything is created. */
export async function assertBranchTypeSupported(client: RuntimeClient): Promise<void> {
  const status = await client.call<RuntimeStatus>('status.get')
  if (!status.result.capabilities?.includes(WORKTREE_CREATE_BRANCH_TYPE_RUNTIME_CAPABILITY)) {
    throw new RuntimeClientError(
      'incompatible_runtime',
      'This Orca host cannot apply --type. Update Orca on the execution host, or omit --type.'
    )
  }
}
