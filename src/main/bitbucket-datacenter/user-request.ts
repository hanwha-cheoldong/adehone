import { cancelUnreadResponseBody } from '../lib/unread-response-body'
import { authHeaders } from './auth-config'

const USER_REQUEST_TIMEOUT_MS = 6000

const TLS_CERTIFICATE_ERROR_CODES = new Set([
  'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
  'SELF_SIGNED_CERT_IN_CHAIN',
  'DEPTH_ZERO_SELF_SIGNED_CERT',
  'ERR_TLS_CERT_ALTNAME_INVALID',
  'CERT_HAS_EXPIRED',
  'UNABLE_TO_GET_ISSUER_CERT_LOCALLY',
  'ERR_TLS_CERT_REJECTED'
])

export type BitbucketDataCenterVerificationResult =
  | { ok: true; account: string | null; serverVersion: string | null }
  | { ok: false; reason: 'rejected' | 'unreachable' | 'untrustedCertificate' }

function readErrorCode(value: unknown): string | null {
  if (!value || typeof value !== 'object') {
    return null
  }
  if ('code' in value && typeof value.code === 'string') {
    return value.code
  }
  return null
}

export function isTlsCertificateError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false
  }
  const causeCode = 'cause' in error ? readErrorCode(error.cause) : null
  const code = causeCode ?? readErrorCode(error)
  return code !== null && TLS_CERTIFICATE_ERROR_CODES.has(code)
}

function asNonEmptyString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null
}

async function fetchWhoamiUsername(
  baseUrl: string,
  accessToken: string,
  timeoutMs: number
): Promise<string | null> {
  try {
    const response = await fetch(`${baseUrl}/plugins/servlet/applinks/whoami`, {
      headers: authHeaders(accessToken),
      signal: AbortSignal.timeout(timeoutMs)
    })
    if (!response.ok) {
      await cancelUnreadResponseBody(response)
      return null
    }
    const text = (await response.text()).trim()
    // Anonymous or login-redirect HTML should never be treated as a username.
    if (!text || text.includes('<')) {
      return null
    }
    return text
  } catch {
    return null
  }
}

export async function verifyBitbucketDataCenterConnection(
  baseUrl: string,
  accessToken: string,
  timeoutMs: number = USER_REQUEST_TIMEOUT_MS
): Promise<BitbucketDataCenterVerificationResult> {
  const normalizedBase = baseUrl.replace(/\/+$/, '')

  // 1. Verify the endpoint is a Bitbucket Server / Data Center instance.
  let serverVersion: string | null = null
  try {
    const propsRes = await fetch(`${normalizedBase}/rest/api/1.0/application-properties`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(timeoutMs)
    })
    if (!propsRes.ok) {
      await cancelUnreadResponseBody(propsRes)
      return {
        ok: false,
        reason: propsRes.status === 401 || propsRes.status === 403 ? 'rejected' : 'unreachable'
      }
    }
    const propsBody: unknown = await propsRes.json()
    if (
      !propsBody ||
      typeof propsBody !== 'object' ||
      !('version' in propsBody) ||
      typeof propsBody.version !== 'string'
    ) {
      return { ok: false, reason: 'unreachable' }
    }
    serverVersion = asNonEmptyString(propsBody.version)
  } catch (error) {
    return {
      ok: false,
      reason: isTlsCertificateError(error) ? 'untrustedCertificate' : 'unreachable'
    }
  }

  // 2. Verify the PAT against an authenticated REST endpoint.
  try {
    const authRes = await fetch(`${normalizedBase}/rest/api/1.0/projects?limit=1`, {
      headers: {
        Accept: 'application/json',
        ...authHeaders(accessToken)
      },
      signal: AbortSignal.timeout(timeoutMs)
    })
    const headerUser = asNonEmptyString(authRes.headers.get('x-ausername'))
    await cancelUnreadResponseBody(authRes)
    if (authRes.status === 401 || authRes.status === 403) {
      return { ok: false, reason: 'rejected' }
    }
    if (!authRes.ok) {
      return { ok: false, reason: 'unreachable' }
    }
    const account =
      headerUser ?? (await fetchWhoamiUsername(normalizedBase, accessToken, timeoutMs))
    return { ok: true, account, serverVersion }
  } catch (error) {
    return {
      ok: false,
      reason: isTlsCertificateError(error) ? 'untrustedCertificate' : 'unreachable'
    }
  }
}
