import { translate } from '@/i18n/i18n'
import type { Translate } from '@/i18n/use-translate'
import type { AiActionId } from '../../../../shared/source-control/ai/recipes/source-control-ai-actions'
import type { SourceControlActionVariable } from '../../../../shared/source-control/ai/recipes/source-control-ai-action-variables'

function basePromptExampleForAction(actionId: AiActionId, t: Translate): string {
  switch (actionId) {
    case 'commitMessage':
      return t(
        'sourceControl.variableExamples.basePrompt.commitMessage',
        'You are generating a single git commit message following the Conventional Commits specification.\nFormat: <type>[optional (scope)][optional !]: <description>\nIncludes allowed types, header/body/footer rules, branch, optional linked issue, staged files, and staged patch.'
      )
    case 'pullRequest':
      return t(
        'sourceControl.variableExamples.basePrompt.pullRequest',
        'You are generating pull request details.\nReturns compact JSON: {"base","title","body","draft"}\nIncludes rules (## Problem, ## Solution, linked issue, existing sections), branch/base/draft state, commits, changed files, and branch diff.'
      )
    case 'branchName':
      return t(
        'sourceControl.variableExamples.basePrompt.branchName',
        'Generate a short git branch name that summarizes the coding task or code changes.\nOutput ONLY the branch name on a single line.\nIncludes the first user request (or changes so far) and initial agent response.'
      )
    case 'conversationName':
      return t(
        'sourceControl.variableExamples.basePrompt.conversationName',
        'Generate a short, descriptive title for this conversation based on the first user request.'
      )
    case 'dictationCleanup':
      return t(
        'sourceControl.variableExamples.basePrompt.dictationCleanup',
        "Clean up the dictated transcript (punctuation, capitalization, and obvious transcription errors) without changing the speaker's meaning."
      )
    case 'fixCommitFailure':
      return t(
        'sourceControl.variableExamples.basePrompt.fixCommitFailure',
        'Diagnose and fix the failed git commit.\nIncludes the failed commit command, error output, and staged/working tree context.'
      )
    case 'fixPushFailure':
      return t(
        'sourceControl.variableExamples.basePrompt.fixPushFailure',
        'Diagnose and resolve the failed git push.\nIncludes the failed push command, error output, and branch/remote status.'
      )
    case 'fixChecks':
      return t(
        'sourceControl.variableExamples.basePrompt.fixChecks',
        'Investigate and fix the failing CI checks.\nIncludes failing check names, summaries, and available logs or annotations.'
      )
    case 'resolveConflicts':
      return t(
        'sourceControl.variableExamples.basePrompt.resolveConflicts',
        'Resolve the git merge or rebase conflicts.\nIncludes the conflicted files, current repository state, and conflict resolution guidance.'
      )
    case 'resolveComments':
      return t(
        'sourceControl.variableExamples.basePrompt.resolveComments',
        'Address the selected PR review comments.\nIncludes the review comment threads, file/line context, and instructions to apply the requested changes.'
      )
  }
}

export function sourceControlVariableExample(
  variable: SourceControlActionVariable,
  actionId: AiActionId,
  t: Translate = translate
): string {
  switch (variable) {
    case 'basePrompt':
      return basePromptExampleForAction(actionId, t)
    case 'branch':
      return t('sourceControl.variableExamples.branch', 'feature/conventional-commits')
    case 'stagedFiles':
      return t(
        'sourceControl.variableExamples.stagedFiles',
        'M src/app.ts\nA src/commit-message.ts'
      )
    case 'stagedPatch':
      return t(
        'sourceControl.variableExamples.stagedPatch',
        'diff --git a/src/app.ts b/src/app.ts\n+addActionRecipeDefaults()'
      )
    case 'baseBranch':
      return t('sourceControl.variableExamples.baseBranch', 'main')
    case 'currentTitle':
      return t(
        'sourceControl.variableExamples.currentTitle',
        'Improve Source Control AI customization'
      )
    case 'currentBody':
      return t(
        'sourceControl.variableExamples.currentBody',
        'Adds configurable agents and command templates for Source Control actions.'
      )
    case 'commitSummary':
      return t(
        'sourceControl.variableExamples.commitSummary',
        'a1b2c3d Add action recipe defaults\nd4e5f6a Render command templates'
      )
    case 'changedFiles':
      return t(
        'sourceControl.variableExamples.changedFiles',
        'src/app.ts | 24 +++++\nsrc/commit-message.ts | 8 +-'
      )
    case 'patch':
      return t(
        'sourceControl.variableExamples.patch',
        'diff --git a/src/app.ts b/src/app.ts\n+renderSourceControlActionCommandTemplate()'
      )
    case 'firstPrompt':
      return t('sourceControl.variableExamples.firstPrompt', 'Fix CI and commit the result')
    case 'assistantMessage':
      return t(
        'sourceControl.variableExamples.assistantMessage',
        'I will inspect the failing check, patch the issue, and run tests.'
      )
    case 'linkedIssue':
      return t('sourceControl.variableExamples.linkedIssue', '123')
    case 'allowedTypes':
      return t(
        'sourceControl.variableExamples.allowedTypes',
        '- feat: new feature\n- fix: bug fix\n- docs: documentation changes\n- refactor: code refactoring without adding features or fixing bugs'
      )
  }
}
