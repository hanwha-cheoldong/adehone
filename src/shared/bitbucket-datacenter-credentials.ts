import type { SecretAtRestProtection } from './secure-storage/secret-at-rest-protection'

export type BitbucketDataCenterCredentialSource = 'environment' | 'stored' | 'none'

export type BitbucketDataCenterAuthMode = 'token' | 'basic'

export type BitbucketDataCenterConnectArgs =
  | {
      baseUrl: string
      authMode?: 'token'
      accessToken: string
    }
  | {
      baseUrl: string
      authMode: 'basic'
      username: string
      password: string
    }

export type BitbucketDataCenterServerStatus = {
  baseUrl: string
  authMode?: BitbucketDataCenterAuthMode
  account: string | null
  serverVersion: string | null
  updatedAt: string
  credentialProtection?: SecretAtRestProtection | null
}

// Never return credential secrets over IPC to the renderer.
export type BitbucketDataCenterConnectionStatus = {
  configured: boolean
  /** Stored-at-rest status only; environment/none write nothing and use null. */
  credentialProtection?: SecretAtRestProtection | null
  source: BitbucketDataCenterCredentialSource
  servers: BitbucketDataCenterServerStatus[]
  envServer?: {
    baseUrl: string
    account: string | null
  } | null
}

// One English table for Bitbucket Data Center connect failures: main builds the wire `error`, the renderer translates by code.
export const BITBUCKET_DC_CONNECT_FAILURE_COPY = {
  invalidInput: 'Invalid Bitbucket Data Center credentials',
  baseUrlRequired: 'Enter a Bitbucket Data Center server URL.',
  invalidBaseUrl: 'Enter a valid HTTP or HTTPS server URL.',
  accessTokenRequired: 'Enter a personal access token.',
  usernameAndPasswordRequired: 'Enter both a username and a password.',
  rejected:
    'Bitbucket Data Center rejected this token. Check the token and permissions, then try again.',
  untrustedCertificate:
    'Could not verify the server TLS certificate. Install the internal CA certificate in your OS trust store, then try again.',
  unreachable:
    'Could not reach Bitbucket Data Center. Check your connection or the server URL, then try again.'
} as const

export type BitbucketDataCenterConnectFailureCode = keyof typeof BITBUCKET_DC_CONNECT_FAILURE_COPY

export type BitbucketDataCenterConnectResult =
  | { ok: true; baseUrl: string; account: string | null; serverVersion: string | null }
  | { ok: false; error: string; errorCode?: string }

export function bitbucketDataCenterConnectFailure(
  errorCode: BitbucketDataCenterConnectFailureCode
): Extract<BitbucketDataCenterConnectResult, { ok: false }> {
  return { ok: false, error: BITBUCKET_DC_CONNECT_FAILURE_COPY[errorCode], errorCode }
}
