import { useCallback, useRef, useState, type SetStateAction } from 'react'
import { useAppStore } from '@/store/index'
import { useActiveWorktree } from '@/store/workspaces/selection/use-selected-worktree'
import { selectReviewRepositoryForWorkspace } from '@/store/slices/hosted-review/workspace-review-repository'
import { useChecksPanelTerminalWorktree } from '../refresh/use-checks-panel-terminal-worktree'
import { getConnectionId } from '@/lib/workspace/ownership/connection-context'
import { readDetectedAgentsForWorktree } from '@/lib/agent-session/launch/inventory/agent-detection-target-inventory'
import { useMountedRef } from '@/hooks/useMountedRef'
import { useConfirmationDialog } from '@/components/dismiss/confirmation/confirmation-dialog-context'
import { getWorktreeGitIdentityDisplay } from '../../../../../../shared/worktree/row-display/git-identity-display'
import type { SourceControlAiWriteTarget } from '../../../../../../shared/source-control/ai/settings/source-control-ai-recipe-save'
import { saveSourceControlAiActionRecipeForTarget } from '../../source-control/ai/recipe-persistence'
import type {
  SourceControlActionRecipe,
  SourceControlLaunchActionId
} from '../../../../../../shared/source-control/ai/recipes/source-control-ai-actions'
import type { PRCheckDetail } from '../../../../../../shared/github/checks/check-types'
import type { PRComment } from '../../../../../../shared/github/comments/comment-types'
import type { PRRefreshErrorType } from '../../../../../../shared/github/pull-requests/refresh/pull-request-refresh-types'
import type { GitLabProjectRef } from '../../../../../../shared/gitlab/gitlab-types'
import type { PRCommentsListSelectionClearRequest } from '../comments/pr-comments-list-selection'
import type { ChecksPanelGitStatusSnapshot } from '../refresh/checks-panel-git-status-snapshot'
import type { ChecksAgentComposerState, HostedReviewCreationSnapshot } from './panel-state-types'
import { useChecksPanelOwnerScope } from './use-checks-panel-owner-scope'

const EMPTY_CHECKS: PRCheckDetail[] = []
const EMPTY_COMMENTS: PRComment[] = []

