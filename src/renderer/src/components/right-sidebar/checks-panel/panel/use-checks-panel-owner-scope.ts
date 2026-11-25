import { useMemo, useRef } from 'react'
import { useWorktreeGitOwnerTarget } from '../../source-control/sync/worktree-git-owner-target'
import { useWorktreeGitCopyHostId } from '@/lib/workspace/ownership/worktree-git-copy'
import { useAppStore } from '@/store/index'
import { readRuntimeStatuses } from '@/store/slices/runtime-status/views/runtime-status-owner'
import type { AppState } from '@/store/types'
import { resolveRepoWorktreeLaunchPlatform } from '@/runtime/hosts/platform/execution-host-facts'
import { runtimeEnvironmentIdOrLocalUnlessTwin } from '@/lib/workspace/ownership/worktree-runtime-owner'
import { normalizeGlobalWindowsRuntimeDefault } from '../../../../../../shared/execution-host/project-runtime-preference'
import { buildChecksPanelGitStatusContextKey } from '../refresh/checks-panel-git-status-snapshot'
import type { Repo } from '../../../../../../shared/repository/repo-types'
import type { Worktree } from '../../../../../../shared/worktree/types'

export function useChecksPanelOwnerScope({
  activeWorktree,
  activeWorktreeId,
  repo,
  branch,
  settings
}: {
  activeWorktree: Worktree | null | undefined
  activeWorktreeId: string | null
  repo: Repo | null | undefined
  branch: string
  settings: AppState['settings']
}) {
  const activeWorktreePath = activeWorktree?.path ?? null
  const activeWorktreePushTarget = activeWorktree?.pushTarget ?? null
  // Quote for the workspace owner's OS, where the agent actually runs (#27971).
  const activeSourceControlLaunchPlatform =
    activeWorktree && repo
      ? resolveRepoWorktreeLaunchPlatform(
          useAppStore.getState(),
          readRuntimeStatuses(),
          repo,
          activeWorktree
        )
      : undefined
  const runtimeEnvironmentId = useAppStore((s) =>
    runtimeEnvironmentIdOrLocalUnlessTwin(s, activeWorktreeId)
  )
  const ownerSettings = useMemo<AppState['settings']>(
    () =>
      !settings
        ? settings
        : runtimeEnvironmentId
          ? { ...settings, activeRuntimeEnvironmentId: runtimeEnvironmentId }
          : { ...settings, activeRuntimeEnvironmentId: null },
    [runtimeEnvironmentId, settings]
  )
  // Route Git by workspace ownership rather than focused server.
  const ownerTarget = useWorktreeGitOwnerTarget(activeWorktreeId)
  const ownerCopyHostId = useWorktreeGitCopyHostId(activeWorktreeId)
  const repoConnectionId = repo?.connectionId?.trim() || null
  // Separate local host/WSL distros; remote IDs already scope SSH/runtime contexts.
  const localExecutionScope = useMemo<string | null>(() => {
    if (runtimeEnvironmentId != null || repoConnectionId != null) {
      return null
    }
    const localRuntime = normalizeGlobalWindowsRuntimeDefault(settings?.localWindowsRuntimeDefault)
    return localRuntime.kind === 'wsl' ? `wsl:${localRuntime.distro ?? ''}` : 'host'
  }, [runtimeEnvironmentId, repoConnectionId, settings?.localWindowsRuntimeDefault])
  const sshConnectionStatus = useAppStore((s) =>
    repoConnectionId ? s.sshConnectionStates.get(repoConnectionId)?.status : undefined
  )
  const panelContextKey = buildChecksPanelGitStatusContextKey({
    repoId: repo?.id,
    worktreeId: activeWorktreeId,
    worktreePath: activeWorktreePath,
    branch,
    linkedGitHubPR: activeWorktree?.linkedPR ?? null,
    linkedGitLabMR: activeWorktree?.linkedGitLabMR ?? null,
    linkedBitbucketPR: activeWorktree?.linkedBitbucketPR ?? null,
    linkedAzureDevOpsPR: activeWorktree?.linkedAzureDevOpsPR ?? null,
    linkedGiteaPR: activeWorktree?.linkedGiteaPR ?? null,
    runtimeEnvironmentId,
    repoConnectionId,
    localExecutionScope,
    pushTarget: activeWorktreePushTarget
  })
  const panelContextKeyRef = useRef(panelContextKey)
  panelContextKeyRef.current = panelContextKey

  return {
    activeWorktreePath,
    activeWorktreePushTarget,
    activeSourceControlLaunchPlatform,
    runtimeEnvironmentId,
    ownerSettings,
    ownerTarget,
    ownerCopyHostId,
    repoConnectionId,
    localExecutionScope,
    sshConnectionStatus,
    panelContextKey,
    panelContextKeyRef
  }
}
