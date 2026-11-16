import { cancelUnreadResponseBody } from '../lib/unread-response-body'
import { authHeaders } from './auth-config'
import { resolveBitbucketDataCenterAuthForBaseUrl } from './credential-connection'

const REQUEST_TIMEOUT_MS = 5000

export type BitbucketDataCenterRequestOptions = {
  searchParams?: Record<string, string | number>
  timeoutMs?: number
}

function buildUrl(
  base: string,
  path: string,
  searchParams?: BitbucketDataCenterRequestOptions['searchParams']
): string {
  const url = new URL(`${base.replace(/\/+$/, '')}${path}`)
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      url.searchParams.set(key, String(value))
    }
  }
  return url.toString()
}

export async function requestBitbucketDataCenterJson<T>(
  baseUrl: string,
  urlBase: string,
  path: string,
  options: BitbucketDataCenterRequestOptions = {},
  throwOnFailure = false,
  notFoundIsNull = false
): Promise<T | null> {
  const auth = resolveBitbucketDataCenterAuthForBaseUrl(baseUrl)
  if (!auth?.accessToken) {
    if (throwOnFailure) {
      throw new Error('Bitbucket Data Center request failed: no usable credential')
    }
    return null
  }
  try {
    const response = await fetch(buildUrl(urlBase, path, options.searchParams), {
      headers: {
        Accept: 'application/json',
        ...authHeaders(auth.accessToken)
      },
      signal: AbortSignal.timeout(options.timeoutMs ?? REQUEST_TIMEOUT_MS)
    })
    if (!response.ok) {
      await cancelUnreadResponseBody(response)
      if (response.status === 404 && notFoundIsNull) {
        return null
      }
      if (throwOnFailure) {
        throw new Error(`Bitbucket Data Center request failed: HTTP ${response.status}`)
      }
      return null
    }
    // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: JSON body decoded for typed REST response
    return (await response.json()) as T
  } catch (error) {
    if (throwOnFailure) {
      throw error
    }
    return null
  }
}
