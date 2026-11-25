import { createGitCommitActionsApi } from './web-git-commit-actions-api'
import { createGitHistoryApi } from './web-git-history-api'
import type { PreloadApi } from '../../../../../preload/api-types'
import { callAbortableRuntimeEnvironment } from '../../../runtime/rpc/calls/abortable-runtime-environment-call'
import { toRuntimeWorktreeSelector } from '../../../runtime/rpc/targets/runtime-worktree-selector'
import { createWebGitRebaseApi } from './web-git-rebase-api'
import { translate } from '@/i18n/i18n'
import { callRuntimeResult } from '../../runtime/client/web-runtime-calls'
import { createWebGitAtRiskLocalFilesApi } from './web-git-at-risk-local-files-api'
import { mutateGitPath, mutateGitPaths, resolveGitConflict } from './web-git-mutations'
import { requireGitStageWorktreeScopeReceipt } from '../../../../../shared/git/paths/git-stage-worktree-scope'
import {
  requireActiveEnvironment,
  updateEnvironmentFromResponse
} from '../../runtime/client/web-runtime-session'
import {
  resolveRuntimeFilePath,
  resolveRuntimeWorktreeByPath
} from '../workspaces/web-runtime-worktree-catalog'

export const webGitStatusAbortControllers = new Map<string, AbortController>()

export async function callAbortableRuntimeStatus<TResult>(
  requestToken: string,
  params: unknown
): Promise<TResult> {
  const environment = requireActiveEnvironment()
  webGitStatusAbortControllers.get(requestToken)?.abort()
  const controller = new AbortController()
  webGitStatusAbortControllers.set(requestToken, controller)
  try {
    const response = await callAbortableRuntimeEnvironment(
      environment.id,
      'git.status',
      params,
      undefined,
      controller.signal
    )
    updateEnvironmentFromResponse(environment, response)
    if (!response.ok) {
      throw new Error(response.error.message)
    }
    return response.result as TResult
  } finally {
    if (webGitStatusAbortControllers.get(requestToken) === controller) {
      webGitStatusAbortControllers.delete(requestToken)
    }
  }
}

async function callWorktreeGit<TResult>(
  method: string,
  worktreePath: string,
  params?: Record<string, unknown>,
  timeoutMs?: number
): Promise<TResult> {
  const worktree = await resolveRuntimeWorktreeByPath(worktreePath)
  return callRuntimeResult<TResult>(
    method,
    {
      worktree: toRuntimeWorktreeSelector(worktree.id),
      ...params
    },
    timeoutMs
  )
}