export function useChecksPanelControllerState() {
  // The sidebar remains mounted while closed; stop hidden checks/comments/cwd polling.
  const rightSidebarOpen = useAppStore((s) => s.rightSidebarOpen)
  const rightSidebarTab = useAppStore((s) => s.rightSidebarTab)
  const isPanelVisible = rightSidebarOpen && rightSidebarTab === 'checks'

  // Follow terminal cwd across worktrees/stacks, falling back to sidebar selection.
  const defaultActiveWorktree = useActiveWorktree()
  const { worktree: activeWorktree } = useChecksPanelTerminalWorktree({
    defaultActiveWorktree,
    isPanelVisible
  })
  const activeWorktreeId = activeWorktree?.id ?? null
  const repo = useAppStore((s) => selectReviewRepositoryForWorkspace(s, activeWorktree))
  const activeConnectionId = activeWorktreeId
    ? (getConnectionId(activeWorktreeId) ?? repo?.connectionId ?? null)
    : null
  const settings = useAppStore((s) => s.settings)
  const updateSettings = useAppStore((s) => s.updateSettings)
  const updateSettingsOrThrow = useAppStore((s) => s.updateSettingsOrThrow)
  const updateRepo = useAppStore((s) => s.updateRepo)
  const fetchPRForBranch = useAppStore((s) => s.fetchPRForBranch)
  const fetchHostedReviewForBranch = useAppStore((s) => s.fetchHostedReviewForBranch)
  const expireGitHubPRRefreshState = useAppStore((s) => s.expireGitHubPRRefreshState)
  const getHostedReviewCreationEligibility = useAppStore(
    (s) => s.getHostedReviewCreationEligibility
  )
  const createHostedReview = useAppStore((s) => s.createHostedReview)
  const createStackedHostedReview = useAppStore((s) => s.createStackedHostedReview)
  const enqueueGitHubPRRefresh = useAppStore((s) => s.enqueueGitHubPRRefresh)
  const conflictOperation = useAppStore((s) =>
    activeWorktreeId ? (s.gitConflictOperationByWorktree[activeWorktreeId] ?? 'unknown') : 'unknown'
  )
  const gitStatusInvalidation = useAppStore((s) =>
    activeWorktreeId ? s.gitStatusByWorktree[activeWorktreeId] : undefined
  )
  const remoteStatusInvalidation = useAppStore((s) =>
    activeWorktreeId ? s.remoteStatusesByWorktree[activeWorktreeId] : undefined
  )
  const isRemoteOperationActive = useAppStore((s) => s.isRemoteOperationActive)
  const pushBranch = useAppStore((s) => s.pushBranch)
  const syncBranch = useAppStore((s) => s.syncBranch)
  const fetchUpstreamStatus = useAppStore((s) => s.fetchUpstreamStatus)
  const setRightSidebarOpen = useAppStore((s) => s.setRightSidebarOpen)
  const setRightSidebarTab = useAppStore((s) => s.setRightSidebarTab)
  const updateWorktreeMeta = useAppStore((s) => s.updateWorktreeMeta)
  const updateWorktreeGitIdentity = useAppStore((s) => s.updateWorktreeGitIdentity)
  const openModal = useAppStore((s) => s.openModal)

  const fetchPRChecks = useAppStore((s) => s.fetchPRChecks)
  const fetchPRCheckDetails = useAppStore((s) => s.fetchPRCheckDetails)
  const fetchPRComments = useAppStore((s) => s.readPRComments)
  const addPRConversationComment = useAppStore((s) => s.addPRConversationComment)
  const addPRReviewCommentReply = useAppStore((s) => s.addPRReviewCommentReply)
  const setPRCommentReaction = useAppStore((s) => s.setPRCommentReaction)
  const resolveReviewThread = useAppStore((s) => s.resolveReviewThread)
  const detectedAgentIds = useAppStore((s) =>
    activeWorktreeId ? readDetectedAgentsForWorktree(s, activeWorktreeId) : s.detectedAgentIds
  )

  const [checksState, setChecksState] = useState<PRCheckDetail[] | null>(null)
  const checks = checksState ?? EMPTY_CHECKS
  // The GitLab parent pipeline from the same reply as its jobs; every other checks write clears it.
  const [gitLabPipelineCheck, setGitLabPipelineCheck] = useState<PRCheckDetail | null>(null)
  // Distinguish failed reads from No checks configured.
  const [checksError, setChecksError] = useState<string | null>(null)
  const setChecks = useCallback(
    (next: PRCheckDetail[] | null, pipelineCheck: PRCheckDetail | null = null) => {
      setChecksError(null)
      setChecksState(next)
      setGitLabPipelineCheck(pipelineCheck)
    },
    []
  )
  const [checksLoading, setChecksLoading] = useState(false)
  const [{ data: commentsState, error: commentsError }, setCommentsRead] = useState<{
    data: PRComment[] | null | undefined
    error: string | null
  }>({ data: undefined, error: null })
  const comments = commentsState ?? EMPTY_COMMENTS
  const setCommentsError = useCallback((error: string | null) => {
    setCommentsRead((current) => (current.error === error ? current : { ...current, error }))
  }, [])
  const setComments = useCallback((next: SetStateAction<PRComment[]> | null | undefined) => {
    setCommentsRead((current) => {
      if (typeof next !== 'function') {
        return { data: next, error: null }
      }
      const data = next(current.data ?? EMPTY_COMMENTS)
      return current.data == null && data.length === 0 ? current : { data, error: null }
    })
  }, [])
  const [commentsLoading, setCommentsLoading] = useState(false)
  const commentsRef = useRef<PRComment[]>([])
  const [commentsSelectionClearRequest, setCommentsSelectionClearRequest] =
    useState<PRCommentsListSelectionClearRequest | null>(null)
  const commentsSelectionClearTokenRef = useRef(0)
  const [emptyRefreshing, setEmptyRefreshing] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const refreshInFlightRef = useRef(false)
  const [conflictDetailsRefreshing, setConflictDetailsRefreshing] = useState(false)
  const createPrInFlightRef = useRef<string | null>(null)
  const [isCreatingPr, setIsCreatingPr] = useState(false)
  const [createPrError, setCreatePrError] = useState<string | null>(null)
  const [isPublishingBranch, setIsPublishingBranch] = useState(false)
  const [isSyncingBranch, setIsSyncingBranch] = useState(false)
  const isResolvingConflictsWithAI = false
  const [isFixingChecksWithAI, setIsFixingChecksWithAI] = useState(false)
  const [agentComposerState, setAgentComposerState] = useState<ChecksAgentComposerState | null>(
    null
  )
  // Submit-after-ready outlives dialog close; retain the payload until launch acceptance.
  const pendingCommentResolutionRef = useRef<NonNullable<
    ChecksAgentComposerState['commentResolution']
  > | null>(null)
  // Park accepted payloads through panel churn; posting still waits for successful prompt delivery.
  const claimedCommentResolutionRef = useRef<NonNullable<
    ChecksAgentComposerState['commentResolution']
  > | null>(null)
  const commentResolutionLaunchAcceptedRef = useRef(false)
  // Block duplicate fixing replies while the first launch/ack is pending.
  const [commentResolutionAckBusy, setCommentResolutionAckBusy] = useState(false)
  const commentResolutionAckBusyRef = useRef(false)
  const setCommentResolutionAckBusyNow = useCallback((busy: boolean): void => {
    commentResolutionAckBusyRef.current = busy
    setCommentResolutionAckBusy(busy)
  }, [])
  const [hostedReviewCreationSnapshot, setHostedReviewCreationSnapshot] =
    useState<HostedReviewCreationSnapshot | null>(null)
  // Retain hard errors until qualifying eligibility clears them so retries cannot reenable Create.
  const [hardRefreshError, setHardRefreshError] = useState<{
    observedAt: number
    errorType: PRRefreshErrorType
    contextKey: string
  } | null>(null)
  const [gitStatusSnapshot, setGitStatusSnapshot] = useState<ChecksPanelGitStatusSnapshot | null>(
    null
  )
  // Name failed snapshot probes so the empty state cannot remain Checking branch status indefinitely.
  const [gitStatusProbeErrorContextKey, setGitStatusProbeErrorContextKey] = useState<string | null>(
    null
  )
  const [gitStatusRefreshNonce, setGitStatusRefreshNonce] = useState(0)
  // Manual retry must rerun eligibility even without Git changes, for example after fixing authentication.
  const [eligibilityRefreshNonce, setEligibilityRefreshNonce] = useState(0)
  const [eligibilitySettledContextKey, setEligibilitySettledContextKey] = useState<string | null>(
    null
  )
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState('')
  const [titleSaving, setTitleSaving] = useState(false)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const titleInputFocusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pollIntervalRef = useRef(30_000) // start at 30s, backs off to 120s
  const mountedRef = useMountedRef()
  const confirm = useConfirmationDialog()
  const prevChecksRef = useRef<string>('')
  // Fork MR pipelines live in the source project; fetch job traces from the MR project rather than the repo remote.
  const gitLabProjectRefRef = useRef<GitLabProjectRef | null>(null)
  const conflictSummaryRefreshKeyRef = useRef<string | null>(null)
  commentsRef.current = comments
  const prGenerationRecords = useAppStore((s) => s.pullRequestGenerationRecords)
  const allocatePullRequestGenerationRequestId = useAppStore(
    (s) => s.allocatePullRequestGenerationRequestId
  )
  const setPullRequestGenerationRecord = useAppStore((s) => s.setPullRequestGenerationRecord)
  const updatePullRequestGenerationRecord = useAppStore((s) => s.updatePullRequestGenerationRecord)

  const saveLaunchActionDefault = useCallback(
    async (
      target: SourceControlAiWriteTarget,
      actionId: SourceControlLaunchActionId,
      recipe: SourceControlActionRecipe
    ): Promise<void> => {
      await saveSourceControlAiActionRecipeForTarget({
        getStoreState: useAppStore.getState,
        updateSettings: updateSettingsOrThrow,
        updateRepo,
        target,
        actionId,
        recipe
      })
    },
    [updateRepo, updateSettingsOrThrow]
  )
  const asyncResultKeyRef = useRef<string>('')
  const refreshRequestKeyRef = useRef<string | null>(null)
  const refreshContextKeyRef = useRef<string | null>(null)
  const gitStatusSnapshotRetryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const gitIdentityDisplay = activeWorktree ? getWorktreeGitIdentityDisplay(activeWorktree) : null
  const detachedHeadDisplay = gitIdentityDisplay?.kind === 'detached' ? gitIdentityDisplay : null
  const branch = gitIdentityDisplay?.kind === 'branch' ? gitIdentityDisplay.branchName : ''
  const ownerScope = useChecksPanelOwnerScope({
    activeWorktree,
    activeWorktreeId,
    repo,
    branch,
    settings
  })
  return {
    rightSidebarOpen,
    rightSidebarTab,
    isPanelVisible,
    activeWorktree,
    activeWorktreeId,
    repo,
    activeConnectionId,
    settings,
    updateSettings,
    updateRepo,
    fetchPRForBranch,
    fetchHostedReviewForBranch,
    expireGitHubPRRefreshState,
    getHostedReviewCreationEligibility,
    createHostedReview,
    createStackedHostedReview,
    enqueueGitHubPRRefresh,
    conflictOperation,
    gitStatusInvalidation,
    remoteStatusInvalidation,
    isRemoteOperationActive,
    pushBranch,
    syncBranch,
    fetchUpstreamStatus,
    setRightSidebarOpen,
    setRightSidebarTab,
    updateWorktreeMeta,
    updateWorktreeGitIdentity,
    openModal,
    fetchPRChecks,
    fetchPRCheckDetails,
    fetchPRComments,
    addPRConversationComment,
    addPRReviewCommentReply,
    setPRCommentReaction,
    resolveReviewThread,
    detectedAgentIds,
    checks,
    checksLoaded: checksState !== null,
    gitLabPipelineCheck,
    setChecks,
    checksLoading,
    setChecksLoading,
    checksError,
    setChecksError,
    comments,
    commentsLoaded: commentsState != null,
    commentsUnavailable: commentsState === null,
    setComments,
    commentsError,
    setCommentsError,
    commentsLoading,
    setCommentsLoading,
    commentsRef,
    commentsSelectionClearRequest,
    setCommentsSelectionClearRequest,
    commentsSelectionClearTokenRef,
    emptyRefreshing,
    setEmptyRefreshing,
    isRefreshing,
    setIsRefreshing,
    refreshInFlightRef,
    conflictDetailsRefreshing,
    setConflictDetailsRefreshing,
    createPrInFlightRef,
    isCreatingPr,
    setIsCreatingPr,
    createPrError,
    setCreatePrError,
    isPublishingBranch,
    setIsPublishingBranch,
    isSyncingBranch,
    setIsSyncingBranch,
    isResolvingConflictsWithAI,
    isFixingChecksWithAI,
    setIsFixingChecksWithAI,
    agentComposerState,
    setAgentComposerState,
    pendingCommentResolutionRef,
    claimedCommentResolutionRef,
    commentResolutionLaunchAcceptedRef,
    commentResolutionAckBusy,
    commentResolutionAckBusyRef,
    setCommentResolutionAckBusyNow,
    hostedReviewCreationSnapshot,
    setHostedReviewCreationSnapshot,
    hardRefreshError,
    setHardRefreshError,
    gitStatusSnapshot,
    setGitStatusSnapshot,
    gitStatusProbeErrorContextKey,
    setGitStatusProbeErrorContextKey,
    gitStatusRefreshNonce,
    setGitStatusRefreshNonce,
    eligibilityRefreshNonce,
    setEligibilityRefreshNonce,
    eligibilitySettledContextKey,
    setEligibilitySettledContextKey,
    editingTitle,
    setEditingTitle,
    titleDraft,
    setTitleDraft,
    titleSaving,
    setTitleSaving,
    titleInputRef,
    titleInputFocusTimerRef,
    pollIntervalRef,
    mountedRef,
    confirm,
    prevChecksRef,
    gitLabProjectRefRef,
    conflictSummaryRefreshKeyRef,
    prGenerationRecords,
    allocatePullRequestGenerationRequestId,
    setPullRequestGenerationRecord,
    updatePullRequestGenerationRecord,
    saveLaunchActionDefault,
    asyncResultKeyRef,
    refreshRequestKeyRef,
    refreshContextKeyRef,
    gitStatusSnapshotRetryTimerRef,
    gitIdentityDisplay,
    detachedHeadDisplay,
    branch,
    ...ownerScope
  }
}

export type ChecksPanelControllerState = ReturnType<typeof useChecksPanelControllerState>
