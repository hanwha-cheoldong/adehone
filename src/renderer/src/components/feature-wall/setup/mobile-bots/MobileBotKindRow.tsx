import React, { useId } from 'react'
import { CircleAlert, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useTranslate, type Translate } from '@/i18n/use-translate'
import type { Bot } from '../../../../../../shared/bot-types'
import { botTemplateWord } from '../../../../../../shared/bots/bot-template-text'
import { botTemplate } from '../../../../../../shared/bots/bot-templates'
import { findMobileBot, type MobileBotKind } from '../../../../../../shared/bots/mobile-bot-setup'
import type { MobileBotUnavailable } from './mobile-bot-setup-draft'
import type { MobileBotFailure, MobileBotOutcome } from './mobile-bot-setup-install'

const NEW_BOT_VALUE = '__new__'

function mobileBotKindName(kind: MobileBotKind, t: Translate): string {
  const template = botTemplate(kind)
  return template ? botTemplateWord(template, 'name', t) : kind
}

function unavailableText({ reason, kind }: MobileBotUnavailable, t: Translate): string {
  const name = mobileBotKindName(kind, t)
  return reason === 'chosen'
    ? t('setupGuide.mobileBots.takenByChoice', 'Already chosen for {{kind}}', { kind: name })
    : t('setupGuide.mobileBots.takenByTemplate', 'Made from the {{kind}} template', { kind: name })
}

function failureText(failure: MobileBotFailure, t: Translate): string {
  switch (failure.code) {
    case 'create':
      return t('setupGuide.mobileBots.failed', 'Install failed: {{reason}}', {
        reason: failure.message
      })
    case 'designation-missing':
      return t(
        'setupGuide.mobileBots.failedChosenMissing',
        'The bot you chose is no longer in the list. Choose again, then retry.'
      )
    case 'partly-made':
      return t(
        'setupGuide.mobileBots.failedPartlyMade',
        'Install failed and left a partly made bot, {{name}}. Delete it from Bots, then retry.',
        { name: failure.botName }
      )
    case 'no-template-origin':
      return t(
        'setupGuide.mobileBots.failedNoTemplate',
        'This computer doesn’t have this template, so {{name}} was made without it. Update the app there, or choose another computer.',
        { name: failure.botName }
      )
    case 'unverified':
      return t(
        'setupGuide.mobileBots.failedUnverified',
        'Couldn’t confirm this bot in the list. Retry to check again.'
      )
  }
}

export type MobileBotKindRowProps = {
  kind: MobileBotKind
  checked: boolean
  /** The listed bots of the picked computer. */
  bots: readonly Bot[]
  listed: boolean
  /** The bot named in this draft, and the one saved as named. */
  draftBotId: string | undefined
  savedBotId: string | undefined
  /** The listed bots that already cover another kind, by id. */
  unavailable: ReadonlyMap<string, MobileBotUnavailable>
  outcome: MobileBotOutcome | undefined
  locked: boolean
  onCheckedChange: (checked: boolean) => void
  onChooseBot: (botId: string | undefined) => void
  onReleaseBot: () => void
}

