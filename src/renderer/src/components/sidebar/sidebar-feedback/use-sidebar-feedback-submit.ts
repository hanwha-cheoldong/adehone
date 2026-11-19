import { useCallback, type Dispatch, type RefObject, type SetStateAction } from 'react'
import { toast } from 'sonner'
import { translate } from '@/i18n/i18n'
import { useAppStore } from '@/store/index'
import { openAppHttpLink } from '@/lib/browser/navigation/app-http-link-open'
import type { FeedbackImageDraft } from '@/components/sidebar/sidebar-feedback/feedback-image-attachments'
import type { GitHubViewer } from '../../../../../shared/github/pull-requests/pull-request-types'
import { stripClientEnvironmentFooter } from '../../../../../shared/feedback/client-environment-info'
import { FEEDBACK_PAYLOAD_TOO_LARGE_STATUS } from '../../../../../shared/feedback/feedback-image-limits'
import { buildFeedbackNewIssueUrl } from '../../../../../shared/feedback/adehone-feedback-issue'
import type { FeedbackGhCliStatus } from './SidebarFeedbackGitHubStatus'

function getSubmitIdentity(
  viewer: GitHubViewer | null,
  anonymous: boolean
): { githubLogin: string | null; githubEmail: string | null } {
  if (anonymous || !viewer) {
    return { githubLogin: null, githubEmail: null }
  }
  return { githubLogin: viewer.login, githubEmail: viewer.email }
}

function clearDeliveredDraft(userText: string, clearFeedbackDraft: () => void): void {
  // Clear delivered text even after unmount, but preserve newer drafts; strip regenerated environment footers before comparing.
  if (
    stripClientEnvironmentFooter(useAppStore.getState().feedbackDraft.feedback).trim() === userText
  ) {
    clearFeedbackDraft()
  }
}

type SubmitFeedbackParams = {
  useGitHubIssueFeedback: boolean
  feedback: string
  submitAnonymously: boolean
  viewer: GitHubViewer | null
  ghStatus: FeedbackGhCliStatus
  images: readonly FeedbackImageDraft[]
  hasPendingImageReads: () => boolean
  mountedRef: RefObject<boolean>
  clearFeedbackDraft: () => void
  clearImages: () => void
  onOpenChange: (open: boolean) => void
  isSubmitting: boolean
  setIsSubmitting: Dispatch<SetStateAction<boolean>>
  setViewer: (viewer: GitHubViewer | null) => void
  setGhStatus: (status: FeedbackGhCliStatus) => void
}

