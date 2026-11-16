import { getEnvAuthConfig } from './auth-config'
import {
  getCachedStoredBitbucketDataCenterMetadata,
  getStoredBitbucketDataCenterMetadata,
  hasStoredBitbucketDataCenterCredential
} from './credential-store'

export async function ensureBitbucketDataCenterCredentialsLoaded(): Promise<void> {
  await getStoredBitbucketDataCenterMetadata()
}

export function listConfiguredBitbucketDataCenterBaseUrls(): string[] {
  const urls = new Set<string>()
  const env = getEnvAuthConfig()
  if (env) {
    urls.add(env.baseUrl)
  }
  if (hasStoredBitbucketDataCenterCredential()) {
    const metadata = getCachedStoredBitbucketDataCenterMetadata()
    for (const server of metadata?.servers ?? []) {
      urls.add(server.baseUrl)
    }
  }
  return Array.from(urls)
}
