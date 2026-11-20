import { afterEach, describe, expect, it } from 'vitest'
import { installFakeAppEnvironment } from '../../../../config/scripts/test-runtime/environment/vitest-host-ports-setup'
import { hasAppEnvironment } from '../../../shared/app-lifecycle/app-environment'
import {
  allowsPlaintextOrcaCloudSession,
  getOrcaCloudAuthConfig,
  isOrcaCloudDevAuthEnabled
} from './profile-cloud-auth-config'

const DEV_OVERRIDES = {
  ORCA_CLOUD_API_URL: 'http://127.0.0.1:8787',
  ORCA_CLOUD_CLIENT_ID: 'local-client',
  ORCA_CLOUD_DEV_AUTH: '1',
  ORCA_CLOUD_ALLOW_PLAINTEXT_SESSION: '1'
}

describe('Orca cloud auth config read from the installed app environment', () => {
  afterEach(() => installFakeAppEnvironment())

  it('allows the dev overrides in an unpackaged host', () => {
    installFakeAppEnvironment({ isPackaged: () => false })

    expect(isOrcaCloudDevAuthEnabled(DEV_OVERRIDES)).toBe(true)
    expect(allowsPlaintextOrcaCloudSession(DEV_OVERRIDES)).toBe(true)
    expect(getOrcaCloudAuthConfig(DEV_OVERRIDES)).toMatchObject({
      configured: true,
      config: { apiBaseUrl: 'http://127.0.0.1:8787', clientId: 'local-client' }
    })
    expect(getOrcaCloudAuthConfig({})).toMatchObject({ configured: false })
  })

  it('reads as unpackaged when no app environment is installed, as a bare Node import did', () => {
    // Test setup installs a fake environment, and there is no uninstall API.
    Reflect.deleteProperty(globalThis, Symbol.for('orca.host.appEnvironment'))
    expect(hasAppEnvironment()).toBe(false)

    expect(isOrcaCloudDevAuthEnabled(DEV_OVERRIDES)).toBe(true)
    expect(getOrcaCloudAuthConfig({})).toMatchObject({ configured: false })
  })
})
