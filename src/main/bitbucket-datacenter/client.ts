import type {
  CheckStatus,
  PRMergeableState,
  ProviderCheckSummary
} from '../../shared/github/pull-requests/pull-request-types'
import {
  getHostedReviewLocalGitOptions,
  type HostedReviewExecutionOptions
} from '../source-control/hosted-review-git-options'
import { shouldHideNonOpenReviewOnDefaultBranch } from '../source-control/repo-default-branch'
import { requestBitbucketDataCenterJson as requestJsonAt } from './api-request'
import { getBitbucketDataCenterConnectionStatus } from './credential-connection'
import {
  deriveBitbucketBuildStatus,
  mapBitbucketDataCenterMergeable,
  mapBitbucketDataCenterPullRequest,
  mapBitbucketDataCenterPullRequestState,
  summarizeBitbucketBuildStatuses,
  type BitbucketDataCenterPullRequestInfo,
  type RawBitbucketBuildStatus,
  type RawBitbucketDataCenterMergeStatus,
  type RawBitbucketDataCenterPullRequest
} from './pull-request-mappers'
import { getBitbucketDataCenterRepoRef, type BitbucketDataCenterRepoRef } from './repository-ref'

const PULL_REQUEST_PAGE_LIMIT = 50
const MAX_PULL_REQUEST_PAGES = 5

export type BitbucketDataCenterAuthStatus = {
  configured: boolean
  authenticated: boolean
  account: string | null
  serverCount: number
}

type PagedResponse<T> = {
  values?: T[]
  isLastPage?: boolean
  nextPageStart?: number
}

function encodedRepoPath(repo: BitbucketDataCenterRepoRef): string {
  return `/projects/${encodeURIComponent(repo.projectKey)}/repos/${encodeURIComponent(repo.repoSlug)}`
}

async function getCommitBuildSummary(
  repo: BitbucketDataCenterRepoRef,
  headSha: string | undefined
): Promise<{ status: CheckStatus; checksSummary?: ProviderCheckSummary }> {
  if (!headSha) {
    return { status: 'neutral' }
  }
  const data = await requestJsonAt<PagedResponse<RawBitbucketBuildStatus>>(
    repo.baseUrl,
    `${repo.baseUrl}/rest/build-status/1.0`,
    `/commits/${encodeURIComponent(headSha)}`
  )
  const statuses = data?.values ?? []
  return {
    status: deriveBitbucketBuildStatus(statuses),
    checksSummary: summarizeBitbucketBuildStatuses(statuses)
  }
}

async function getMergeStatus(
  repo: BitbucketDataCenterRepoRef,
  prNumber: number
): Promise<PRMergeableState> {
  const data = await requestJsonAt<RawBitbucketDataCenterMergeStatus>(
    repo.baseUrl,
    repo.apiBaseUrl,
    `${encodedRepoPath(repo)}/pull-requests/${prNumber}/merge`
  )
  return mapBitbucketDataCenterMergeable(data)
}

async function enrichPullRequest(
  repo: BitbucketDataCenterRepoRef,
  raw: RawBitbucketDataCenterPullRequest
): Promise<BitbucketDataCenterPullRequestInfo | null> {
  if (typeof raw.id !== 'number') {
    return null
  }
  const state = mapBitbucketDataCenterPullRequestState(raw.state)
  const [buildSummary, mergeable] = await Promise.all([
    getCommitBuildSummary(repo, raw.fromRef?.latestCommit ?? undefined),
    state === 'open' ? getMergeStatus(repo, raw.id) : Promise.resolve<PRMergeableState>('UNKNOWN')
  ])
  return mapBitbucketDataCenterPullRequest(
    raw,
    buildSummary.status,
    mergeable,
    buildSummary.checksSummary
  )
}

function updatedTimestamp(raw: RawBitbucketDataCenterPullRequest): number {
  return typeof raw.updatedDate === 'number' ? raw.updatedDate : (raw.createdDate ?? 0)
}

function selectPreferredPullRequest(
  candidates: RawBitbucketDataCenterPullRequest[]
): RawBitbucketDataCenterPullRequest | null {
  if (candidates.length === 0) {
    return null
  }
  const open = candidates.find((pr) => mapBitbucketDataCenterPullRequestState(pr.state) === 'open')
  if (open) {
    return open
  }
  return [...candidates].sort((a, b) => updatedTimestamp(b) - updatedTimestamp(a))[0]
}

