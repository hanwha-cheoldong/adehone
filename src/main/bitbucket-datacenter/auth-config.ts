export type BitbucketDataCenterAuthConfig = {
  baseUrl: string
  accessToken: string | null
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
  const accessToken =
    envValue('ORCA_BITBUCKET_DC_TOKEN') ?? envValue('ORCA_BITBUCKET_DATACENTER_TOKEN')
  if (!rawBaseUrl || !accessToken) {
    return null
  }
  const baseUrl = normalizeBitbucketDataCenterBaseUrl(rawBaseUrl)
  if (!baseUrl) {
    return null
  }
  return { baseUrl, accessToken }
}

export function authHeaders(accessToken: string | null): Record<string, string> {
  if (!accessToken) {
    return {}
  }
  return { Authorization: `Bearer ${accessToken}` }
}
