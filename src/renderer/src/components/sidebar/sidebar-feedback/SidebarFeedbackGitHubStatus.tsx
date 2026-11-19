import React from 'react'
import { ExternalLink, Terminal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslate } from '@/i18n/use-translate'
import { openAppHttpLink } from '@/lib/browser/navigation/app-http-link-open'
import type { GitHubViewer } from '../../../../../shared/github/pull-requests/pull-request-types'
import {
  ADEHONE_GITHUB_OWNER,
  ADEHONE_GITHUB_REPO
} from '../../../../../shared/feedback/adehone-feedback-issue'

const GH_CLI_INSTALL_URL = 'https://cli.github.com'
const GH_AUTH_LOGIN_DOCS_URL = 'https://cli.github.com/manual/gh_auth_login'
const GH_AUTH_LOGIN_COMMAND = 'gh auth login'

export type FeedbackGhCliStatus =
  | 'checking'
  | 'connected'
  | 'not-installed'
  | 'not-authenticated'
  | 'unavailable'

type SidebarFeedbackGitHubStatusProps = {
  status: FeedbackGhCliStatus
  viewer: GitHubViewer | null
  isRechecking: boolean
  onRecheck: () => void
}

export function SidebarFeedbackGitHubStatus({
  status,
  viewer,
  isRechecking,
  onRecheck
}: SidebarFeedbackGitHubStatusProps): React.JSX.Element {
  const t = useTranslate()

  if (status === 'connected' && viewer) {
    return (
      <div className="min-h-9 rounded-md border border-border/70 bg-muted/30 px-3 py-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>
            {t('auto.components.sidebar.SidebarFeedbackDialog.c9e5ea0791', 'GitHub:')}{' '}
            <span className="font-mono text-foreground">
              {viewer.login}
              {viewer.email ? ` (${viewer.email})` : ''}
            </span>
          </span>
          <span>
            {t(
              'auto.components.sidebar.SidebarFeedbackDialog.submitsToAdehoneRepo',
              'Creates an issue in {{repo}}',
              { repo: `${ADEHONE_GITHUB_OWNER}/${ADEHONE_GITHUB_REPO}` }
            )}
          </span>
        </div>
      </div>
    )
  }

  if (status === 'checking') {
    return (
      <div className="min-h-9 rounded-md border border-border/70 bg-muted/30 px-3 py-2">
        <div className="text-xs text-muted-foreground">
          {t(
            'auto.components.sidebar.SidebarFeedbackDialog.d20439c560',
            'Checking GitHub identity…'
          )}
        </div>
      </div>
    )
  }

  if (status === 'not-installed') {
    return (
      <div className="space-y-2 rounded-md border border-border/70 bg-muted/30 px-3 py-2 text-xs">
        <div className="font-medium text-foreground">
          {t(
            'auto.components.sidebar.SidebarFeedbackDialog.ghNotInstalledTitle',
            'GitHub CLI (gh) is not installed'
          )}
        </div>
        <p className="text-muted-foreground">
          {t(
            'auto.components.sidebar.SidebarFeedbackDialog.ghNotInstalledDescription',
            'Install GitHub CLI and sign in to submit feedback with screenshots directly to Adehone. Without it, sending opens the GitHub issue form in your browser.'
          )}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(event) => openAppHttpLink(GH_CLI_INSTALL_URL, { event })}
          >
            <ExternalLink className="size-3.5" />
            {t('auto.components.sidebar.SidebarFeedbackDialog.installGhCli', 'Install GitHub CLI')}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isRechecking}
            onClick={onRecheck}
          >
            {t('auto.components.sidebar.SidebarFeedbackDialog.recheckGhCli', 'Re-check')}
          </Button>
        </div>
      </div>
    )
  }

  if (status === 'not-authenticated') {
    return (
      <div className="space-y-2 rounded-md border border-border/70 bg-muted/30 px-3 py-2 text-xs">
        <div className="font-medium text-foreground">
          {t(
            'auto.components.sidebar.SidebarFeedbackDialog.ghNotAuthenticatedTitle',
            'GitHub CLI is not signed in'
          )}
        </div>
        <p className="text-muted-foreground">
          {t(
            'auto.components.sidebar.SidebarFeedbackDialog.ghNotAuthenticatedDescription',
            'Run this command in a terminal to submit directly from Adehone, or continue in your browser:'
          )}
        </p>
        <div className="flex items-center gap-2 rounded border border-border/70 bg-background px-2.5 py-1.5 font-mono text-xs text-foreground">
          <Terminal className="size-3.5 shrink-0 text-muted-foreground" />
          <span>{GH_AUTH_LOGIN_COMMAND}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(event) => openAppHttpLink(GH_AUTH_LOGIN_DOCS_URL, { event })}
          >
            <ExternalLink className="size-3.5" />
            {t('auto.components.sidebar.SidebarFeedbackDialog.ghAuthGuide', 'Auth guide')}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isRechecking}
            onClick={onRecheck}
          >
            {t('auto.components.sidebar.SidebarFeedbackDialog.recheckGhCli', 'Re-check')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-9 rounded-md border border-border/70 bg-muted/30 px-3 py-2">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>
          {t(
            'auto.components.sidebar.SidebarFeedbackDialog.ghUnavailable',
            'GitHub CLI status is unavailable. Sending will open the GitHub issue form in your browser.'
          )}
        </span>
        <Button type="button" variant="ghost" size="sm" disabled={isRechecking} onClick={onRecheck}>
          {t('auto.components.sidebar.SidebarFeedbackDialog.recheckGhCli', 'Re-check')}
        </Button>
      </div>
    </div>
  )
}
