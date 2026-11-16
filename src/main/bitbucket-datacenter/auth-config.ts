export type BitbucketDataCenterAuthCredentials =
  | {
      authMode: 'token'
      accessToken: string
    }
  | {
      authMode: 'basic'
      username: string
      password: string
    }

export type BitbucketDataCenterAuthConfig = BitbucketDataCenterAuthCredentials & {
  baseUrl: string
}

export function envValue(name: string): string | null {
  const value = process.env[name]?.trim() ?? ''
  return value.length > 0 ? value : null
}

/**
 * Normalize a Bitbucket Data Center base URL to `{origin}{contextPath}` without a trailing slash.
 * Returns null if the input is not a valid http(s) URL.
 */
export function normalizeBitbucketDataCenterBaseUrl(rawUrl: string): string | null {
  const trimmed = rawUrl.trim()
  if (!trimmed) {
    return null
  }
  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    return null
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return null
  }
  const pathname = parsed.pathname
    .replace(/\/+$/, '')
    .replace(/\/rest\/api\/(?:1\.0|latest)$/i, '')
    .replace(/\/+$/, '')
  return `${parsed.origin}${pathname}`
}

export function getEnvAuthConfig(): BitbucketDataCenterAuthConfig | null {
  const rawBaseUrl = envValue('ORCA_BITBUCKET_DC_URL') ?? envValue('ORCA_BITBUCKET_DATACENTER_URL')
  if (!rawBaseUrl) {
    return null
  }
  const baseUrl = normalizeBitbucketDataCenterBaseUrl(rawBaseUrl)
  if (!baseUrl) {
    return null
  }
  const accessToken =
    envValue('ORCA_BITBUCKET_DC_TOKEN') ?? envValue('ORCA_BITBUCKET_DATACENTER_TOKEN')
  if (accessToken) {
    return { baseUrl, authMode: 'token', accessToken }
  }
  const username =
    envValue('ORCA_BITBUCKET_DC_USERNAME') ?? envValue('ORCA_BITBUCKET_DATACENTER_USERNAME')
  const password =
    envValue('ORCA_BITBUCKET_DC_PASSWORD') ?? envValue('ORCA_BITBUCKET_DATACENTER_PASSWORD')
  if (username && password) {
    return { baseUrl, authMode: 'basic', username, password }
  }
  return null
}

export function hasUsableBitbucketDataCenterAuth(
  auth: BitbucketDataCenterAuthConfig | null | undefined
): boolean {
  if (!auth) {
    return false
  }
  return auth.authMode === 'basic'
    ? auth.username.length > 0 && auth.password.length > 0
    : auth.accessToken.length > 0
}

export function authHeaders(
  auth: BitbucketDataCenterAuthCredentials | null | undefined
): Record<string, string> {
  if (!auth) {
    return {}
  }
  if (auth.authMode === 'basic') {
    if (!auth.username || !auth.password) {
      return {}
    }
    const encoded = Buffer.from(`${auth.username}:${auth.password}`, 'utf-8').toString('base64')
    return { Authorization: `Basic ${encoded}` }
  }
  if (!auth.accessToken) {
    return {}
  }
  return { Authorization: `Bearer ${auth.accessToken}` }
}
