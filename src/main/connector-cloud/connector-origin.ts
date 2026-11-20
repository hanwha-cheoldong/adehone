import { cleanCloudServiceOrigin } from '../../shared/network/cloud-service-url'

export const DEFAULT_CONNECTOR_ORIGIN = ''

export function resolveConnectorOrigin(env: NodeJS.ProcessEnv, packaged: boolean): string {
  return cleanCloudServiceOrigin(env.ORCA_CONNECTOR_URL, !packaged) ?? DEFAULT_CONNECTOR_ORIGIN
}
