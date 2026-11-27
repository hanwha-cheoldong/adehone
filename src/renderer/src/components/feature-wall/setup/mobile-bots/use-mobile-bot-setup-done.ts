import { useSyncExternalStore } from 'react'
import { readHostBots, subscribeToLoadedBots, useBotsEnabled } from '@/lib/bot-catalog'
import { useAppStore } from '@/store'
import { isMobileBotSetupDone } from '../../../../../../shared/bots/mobile-bot-setup'
import {
  isUnusableMobileBot,
  readMobileBotInstall,
  subscribeToMobileBotInstall
} from './mobile-bot-setup-install'

const subscribeToNothing = (): (() => void) => () => {}

/** Whether the checklist's mobile bot step is done, from the live bot lists. A boolean, so its readers
 *  render again only when it flips. */
export function useMobileBotSetupDone(enabled: boolean): boolean {
  const setup = useAppStore((state) => state.mobileBotSetup)
  const botsEnabled = useBotsEnabled()
  const active = enabled && botsEnabled
  const read = (): boolean => {
    if (!active) {
      return false
    }
    const selection = setup?.selection
    if (selection) {
      const { runningHostId, outcomes } = readMobileBotInstall()
      // A run still going, or a failure it reported, outranks a bot the list already shows.
      if (
        runningHostId === selection.hostId ||
        selection.kinds.some((kind) => outcomes[selection.hostId]?.[kind]?.status === 'failed')
      ) {
        return false
      }
    }
    return isMobileBotSetupDone(setup, readHostBots, isUnusableMobileBot)
  }
  return useSyncExternalStore(active ? subscribe : subscribeToNothing, read, read)
}

function subscribe(listener: () => void): () => void {
  const stopBots = subscribeToLoadedBots(listener)
  const stopInstall = subscribeToMobileBotInstall(listener)
  return () => {
    stopBots()
    stopInstall()
  }
}
