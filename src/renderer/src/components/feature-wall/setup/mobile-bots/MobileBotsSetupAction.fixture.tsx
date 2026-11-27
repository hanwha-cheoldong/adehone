// The step against a simulated host: the component and the install run are real, bots.list and
// bots.create answer from memory.
import { useAppStore } from '@/store'
import { i18n, loadRendererUiLanguage } from '@/i18n/i18n'
import { unwrapRuntimeRpcResult } from '@/runtime/rpc/calls/runtime-rpc-result'
import { defineFixture } from '../../../../component-fixtures/component-fixture'
import { stubBots } from '../../../../component-fixtures/fixture-bots'
import { seedNewBotFixture } from '../../../bots/new-bot-stage-fixture'
import { refreshBotHost } from '@/lib/bot-catalog'
import type { Bot } from '../../../../../../shared/bot-types'
import { BOT_PARTLY_MADE_KEPT_WORDS } from '../../../../../../shared/bots/bot-partly-made'
import type { BotCreateParams } from '../../../../../../shared/rpc-contract/bots-params'
import type { MobileBotSetup } from '../../../../../../shared/bots/mobile-bot-setup'
import { useMobileBotSetupDone } from './use-mobile-bot-setup-done'
import { MobileBotsSetupAction } from './MobileBotsSetupAction'
import { installMobileBots, resetMobileBotInstall } from './mobile-bot-setup-install'

type Fault =
  | 'slow'
  | 'ios-fails'
  | 'ios-without-template'
  | 'ios-partly-made'
  | 'ios-name-taken-once'

function simulatedBot(id: string, name: string, templateId?: string): Bot {
  // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: the step reads only these fields.
  return { id, name, templateId, hostId: 'local', agent: 'claude' } as unknown as Bot
}

function simulateHost(initial: Bot[], fault?: Fault): void {
  let bots = [...initial]
  let nameRefused = false
  let created = 0
  const runtime = window.api.runtime
  const ok = (result: unknown) => ({ id: 'fixture', ok: true, result, _meta: { runtimeId: 'f' } })
  const refuse = (message: string) => ({
    id: 'fixture',
    ok: false,
    error: { code: 'runtime_error', message },
    _meta: { runtimeId: 'f' }
  })
  Reflect.set(window.api, 'runtime', {
    ...runtime,
    call: async (request: Parameters<typeof runtime.call>[0]) => {
      if (request.method === 'bots.list') {
        return ok({ bots, botsEnabled: true })
      }
      if (request.method !== 'bots.create') {
        return runtime.call(request)
      }
      if (fault === 'slow') {
        await settle(500)
      }
      // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: the step's own request.
      const params = request.params as BotCreateParams
      const templateId = params.fromTemplate?.id
      const next = simulatedBot(`new-${++created}`, params.name, templateId)
      if (templateId === 'ios-dev') {
        if (fault === 'ios-fails') {
          return refuse("EACCES: permission denied, mkdir '/simulated/bots/ios-development'")
        }
        if (fault === 'ios-name-taken-once' && !nameRefused) {
          nameRefused = true
          bots = [...bots, simulatedBot('other', params.name)]
          return refuse('bot_name_taken')
        }
        if (fault === 'ios-without-template') {
          bots = [...bots, { ...next, templateId: undefined }]
          return ok({ bot: { ...next, templateId: undefined } })
        }
        if (fault === 'ios-partly-made') {
          bots = [...bots, next]
          return refuse(`disk full Orca ${BOT_PARTLY_MADE_KEPT_WORDS} "${next.name}" (busy).`)
        }
      }
      bots = [...bots, next]
      return ok({ bot: next })
    }
  })
}

function Step(): React.JSX.Element {
  const done = useMobileBotSetupDone(true)
  const setup = useAppStore((state) => state.mobileBotSetup)
  return (
    <div className="space-y-3 bg-background p-4">
      <p data-testid="fixture-done" className="font-mono text-xs text-muted-foreground">
        simulated host · done={String(done)} · saved={setup?.selection?.kinds.join(',') ?? 'none'}
      </p>
      <MobileBotsSetupAction done={done} onSkip={() => {}} />
    </div>
  )
}