export function MobileBotKindRow(props: MobileBotKindRowProps): React.JSX.Element {
  const t = useTranslate()
  const id = useId()
  const statusId = `${id}-status`
  const failureId = `${id}-failure`
  const unavailableId = `${id}-unavailable`
  const { kind, bots, outcome, savedBotId } = props
  const name = mobileBotKindName(kind, t)
  const fromTemplate = findMobileBot(kind, bots, undefined)?.bot
  const chosen = bots.find((bot) => bot.id === props.draftBotId)
  const savedBot = bots.find((bot) => bot.id === savedBotId)
  const busy = outcome?.status === 'installing' || outcome?.status === 'queued'
  const choosable = props.checked && props.listed && !fromTemplate && bots.length > 0
  const unavailableBots = bots.filter((bot) => props.unavailable.has(bot.id))

  let status: string | null = null
  if (outcome?.status === 'installing') {
    status = t('setupGuide.mobileBots.installing', 'Installing…')
  } else if (outcome?.status === 'queued') {
    status = t('setupGuide.mobileBots.queued', 'Waiting to install')
  } else if (props.listed && fromTemplate) {
    status =
      outcome?.status === 'created'
        ? t('setupGuide.mobileBots.installed', 'Installed: {{name}}', { name: fromTemplate.name })
        : t('setupGuide.mobileBots.alreadyHave', 'Already here: {{name}}', {
            name: fromTemplate.name
          })
  } else if (props.listed && savedBotId && !savedBot) {
    status = t(
      'setupGuide.mobileBots.chosenMissing',
      'The bot you chose before isn’t in this list.'
    )
  } else if (props.listed && savedBot && props.unavailable.has(savedBot.id)) {
    status = t(
      'setupGuide.mobileBots.chosenTaken',
      'The bot you chose before covers another kind now.'
    )
  } else if (props.listed && savedBot) {
    status = t('setupGuide.mobileBots.usingChosen', 'Using your bot: {{name}}', {
      name: savedBot.name
    })
  }

  return (
    <li className="space-y-2 px-3 py-2.5">
      <div className="flex items-start gap-2.5">
        <Checkbox
          id={id}
          checked={props.checked}
          disabled={props.locked}
          onCheckedChange={(next) => props.onCheckedChange(next === true)}
          aria-describedby={
            [status ? statusId : null, outcome?.status === 'failed' ? failureId : null]
              .filter(Boolean)
              .join(' ') || undefined
          }
          className="mt-0.5"
        />
        <div className="min-w-0 flex-1 space-y-0.5">
          <Label htmlFor={id} variant="control">
            {name}
          </Label>
          {status ? (
            <p
              id={statusId}
              className="flex items-center gap-1.5 text-xs break-words text-muted-foreground"
            >
              {busy ? <LoadingSpinner className="size-3.5" /> : null}
              {!busy && fromTemplate ? <Check aria-hidden className="size-3.5 shrink-0" /> : null}
              {status}
            </p>
          ) : null}
          {outcome?.status === 'failed' ? (
            <p
              id={failureId}
              role="alert"
              className="flex items-start gap-1.5 text-xs text-destructive"
            >
              <CircleAlert aria-hidden className="mt-px size-3.5 shrink-0" />
              <span className="min-w-0 break-words">{failureText(outcome.failure, t)}</span>
            </p>
          ) : null}
        </div>
        {savedBotId && !fromTemplate ? (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            disabled={props.locked}
            onClick={props.onReleaseBot}
            aria-label={t(
              'setupGuide.mobileBots.releaseNamed',
              'Stop using the chosen bot for {{name}}',
              {
                name
              }
            )}
          >
            {t('setupGuide.mobileBots.release', 'Stop using')}
          </Button>
        ) : null}
      </div>
      {choosable ? (
        <div className="space-y-1.5 pl-6.5">
          <Select
            value={chosen ? chosen.id : NEW_BOT_VALUE}
            disabled={props.locked}
            onValueChange={(value) =>
              props.onChooseBot(value === NEW_BOT_VALUE ? undefined : value)
            }
          >
            <SelectTrigger
              size="sm"
              className="w-full max-w-sm"
              aria-label={t('setupGuide.mobileBots.botFor', 'Bot to use for {{name}}', { name })}
              aria-describedby={unavailableBots.length > 0 ? unavailableId : undefined}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" align="start">
              <SelectItem value={NEW_BOT_VALUE}>
                {t('setupGuide.mobileBots.createNew', 'Create a new bot')}
              </SelectItem>
              {bots.map((bot) => {
                const taken = props.unavailable.get(bot.id)
                return (
                  <SelectItem
                    key={bot.id}
                    value={bot.id}
                    disabled={Boolean(taken)}
                    description={taken ? unavailableText(taken, t) : undefined}
                  >
                    {t('setupGuide.mobileBots.useExisting', 'Use {{name}}', { name: bot.name })}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
          {/* Arrow keys skip a disabled option, so the closed picker says why too. */}
          {unavailableBots.length > 0 ? (
            <div id={unavailableId} className="text-xs break-words text-muted-foreground">
              <p>
                {t('setupGuide.mobileBots.oneKind', 'A bot covers one kind. Not available here:')}
              </p>
              <ul>
                {unavailableBots.map((bot) => {
                  const taken = props.unavailable.get(bot.id)
                  return taken ? (
                    <li key={bot.id}>
                      {t('setupGuide.mobileBots.unavailableBot', '{{name}}: {{reason}}', {
                        name: bot.name,
                        reason: unavailableText(taken, t)
                      })}
                    </li>
                  ) : null
                })}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </li>
  )
}
