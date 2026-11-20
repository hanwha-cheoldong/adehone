import type {
  FeedbackGitHubIssueSubmitArgs,
  FeedbackGitHubIssueSubmitFailureReason,
  FeedbackGitHubIssueSubmitResult
} from '../../../shared/feedback/feedback-submit-contract'
import {
  ADEHONE_GITHUB_OWNER,
  ADEHONE_GITHUB_REPO,
  buildFeedbackIssueTitle
} from '../../../shared/feedback/adehone-feedback-issue'
import { stripClientEnvironmentFooter } from '../../../shared/feedback/client-environment-info'
import { ghExecFileAsync } from '../../git/command-runner/hosted-cli/gh-exec-file'
import { isHostCommandMissing } from '../../git/command-runner/hosted-cli/github-cli-host-fallback'
import { extractExecError } from '../../git/command-runner/process-capture/exec-error'
import { uploadGitHubImage } from '../../github/attachments/image-attachment-upload'
import { acquire, release } from '../../github/execution/github-operation-slots'
import { runPreflightCheck } from '../../preflight/agent-detection'
import { feedbackImageFilename, validateFeedbackImages } from './feedback-image-attachments'

function ghErrorMessage(error: unknown): string {
  const { stderr, stdout } = extractExecError(error)
  const combined = [stderr.trim(), stdout.trim()].filter(Boolean).join('\n')
  if (combined) {
    return combined
  }
  return error instanceof Error ? error.message : String(error)
}

function classifyGhIssueError(error: unknown): FeedbackGitHubIssueSubmitFailureReason {
  if (isHostCommandMissing(error, 'gh')) {
    return 'gh-not-installed'
  }
  const message = ghErrorMessage(error).toLowerCase()
  if (
    message.includes('gh auth login') ||
    message.includes('not logged in') ||
    message.includes('authentication') ||
    /\b401\b/.test(message)
  ) {
    return 'gh-not-authenticated'
  }
  return 'request-failed'
}

async function ensureGhReadyForFeedback(): Promise<
  { ok: true } | { ok: false; error: string; reason: 'gh-not-installed' | 'gh-not-authenticated' }
> {
  let preflight = await runPreflightCheck()
  // Re-probe once when cached state reports missing/unauthenticated so newly installed gh works without restart.
  if (!preflight.gh.installed || !preflight.gh.authenticated) {
    preflight = await runPreflightCheck(true)
  }
  if (!preflight.gh.installed) {
    return {
      ok: false,
      error: 'GitHub CLI (gh) is not installed.',
      reason: 'gh-not-installed'
    }
  }
  if (!preflight.gh.authenticated) {
    return {
      ok: false,
      error: 'GitHub CLI (gh) is not authenticated.',
      reason: 'gh-not-authenticated'
    }
  }
  return { ok: true }
}

function buildFeedbackIssueBody(
  feedback: string,
  uploadedImages: readonly { alt: string; url: string }[]
): string {
  if (uploadedImages.length === 0) {
    return feedback
  }
  const screenshotsSection = uploadedImages
    .map((image) => `![${image.alt}](${image.url})`)
    .join('\n\n')
  return `${feedback}\n\n### Screenshots\n\n${screenshotsSection}`
}

/** Submit feedback directly as a GitHub issue on hanwha-cheoldong/adehone via authenticated gh CLI. */
export async function submitFeedbackToGitHubIssue(
  args: FeedbackGitHubIssueSubmitArgs
): Promise<FeedbackGitHubIssueSubmitResult> {
  const trimmedFeedback = typeof args.feedback === 'string' ? args.feedback.trim() : ''
  const userText = stripClientEnvironmentFooter(trimmedFeedback).trim()
  if (!trimmedFeedback || !userText) {
    return {
      ok: false,
      error: 'Please enter feedback before submitting.',
      reason: 'validation'
    }
  }
  if (args.images !== undefined) {
    const imageError = validateFeedbackImages(args.images)
    if (imageError) {
      return {
        ok: false,
        error: imageError,
        reason: 'validation'
      }
    }
  }

  const ghReady = await ensureGhReadyForFeedback()
  if (!ghReady.ok) {
    return ghReady
  }

  const uploadedImages: { alt: string; url: string }[] = []
  let imagesFailedCount = 0
  for (const [index, image] of (args.images ?? []).entries()) {
    const fileName = feedbackImageFilename(index, image.contentType)
    try {
      const { url } = await uploadGitHubImage({
        fileName,
        contentType: image.contentType,
        bytes: Buffer.from(image.data.buffer, image.data.byteOffset, image.data.byteLength),
        resolve: async () => ({
          ownerRepo: {
            owner: ADEHONE_GITHUB_OWNER,
            repo: ADEHONE_GITHUB_REPO,
            host: 'github.com'
          },
          ghOptions: {}
        })
      })
      uploadedImages.push({ alt: fileName, url })
    } catch {
      imagesFailedCount += 1
    }
  }

  const title = buildFeedbackIssueTitle(trimmedFeedback)
  const body = buildFeedbackIssueBody(trimmedFeedback, uploadedImages)
  const issuesEndpoint = `repos/${ADEHONE_GITHUB_OWNER}/${ADEHONE_GITHUB_REPO}/issues`

  await acquire()
  try {
    const { stdout } = await ghExecFileAsync(
      ['api', '-X', 'POST', issuesEndpoint, '--input', '-'],
      {
        encoding: 'utf-8',
        stdin: JSON.stringify({ title, body })
      }
    )
    const raw: unknown = JSON.parse(stdout)
    const parsed = typeof raw === 'object' && raw !== null ? raw : null
    const issueNumber = parsed && 'number' in parsed ? parsed.number : undefined
    const htmlUrl = parsed && 'html_url' in parsed ? parsed.html_url : undefined
    const apiUrl = parsed && 'url' in parsed ? parsed.url : undefined
    if (typeof issueNumber !== 'number') {
      return {
        ok: false,
        error: 'GitHub returned an unexpected issue response.',
        reason: 'request-failed'
      }
    }
    const issueUrl =
      typeof htmlUrl === 'string' ? htmlUrl : typeof apiUrl === 'string' ? apiUrl : ''
    return {
      ok: true,
      issueUrl,
      issueNumber,
      imagesUploaded: uploadedImages.length,
      imagesFailedCount
    }
  } catch (error) {
    return {
      ok: false,
      error: ghErrorMessage(error),
      reason: classifyGhIssueError(error)
    }
  } finally {
    release()
  }
}
