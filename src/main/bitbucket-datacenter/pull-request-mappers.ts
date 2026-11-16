import type {
  CheckStatus,
  PRMergeableState,
  PRReviewDecision,
  ProviderCheckSummary
} from '../../shared/github/pull-requests/pull-request-types'
import {
  deriveBitbucketBuildStatus,
  summarizeBitbucketBuildStatuses,
  type RawBitbucketBuildStatus
} from '../bitbucket/pull-request-mappers'

export { deriveBitbucketBuildStatus, summarizeBitbucketBuildStatuses, type RawBitbucketBuildStatus }

export type RawBitbucketDataCenterReviewer = {
  approved?: boolean
  status?: string | null
}

export type RawBitbucketDataCenterRef = {
  id?: string | null
  displayId?: string | null
  latestCommit?: string | null
}

export type RawBitbucketDataCenterPullRequest = {
  id?: number
  title?: string
  state?: string | null
  updatedDate?: number | null
  createdDate?: number | null
  links?: {
    self?: { href?: string }[]
  }
  fromRef?: RawBitbucketDataCenterRef | null
  toRef?: RawBitbucketDataCenterRef | null
  reviewers?: RawBitbucketDataCenterReviewer[] | null
}

export type RawBitbucketDataCenterMergeStatus = {
  canMerge?: boolean | null
  conflicted?: boolean | null
}

export type BitbucketDataCenterPullRequestInfo = {
  number: number
  title: string
  state: 'open' | 'closed' | 'merged'
  url: string
  status: CheckStatus
  checksSummary?: ProviderCheckSummary
  updatedAt: string
  mergeable: PRMergeableState
  reviewDecision?: PRReviewDecision | null
  headSha?: string
  baseRefName?: string
}

export function mapBitbucketDataCenterPullRequestState(
  state: string | null | undefined
): BitbucketDataCenterPullRequestInfo['state'] {
  switch (state?.trim().toUpperCase()) {
    case 'MERGED':
      return 'merged'
    case 'DECLINED':
    case 'SUPERSEDED':
      return 'closed'
    case 'OPEN':
    case undefined:
    default:
      return 'open'
  }
}

export function mapBitbucketDataCenterMergeable(
  mergeStatus: RawBitbucketDataCenterMergeStatus | null | undefined
): PRMergeableState {
  if (!mergeStatus) {
    return 'UNKNOWN'
  }
  if (mergeStatus.conflicted === true) {
    return 'CONFLICTING'
  }
  if (mergeStatus.canMerge === true) {
    return 'MERGEABLE'
  }
  if (mergeStatus.canMerge === false) {
    return 'CONFLICTING'
  }
  return 'UNKNOWN'
}

export function mapBitbucketDataCenterReviewDecision(
  reviewers: readonly RawBitbucketDataCenterReviewer[] | null | undefined
): PRReviewDecision | null {
  if (!reviewers || reviewers.length === 0) {
    return null
  }
  const statuses = reviewers.map((reviewer) => reviewer.status?.trim().toUpperCase() ?? '')
  if (statuses.some((status) => status === 'NEEDS_WORK')) {
    return 'CHANGES_REQUESTED'
  }
  if (
    statuses.some((status) => status === 'APPROVED') ||
    reviewers.some((r) => r.approved === true)
  ) {
    return 'APPROVED'
  }
  return 'REVIEW_REQUIRED'
}

export function mapBitbucketDataCenterPullRequest(
  raw: RawBitbucketDataCenterPullRequest,
  status: CheckStatus,
  mergeable: PRMergeableState = 'UNKNOWN',
  checksSummary?: ProviderCheckSummary
): BitbucketDataCenterPullRequestInfo | null {
  const url = raw.links?.self?.[0]?.href
  if (typeof raw.id !== 'number' || !raw.title || !url) {
    return null
  }
  const headSha = raw.fromRef?.latestCommit?.trim()
  const baseRefName = raw.toRef?.displayId?.trim()
  const updatedMs = typeof raw.updatedDate === 'number' ? raw.updatedDate : raw.createdDate
  const updatedAt =
    typeof updatedMs === 'number' && Number.isFinite(updatedMs)
      ? new Date(updatedMs).toISOString()
      : ''
  const reviewDecision = mapBitbucketDataCenterReviewDecision(raw.reviewers)

  return {
    number: raw.id,
    title: raw.title,
    state: mapBitbucketDataCenterPullRequestState(raw.state),
    url,
    status,
    ...(checksSummary ? { checksSummary } : {}),
    updatedAt,
    mergeable,
    ...(reviewDecision ? { reviewDecision } : {}),
    ...(headSha ? { headSha } : {}),
    ...(baseRefName ? { baseRefName } : {})
  }
}