const settle = (ms = 400): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

function button(frame: HTMLElement, text: string): HTMLButtonElement {
  const found = [...frame.querySelectorAll('button')].find(
    (entry) => entry.textContent?.trim() === text
  )
  if (!found) {
    const shown = [...frame.querySelectorAll('button')].map((entry) => entry.textContent)
    throw new Error(`No "${text}" button among ${shown.join(' | ')}`)
  }
  return found
}

function describedText(element: Element | undefined): string {
  return (element?.getAttribute('aria-describedby') ?? '')
    .split(' ')
    .map((id) => document.getElementById(id)?.textContent ?? '')
    .join(' ')
}

function openPicker(frame: HTMLElement, label: string): void {
  const trigger = frame.querySelector<HTMLButtonElement>(`[aria-label="${label}"]`)
  if (!trigger) {
    throw new Error(`No picker "${label}"`)
  }
  trigger.focus()
  trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
}

async function choose(frame: HTMLElement, label: string, option: string): Promise<void> {
  openPicker(frame, label)
  await settle()
  const found = [...document.querySelectorAll<HTMLElement>('[role="option"]')].find(
    (entry) => entry.textContent === option
  )
  if (!found) {
    throw new Error(`No option "${option}"`)
  }
  found.focus()
  found.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
  await settle()
}

function expectDone(frame: HTMLElement, done: boolean): void {
  const line = frame.querySelector('[data-testid="fixture-done"]')?.textContent ?? ''
  if (!line.includes(`done=${done}`)) {
    throw new Error(`Expected done=${done}: ${line}`)
  }
}

async function listSimulatedBots(): Promise<readonly unknown[]> {
  const response = await window.api.runtime.call({ method: 'bots.list' })
  const result = unwrapRuntimeRpcResult(response)
  return typeof result === 'object' && result && 'bots' in result && Array.isArray(result.bots)
    ? result.bots
    : []
}

function step(options: {
  bots?: Bot[]
  fault?: Fault
  setup?: MobileBotSetup
  language?: Parameters<typeof loadRendererUiLanguage>[0]
  interact?: (frame: HTMLElement) => Promise<void>
}) {
  return defineFixture({
    width: 600,
    render: () => <Step />,
    setup: () => {
      resetMobileBotInstall()
      seedNewBotFixture()()
      stubBots(options.bots ?? [])
      simulateHost(options.bots ?? [], options.fault)
      useAppStore.setState({ mobileBotSetup: options.setup ?? null })
      void refreshBotHost('local')
    },
    interact: async (frame) => {
      await i18n.changeLanguage(await loadRendererUiLanguage(options.language ?? 'en'))
      await settle()
      await options.interact?.(frame)
    }
  })
}

async function pick(frame: HTMLElement, ...indexes: number[]): Promise<void> {
  for (const index of indexes) {
    frame.querySelectorAll<HTMLButtonElement>('[role="checkbox"]')[index]?.click()
    await settle(100)
  }
}

async function installAndroidAndIos(frame: HTMLElement): Promise<void> {
  await pick(frame, 0, 1)
  button(frame, 'Install selected bots').click()
  await settle(800)
}

export const empty = step({})

export const korean = step({
  language: 'ko',
  interact: async (frame) => pick(frame, 0, 1, 2)
})

/** S5, simulated: only the iOS create fails. */
export const partialFailure = step({
  fault: 'ios-fails',
  interact: async (frame) => {
    await installAndroidAndIos(frame)
    expectDone(frame, false)
    button(frame, 'Retry')
    // Changing the pick to Android alone completes the step.
    await pick(frame, 1)
    button(frame, 'Save selection').click()
    await settle(800)
    expectDone(frame, true)
    await pick(frame, 1)
    button(frame, 'Install selected bots').click()
    await settle(800)
    expectDone(frame, false)
  }
})

