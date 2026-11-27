import type { ComposerGeneratedBranch } from '@/components/new-workspace/composer/ComposerGeneratedBranchPreview'
import { toFolderWorkspaceLinkedTask } from '@/components/sidebar/workspace-creation/folder/folder-workspace-source-selection'
import { getWorkspaceSeedName } from '@/lib/workspace/creation/new-workspace'
import type { ComposerModel } from '../composer-model'

/** The same seed and links quick create sends, so the preview composes what the host will. */
export function composerGeneratedBranch(state: ComposerModel): ComposerGeneratedBranch {
  return {
    name: getWorkspaceSeedName({
      explicitName: state.name,
      prompt: '',
      linkedIssueNumber: state.parsedLinkedIssueNumber,
      linkedPR: state.linkedPR,
      fallbackName: state.fallbackCreatureName
    }),
    ticketSource: {
      linkedWorkItem: toFolderWorkspaceLinkedTask(state.linkedWorkItem),
      linkedIssue: state.parsedLinkedIssueNumber,
      linkedGitLabIssue: state.linkedGitLabIssue
    },
    type: state.branchType,
    onTypeChange: state.setBranchType
  }
}
