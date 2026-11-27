import { parseMobileBotSetup } from '../../../../../shared/bots/mobile-bot-setup'
import type { PersistedUIState } from '../../../../../shared/orca-profiles/persisted-ui-state-types'
import type { UISlice } from './ui-slice-contract'

export function hydrateSetupGuide(
  ui: PersistedUIState
): Pick<
  UISlice,
  | 'setupGuideSidebarDismissed'
  | 'setupGuideBrowserMilestoneMigrated'
  | 'setupGuideBrowserMilestoneLegacyComplete'
  | 'mobileBotSetup'
> {
  return {
    setupGuideSidebarDismissed: ui.setupGuideSidebarDismissed === true,
    setupGuideBrowserMilestoneMigrated: ui.setupGuideBrowserMilestoneMigrated === true,
    setupGuideBrowserMilestoneLegacyComplete: ui.setupGuideBrowserMilestoneLegacyComplete === true,
    mobileBotSetup: parseMobileBotSetup(ui.mobileBotSetup) ?? null
  }
}