/** Simulated: a host whose catalog lacks the template answers with a plain bot; a retry adds none. */
export const hostWithoutTemplate = step({
  fault: 'ios-without-template',
  interact: async (frame) => {
    await installAndroidAndIos(frame)
    button(frame, 'Retry').click()
    await settle(800)
    expectDone(frame, false)
    const bots = await listSimulatedBots()
    if (bots.length !== 2) {
      throw new Error(`Expected 2 bots after the retry, got ${bots.length}`)
    }
  }
})

/** Simulated: the host could not remove a half-made bot; it never counts, even after a retry. */
export const partlyMadeBotLeft = step({
  fault: 'ios-partly-made',
  interact: async (frame) => {
    await installAndroidAndIos(frame)
    expectDone(frame, false)
  }
})

/** Simulated: another device took the name between the read and the create. */
export const nameTakenRetries = step({
  fault: 'ios-name-taken-once',
  interact: async (frame) => {
    await installAndroidAndIos(frame)
    expectDone(frame, true)
  }
})

export const chosenBotDeleted = step({
  bots: [simulatedBot('made', 'Android development', 'android-dev')],
  setup: {
    selection: { hostId: 'local', kinds: ['android-dev', 'ios-dev'] },
    designated: { local: { 'ios-dev': 'deleted-bot' } }
  },
  interact: async (frame) => expectDone(frame, false)
})

/** Simulated slow host: a second start while one runs joins it, so each kind is made once. */
export const secondRunJoinsFirst = step({
  fault: 'slow',
  interact: async (frame) => {
    await pick(frame, 0, 1)
    button(frame, 'Install selected bots').click()
    await settle(200)
    expectDone(frame, false)
    button(frame, 'Installing…').click()
    await installMobileBots({
      hostId: 'local',
      kinds: ['android-dev', 'ios-dev'],
      designations: {},
      agentSetup: { agent: 'claude' }
    })
    await settle()
    const bots = await listSimulatedBots()
    if (bots.length !== 2) {
      throw new Error(`Expected one bot per kind, got ${bots.length}`)
    }
    expectDone(frame, true)
  }
})

const MINE = [simulatedBot('mine', 'My mobile bot'), simulatedBot('other', 'Another bot')]

/** Saved values naming one bot twice cover one kind only, and the other row says why. */
export const savedTwice = step({
  bots: MINE,
  setup: {
    selection: { hostId: 'local', kinds: ['android-dev', 'ios-dev'] },
    designated: { local: { 'android-dev': 'mine', 'ios-dev': 'mine' } }
  },
  interact: async (frame) => {
    expectDone(frame, false)
    const ios = [...frame.querySelectorAll('[role="combobox"]')].at(-1)
    const description = describedText(ios)
    if (!description.includes('My mobile bot: Already chosen for Android development')) {
      throw new Error(`The iOS picker must say why the bot is unavailable: ${description}`)
    }
  }
})

/** A bot named for one kind, and a template bot, can't be picked for another; the list says why. */
export const takenBotsInPicker = step({
  bots: [...MINE, simulatedBot('made', 'Mobile web development', 'mobile-web-dev')],
  interact: async (frame) => {
    await pick(frame, 0, 1)
    await choose(frame, 'Bot to use for Android development', 'Use My mobile bot')
    openPicker(frame, 'Bot to use for iOS development')
    await settle()
    const disabled = [...document.querySelectorAll('[role="option"][aria-disabled="true"]')].map(
      (option) => option.textContent ?? ''
    )
    const expected = [
      'Use My mobile botAlready chosen for Android development',
      'Use Mobile web developmentMade from the Mobile web development template'
    ]
    if (disabled.join('|') !== expected.join('|')) {
      throw new Error(`Unexpected unavailable options: ${disabled.join('|')}`)
    }
  }
})
