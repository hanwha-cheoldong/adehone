import { ipcRenderer } from 'electron'
import type { PreloadApi } from '../api-types'
import type {
  BitbucketDataCenterConnectArgs,
  BitbucketDataCenterConnectResult
} from '../../shared/bitbucket-datacenter-credentials'

export const bitbucketDataCenterApi = {
  connect: (args: BitbucketDataCenterConnectArgs): Promise<BitbucketDataCenterConnectResult> =>
    ipcRenderer.invoke('bitbucket-datacenter:connect', args),

  disconnect: (baseUrl?: string | null): Promise<void> =>
    ipcRenderer.invoke('bitbucket-datacenter:disconnect', baseUrl ?? null),

  status: () => ipcRenderer.invoke('bitbucket-datacenter:status')
} satisfies PreloadApi['bitbucketDataCenter']
