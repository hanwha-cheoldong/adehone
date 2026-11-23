import React, { useRef, useState } from 'react'
import { ExternalLink, Github } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { useMountedRef } from '@/hooks/useMountedRef'
import { useAppStore } from '@/store/index'
import { cn } from '@/lib/class-names'
import { useTranslate } from '@/i18n/use-translate'
import {
  extractImageFilesFromDataTransfer,
  hasAttachableFeedbackImage
} from '@/components/sidebar/sidebar-feedback/feedback-image-attachments'
import { stripClientEnvironmentFooter } from '../../../../../shared/feedback/client-environment-info'
import { ADEHONE_GITHUB_ISSUES_URL } from '../../../../../shared/feedback/adehone-feedback-issue'
import { SidebarFeedbackImageAttachments } from './SidebarFeedbackImageAttachments'
import { SidebarFeedbackGitHubStatus } from './SidebarFeedbackGitHubStatus'
import { useSidebarFeedbackEnvironmentPrefill } from './use-sidebar-feedback-environment-prefill'
import { useSidebarFeedbackGhStatus } from './use-sidebar-feedback-gh-status'
import { useSidebarFeedbackImages } from './use-sidebar-feedback-images'
import { useSidebarFeedbackSubmit } from './use-sidebar-feedback-submit'
import { openHelpLink } from '../chrome/help-link-open'

const GITHUB_ISSUES_URL = ADEHONE_GITHUB_ISSUES_URL
const DISCORD_URL = 'https://discord.gg/fzjDKHxv8Q'
const X_URL = 'https://x.com/orca_build'

// Keep upstream social links and legacy feedback API code intact to minimize merge conflicts.
const SHOW_LEGACY_SOCIAL_LINKS: boolean = false
const USE_GITHUB_ISSUE_FEEDBACK: boolean = true

type SidebarFeedbackDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SidebarFeedbackDialog({
  open,
  onOpenChange
}: SidebarFeedbackDialogProps): React.JSX.Element {
  const t = useTranslate()
  // Store drafts survive sidebar collapse, which unmounts this dialog.
  const feedback = useAppStore((s) => s.feedbackDraft.feedback)
  const submitAnonymously = useAppStore((s) => s.feedbackDraft.submitAnonymously)
  const setFeedbackDraft = useAppStore((s) => s.setFeedbackDraft)
  const clearFeedbackDraft = useAppStore((s) => s.clearFeedbackDraft)
  const mountedRef = useMountedRef()
  const feedbackTextareaRef = useRef<HTMLTextAreaElement>(null)
  const { viewer, ghStatus, isRecheckingGh, setViewer, setGhStatus, refreshGhStatus } =
    useSidebarFeedbackGhStatus({ open, mountedRef })
  const isViewerLoading = ghStatus === 'checking'
  const [isSubmitting, setIsSubmitting] = useState(false)
  const {
    images,
    pendingImageReadCount,
    isDragActive,
    contentRef,
    dragHandlers,
    handleAddFiles,
    handleRemoveImage,
    clearImages,
    hasPendingImageReads,
    getReservedImageCapacity
  } = useSidebarFeedbackImages({ open, isSubmitting, mountedRef })
  const { handleSubmit } = useSidebarFeedbackSubmit({
    useGitHubIssueFeedback: USE_GITHUB_ISSUE_FEEDBACK,
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

  // Read committed text at call time so late prefill cannot overwrite typing.
  const setFeedback = React.useCallback(
    (updater: (current: string) => string) => {
      setFeedbackDraft({ feedback: updater(useAppStore.getState().feedbackDraft.feedback) })
    },
    [setFeedbackDraft]
  )

  useSidebarFeedbackEnvironmentPrefill({
    open,
    feedback,
    setFeedback,
    textareaRef: feedbackTextareaRef,
    mountedRef
  })

  const usesBrowserFallback =
    USE_GITHUB_ISSUE_FEEDBACK && ghStatus !== 'connected' && ghStatus !== 'checking'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={contentRef}
        className="max-h-[calc(100vh-3rem)] overflow-y-auto scrollbar-sleek sm:max-w-lg"
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          feedbackTextareaRef.current?.focus()
        }}
        // Handle image paste across the dialog even without a textarea caret.
        onPaste={(event) => {
          const pasted = extractImageFilesFromDataTransfer(event.clipboardData)
          if (pasted.length === 0) {
            return
          }
          // Consume only attachable image pastes; rejection toasts must not cost co-pasted text.
          const reserved = getReservedImageCapacity()
          // An optimistic shrink may fail; let co-pasted text insert now rather than restore it later.
          if (
            hasAttachableFeedbackImage(pasted, reserved.count, reserved.bytes, {
              allowShrinking: event.clipboardData.getData('text/plain').length === 0
            })
          ) {
            event.preventDefault()
          }
          handleAddFiles(pasted)
        }}
        // Nested drag events need depth tracking so highlights persist until the pointer leaves the dialog.
        {...dragHandlers}
      >
        <DialogHeader>
          <DialogTitle className="text-sm">
            {t('auto.components.sidebar.SidebarFeedbackDialog.0eb643f07f', 'Send Feedback')}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {t(
              'auto.components.sidebar.SidebarFeedbackDialog.a828fa4aee',
              "Share what's working, what's broken, or what Adehone should do next."
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 rounded-md border border-border/70 bg-muted/30 p-3">
          <div className="text-xs font-medium text-foreground">
            {t(
              'auto.components.sidebar.SidebarFeedbackDialog.9b33530b3d',
              'Other ways to reach us'
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={(event) => openHelpLink(GITHUB_ISSUES_URL, { event })}
            >
              <Github className="size-3.5" />
              {t('auto.components.sidebar.SidebarFeedbackDialog.d245c4ef6c', 'GitHub issues')}
              <ExternalLink className="size-3.5" />
            </Button>
            {SHOW_LEGACY_SOCIAL_LINKS ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={(event) => openHelpLink(DISCORD_URL, { event })}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="size-3.5 fill-current">
                    <path d="M20.317 4.369A19.791 19.791 0 0 0 15.885 3c-.191.328-.403.77-.553 1.116a18.27 18.27 0 0 0-5.098 0A12.64 12.64 0 0 0 9.68 3a19.736 19.736 0 0 0-4.433 1.369C2.444 8.479 1.69 12.488 2.067 16.44a19.912 19.912 0 0 0 5.427 2.744c.438-.598.828-1.23 1.164-1.89a12.95 12.95 0 0 1-1.833-.877c.154-.113.305-.231.45-.352a14.294 14.294 0 0 0 12.45 0c.146.12.296.239.45.352-.585.34-1.2.634-1.835.878.337.659.727 1.29 1.165 1.888a19.84 19.84 0 0 0 5.43-2.744c.442-4.579-.755-8.551-3.932-12.07ZM9.955 14.005c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.418 2.157-2.418 1.211 0 2.176 1.095 2.157 2.418 0 1.334-.955 2.419-2.157 2.419Zm4.09 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.418 2.157-2.418 1.211 0 2.176 1.095 2.157 2.418 0 1.334-.946 2.419-2.157 2.419Z" />
                  </svg>
                  {t('auto.components.sidebar.SidebarFeedbackDialog.26108d3699', 'Join Discord')}
                  <ExternalLink className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={(event) => openHelpLink(X_URL, { event })}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="size-3.5 fill-current">
                    <path d="M18.901 1.153h3.68l-8.041 9.19L24 22.847h-7.406l-5.8-7.584-6.64 7.584H.474l8.6-9.83L0 1.153h7.594l5.243 6.932 6.064-6.932Zm-1.29 19.493h2.04L6.486 3.24H4.298l13.313 17.406Z" />
                  </svg>
                  {t('auto.components.sidebar.SidebarFeedbackDialog.3460258a54', 'Follow on X')}
                  <ExternalLink className="size-3.5" />
                </Button>
              </>
            ) : null}
          </div>
        </div>

        <textarea
          ref={feedbackTextareaRef}
          value={feedback}
          onChange={(event) => setFeedbackDraft({ feedback: event.target.value })}
          placeholder={t(
            'auto.components.sidebar.SidebarFeedbackDialog.d46ddd66fc',
            'What could we improve?'
          )}
          rows={7}
          className="min-h-32 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />

        <SidebarFeedbackImageAttachments
          images={images}
          pendingCount={pendingImageReadCount}
          disabled={isSubmitting}
          isDragActive={isDragActive}
          onAddFiles={handleAddFiles}
          onRemove={handleRemoveImage}
        />

        {USE_GITHUB_ISSUE_FEEDBACK ? (
          <SidebarFeedbackGitHubStatus
            status={ghStatus}
            viewer={viewer}
            isRechecking={isRecheckingGh}
            onRecheck={() => void refreshGhStatus(true)}
          />
        ) : (
          <div className="min-h-9 rounded-md border border-border/70 bg-muted/30 px-3 py-2">
            {viewer ? (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span>
                  {t('auto.components.sidebar.SidebarFeedbackDialog.c9e5ea0791', 'GitHub:')}{' '}
                  <span className="font-mono text-foreground">
                    {viewer.login}
                    {viewer.email ? ` (${viewer.email})` : ''}
                  </span>
                </span>
                <label className="flex cursor-pointer items-center gap-2 text-foreground">
                  <input
                    type="checkbox"
                    checked={submitAnonymously}
                    onChange={(event) =>
                      setFeedbackDraft({ submitAnonymously: event.target.checked })
                    }
                    className={cn(
                      'size-3.5 rounded border border-border bg-background align-middle',
                      'accent-foreground'
                    )}
                  />
                  {t(
                    'auto.components.sidebar.SidebarFeedbackDialog.5b120b9634',
                    'Submit anonymously'
                  )}
                </label>
              </div>
            ) : isViewerLoading ? (
              <div className="text-xs text-muted-foreground">
                {t(
                  'auto.components.sidebar.SidebarFeedbackDialog.d20439c560',
                  'Checking GitHub identity…'
                )}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">
                {t(
                  'auto.components.sidebar.SidebarFeedbackDialog.8de03e23c5',
                  'Submit with your typed feedback only, or connect `gh` to include GitHub identity.'
                )}
              </div>
            )}
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            {t('auto.components.sidebar.SidebarFeedbackDialog.8bf619e4cf', 'Cancel')}
          </Button>
          <Button
            onClick={() => void handleSubmit()}
            disabled={
              isSubmitting ||
              pendingImageReadCount > 0 ||
              stripClientEnvironmentFooter(feedback).trim() === ''
            }
          >
            {isSubmitting
              ? t('auto.components.sidebar.SidebarFeedbackDialog.69969ba364', 'Sending…')
              : usesBrowserFallback
                ? t('auto.components.sidebar.SidebarFeedbackDialog.openInGitHub', 'Open in GitHub')
                : t('auto.components.sidebar.SidebarFeedbackDialog.f2e42e1307', 'Send')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
