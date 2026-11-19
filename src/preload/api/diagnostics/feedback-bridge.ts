import { ipcRenderer } from 'electron'
import type { PreloadApi } from '../../api-types'
import type {
  FeedbackGitHubIssueSubmitArgs,
  FeedbackGitHubIssueSubmitResult,
  FeedbackSubmitArgs,
  FeedbackSubmitResult
} from '../../../shared/feedback/feedback-submit-contract'

export const feedbackApi = {
  submit: (args: FeedbackSubmitArgs): Promise<FeedbackSubmitResult> =>
    ipcRenderer.invoke('feedback:submit', args),
  submitGitHubIssue: (
    args: FeedbackGitHubIssueSubmitArgs
  ): Promise<FeedbackGitHubIssueSubmitResult> =>
    ipcRenderer.invoke('feedback:submitGitHubIssue', args)
} satisfies PreloadApi['feedback']
