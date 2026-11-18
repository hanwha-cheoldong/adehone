import React from 'react'
import { Button } from '@/components/ui/button'
import { useTranslate } from '@/i18n/use-translate'

export function ChecksPanelNoWorkspaceNotice(): React.JSX.Element {
  const t = useTranslate()
  return (
    <div className="px-4 py-6">
      <div className="text-sm font-medium text-foreground">
        {t('auto.components.right.sidebar.ChecksPanel.a4ef4e0832', 'No workspace selected')}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">
        {t(
          'auto.components.right.sidebar.ChecksPanel.b5dd73a105',
          'Select a workspace to view checks'
        )}
      </div>
    </div>
  )
}

export function ChecksPanelFolderNotice(): React.JSX.Element {
  const t = useTranslate()
  return (
    <div className="px-4 py-6">
      <div className="text-sm font-medium text-foreground">
        {t('auto.components.right.sidebar.ChecksPanel.976cefd02f', 'Checks unavailable')}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">
        {t(
          'auto.components.right.sidebar.ChecksPanel.dda5924a40',
          'Checks require a Git branch and hosted review context'
        )}
      </div>
    </div>
  )
}

export function ChecksPanelUnlinkedPrNotice({
  suppressedGitHubPR,
  onRelink
}: {
  suppressedGitHubPR: number | null
  onRelink: () => void
}): React.JSX.Element {
  const t = useTranslate()
  return (
    <div className="px-4 py-6">
      <div className="text-sm font-medium text-foreground">
        {t('checksPanel.unlinked.title', 'Pull request unlinked')}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">
        {t(
          'checksPanel.unlinked.description',
          'PR #{{number}} is hidden for this workspace. Link it again to restore checks and review details.',
          { number: suppressedGitHubPR }
        )}
      </div>
      <Button size="xs" className="mt-3" onClick={onRelink}>
        {t('checksPanel.unlinked.relink', 'Link PR #{{number}}', {
          number: suppressedGitHubPR
        })}
      </Button>
    </div>
  )
}
