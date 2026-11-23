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

  if (input.authMode === 'basic') {
    const username = input.username.trim()
    const password = input.password
    if (!username || !password) {
      return bitbucketDataCenterConnectFailure('usernameAndPasswordRequired')
    }
    const verification = await verifyBitbucketDataCenterConnection(
      normalizedBaseUrl,
      { authMode: 'basic', username, password },
      VERIFY_TIMEOUT_MS
    )
    if (!verification.ok) {
      return bitbucketDataCenterConnectFailure(verification.reason)
    }
    const account = verification.account ?? username
    await upsertBitbucketDataCenterCredential({
      baseUrl: normalizedBaseUrl,
      authMode: 'basic',
      account,
      serverVersion: verification.serverVersion,
      username,
      password
    })
    _resetBitbucketDataCenterRepoRefCache()
    return {
      ok: true,
      baseUrl: normalizedBaseUrl,
      account,
      serverVersion: verification.serverVersion
    }
  }

  const accessToken = input.accessToken.trim()
  if (!accessToken) {
    return bitbucketDataCenterConnectFailure('accessTokenRequired')
  }

  const verification = await verifyBitbucketDataCenterConnection(
    normalizedBaseUrl,
    { authMode: 'token', accessToken },
    VERIFY_TIMEOUT_MS
  )
  if (!verification.ok) {
    return bitbucketDataCenterConnectFailure(verification.reason)
  }

  await upsertBitbucketDataCenterCredential({
    baseUrl: normalizedBaseUrl,
    authMode: 'token',
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

export async function disconnectBitbucketDataCenter(baseUrl?: string | null): Promise<void> {
  await (baseUrl && baseUrl.trim().length > 0
    ? removeBitbucketDataCenterCredential(baseUrl)
    : clearStoredBitbucketDataCenterCredentials())
  _resetBitbucketDataCenterRepoRefCache()
}

// Status reads must avoid keychain prompts.
export async function getBitbucketDataCenterConnectionStatus(): Promise<BitbucketDataCenterConnectionStatus> {
  const env = getEnvAuthConfig()
  const metadata = await getStoredBitbucketDataCenterMetadata()
  const hasStored = hasStoredBitbucketDataCenterCredential()
  const protection = hasStored ? await getBitbucketDataCenterCredentialProtection() : null
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

export {
  ensureBitbucketDataCenterCredentialsLoaded,
  listConfiguredBitbucketDataCenterBaseUrls
} from './configured-servers'

export async function resolveBitbucketDataCenterAuthForBaseUrl(
  baseUrl: string
): Promise<BitbucketDataCenterAuthConfig | null> {
  const normalized = normalizeBitbucketDataCenterBaseUrl(baseUrl)
  if (!normalized) {
    return null
  }
  const env = getEnvAuthConfig()
  if (env && env.baseUrl === normalized) {
    return env
  }
  try {
    const secret = await loadStoredBitbucketDataCenterSecret({ force: true })
    const entry = secret?.servers[normalized]
    if (entry?.authMode === 'basic' && entry.username && entry.password) {
      return {
        baseUrl: normalized,
        authMode: 'basic',
        username: entry.username,
        password: entry.password
      }
    }
    if (entry && 'accessToken' in entry && entry.accessToken) {
      return { baseUrl: normalized, authMode: 'token', accessToken: entry.accessToken }
    }
  } catch {
    return env && env.baseUrl === normalized ? env : null
  }
  return null
}
