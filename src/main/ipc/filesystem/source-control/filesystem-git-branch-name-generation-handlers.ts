import { ipcMain } from 'electron'
import os from 'node:os'
import { getCommitMessageModelDiscoveryHostKey } from '../../../../shared/source-control/ai/generation/commit-message-host-key'
import { textGenerationFailureCodeFields } from '../../../../shared/text-generation/text-generation-failure-copy'
import { SSH_HOST_NOT_SERVED_MESSAGE } from '../../../providers/ssh-host-not-served-error'
import {
  generateBranchNameFromContext,
  resolveCommitMessageSettings
} from '../../../text-generation/commit-message-text-generation'
import { prepareLocalCommitMessageAgentEnv } from '../../../text-generation/execution/commit-message-agent-environment'
import type { GenerateBranchNameResult } from '../../../text-generation/source-control-text-generation-types'
import { getLocalProjectWorktreeGitOptions } from '../../../workspaces/execution-host/project-runtime-git-options'
import type { FilesystemHandlerContext } from '../filesystem-handler-context'
import {
  getLocalAgentRuntimeTarget,
  getLocalTextGenerationTarget
} from './filesystem-source-control-ai-targets'

/** Expose branch-name AI generation to the renderer when a title exceeds synchronous slug limits. */
export function registerFilesystemGitBranchNameGenerationHandlers(
  context: FilesystemHandlerContext
): void {
  const { store, commitMessageAgentEnv } = context
  ipcMain.handle(
    'git:generateBranchName',
    async (
      _event,
      args: {
        title: string
        repoId?: string
        connectionId?: string
      }
    ): Promise<GenerateBranchNameResult> => {
      const title = args.title.trim()
      if (!title) {
        return { success: false, error: 'Title is empty.' }
      }
      if (args.connectionId) {
        return { success: false, error: SSH_HOST_NOT_SERVED_MESSAGE }
      }
      const repo = args.repoId ? store.getRepo(args.repoId) : undefined
      const discoveryHostKey = getCommitMessageModelDiscoveryHostKey(args.connectionId ?? null)
      const resolvedSettings = resolveCommitMessageSettings(
        store.getSettings(),
        discoveryHostKey,
        'branchName',
        repo
      )
      if (!resolvedSettings.ok) {
        return {
          success: false,
          error: resolvedSettings.error,
          ...textGenerationFailureCodeFields(resolvedSettings)
        }
      }
      const cwd = repo?.path || os.homedir()
      const gitOptions = repo ? getLocalProjectWorktreeGitOptions(store, repo) : {}
      const localEnv = await prepareLocalCommitMessageAgentEnv(
        resolvedSettings.params.agentId,
        commitMessageAgentEnv,
        getLocalAgentRuntimeTarget(gitOptions)
      )
      if (!localEnv.ok) {
        return { success: false, error: localEnv.error }
      }
      return generateBranchNameFromContext(
        { firstPrompt: title },
        resolvedSettings.params,
        getLocalTextGenerationTarget(cwd, gitOptions, localEnv.env)
      )
    }
  )
}
