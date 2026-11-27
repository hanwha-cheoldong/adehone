import React, { useState, useSyncExternalStore } from 'react'
import { useAppStore } from '@/store'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useTranslate } from '@/i18n/use-translate'
import {
  readBotHostListed,
  refreshBotHost,
  subscribeToLoadedBots,
  useBotsEnabled,
  useHostBots
} from '@/lib/bot-catalog'
import { useBotHostHas } from '@/lib/bot-host-status'
import { useOrcaTeamFeatureBlocked } from '@/lib/orca-team-policy'
import { BotRunsOnPicker } from '@/components/bots/BotRunsOnPicker'
import { useBotCreateHost } from '@/components/bots/bot-create-hosts'
import { useNewBotAgentMenu } from '@/components/bots/use-bot-agent-choices'
import { useBotAgentSetup } from '@/components/bots/use-bot-agent-setup'
import { ORCA_CLOUD_TEAM_POLICY_FLAGS } from '../../../../../../shared/orca-profiles/orca-cloud-team-policy'
import { BOTS_TEMPLATES_RUNTIME_CAPABILITY } from '../../../../../../shared/bot-runtime-capabilities'
import {
  MOBILE_BOT_KINDS,
  withMobileBotSelection,
  withoutMobileBotDesignation,
  type MobileBotKind
} from '../../../../../../shared/bots/mobile-bot-setup'
import { MobileBotKindRow } from './MobileBotKindRow'
import {
  mobileBotDraftPlan,
  savedMobileBotDraft,
  toggledMobileBotKind,
  unavailableMobileBots,
  withChosenMobileBot,
  type MobileBotDraft
} from './mobile-bot-setup-draft'
import {
  clearMobileBotOutcome,
  installMobileBots,
  isUnusableMobileBot,
  useMobileBotInstall
} from './mobile-bot-setup-install'

type Props = { done: boolean; onSkip: () => void }

export function MobileBotsSetupAction(props: Props): React.JSX.Element {
  const t = useTranslate()
  const botsEnabled = useBotsEnabled()
  const teamBlocked = useOrcaTeamFeatureBlocked(ORCA_CLOUD_TEAM_POLICY_FLAGS.bots)
  if (botsEnabled) {
    return <MobileBotsForm {...props} />
  }
  return (
    <div className="max-w-xl space-y-3">
      <p className="text-sm text-muted-foreground">
        {teamBlocked
          ? t('setupGuide.mobileBots.teamBlocked', 'Your team has turned bots off.')
          : t(
              'setupGuide.mobileBots.botsOff',
              'Bots are turned off. Turn on Enable bots in Settings › Bots to set these up.'
            )}
      </p>
      <Button type="button" variant="ghost" size="sm" onClick={props.onSkip}>
        {t('setupGuide.mobileBots.skip', 'Skip')}
      </Button>
    </div>
  )
}

