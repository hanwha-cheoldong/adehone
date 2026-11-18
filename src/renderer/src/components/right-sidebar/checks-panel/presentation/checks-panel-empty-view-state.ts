import { translate } from '@/i18n/i18n'
import type { Translate } from '@/i18n/use-translate'
import type { HostedReviewLookupAuthority as ChecksPanelReviewLookup } from '../../../../../../shared/source-control/hosted-review/hosted-review-create-confirmation'
import type { HostedReviewCreationBlockedReason } from '../../../../../../shared/source-control/hosted-review/hosted-review-contracts'
import type { PRRefreshErrorType } from '../../../../../../shared/github/pull-requests/refresh/pull-request-refresh-types'
import type {
  ChecksPanelRefreshInput,
  ChecksPanelReviewState
} from '../review-state/checks-panel-review-state-model'
import { getChecksPanelReviewState } from './checks-panel-empty-state'

function resolveChecksPanelEmptyGitStatusPhase(input: {
  hasUncommittedChanges: boolean | undefined
  gitStatusProbeErrorContextKey: string | null
  panelContextKey: string
}): 'loading' | 'ready' | 'error' {
  if (input.hasUncommittedChanges !== undefined) {
    return 'ready'
  }
  return input.gitStatusProbeErrorContextKey === input.panelContextKey ? 'error' : 'loading'
}

function resolveChecksPanelEmptyRefreshInput(input: {
  isGitHubReviewContext: boolean
  entryHostedReviewFetchInFlight: boolean
  checksPanelHasHardRefreshError: boolean
  hardRefreshError: { errorType: PRRefreshErrorType } | null
  prRefreshState: ChecksPanelRefreshInput | undefined
  initialEntryRefreshPending: boolean
}): ChecksPanelRefreshInput | undefined {
  if (!input.isGitHubReviewContext) {
    return input.entryHostedReviewFetchInFlight ? { status: 'in-flight' } : undefined
  }
  if (input.checksPanelHasHardRefreshError && input.hardRefreshError) {
    return { status: 'error', errorType: input.hardRefreshError.errorType }
  }
  if (input.prRefreshState) {
    return {
      status: input.prRefreshState.status,
      errorType: input.prRefreshState.errorType,
      skippedReason: input.prRefreshState.skippedReason,
      nextAutoRetryAt: input.prRefreshState.nextAutoRetryAt,
      retryDisabledUntil: input.prRefreshState.retryDisabledUntil
    }
  }
  return input.initialEntryRefreshPending ? { status: 'queued' } : undefined
}

function isChecksPanelCheckingExistingReview(input: {
  isPanelVisible: boolean
  hasRepo: boolean
  isFolder: boolean
  branch: string | null | undefined
  gitStatusPhase: 'loading' | 'ready' | 'error'
  hasHostedReviewCreation: boolean
  eligibilitySettledContextKey: string | null
  panelContextKey: string
}): boolean {
  return (
    input.isPanelVisible &&
    input.hasRepo &&
    !input.isFolder &&
    Boolean(input.branch) &&
    input.gitStatusPhase !== 'error' &&
    !input.hasHostedReviewCreation &&
    input.eligibilitySettledContextKey !== input.panelContextKey
  )
}

export function resolveChecksPanelEmptyViewState(
  input: {
    operationLabel: string | null
    reviewLabel: string
    reviewShortLabel: string
    providerName: string
    isGitHubProvider: boolean
    reviewLookup: ChecksPanelReviewLookup
    openReviewUrl: string | null
    eligibilityBlockedReason: HostedReviewCreationBlockedReason | undefined
    confirmedReadiness: boolean
    confirmedNeedsPush: boolean
    hasUpstream: boolean | undefined
    branch: string | null | undefined
    isPanelVisible: boolean
    hasRepo: boolean
    isFolder: boolean
    prFetchedAt: number | undefined
    hasUncommittedChanges: boolean | undefined
    gitStatusProbeErrorContextKey: string | null
    panelContextKey: string
    hasHostedReviewCreation: boolean
    eligibilitySettledContextKey: string | null
    isGitHubReviewContext: boolean
    entryHostedReviewFetchInFlight: boolean
    checksPanelHasHardRefreshError: boolean
    hardRefreshError: { errorType: PRRefreshErrorType } | null
    prRefreshState: ChecksPanelRefreshInput | undefined
  },
  t: Translate = translate
): {
  emptyRefreshInput: ChecksPanelRefreshInput | undefined
  reviewState: ChecksPanelReviewState
} {
  const gitStatusPhase = resolveChecksPanelEmptyGitStatusPhase({
    hasUncommittedChanges: input.hasUncommittedChanges,
    gitStatusProbeErrorContextKey: input.gitStatusProbeErrorContextKey,
    panelContextKey: input.panelContextKey
  })
  const emptyRefreshInput = resolveChecksPanelEmptyRefreshInput({
    isGitHubReviewContext: input.isGitHubReviewContext,
    entryHostedReviewFetchInFlight: input.entryHostedReviewFetchInFlight,
    checksPanelHasHardRefreshError: input.checksPanelHasHardRefreshError,
    hardRefreshError: input.hardRefreshError,
    prRefreshState: input.prRefreshState,
    initialEntryRefreshPending:
      input.isPanelVisible &&
      input.hasRepo &&
      !input.isFolder &&
      Boolean(input.branch) &&
      input.prFetchedAt === undefined &&
      input.reviewLookup === 'unknown' &&
      !input.checksPanelHasHardRefreshError &&
      !input.prRefreshState
  })
  const isCheckingExistingReview = isChecksPanelCheckingExistingReview({
    isPanelVisible: input.isPanelVisible,
    hasRepo: input.hasRepo,
    isFolder: input.isFolder,
    branch: input.branch,
    gitStatusPhase,
    hasHostedReviewCreation: input.hasHostedReviewCreation,
    eligibilitySettledContextKey: input.eligibilitySettledContextKey,
    panelContextKey: input.panelContextKey
  })
  const reviewState = getChecksPanelReviewState(
    {
      operationLabel: input.operationLabel,
      reviewLabel: input.reviewLabel,
      reviewShortLabel: input.reviewShortLabel,
      providerName: input.providerName,
      isGitHubProvider: input.isGitHubProvider,
      reviewLookup: input.reviewLookup,
      openReviewUrl: input.openReviewUrl,
      eligibilityBlockedReason: input.eligibilityBlockedReason,
      confirmedReadiness: input.confirmedReadiness,
      confirmedNeedsPush: input.confirmedNeedsPush,
      refresh: emptyRefreshInput,
      gitStatusPhase,
      hasUpstream: input.hasUpstream,
      hasCurrentBranch: Boolean(input.branch),
      isCheckingExistingReview
    },
    t
  )
  return { emptyRefreshInput, reviewState }
}
