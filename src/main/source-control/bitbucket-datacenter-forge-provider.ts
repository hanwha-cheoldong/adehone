import {
  getBitbucketDataCenterPullRequest,
  getBitbucketDataCenterPullRequestForBranchOrThrow,
  getBitbucketDataCenterRepoSlug
} from '../bitbucket-datacenter/client'
import { createBitbucketDataCenterPullRequest } from '../bitbucket-datacenter/pull-request-creation'
import { mapBitbucketDataCenterReview } from './forge-review-mappers'
import { hostedReviewSshConnectionId } from './hosted-review-execution-host'
import {
  hasHostedReviewLocalGitOptions,
  getHostedReviewLocalGitOptions,
  type HostedReviewExecutionOptions
} from './hosted-review-git-options'
import type { ForgeProvider, ForgeProviderRepositoryContext } from './forge-provider'

function forgeConnectionId(context: ForgeProviderRepositoryContext): string | null {
  return hostedReviewSshConnectionId(context.executionHostId)
}

function hostedReviewExecutionArgs(
  options: HostedReviewExecutionOptions
): [] | [HostedReviewExecutionOptions] {
  return hasHostedReviewLocalGitOptions(options)
    ? [{ localGitExecOptions: getHostedReviewLocalGitOptions(options) }]
    : []
}

export const bitbucketDataCenterForgeProvider = {
  id: 'bitbucket-datacenter',
  supportsReviewCreation: true,
  resolveRepository: (context) =>
    getBitbucketDataCenterRepoSlug(
      context.repoPath,
      forgeConnectionId(context),
      ...hostedReviewExecutionArgs(context)
    ),
  async getReviewForBranch(input) {
    const pr = await getBitbucketDataCenterPullRequestForBranchOrThrow(
      input.repoPath,
      input.branch,
      input.linkedReviewNumber ?? null,
      forgeConnectionId(input),
      ...hostedReviewExecutionArgs(input)
    )
    return pr ? mapBitbucketDataCenterReview(pr) : null
  },
  async getReviewByNumber(input) {
    const pr = await getBitbucketDataCenterPullRequest(
      input.repoPath,
      input.number,
      forgeConnectionId(input),
      ...hostedReviewExecutionArgs(input)
    )
    return pr ? mapBitbucketDataCenterReview(pr) : null
  },
  createReview: createBitbucketDataCenterPullRequest
} satisfies ForgeProvider