async function submitSidebarFeedback(params: SubmitFeedbackParams): Promise<void> {
  const {
    useGitHubIssueFeedback,
    feedback,
    submitAnonymously,
    viewer,
    ghStatus,
    images,
    hasPendingImageReads,
    mountedRef,
    clearFeedbackDraft,
    clearImages,
    onOpenChange,
    isSubmitting,
    setIsSubmitting,
    setViewer,
    setGhStatus
  } = params

  if (isSubmitting || hasPendingImageReads()) {
    return
  }
  const trimmed = feedback.trim()
  const userText = stripClientEnvironmentFooter(feedback).trim()
  if (!trimmed || !userText) {
    toast.warning(
      translate(
        'auto.components.sidebar.SidebarFeedbackDialog.a2fd890d9e',
        'Please enter feedback before submitting.'
      )
    )
    return
  }

  const openBrowserFallback = (): void => {
    openAppHttpLink(buildFeedbackNewIssueUrl(trimmed))
    if (images.length > 0) {
      toast.warning(
        translate(
          'auto.components.sidebar.SidebarFeedbackDialog.browserFallbackWithImages',
          'Opened GitHub in your browser. Please attach your screenshots there before submitting.'
        )
      )
      return
    }
    clearDeliveredDraft(userText, clearFeedbackDraft)
    if (mountedRef.current) {
      clearImages()
      onOpenChange(false)
      toast.info(
        translate(
          'auto.components.sidebar.SidebarFeedbackDialog.browserFallbackOpened',
          'Opened the Adehone GitHub issue form in your browser.'
        )
      )
    }
  }

  setIsSubmitting(true)
  try {
    const payloadImages = images.map((image) => ({
      contentType: image.contentType,
      data: image.data
    }))

    if (useGitHubIssueFeedback) {
      if (ghStatus !== 'connected' || !viewer) {
        openBrowserFallback()
        return
      }
      const result = await window.api.feedback.submitGitHubIssue({
        feedback: trimmed,
        images: payloadImages
      })
      if (!result.ok) {
        if (result.reason === 'gh-not-installed' || result.reason === 'gh-not-authenticated') {
          if (mountedRef.current) {
            setViewer(null)
            setGhStatus(
              result.reason === 'gh-not-installed' ? 'not-installed' : 'not-authenticated'
            )
          }
          openBrowserFallback()
          return
        }
        throw new Error(result.error)
      }
      clearDeliveredDraft(userText, clearFeedbackDraft)
      if (mountedRef.current) {
        const issueAction = result.issueUrl
          ? {
              label: translate(
                'auto.components.sidebar.SidebarFeedbackDialog.openCreatedIssue',
                'Open issue'
              ),
              onClick: () => openAppHttpLink(result.issueUrl)
            }
          : undefined
        if (result.imagesFailedCount > 0) {
          toast.warning(
            translate(
              'auto.components.sidebar.SidebarFeedbackDialog.imagesNotIncluded',
              'Feedback sent. Your screenshots could not be uploaded and were not included.'
            ),
            issueAction ? { action: issueAction } : undefined
          )
        } else {
          toast.success(
            translate(
              'auto.components.sidebar.SidebarFeedbackDialog.7a46c228b8',
              'Thanks for the feedback.'
            ),
            issueAction ? { action: issueAction } : undefined
          )
        }
        clearImages()
        onOpenChange(false)
      }
      return
    }

    const identity = getSubmitIdentity(viewer, submitAnonymously)
    // Main-process IPC avoids packaged file-renderer CORS restrictions during submission.
    const result = await window.api.feedback.submit({
      feedback: trimmed,
      submitAnonymously,
      githubLogin: identity.githubLogin,
      githubEmail: identity.githubEmail,
      images: payloadImages
    })
    if (!result.ok) {
      throw new Error(`Feedback request failed: ${result.error}`)
    }
    clearDeliveredDraft(userText, clearFeedbackDraft)
    if (mountedRef.current) {
      // The dialog closes after delivery; report lost screenshots without implying they remain recoverable here.
      if (result.imagesFailure) {
        toast.warning(
          // Only 413 proves the size limit; other attachment refusals need different explanations.
          result.imagesFailure.status === FEEDBACK_PAYLOAD_TOO_LARGE_STATUS
            ? translate(
                'auto.components.sidebar.SidebarFeedbackDialog.imagesRejected',
                'Feedback sent. Your screenshots were too large to upload and were not included.'
              )
            : translate(
                'auto.components.sidebar.SidebarFeedbackDialog.imagesNotIncluded',
                'Feedback sent. Your screenshots could not be uploaded and were not included.'
              )
        )
      } else if (result.imagesDelivered === false) {
        toast.warning(
          translate(
            'auto.components.sidebar.SidebarFeedbackDialog.imagesNotDelivered',
            'Feedback sent, but image delivery could not be confirmed.'
          )
        )
      } else {
        toast.success(
          translate(
            'auto.components.sidebar.SidebarFeedbackDialog.7a46c228b8',
            'Thanks for the feedback.'
          )
        )
      }
      clearImages()
      onOpenChange(false)
    }
  } catch (err) {
    if (mountedRef.current) {
      toast.error(
        translate(
          'auto.components.sidebar.SidebarFeedbackDialog.60b721e857',
          'Failed to submit feedback. Please try again.'
        )
      )
    }
    console.error('Failed to submit feedback:', err)
  } finally {
    if (mountedRef.current) {
      setIsSubmitting(false)
    }
  }
}

export function useSidebarFeedbackSubmit(params: SubmitFeedbackParams): {
  handleSubmit: () => Promise<void>
} {
  const {
    useGitHubIssueFeedback,
    feedback,
    submitAnonymously,
    viewer,
    ghStatus,
    images,
    hasPendingImageReads,
    mountedRef,
    clearFeedbackDraft,
    clearImages,
    onOpenChange,
    isSubmitting,
    setIsSubmitting,
    setViewer,
    setGhStatus
  } = params

  const handleSubmit = useCallback(async (): Promise<void> => {
    await submitSidebarFeedback({
      useGitHubIssueFeedback,
      feedback,
      submitAnonymously,
      viewer,
      ghStatus,
      images,
      hasPendingImageReads,
      mountedRef,
      clearFeedbackDraft,
      clearImages,
      onOpenChange,
      isSubmitting,
      setIsSubmitting,
      setViewer,
      setGhStatus
    })
  }, [
    clearFeedbackDraft,
    clearImages,
    feedback,
    ghStatus,
    hasPendingImageReads,
    images,
    isSubmitting,
    mountedRef,
    onOpenChange,
    setGhStatus,
    setIsSubmitting,
    setViewer,
    submitAnonymously,
    useGitHubIssueFeedback,
    viewer
  ])

  return { handleSubmit }
}
