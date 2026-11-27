import { getAzureDevOpsAuthStatus } from '../azure-devops/client'
import { getBitbucketAuthStatus } from '../bitbucket/client'
import { getBitbucketDataCenterAuthStatus } from '../bitbucket-datacenter/client'
import { getGiteaAuthStatus } from '../gitea/client'

export async function probeHostedReviewProviderAuth() {
  const [bitbucket, bitbucketDataCenter, azureDevOps, gitea] = await Promise.all([
    getBitbucketAuthStatus(),
    getBitbucketDataCenterAuthStatus(),
    getAzureDevOpsAuthStatus(),
    getGiteaAuthStatus()
  ])
  return { bitbucket, bitbucketDataCenter, azureDevOps, gitea }
}
