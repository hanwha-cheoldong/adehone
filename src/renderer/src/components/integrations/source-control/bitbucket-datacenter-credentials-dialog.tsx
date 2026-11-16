import { useEffectEvent, useId, useLayoutEffect, useRef, useState } from 'react'
import { ExternalLink, LoaderCircle, Lock } from 'lucide-react'
import { useAppStore } from '@/store/index'
import { useMountedRef } from '@/hooks/useMountedRef'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { hasRemoteProviderRuntime } from '@/runtime/hosts/observations/provider-runtime-context'
import { preventOutsideDismissWhenDirty } from '@/lib/overlay-interaction/outside-dismiss-guard'
import { bitbucketDataCenterConnectErrorText } from '@/lib/source-control/remote/bitbucket-datacenter-connect-error-copy'
import { useTranslate } from '@/i18n/use-translate'

const PAT_DOCS_URL =
  'https://confluence.atlassian.com/bitbucketserver/http-access-tokens-939515499.html'

type ConnectState = 'idle' | 'connecting' | 'error'

type BitbucketDataCenterCredentialsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialBaseUrl?: string | null
  environmentManaged?: boolean
  onConnected?: () => void
}

export function BitbucketDataCenterCredentialsDialog({
  open,
  onOpenChange,
  initialBaseUrl,
  environmentManaged = false,
  onConnected
}: BitbucketDataCenterCredentialsDialogProps): React.JSX.Element {
  const t = useTranslate()
  const settings = useAppStore((s) => s.settings)
  const mountedRef = useMountedRef()
  const baseUrlId = useId()
  const accessTokenId = useId()
  const errorId = useId()

  const [baseUrl, setBaseUrl] = useState('')
  const [accessToken, setAccessToken] = useState('')
  const [connectState, setConnectState] = useState<ConnectState>('idle')
  const [connectError, setConnectError] = useState<string | null>(null)
  const baselineRef = useRef({ baseUrl: '' })

  const seedFromProps = useEffectEvent(() => {
    const seedBaseUrl = initialBaseUrl ?? ''
    baselineRef.current = { baseUrl: seedBaseUrl }
    setBaseUrl(seedBaseUrl)
    setAccessToken('')
    setConnectState('idle')
    setConnectError(null)
  })

  useLayoutEffect(() => {
    if (open) {
      seedFromProps()
    }
  }, [open])

  const remoteRuntime = hasRemoteProviderRuntime(settings)
  const locked = environmentManaged
  const connecting = connectState === 'connecting'
  const hasRequiredFields = Boolean(baseUrl.trim()) && Boolean(accessToken.trim())
  const canSubmit = !locked && !connecting && hasRequiredFields

  const clearErrorOnEdit = (): void => {
    if (connectState === 'error') {
      setConnectState('idle')
      setConnectError(null)
    }
  }

  const handleOpenChange = (nextOpen: boolean): void => {
    if (!connecting) {
      onOpenChange(nextOpen)
    }
  }

  const isDraftDirty = (): boolean => baseUrl !== baselineRef.current.baseUrl || accessToken !== ''
  const guardOutsideDismiss = preventOutsideDismissWhenDirty(isDraftDirty)

  const handleConnect = async (): Promise<void> => {
    if (!canSubmit) {
      return
    }
    setConnectState('connecting')
    setConnectError(null)
    try {
      const result = await window.api.bitbucketDataCenter.connect({
        baseUrl: baseUrl.trim(),
        accessToken: accessToken.trim()
      })
      if (!mountedRef.current) {
        return
      }
      if (result.ok) {
        setAccessToken('')
        setConnectState('idle')
        onOpenChange(false)
        onConnected?.()
        return
      }
      setConnectState('error')
      setConnectError(bitbucketDataCenterConnectErrorText(result))
    } catch (error) {
      if (mountedRef.current) {
        setConnectState('error')
        setConnectError(
          error instanceof Error
            ? error.message
            : t(
                'auto.components.settings.bitbucketDatacenter.dialog.connectFailed',
                'Could not connect to Bitbucket Data Center.'
              )
        )
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-[440px]"
        onEscapeKeyDown={(event) => {
          if (connecting) {
            event.preventDefault()
          }
        }}
        onPointerDownOutside={guardOutsideDismiss}
        onInteractOutside={guardOutsideDismiss}
      >
        <DialogHeader>
          <DialogTitle>
            {initialBaseUrl
              ? t(
                  'auto.components.settings.bitbucketDatacenter.dialog.editTitle',
                  'Edit Bitbucket Data Center server'
                )
              : t(
                  'auto.components.settings.bitbucketDatacenter.dialog.title',
                  'Connect Bitbucket Data Center'
                )}
          </DialogTitle>
          <DialogDescription>
            {t(
              'auto.components.settings.bitbucketDatacenter.dialog.description',
              'Enter your Bitbucket Data Center server URL and an HTTP access token (v8.x+).'
            )}
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4 py-1"
          onSubmit={(event) => {
            event.preventDefault()
            void handleConnect()
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor={baseUrlId}>
              {t('auto.components.settings.bitbucketDatacenter.dialog.serverUrl', 'Server URL')}
            </Label>
            <Input
              id={baseUrlId}
              type="url"
              autoComplete="off"
              spellCheck={false}
              placeholder={t(
                'auto.components.settings.bitbucketDatacenter.dialog.serverUrlPlaceholder',
                'https://bitbucket.example.com'
              )}
              value={baseUrl}
              disabled={locked || connecting}
              onChange={(event) => {
                setBaseUrl(event.target.value)
                clearErrorOnEdit()
              }}
            />
            <p className="text-xs text-muted-foreground">
              {t(
                'auto.components.settings.bitbucketDatacenter.dialog.serverUrlHint',
                'Include any context path if configured (for example, https://git.example.com/bitbucket).'
              )}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={accessTokenId}>
              {t(
                'auto.components.settings.bitbucketDatacenter.dialog.accessToken',
                'HTTP access token'
              )}
            </Label>
            <Input
              id={accessTokenId}
              type="password"
              autoComplete="off"
              spellCheck={false}
              placeholder={t(
                'auto.components.settings.bitbucketDatacenter.dialog.accessTokenPlaceholder',
                'Enter your personal access token'
              )}
              value={accessToken}
              disabled={locked || connecting}
              onChange={(event) => {
                setAccessToken(event.target.value)
                clearErrorOnEdit()
              }}
            />
            <p className="text-xs text-muted-foreground">
              {t(
                'auto.components.settings.bitbucketDatacenter.dialog.permissionsHint',
                'Required permissions: Project read and Repository read (Repository write to create pull requests).'
              )}
            </p>
          </div>

          {remoteRuntime ? (
            <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <Lock className="size-3.5 mt-0.5 shrink-0" />
              <span>
                {t(
                  'auto.components.settings.bitbucketDatacenter.dialog.remoteStorageHint',
                  'Tokens are stored encrypted on this machine and used for Bitbucket Data Center API requests.'
                )}
              </span>
            </p>
          ) : null}

          {connectError ? (
            <p id={errorId} role="alert" className="text-xs text-destructive">
              {connectError}
            </p>
          ) : null}

          <DialogFooter className="sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => window.api.shell.openUrl(PAT_DOCS_URL)}
            >
              <ExternalLink className="size-3.5 mr-1.5" />
              {t('auto.components.settings.bitbucketDatacenter.dialog.tokenDocs', 'Token docs')}
            </Button>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={connecting}
                onClick={() => handleOpenChange(false)}
              >
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button type="submit" disabled={!canSubmit}>
                {connecting ? <LoaderCircle className="size-3.5 mr-1.5 animate-spin" /> : null}
                {t('auto.components.settings.bitbucketDatacenter.dialog.connect', 'Connect')}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
