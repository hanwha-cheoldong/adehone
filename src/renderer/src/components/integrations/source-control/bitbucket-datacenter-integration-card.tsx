import { useCallback, useEffect, useRef, useState } from 'react'
import { GitPullRequestArrow, LoaderCircle, Plus, Unlink } from 'lucide-react'
import type { BitbucketDataCenterConnectionStatus } from '../../../../../shared/bitbucket-datacenter-credentials'
import { Button } from '@/components/ui/button'
import { useMountedRef } from '@/hooks/useMountedRef'
import { readIpcErrorMessage } from '@/runtime/errors/ipc-error'
import { UnsealedCredentialNotice } from '../../provider-accounts/UnsealedCredentialNotice'
import {
  IntegrationCardDetails,
  IntegrationCardShell
} from '../presentation/integration-card-shell'
import { useIntegrationSubordinateRowClass } from '../presentation/integration-card-presentation'
import { usePreflightCardStatuses } from './source-control-preflight-card-status'
import { tokenProviderStatusLabel } from './token-source-control-status'
import { BitbucketDataCenterCredentialsDialog } from './bitbucket-datacenter-credentials-dialog'
import { useTranslate } from '@/i18n/use-translate'

export function BitbucketDataCenterIntegrationCard(): React.JSX.Element {
  const t = useTranslate()
  const { statuses, unavailable, refresh } = usePreflightCardStatuses('bitbucketDataCenter')
  const status = unavailable ? 'unavailable' : statuses.bitbucketDataCenterStatus
  const connected = status === 'connected'
  const mountedRef = useMountedRef()
  const subordinateRowClass = useIntegrationSubordinateRowClass('flex items-center gap-3')
  const [connection, setConnection] = useState<BitbucketDataCenterConnectionStatus | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingBaseUrl, setEditingBaseUrl] = useState<string | null>(null)
  const [disconnectingUrl, setDisconnectingUrl] = useState<string | null>(null)
  const [disconnectError, setDisconnectError] = useState<string | null>(null)
  const [connectionLoadFailed, setConnectionLoadFailed] = useState(false)
  const connectionLoadGenerationRef = useRef(0)

  const loadConnection = useCallback(async () => {
    const generation = ++connectionLoadGenerationRef.current
    try {
      const next = await window.api.bitbucketDataCenter.status()
      if (mountedRef.current && generation === connectionLoadGenerationRef.current) {
        setConnection(next)
        setConnectionLoadFailed(false)
      }
    } catch {
      if (mountedRef.current && generation === connectionLoadGenerationRef.current) {
        setConnectionLoadFailed(true)
      }
    }
  }, [mountedRef])

  useEffect(() => {
    void loadConnection()
  }, [loadConnection])

  const currentConnection = connectionLoadFailed ? null : connection
  const credentialStatusKnown = currentConnection !== null
  const servers = currentConnection?.servers ?? []
  const envServer = currentConnection?.envServer ?? null

  const reloadCardState = (): void => {
    void loadConnection()
    refresh()
  }

  const openAddServerDialog = (): void => {
    setEditingBaseUrl(null)
    setDialogOpen(true)
  }

  const openEditServerDialog = (baseUrl: string): void => {
    setEditingBaseUrl(baseUrl)
    setDialogOpen(true)
  }

  const handleDisconnectServer = async (baseUrl: string): Promise<void> => {
    setDisconnectingUrl(baseUrl)
    setDisconnectError(null)
    try {
      await window.api.bitbucketDataCenter.disconnect(baseUrl)
    } catch (error) {
      if (mountedRef.current) {
        setDisconnectError(
          readIpcErrorMessage(error) ??
            t(
              'auto.components.settings.bitbucketDatacenter.card.disconnectFailed',
              'Could not remove the saved Bitbucket Data Center credential.'
            )
        )
      }
    } finally {
      if (mountedRef.current) {
        setDisconnectingUrl(null)
      }
      reloadCardState()
    }
  }

  const summaryDescription = connected
    ? servers.length > 1
      ? t(
          'auto.components.settings.bitbucketDatacenter.card.connectedMultiple',
          '{{count}} servers connected · Pull requests and build statuses',
          { count: servers.length }
        )
      : (servers[0]?.account ?? envServer?.baseUrl)
        ? t(
            'auto.components.settings.token.source.control.integration.cards.ea204f5e03',
            '{{value0}} · Pull requests and build statuses',
            { value0: servers[0]?.account ?? envServer?.baseUrl ?? '' }
          )
        : t(
            'auto.components.settings.token.source.control.integration.cards.0fa5629dad',
            'Pull requests and build statuses'
          )
    : t(
        'auto.components.settings.bitbucketDatacenter.card.description',
        'Pull requests and build statuses for self-hosted Bitbucket Data Center (v8.19+).'
      )

  return (
    <IntegrationCardShell
      icon={<GitPullRequestArrow className="size-5" />}
      name="Bitbucket Data Center"
      description={summaryDescription}
      checking={status === 'checking'}
      statusTone={connected ? 'connected' : 'attention'}
      statusLabel={tokenProviderStatusLabel({ configured: connected, status }, t)}
      actions={
        status !== 'checking' && (credentialStatusKnown || connectionLoadFailed) ? (
          <Button
            variant={connected ? 'outline' : 'default'}
            size="sm"
            onClick={openAddServerDialog}
          >
            {connected ? <Plus className="size-3.5 mr-1.5" /> : null}
            {connected
              ? t('auto.components.settings.bitbucketDatacenter.card.addServer', 'Add server')
              : t('auto.components.settings.bitbucketDatacenter.card.connect', 'Connect')}
          </Button>
        ) : null
      }
    >
      {status !== 'checking' ? (
        <IntegrationCardDetails>
          <UnsealedCredentialNotice
            protection={currentConnection?.credentialProtection ?? null}
            credentialName={t(
              'auto.components.settings.bitbucketDatacenter.card.credentialName',
              'Your Bitbucket Data Center credential'
            )}
          />

          {envServer ? (
            <div className={subordinateRowClass}>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{envServer.baseUrl}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {t(
                    'auto.components.settings.bitbucketDatacenter.card.envConfigured',
                    'Managed by ORCA_BITBUCKET_DC_URL and ORCA_BITBUCKET_DC_TOKEN'
                  )}
                </p>
              </div>
            </div>
          ) : null}

          {servers.map((server) => (
            <div key={server.baseUrl} className={subordinateRowClass}>
              <button
                type="button"
                onClick={() => openEditServerDialog(server.baseUrl)}
                className="min-w-0 flex-1 text-left transition-opacity hover:opacity-80"
              >
                <p className="truncate text-sm font-medium text-foreground">{server.baseUrl}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {[
                    server.account,
                    server.serverVersion ? `Bitbucket ${server.serverVersion}` : null
                  ]
                    .filter(Boolean)
                    .join(' · ') ||
                    t(
                      'auto.components.settings.bitbucketDatacenter.card.tokenSaved',
                      'Personal access token saved'
                    )}
                </p>
              </button>
              <button
                type="button"
                onClick={() => void handleDisconnectServer(server.baseUrl)}
                disabled={disconnectingUrl === server.baseUrl}
                aria-label={t(
                  'auto.components.settings.bitbucketDatacenter.card.disconnect',
                  'Disconnect {{url}}',
                  { url: server.baseUrl }
                )}
                className="rounded-md p-1 text-muted-foreground/50 transition-colors hover:text-destructive"
              >
                {disconnectingUrl === server.baseUrl ? (
                  <LoaderCircle className="size-3.5 animate-spin" />
                ) : (
                  <Unlink className="size-3.5" />
                )}
              </button>
            </div>
          ))}

          {disconnectError ? <p className="text-xs text-destructive">{disconnectError}</p> : null}

          {connectionLoadFailed ? (
            <p role="alert" className="text-xs text-destructive">
              {t(
                'auto.components.settings.bitbucketDatacenter.card.statusLoadFailed',
                'Could not check for saved Bitbucket Data Center credentials.'
              )}
            </p>
          ) : null}

          {credentialStatusKnown && !connected ? (
            <p className="text-xs text-muted-foreground">
              {status === 'unavailable'
                ? t(
                    'auto.components.settings.bitbucketDatacenter.card.unavailable',
                    'Bitbucket Data Center status is not available in this runtime yet.'
                  )
                : t(
                    'auto.components.settings.bitbucketDatacenter.card.hint',
                    'Connect one or more self-hosted Bitbucket Data Center servers using an HTTP access token.'
                  )}
            </p>
          ) : null}

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={reloadCardState}>
              {t(
                'auto.components.settings.token.source.control.integration.cards.793a06e899',
                'Re-check'
              )}
            </Button>
          </div>
        </IntegrationCardDetails>
      ) : null}

      <BitbucketDataCenterCredentialsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialBaseUrl={editingBaseUrl}
        environmentManaged={false}
        onConnected={reloadCardState}
      />
    </IntegrationCardShell>
  )
}
