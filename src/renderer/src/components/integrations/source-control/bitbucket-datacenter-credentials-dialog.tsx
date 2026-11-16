import { useEffectEvent, useId, useLayoutEffect, useState } from 'react'
import { ExternalLink, LoaderCircle, Lock } from 'lucide-react'
import type { BitbucketDataCenterAuthMode } from '../../../../../shared/bitbucket-datacenter-credentials'
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
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { openAppHttpLink } from '@/lib/browser/navigation/app-http-link-open'
import { preventOutsideDismissWhenDirty } from '@/lib/overlay-interaction/outside-dismiss-guard'
import { bitbucketDataCenterConnectErrorText } from '@/lib/source-control/remote/bitbucket-datacenter-connect-error-copy'
import { useTranslate } from '@/i18n/use-translate'

const PAT_DOCS_URL =
  'https://confluence.atlassian.com/bitbucketserver/http-access-tokens-939515499.html'

type ConnectState = 'idle' | 'connecting' | 'error'

type BitbucketDataCenterCredentialsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialAuthMode?: BitbucketDataCenterAuthMode | null
  initialBaseUrl?: string | null
  initialAccount?: string | null
  environmentManaged?: boolean
  onConnected?: () => void
}

export function BitbucketDataCenterCredentialsDialog({
  open,
  onOpenChange,
  initialAuthMode,
  initialBaseUrl,
  initialAccount,
  environmentManaged = false,
  onConnected
}: BitbucketDataCenterCredentialsDialogProps): React.JSX.Element {
  const t = useTranslate()
  const mountedRef = useMountedRef()
  const baseUrlId = useId()
  const accessTokenId = useId()
  const usernameId = useId()
  const passwordId = useId()
  const errorId = useId()

  const [authMode, setAuthMode] = useState<BitbucketDataCenterAuthMode>('token')
  const [baseUrl, setBaseUrl] = useState('')
  const [accessToken, setAccessToken] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [connectState, setConnectState] = useState<ConnectState>('idle')
  const [connectError, setConnectError] = useState<string | null>(null)

  const seedFromProps = useEffectEvent(() => {
    setAuthMode(initialAuthMode ?? 'token')
    setBaseUrl(initialBaseUrl ?? '')
    setAccessToken('')
    setUsername(initialAccount ?? '')
    setPassword('')
    setConnectState('idle')
    setConnectError(null)
  })

  useLayoutEffect(() => {
    if (open) {
      seedFromProps()
    }
  }, [open])

  const locked = environmentManaged
  const connecting = connectState === 'connecting'
  const isTokenMode = authMode === 'token'
  const hasRequiredFields =
    Boolean(baseUrl.trim()) &&
    (isTokenMode ? Boolean(accessToken.trim()) : Boolean(username.trim()) && Boolean(password))
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

  const isDraftDirty = (): boolean =>
    baseUrl !== (initialBaseUrl ?? '') ||
    (isTokenMode ? accessToken !== '' : username !== (initialAccount ?? '') || password !== '')
  const guardOutsideDismiss = preventOutsideDismissWhenDirty(isDraftDirty)

  const handleConnect = async (): Promise<void> => {
    if (!canSubmit) {
      return
    }
    setConnectState('connecting')
    setConnectError(null)
    try {
      const result = await window.api.bitbucketDataCenter.connect(
        authMode === 'basic'
          ? {
              baseUrl: baseUrl.trim(),
              authMode: 'basic',
              username: username.trim(),
              password
            }
          : {
              baseUrl: baseUrl.trim(),
              authMode: 'token',
              accessToken: accessToken.trim()
            }
      )
      if (!mountedRef.current) {
        return
      }
      if (result.ok) {
        setAccessToken('')
        setPassword('')
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
              'Enter your Bitbucket Data Center server URL and choose an HTTP access token or ID/password (v8.x+).'
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
            <Label>
              {t('auto.components.settings.bitbucketDatacenter.dialog.authMethod', 'Auth method')}
            </Label>
            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              className="w-full"
              value={authMode}
              disabled={locked || connecting}
              onValueChange={(value) => {
                if (value === 'token' || value === 'basic') {
                  setAuthMode(value)
                  clearErrorOnEdit()
                }
              }}
            >
              <ToggleGroupItem value="token" className="flex-1">
                {t(
                  'auto.components.settings.bitbucketDatacenter.dialog.authModeToken',
                  'HTTP access token'
                )}
              </ToggleGroupItem>
              <ToggleGroupItem value="basic" className="flex-1">
                {t(
                  'auto.components.settings.bitbucketDatacenter.dialog.authModeBasic',
                  'ID / Password'
                )}
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

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

          {isTokenMode ? (
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
          ) : (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor={usernameId}>
                  {t('auto.components.settings.bitbucketDatacenter.dialog.username', 'Username')}
                </Label>
                <Input
                  id={usernameId}
                  type="text"
                  autoComplete="username"
                  spellCheck={false}
                  placeholder={t(
                    'auto.components.settings.bitbucketDatacenter.dialog.usernamePlaceholder',
                    'Enter your username'
                  )}
                  value={username}
                  disabled={locked || connecting}
                  onChange={(event) => {
                    setUsername(event.target.value)
                    clearErrorOnEdit()
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={passwordId}>
                  {t('auto.components.settings.bitbucketDatacenter.dialog.password', 'Password')}
                </Label>
                <Input
                  id={passwordId}
                  type="password"
                  autoComplete="current-password"
                  spellCheck={false}
                  placeholder={t(
                    'auto.components.settings.bitbucketDatacenter.dialog.passwordPlaceholder',
                    'Enter your password'
                  )}
                  value={password}
                  disabled={locked || connecting}
                  onChange={(event) => {
                    setPassword(event.target.value)
                    clearErrorOnEdit()
                  }}
                />
              </div>
            </div>
          )}

          <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <Lock className="size-3.5 mt-0.5 shrink-0" />
            <span>
              {t(
                'auto.components.settings.bitbucketDatacenter.dialog.remoteStorageHint',
                'Tokens are stored encrypted on this machine and used for Bitbucket Data Center API requests.'
              )}
            </span>
          </p>

          {connectError ? (
            <p id={errorId} role="alert" className="text-xs text-destructive">
              {connectError}
            </p>
          ) : null}

          <DialogFooter className={isTokenMode ? 'sm:justify-between' : 'sm:justify-end'}>
            {isTokenMode ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(event) => openAppHttpLink(PAT_DOCS_URL, { event })}
              >
                <ExternalLink className="size-3.5 mr-1.5" />
                {t('auto.components.settings.bitbucketDatacenter.dialog.tokenDocs', 'Token docs')}
              </Button>
            ) : null}
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