async function lookupPullRequestForBranch(
  repoPath: string,
  branch: string,
  linkedPrNumber: number | null,
  connectionId: string | null | undefined,
  options: HostedReviewExecutionOptions,
  throwOnFailure: boolean
): Promise<BitbucketDataCenterPullRequestInfo | null> {
  const repo = await getBitbucketDataCenterRepoRef(
    repoPath,
    connectionId,
    getHostedReviewLocalGitOptions(options)
  )
  if (!repo) {
    return null
  }

  if (linkedPrNumber !== null) {
    const linked = await requestJsonAt<RawBitbucketDataCenterPullRequest>(
      repo.baseUrl,
      repo.apiBaseUrl,
      `${encodedRepoPath(repo)}/pull-requests/${linkedPrNumber}`,
      {},
      throwOnFailure,
      true
    )
    if (linked) {
      return enrichPullRequest(repo, linked)
    }
  }

  const normalizedBranch = branch.replace(/^refs\/heads\//, '')
  if (!normalizedBranch) {
    return null
  }

  const matches: RawBitbucketDataCenterPullRequest[] = []
  let start = 0
  for (let page = 0; page < MAX_PULL_REQUEST_PAGES; page += 1) {
    const response = await requestJsonAt<PagedResponse<RawBitbucketDataCenterPullRequest>>(
      repo.baseUrl,
      repo.apiBaseUrl,
      `${encodedRepoPath(repo)}/pull-requests`,
      {
        searchParams: {
          at: `refs/heads/${normalizedBranch}`,
          direction: 'OUTGOING',
          state: 'ALL',
          limit: PULL_REQUEST_PAGE_LIMIT,
          start
        }
      },
      throwOnFailure
    )
    const values = response?.values ?? []
    matches.push(...values)
    if (!response || response.isLastPage !== false || typeof response.nextPageStart !== 'number') {
      break
    }
    start = response.nextPageStart
  }

  const selected = selectPreferredPullRequest(matches)
  if (!selected) {
    return null
  }

  const selectedState = mapBitbucketDataCenterPullRequestState(selected.state)
  if (
    await shouldHideNonOpenReviewOnDefaultBranch({
      state: selectedState,
      reviewNumber: typeof selected.id === 'number' ? selected.id : null,
      linkedReviewNumber: linkedPrNumber,
      branchName: normalizedBranch,
      repoPath,
      connectionId,
      localGitOptions: getHostedReviewLocalGitOptions(options)
    })
  ) {
    return null
  }

  return enrichPullRequest(repo, selected)
}

export async function getBitbucketDataCenterAuthStatus(): Promise<BitbucketDataCenterAuthStatus> {
  const status = await getBitbucketDataCenterConnectionStatus()
  if (!status.configured) {
    return { configured: false, authenticated: false, account: null, serverCount: 0 }
  }
  const primaryAccount = status.servers[0]?.account ?? status.envServer?.account ?? null
  return {
    configured: true,
    authenticated: true,
    account: primaryAccount,
    serverCount: status.source === 'environment' ? 1 : status.servers.length
  }
}

export async function getBitbucketDataCenterPullRequest(
  repoPath: string,
  prNumber: number,
  connectionId?: string | null,
  options: HostedReviewExecutionOptions = {}
): Promise<BitbucketDataCenterPullRequestInfo | null> {
  const repo = await getBitbucketDataCenterRepoRef(
    repoPath,
    connectionId,
    getHostedReviewLocalGitOptions(options)
  )
  if (!repo) {
    return null
  }
  const raw = await requestJsonAt<RawBitbucketDataCenterPullRequest>(
    repo.baseUrl,
    repo.apiBaseUrl,
    `${encodedRepoPath(repo)}/pull-requests/${prNumber}`
  )
  return raw ? enrichPullRequest(repo, raw) : null
}

export async function getBitbucketDataCenterPullRequestForBranch(
  repoPath: string,
  branch: string,
  linkedPrNumber: number | null,
  connectionId?: string | null,
  options: HostedReviewExecutionOptions = {}
): Promise<BitbucketDataCenterPullRequestInfo | null> {
  return lookupPullRequestForBranch(repoPath, branch, linkedPrNumber, connectionId, options, false)
}

export async function getBitbucketDataCenterPullRequestForBranchOrThrow(
  repoPath: string,
  branch: string,
  linkedPrNumber: number | null,
  connectionId?: string | null,
  options: HostedReviewExecutionOptions = {}
): Promise<BitbucketDataCenterPullRequestInfo | null> {
  return lookupPullRequestForBranch(repoPath, branch, linkedPrNumber, connectionId, options, true)
}

export async function getBitbucketDataCenterRepoSlug(
  repoPath: string,
  connectionId?: string | null,
  options: HostedReviewExecutionOptions = {}
): Promise<BitbucketDataCenterRepoRef | null> {
  return getBitbucketDataCenterRepoRef(
    repoPath,
    connectionId,
    getHostedReviewLocalGitOptions(options)
  )
}
