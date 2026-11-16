import {
  bitbucketDataCenterConnectFailure,
  type BitbucketDataCenterConnectArgs,
  type BitbucketDataCenterConnectionStatus,
  type BitbucketDataCenterConnectResult
} from '../../shared/bitbucket-datacenter-credentials'
import {
  getEnvAuthConfig,
  normalizeBitbucketDataCenterBaseUrl,
  type BitbucketDataCenterAuthConfig
} from './auth-config'
import {
  clearStoredBitbucketDataCenterCredentials,
  getBitbucketDataCenterCredentialProtection,
  getStoredBitbucketDataCenterMetadata,
  hasStoredBitbucketDataCenterCredential,
  loadStoredBitbucketDataCenterSecret,
  removeBitbucketDataCenterCredential,
  upsertBitbucketDataCenterCredential
} from './credential-store'
import { _resetBitbucketDataCenterRepoRefCache } from './repository-ref'
import { verifyBitbucketDataCenterConnection } from './user-request'

const VERIFY_TIMEOUT_MS = 6000

export async function connectBitbucketDataCenter(
  input: BitbucketDataCenterConnectArgs
): Promise<BitbucketDataCenterConnectResult> {
  const trimmedUrl = input.baseUrl.trim()
  if (!trimmedUrl) {
    return bitbucketDataCenterConnectFailure('baseUrlRequired')
  }
  const normalizedBaseUrl = normalizeBitbucketDataCenterBaseUrl(trimmedUrl)
  if (!normalizedBaseUrl) {
    return bitbucketDataCenterConnectFailure('invalidBaseUrl')
  }
  const accessToken = input.accessToken.trim()
  if (!accessToken) {
    return bitbucketDataCenterConnectFailure('accessTokenRequired')
  }

  const verification = await verifyBitbucketDataCenterConnection(
    normalizedBaseUrl,
    accessToken,
    VERIFY_TIMEOUT_MS
  )
  if (!verification.ok) {
    return bitbucketDataCenterConnectFailure(verification.reason)
  }

  upsertBitbucketDataCenterCredential({
    baseUrl: normalizedBaseUrl,
    account: verification.account,
    serverVersion: verification.serverVersion,
    accessToken
  })
  _resetBitbucketDataCenterRepoRefCache()
  return {
    ok: true,
    baseUrl: normalizedBaseUrl,
    account: verification.account,
    serverVersion: verification.serverVersion
  }
}

export function disconnectBitbucketDataCenter(baseUrl?: string | null): void {
  if (baseUrl && baseUrl.trim().length > 0) {
    removeBitbucketDataCenterCredential(baseUrl)
  } else {
    clearStoredBitbucketDataCenterCredentials()
  }
  _resetBitbucketDataCenterRepoRefCache()
}

// Status reads must avoid keychain prompts.
export function getBitbucketDataCenterConnectionStatus(): BitbucketDataCenterConnectionStatus {
  const env = getEnvAuthConfig()
  const metadata = getStoredBitbucketDataCenterMetadata()
  const hasStored = hasStoredBitbucketDataCenterCredential()
  const protection = hasStored ? getBitbucketDataCenterCredentialProtection() : null
  const storedServers = hasStored && metadata ? metadata.servers : []

  if (env) {
    return {
      configured: true,
      source: 'environment',
      credentialProtection: protection,
      servers: storedServers.map((server) => ({
        ...server,
        credentialProtection: protection
      })),
      envServer: {
        baseUrl: env.baseUrl,
        account: null
      }
    }
  }

  if (storedServers.length > 0) {
    return {
      configured: true,
      source: 'stored',
      credentialProtection: protection,
      servers: storedServers.map((server) => ({
        ...server,
        credentialProtection: protection
      })),
      envServer: null
    }
  }

  return {
    configured: false,
    source: 'none',
    credentialProtection: null,
    servers: [],
    envServer: null
  }
}

export function listConfiguredBitbucketDataCenterBaseUrls(): string[] {
  const urls = new Set<string>()
  const env = getEnvAuthConfig()
  if (env) {
    urls.add(env.baseUrl)
  }
  if (hasStoredBitbucketDataCenterCredential()) {
    const metadata = getStoredBitbucketDataCenterMetadata()
    for (const server of metadata?.servers ?? []) {
      urls.add(server.baseUrl)
    }
  }
  return Array.from(urls)
}

export function resolveBitbucketDataCenterAuthForBaseUrl(
  baseUrl: string
): BitbucketDataCenterAuthConfig | null {
  const normalized = normalizeBitbucketDataCenterBaseUrl(baseUrl)
  if (!normalized) {
    return null
  }
  const env = getEnvAuthConfig()
  if (env && env.baseUrl === normalized) {
    return env
  }
  try {
    const secret = loadStoredBitbucketDataCenterSecret({ force: true })
    const entry = secret?.servers[normalized]
    if (entry?.accessToken) {
      return { baseUrl: normalized, accessToken: entry.accessToken }
    }
  } catch {
    return env && env.baseUrl === normalized ? env : null
  }
  return null
}