function MobileBotsForm({ done, onSkip }: Props): React.JSX.Element {
  const t = useTranslate()
  const setup = useAppStore((state) => state.mobileBotSetup)
  const setSetup = useAppStore((state) => state.setMobileBotSetup)
  const hostChoice = useBotCreateHost(true, undefined, setup?.selection?.hostId)
  const { hostId, blocked, sleeping, waking } = hostChoice.host
  const menu = useNewBotAgentMenu(hostId, true)
  const agentSetup = useBotAgentSetup(menu, hostId)
  const templates = useBotHostHas(hostId, BOTS_TEMPLATES_RUNTIME_CAPABILITY)
  const listed = useSyncExternalStore(
    subscribeToLoadedBots,
    () => readBotHostListed(hostId),
    () => readBotHostListed(hostId)
  )
  const install = useMobileBotInstall()
  const bots = useHostBots(hostId).filter((bot) => !isUnusableMobileBot(hostId, bot.id))
  const [edited, setEdited] = useState<MobileBotDraft | null>(null)
  // Unedited, the form shows what is saved, so a late settings load or another computer needs no sync.
  const draft = edited?.hostId === hostId ? edited : savedMobileBotDraft(setup, hostId)
  const plan = mobileBotDraftPlan(draft, bots)
  const outcomes = install.outcomes[hostId]
  const running = install.runningHostId !== null
  const hasFailure = draft.kinds.some((kind) => outcomes?.[kind]?.status === 'failed')
  const creates = plan.toCreate.length > 0
  const savedHere = setup?.selection?.hostId === hostId
  const nothingToSave = draft.kinds.length === 0 && !savedHere
  // Only a confirm that makes no bot is a "save"; with nothing ticked or saved, the button still names the install.
  const savesOnly = !creates && (draft.kinds.length > 0 || savedHere)
  const cannotReach = Boolean(blocked || sleeping || waking) || hostChoice.busy
  const blockedReason = cannotReach
    ? t('setupGuide.mobileBots.hostUnavailable', 'Bots can’t be set up on this computer right now.')
    : !listed
      ? t('setupGuide.mobileBots.loadingList', 'The bot list for this computer isn’t loaded yet.')
      : creates && !templates
        ? t(
            'setupGuide.mobileBots.hostNeedsUpdate',
            'Update the app on this computer to create bots from templates.'
          )
        : creates && menu.choices.length === 0
          ? t('setupGuide.mobileBots.noAgent', 'No agent is available for a new bot here.')
          : null
  const confirmDisabled = running || nothingToSave || blockedReason !== null

  const confirm = (): void => {
    if (confirmDisabled) {
      return
    }
    setSetup(withMobileBotSelection(setup, hostId, draft.kinds, plan.designations))
    setEdited(null)
    void installMobileBots({
      hostId,
      kinds: draft.kinds,
      designations: plan.designations,
      agentSetup: agentSetup.setup
    })
  }

  const release = (kind: MobileBotKind): void => {
    if (!setup) {
      return
    }
    setSetup(withoutMobileBotDesignation(setup, hostId, kind))
    clearMobileBotOutcome(hostId, kind)
    const { [kind]: _released, ...designations } = draft.designations
    setEdited({ ...draft, designations })
  }

  const confirmLabel = running
    ? t('setupGuide.mobileBots.installing', 'Installing…')
    : hasFailure
      ? t('setupGuide.mobileBots.retry', 'Retry')
      : savesOnly
        ? t('setupGuide.mobileBots.save', 'Save selection')
        : t('setupGuide.mobileBots.install', 'Install selected bots')

  return (
    <div className="max-w-xl space-y-3">
      <BotRunsOnPicker
        hostChoice={hostChoice}
        setup={agentSetup.setup}
        model={menu.model}
        choices={menu.choices}
        onSetupChange={agentSetup.setSetup}
      />
      <fieldset aria-busy={running}>
        <legend className="sr-only">
          {t('setupGuide.mobileBots.legend', 'Mobile dev bots to set up')}
        </legend>
        <ul className="divide-y divide-border rounded-md border border-border">
          {MOBILE_BOT_KINDS.map((kind) => (
            <MobileBotKindRow
              key={kind}
              kind={kind}
              checked={draft.kinds.includes(kind)}
              bots={bots}
              listed={listed}
              draftBotId={plan.designations[kind]}
              savedBotId={setup?.designated[hostId]?.[kind]}
              unavailable={unavailableMobileBots(draft, kind, bots)}
              outcome={outcomes?.[kind]}
              locked={running}
              onCheckedChange={(checked) => setEdited(toggledMobileBotKind(draft, kind, checked))}
              onChooseBot={(botId) => setEdited(withChosenMobileBot(draft, kind, botId))}
              onReleaseBot={() => release(kind)}
            />
          ))}
        </ul>
      </fieldset>
      <p className="text-xs text-muted-foreground">
        {t(
          'setupGuide.mobileBots.originNote',
          'Bots made from these templates are found automatically. A bot you made yourself or got from a shared link counts only after you choose it here.'
        )}
      </p>
      {creates ? (
        <p className="text-xs text-muted-foreground">
          {t(
            'setupGuide.mobileBots.firstChatNote',
            'Each new bot starts its first chat on its own, which uses your agent’s usage.'
          )}
        </p>
      ) : null}
      <p role="status" aria-live="polite" className="text-xs text-muted-foreground empty:hidden">
        {running
          ? t('setupGuide.mobileBots.runningStatus', 'Setting up the selected bots…')
          : hasFailure
            ? t(
                'setupGuide.mobileBots.someFailed',
                'Some bots weren’t set up. Retry, or change the selection.'
              )
            : done && setup?.selection
              ? t('setupGuide.mobileBots.allPresent', 'Every selected bot is in the list.')
              : draft.kinds.length > 0
                ? blockedReason
                : null}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {/* aria-disabled keeps keyboard focus here while a run starts. */}
        <Button
          type="button"
          size="sm"
          aria-disabled={confirmDisabled}
          onClick={confirm}
          className="min-w-44"
        >
          {running ? <LoadingSpinner className="size-4" /> : null}
          {confirmLabel}
        </Button>
        {!done && !running ? (
          <Button type="button" variant="ghost" size="sm" onClick={onSkip}>
            {t('setupGuide.mobileBots.skip', 'Skip')}
          </Button>
        ) : null}
        {!listed && !cannotReach ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void refreshBotHost(hostId)}
          >
            {t('setupGuide.mobileBots.reloadList', 'Reload list')}
          </Button>
        ) : null}
      </div>
    </div>
  )
}
