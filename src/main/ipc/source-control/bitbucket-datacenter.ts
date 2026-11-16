import { ipcMain } from 'electron'
import {
  connectBitbucketDataCenter,
  disconnectBitbucketDataCenter,
  getBitbucketDataCenterConnectionStatus
} from '../../bitbucket-datacenter/credential-connection'
import { _resetPreflightCache } from '../../preflight/agent-detection'
import {
  type BitbucketDataCenterConnectArgs,
  type BitbucketDataCenterConnectResult,
  type BitbucketDataCenterConnectionStatus,
  bitbucketDataCenterConnectFailure
} from '../../../shared/bitbucket-datacenter-credentials'

function normalizeConnectInput(value: unknown): BitbucketDataCenterConnectArgs | null {
  if (!value || typeof value !== 'object') {
    return null
  }
  const raw = value as Record<string, unknown>
  if (typeof raw.baseUrl !== 'string' || typeof raw.accessToken !== 'string') {
    return null
  }
  return {
    baseUrl: raw.baseUrl,
    accessToken: raw.accessToken
  }
}

export function registerBitbucketDataCenterHandlers(): void {
  ipcMain.handle(
    'bitbucket-datacenter:connect',
    async (_event, args: unknown): Promise<BitbucketDataCenterConnectResult> => {
      const input = normalizeConnectInput(args)
      if (!input) {
        return bitbucketDataCenterConnectFailure('invalidInput')
      }
      const result = await connectBitbucketDataCenter(input)
      if (result.ok) {
        // Refresh cached source-control preflight so reconnection needs no relaunch.
        _resetPreflightCache()
      }
      return result
    }
  )

  ipcMain.handle(
    'bitbucket-datacenter:disconnect',
    async (_event, baseUrl?: unknown): Promise<void> => {
      disconnectBitbucketDataCenter(typeof baseUrl === 'string' ? baseUrl : null)
      _resetPreflightCache()
    }
  )

  ipcMain.handle(
    'bitbucket-datacenter:status',
    async (): Promise<BitbucketDataCenterConnectionStatus> => {
      return getBitbucketDataCenterConnectionStatus()
    }
  )
}
