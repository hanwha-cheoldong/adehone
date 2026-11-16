import type { ExecutionHostId } from '../../shared/execution-host'
import type {
  CreateHostedReviewInput,
  CreateHostedReviewResult
} from '../../shared/source-control/hosted-review/hosted-review-contracts'
import {
  normalizeHostedReviewBaseRef,
  normalizeHostedReviewHeadRef
} from '../../shared/source-control/hosted-review/hosted-review-refs'
import {
  HostedReviewApiRequestError,
  requestHostedReviewJson
} from '../source-control/hosted-review-api-request'
import { hostedReviewSshConnectionId } from '../source-control/hosted-review-execution-host'
import {
  getHostedReviewLocalGitOptions,
  type HostedReviewExecutionOptions
} from '../source-control/hosted-review-git-options'
import { readHostedPullRequestTemplate } from '../source-control/pull-request-template'
import {
  authHeaders,
  hasUsableBitbucketDataCenterAuth,
  type BitbucketDataCenterAuthConfig
} from './auth-config'
import { getBitbucketDataCenterPullRequestForBranch } from './client'
import {
  ensureBitbucketDataCenterCredentialsLoaded,
  listConfiguredBitbucketDataCenterBaseUrls,
  resolveBitbucketDataCenterAuthForBaseUrl
} from './credential-connection'
import {
  mapBitbucketDataCenterPullRequest,
  type RawBitbucketDataCenterPullRequest
} from './pull-request-mappers'
import { getBitbucketDataCenterRepoRef, type BitbucketDataCenterRepoRef } from './repository-ref'

const CREATE_REQUEST_TIMEOUT_MS = 60_000
const DEFAULT_BRANCH_TIMEOUT_MS = 5_000

export async function isBitbucketDataCenterReviewCreationAuthenticated(): Promise<boolean> {
  await ensureBitbucketDataCenterCredentialsLoaded()
  return listConfiguredBitbucketDataCenterBaseUrls().length > 0
}

function encodedRepoPath(repo: BitbucketDataCenterRepoRef): string {
  return `/projects/${encodeURIComponent(repo.projectKey)}/repos/${encodeURIComponent(repo.repoSlug)}`
}

function classifyCreateError(error: unknown): CreateHostedReviewResult {
  const message = error instanceof Error ? error.message : String(error)
  if (message) {
    console.warn('createBitbucketDataCenterPullRequest failed:', message)
  }
  const lower = message.toLowerCase()
  const status = error instanceof HostedReviewApiRequestError ? error.status : null
  if (
    status === 401 ||
    status === 403 ||
    lower.includes('unauthorized') ||
    lower.includes('forbidden') ||
    lower.includes('authentication')
  ) {
    return {
      ok: false,
      code: 'auth_required',
      error:
        'Create PR failed: Bitbucket Data Center is not authenticated. Next step: connect Bitbucket Data Center in Settings > Integrations.',
      reason: 'auth_required'
    }
  }
  if (status === 409 || lower.includes('already exists') || lower.includes('already open')) {
    return {
      ok: false,
      code: 'already_exists',
      error: 'A pull request already exists for this branch.',
      reason: 'existing_review'
    }
  }
  if (error instanceof HostedReviewApiRequestError && error.timedOut) {
    return {
      ok: false,
      code: 'unknown_completion',
      error: 'PR creation may have completed. Refreshing branch review state...',
      reason: 'creation_unconfirmed'
    }
  }
  if (status === 400 || status === 422 || lower.includes('validation')) {
    return {
      ok: false,
      code: 'validation',
      error:
        'Create PR failed: Bitbucket Data Center rejected the pull request. Check the base branch and branch state, then try again.',
      reason: 'rejected'
    }
  }
  return {
    ok: false,
    code: 'unknown',
    error:
      'Create PR failed: Bitbucket Data Center could not create the pull request. Try again in a moment.',
    reason: 'create_failed'
  }
}

async function fetchDefaultBranch(
  repo: BitbucketDataCenterRepoRef,
  auth: BitbucketDataCenterAuthConfig
): Promise<string | null> {
  try {
    const data = await requestHostedReviewJson<{ displayId?: string; id?: string }>(
      new URL(`${repo.apiBaseUrl}${encodedRepoPath(repo)}/branches/default`),
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          ...authHeaders(auth)
        }
      },
      DEFAULT_BRANCH_TIMEOUT_MS
    )
    const branch = data.displayId?.trim() || data.id?.replace(/^refs\/heads\//, '').trim()
    return branch || null
  } catch {
    return null
  }
}

