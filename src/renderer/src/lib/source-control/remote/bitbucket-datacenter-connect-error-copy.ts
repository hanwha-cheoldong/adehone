import { translate } from '@/i18n/i18n'
import type { BitbucketDataCenterConnectFailureCode } from '../../../../../shared/bitbucket-datacenter-credentials'

const COPY: Record<BitbucketDataCenterConnectFailureCode, () => string> = {
  invalidInput: () =>
    translate(
      'codeHost.bitbucketDataCenterConnect.invalidInput',
      'Invalid Bitbucket Data Center credentials'
    ),
  baseUrlRequired: () =>
    translate(
      'codeHost.bitbucketDataCenterConnect.baseUrlRequired',
      'Enter a Bitbucket Data Center server URL.'
    ),
  invalidBaseUrl: () =>
    translate(
      'codeHost.bitbucketDataCenterConnect.invalidBaseUrl',
      'Enter a valid HTTP or HTTPS server URL.'
    ),
  accessTokenRequired: () =>
    translate(
      'codeHost.bitbucketDataCenterConnect.accessTokenRequired',
      'Enter a personal access token.'
    ),
  rejected: () =>
    translate(
      'codeHost.bitbucketDataCenterConnect.rejected',
      'Bitbucket Data Center rejected this token. Check the token and permissions, then try again.'
    ),
  untrustedCertificate: () =>
    translate(
      'codeHost.bitbucketDataCenterConnect.untrustedCertificate',
      'Could not verify the server TLS certificate. Install the internal CA certificate in your OS trust store, then try again.'
    ),
  unreachable: () =>
    translate(
      'codeHost.bitbucketDataCenterConnect.unreachable',
      'Could not reach Bitbucket Data Center. Check your connection or the server URL, then try again.'
    )
}

function isBitbucketDataCenterConnectFailureCode(
  code: unknown
): code is BitbucketDataCenterConnectFailureCode {
  return typeof code === 'string' && Object.hasOwn(COPY, code)
}

/** A connect failure in the UI language; uncoded (older host) or unknown codes show the English `error`. */
export function bitbucketDataCenterConnectErrorText(failure: {
  error: string
  errorCode?: unknown
}): string {
  return isBitbucketDataCenterConnectFailureCode(failure.errorCode)
    ? COPY[failure.errorCode]()
    : failure.error
}