export function createGitApi(): NonNullable<Partial<PreloadApi>['git']> {
  return {
    status: async ({
      worktreePath,
      includeIgnored,
      includeLineStats,
      bypassEffectiveUpstreamNegativeCache,
      reuseLineStats,
      branchLineTotalMergeBase,
      requestToken
    }) => {
      const worktree = await resolveRuntimeWorktreeByPath(worktreePath)
      const params = {
        worktree: toRuntimeWorktreeSelector(worktree.id),
        includeIgnored,
        includeLineStats,
        bypassEffectiveUpstreamNegativeCache,
        reuseLineStats,
        ...(branchLineTotalMergeBase ? { branchLineTotalMergeBase } : {})
      }
      // Why: no token = nothing to cancel (pooled); a token routes via the subscription bridge so cancelStatus can abort.
      if (!requestToken) {
        return callRuntimeResult('git.status', params)
      }
      return callAbortableRuntimeStatus(requestToken, params)
    },
    cancelStatus: async ({ requestToken }) => {
      webGitStatusAbortControllers.get(requestToken)?.abort()
    },
    setStatusUpstreamRefWatch: async () => {},
    submoduleStatus: async ({ worktreePath, submodulePath, area }) =>
      callWorktreeGit('git.submoduleStatus', worktreePath, { submodulePath, area }),
    checkIgnored: async ({ worktreePath, paths }) =>
      callWorktreeGit('git.checkIgnored', worktreePath, { paths }),
    ...createWebGitAtRiskLocalFilesApi(),
    // Why: the "add huge folder to .gitignore" flow is desktop-only; the web runtime makes no offer, so return no candidates.
    findHugeFoldersToIgnore: async () => [],
    appendGitignore: async () => false,
    ...createGitHistoryApi(),
    mutationInFlight: async ({ worktreePath }) =>
      callWorktreeGit('git.mutationInFlight', worktreePath),
    conflictOperation: async ({ worktreePath }) =>
      callWorktreeGit('git.conflictOperation', worktreePath),
    abortMerge: async ({ worktreePath }) => {
      await callWorktreeGit('git.abortMerge', worktreePath)
    },
    ...createWebGitRebaseApi(),
    diff: async ({ worktreePath, filePath, staged, compareAgainstHead, oldPath }) => {
      const file = await resolveRuntimeFilePath(filePath, worktreePath)
      return callRuntimeResult('git.diff', {
        worktree: toRuntimeWorktreeSelector(file.worktree.id),
        filePath: file.relativePath,
        staged,
        compareAgainstHead,
        ...(oldPath ? { oldPath } : {})
      })
    },
    branchCompare: async ({ worktreePath, baseRef, admissionTier }) =>
      callWorktreeGit('git.branchCompare', worktreePath, {
        baseRef,
        ...(admissionTier ? { admissionTier } : {})
      }),
    commitCompare: async ({ worktreePath, commitId }) =>
      callWorktreeGit('git.commitCompare', worktreePath, { commitId }),
    upstreamStatus: async ({ worktreePath, pushTarget }) =>
      callWorktreeGit('git.upstreamStatus', worktreePath, { pushTarget }),
    fetch: async ({ worktreePath, pushTarget }) => {
      await callWorktreeGit('git.fetch', worktreePath, { pushTarget })
    },
    syncFork: async ({ worktreePath, expectedUpstream }) =>
      callWorktreeGit('git.forkSync', worktreePath, { expectedUpstream }, 60_000),
    push: async ({ worktreePath, publish, forceWithLease, pushTarget }) => {
      await callWorktreeGit('git.push', worktreePath, { publish, forceWithLease, pushTarget })
    },
    pull: async ({ worktreePath, pushTarget }) => {
      await callWorktreeGit('git.pull', worktreePath, { pushTarget })
    },
    fastForward: async ({ worktreePath, pushTarget }) => {
      await callWorktreeGit('git.fastForward', worktreePath, { pushTarget })
    },
    rebaseFromBase: async ({ worktreePath, baseRef }) => {
      return callWorktreeGit('git.rebaseFromBase', worktreePath, { baseRef })
    },
    branchDiff: async ({ worktreePath, filePath, compare, oldPath }) => {
      const file = await resolveRuntimeFilePath(filePath, worktreePath)
      return callRuntimeResult('git.branchDiff', {
        worktree: toRuntimeWorktreeSelector(file.worktree.id),
        filePath: file.relativePath,
        compare,
        oldPath
      })
    },
    commitDiff: async ({ worktreePath, filePath, commitOid, parentOid, oldPath }) => {
      const file = await resolveRuntimeFilePath(filePath, worktreePath)
      return callRuntimeResult('git.commitDiff', {
        worktree: toRuntimeWorktreeSelector(file.worktree.id),
        filePath: file.relativePath,
        commitOid,
        parentOid,
        oldPath
      })
    },
    commit: async ({ worktreePath, message }) =>
      callWorktreeGit('git.commit', worktreePath, { message }),
    ...createGitCommitActionsApi(),
    completeMerge: async ({ worktreePath }) => callWorktreeGit('git.completeMerge', worktreePath),
    generateCommitMessage: async () => ({
      success: false,
      error: translate(
        'auto.web.web.preload.api.9fc90740b6',
        'Commit message generation is unavailable in the web client.'
      )
    }),
    discoverCommitMessageModels: async () => ({
      success: false,
      error: translate(
        'auto.web.web.preload.api.e57c82d276',
        'Commit message model discovery is unavailable in the web client.'
      )
    }),
    cancelGenerateCommitMessage: () => Promise.resolve(),
    generatePullRequestFields: async () => ({
      success: false,
      error: translate(
        'auto.web.web.preload.api.b8a1618172',
        'Pull request detail generation is unavailable in the web client.'
      )
    }),
    cancelGeneratePullRequestFields: () => Promise.resolve(),
    stage: async ({ worktreePath, filePath }) => mutateGitPath('git.stage', worktreePath, filePath),
    resolveConflict: async ({ worktreePath, filePath, resolution }) =>
      resolveGitConflict(worktreePath, filePath, resolution),
    addToGitignore: async ({ worktreePath, relativePath, isDirectory }) => {
      const result = await callWorktreeGit<{ added: boolean }>('git.addToGitignore', worktreePath, {
        relativePath,
        isDirectory
      })
      return result.added
    },
    bulkStage: async ({ worktreePath, filePaths, scope }) => {
      if (!scope) {
        return mutateGitPaths('git.bulkStage', worktreePath, filePaths)
      }
      const worktree = await resolveRuntimeWorktreeByPath(worktreePath)
      // Why no paths: an older host strips `scope` and stages `filePaths`, so an empty list makes that a no-op.
      const reply = await callRuntimeResult<unknown>('git.bulkStage', {
        worktree: toRuntimeWorktreeSelector(worktree.id),
        filePaths: [],
        scope
      })
      requireGitStageWorktreeScopeReceipt(reply, scope)
    },
    unstage: async ({ worktreePath, filePath }) =>
      mutateGitPath('git.unstage', worktreePath, filePath),
    bulkUnstage: async ({ worktreePath, filePaths }) =>
      mutateGitPaths('git.bulkUnstage', worktreePath, filePaths),
    discard: async ({ worktreePath, filePath }) =>
      mutateGitPath('git.discard', worktreePath, filePath),
    bulkDiscard: async ({ worktreePath, filePaths }) => {
      for (const filePath of filePaths) {
        await mutateGitPath('git.discard', worktreePath, filePath)
      }
    },
    remoteFileUrl: async ({ worktreePath, relativePath, line, endLine }) =>
      callWorktreeGit('git.remoteFileUrl', worktreePath, { relativePath, line, endLine }),
    remoteCommitUrl: async ({ worktreePath, sha }) =>
      callWorktreeGit('git.remoteCommitUrl', worktreePath, { sha })
  }
}