export async function createBitbucketDataCenterPullRequest(
  repoPath: string,
  input: CreateHostedReviewInput,
  executionHostId: ExecutionHostId,
  options: HostedReviewExecutionOptions = {}
): Promise<CreateHostedReviewResult> {
  if (input.provider !== 'bitbucket-datacenter') {
    return {
      ok: false,
      code: 'unsupported_provider',
      error: 'Creating reviews for this provider is not supported yet.',
      reason: 'provider_not_supported'
    }
  }

  const connectionId = hostedReviewSshConnectionId(executionHostId)
  const localGitOptions = getHostedReviewLocalGitOptions(options)
  const repo = await getBitbucketDataCenterRepoRef(repoPath, connectionId, localGitOptions)
  if (!repo) {
    return {
      ok: false,
      code: 'unsupported_provider',
      error: 'Creating pull requests requires a configured Bitbucket Data Center remote.',
      reason: 'unsupported_provider'
    }
  }

  const auth = await resolveBitbucketDataCenterAuthForBaseUrl(repo.baseUrl)
  if (!auth || !hasUsableBitbucketDataCenterAuth(auth)) {
    return {
      ok: false,
      code: 'auth_required',
      error:
        'Create PR failed: Bitbucket Data Center is not authenticated. Next step: connect Bitbucket Data Center in Settings > Integrations.',
      reason: 'auth_required'
    }
  }

  const head = normalizeHostedReviewHeadRef(input.head ?? '')
  const title = input.title.trim()
  const rawBase = normalizeHostedReviewBaseRef(input.base)
  const base = rawBase || (await fetchDefaultBranch(repo, auth)) || ''
  if (!head || !base || !title) {
    return {
      ok: false,
      code: 'validation',
      error: 'Bitbucket Data Center pull requests require a base branch, head branch, and title.',
      reason: 'base_head_title_required'
    }
  }

  const body =
    input.body?.trim() ||
    (input.useTemplate
      ? await readHostedPullRequestTemplate(input.worktreePath ?? repoPath, connectionId)
      : undefined)

  const repositoryPayload = {
    slug: repo.repoSlug,
    project: { key: repo.projectKey }
  }

  try {
    const raw = await requestHostedReviewJson<RawBitbucketDataCenterPullRequest>(
      new URL(`${repo.apiBaseUrl}${encodedRepoPath(repo)}/pull-requests`),
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...authHeaders(auth)
        },
        body: JSON.stringify({
          title,
          ...(body ? { description: body } : {}),
          fromRef: {
            id: `refs/heads/${head}`,
            repository: repositoryPayload
          },
          toRef: {
            id: `refs/heads/${base}`,
            repository: repositoryPayload
          }
        })
      },
      CREATE_REQUEST_TIMEOUT_MS
    )

    const mapped = mapBitbucketDataCenterPullRequest(raw, 'neutral')
    if (mapped) {
      return { ok: true, number: mapped.number, url: mapped.url }
    }
    const lookedUp = await getBitbucketDataCenterPullRequestForBranch(
      repoPath,
      head,
      null,
      connectionId,
      options
    )
    if (lookedUp) {
      return { ok: true, number: lookedUp.number, url: lookedUp.url }
    }
    return {
      ok: false,
      code: 'unknown_completion',
      error: 'PR creation may have completed. Refreshing branch review state...',
      reason: 'creation_unconfirmed'
    }
  } catch (error) {
    const classified = classifyCreateError(error)
    if (classified.ok) {
      return classified
    }
    if (classified.code === 'already_exists' || classified.code === 'unknown_completion') {
      const existing = await getBitbucketDataCenterPullRequestForBranch(
        repoPath,
        head,
        null,
        connectionId,
        options
      )
      if (existing) {
        if (classified.code === 'already_exists') {
          return {
            ...classified,
            existingReview: {
              number: existing.number,
              url: existing.url
            }
          }
        }
        return { ok: true, number: existing.number, url: existing.url }
      }
    }
    return classified
  }
}
