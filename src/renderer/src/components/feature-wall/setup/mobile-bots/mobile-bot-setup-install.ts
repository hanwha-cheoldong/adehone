// Installs the picked mobile bots on one computer and keeps this session's results. It lives outside the
// checklist, so closing the guide or opening its other surface never starts a second run.
import { useSyncExternalStore } from 'react'
import { translate } from '@/i18n/i18n'
import { createBot, refreshBotHost } from '@/lib/bot-catalog'
import { BOTS_LIST_TIMEOUT_MS } from '@/lib/bot-host-refresh'
import { botHostTarget } from '@/lib/bot-hosts'
import { callRuntimeRpc } from '@/runtime/rpc/calls/runtime-rpc-call'
import { runtimeTargetEnvironmentId } from '@/runtime/rpc/targets/runtime-client-target'
import { readRuntimeStatuses } from '@/store/slices/runtime-status/views/runtime-status-owner'
import { botErrorMessage, botErrorText } from '@/components/bots/bot-presentation'
import type { BotAgentSetup } from '@/components/bots/BotAgentLaunchPicker'
import type { Bot } from '../../../../../../shared/bot-types'
import { BOT_PARTLY_MADE_KEPT_WORDS } from '../../../../../../shared/bots/bot-partly-made'
import { proposalCreateParams, templateProposal } from '../../../../../../shared/bots/bot-proposal'
import {
  botTemplateBotName,
  botTemplateWord
} from '../../../../../../shared/bots/bot-template-text'
import { botTemplate } from '../../../../../../shared/bots/bot-templates'
import { lastVerifiedRuntimeStatus } from '../../../../../../shared/remote-runtime/host-status/runtime-host-status'
import {
  findMobileBot,
  singleKindDesignations,
  type MobileBotDesignations,
  type MobileBotKind
} from '../../../../../../shared/bots/mobile-bot-setup'
import type { ExecutionHostId } from '../../../../../../shared/execution-host/execution-host'

export type MobileBotFailure =
  | { code: 'create'; message: string }
  | { code: 'designation-missing' }
  /** The create failed and the host could not remove what it had made. */
  | { code: 'partly-made'; botName: string }
  /** The host answered with a bot that doesn't say it came from the template. */
  | { code: 'no-template-origin'; botName: string }
  | { code: 'unverified' }

export type MobileBotOutcome =
  | { status: 'queued' | 'installing' | 'created' | 'existing' | 'designated' }
  | { status: 'failed'; failure: MobileBotFailure }

export type MobileBotInstallState = {
  runningHostId: ExecutionHostId | null
  outcomes: Partial<
    Record<ExecutionHostId, Partial<Record<MobileBotKind, MobileBotOutcome>> | undefined>
  >
  /** Bots a failed create could not remove (`botKey`): listed, but half made. */
  unusableBots: ReadonlySet<string>
}

export type MobileBotInstallRequest = {
  hostId: ExecutionHostId
  kinds: readonly MobileBotKind[]
  designations: MobileBotDesignations
  agentSetup: BotAgentSetup
}

const INITIAL_STATE: MobileBotInstallState = {
  runningHostId: null,
  outcomes: {},
  unusableBots: new Set()
}

let state = INITIAL_STATE
let running: Promise<void> | null = null
const listeners = new Set<() => void>()
/** Hosts whose catalog lacks a template: asking again would only add another plain bot. */
const hostsLackingTemplate = new Map<string, string>()

// An updated server restarts under a new runtime id, so the block never outlives the app it was seen on.
function lackingTemplateKey(hostId: ExecutionHostId, kind: MobileBotKind): string {
  const environmentId = runtimeTargetEnvironmentId(botHostTarget(hostId))
  const status = environmentId ? readRuntimeStatuses().get(environmentId) : undefined
  return [hostId, lastVerifiedRuntimeStatus(status)?.runtimeId ?? '', kind].join('\u0000')
}

const botKey = (hostId: ExecutionHostId, id: string): string => `${hostId}\u0000${id}`

function publish(next: Partial<MobileBotInstallState>): void {
  state = { ...state, ...next }
  listeners.forEach((listener) => listener())
}

function setOutcome(
  hostId: ExecutionHostId,
  kind: MobileBotKind,
  outcome: MobileBotOutcome | undefined
): void {
  publish({
    outcomes: { ...state.outcomes, [hostId]: { ...state.outcomes[hostId], [kind]: outcome } }
  })
}

export function subscribeToMobileBotInstall(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export const readMobileBotInstall = (): MobileBotInstallState => state

export function useMobileBotInstall(): MobileBotInstallState {
  return useSyncExternalStore(subscribeToMobileBotInstall, readMobileBotInstall)
}

export function isUnusableMobileBot(hostId: ExecutionHostId, botId: string): boolean {
  return state.unusableBots.has(botKey(hostId, botId))
}

export function clearMobileBotOutcome(hostId: ExecutionHostId, kind: MobileBotKind): void {
  setOutcome(hostId, kind, undefined)
}

/** The host's list read now: the cached one swallows a failed read. */
async function listHostBots(hostId: ExecutionHostId): Promise<Bot[]> {
  const { bots } = await callRuntimeRpc<{ bots: Bot[] }>(
    botHostTarget(hostId),
    'bots.list',
    undefined,
    { timeoutMs: BOTS_LIST_TIMEOUT_MS }
  )
  return bots.filter((bot) => !isUnusableMobileBot(hostId, bot.id))
}

const failed = (failure: MobileBotFailure): MobileBotOutcome => ({ status: 'failed', failure })

// The host's own words say what to fix (permissions, a full disk); a bare code gets the app's copy.
const failedCreate = (error: unknown): MobileBotOutcome => {
  const words = botErrorText(error)
  return failed({
    code: 'create',
    message: /^[a-z0-9_]+$/.test(words) ? botErrorMessage(error) : words
  })
}

async function createFromTemplate(
  { hostId, agentSetup }: MobileBotInstallRequest,
  kind: MobileBotKind,
  listed: readonly Bot[]
): Promise<MobileBotOutcome> {
  const template = botTemplate(kind)
  if (!template) {
    return failedCreate(new Error(kind))
  }
  const name = botTemplateBotName(
    template,
    listed.map((bot) => bot.name),
    translate
  )
  const bot = await createBot(hostId, {
    ...proposalCreateParams(templateProposal(template, { name }), agentSetup.agent, {
      templatePackages: true,
      templateNameShown: botTemplateWord(template, 'name', translate)
    }),
    ...agentSetup
  })
  if (bot.templateId !== kind) {
    hostsLackingTemplate.set(lackingTemplateKey(hostId, kind), bot.name)
    return failed({ code: 'no-template-origin', botName: bot.name })
  }
  return { status: 'created' }
}

/** Keeps a bot the host could not clean up from reading as installed. */
async function markLeftovers(
  hostId: ExecutionHostId,
  kind: MobileBotKind,
  before: readonly Bot[]
): Promise<Bot | undefined> {
  const known = new Set(before.map((bot) => bot.id))
  const after = await listHostBots(hostId).catch(() => [])
  const left = after.filter((bot) => bot.templateId === kind && !known.has(bot.id))
  if (left.length > 0) {
    publish({
      unusableBots: new Set([...state.unusableBots, ...left.map((bot) => botKey(hostId, bot.id))])
    })
  }
  return left[0]
}

async function installKind(
  request: MobileBotInstallRequest,
  kind: MobileBotKind,
  retryTakenName = true
): Promise<MobileBotOutcome> {
  const { hostId, designations } = request
  // Read again right before creating: another window or device may have made this bot meanwhile.
  const listed = await listHostBots(hostId)
  const match = findMobileBot(kind, listed, designations[kind])
  if (match) {
    return { status: match.source === 'template' ? 'existing' : 'designated' }
  }
  if (designations[kind]) {
    // The named bot is gone: making a new one is the owner's call, not this run's.
    return failed({ code: 'designation-missing' })
  }
  const plainBot = hostsLackingTemplate.get(lackingTemplateKey(hostId, kind))
  if (plainBot !== undefined) {
    return failed({ code: 'no-template-origin', botName: plainBot })
  }
  try {
    return await createFromTemplate(request, kind, listed)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (retryTakenName && message === 'bot_name_taken') {
      return installKind(request, kind, false)
    }
    if (message.includes(BOT_PARTLY_MADE_KEPT_WORDS)) {
      const left = await markLeftovers(hostId, kind, listed)
      if (left) {
        return failed({ code: 'partly-made', botName: left.name })
      }
    }
    throw error
  }
}

async function run(request: MobileBotInstallRequest): Promise<void> {
  const { hostId, kinds, designations } = request
  const queued = Object.fromEntries(kinds.map((kind) => [kind, { status: 'queued' }]))
  publish({ runningHostId: hostId, outcomes: { ...state.outcomes, [hostId]: queued } })
  const results = new Map<MobileBotKind, MobileBotOutcome>()
  // One at a time, and a failure never stops the rest.
  for (const kind of kinds) {
    setOutcome(hostId, kind, { status: 'installing' })
    const outcome = await installKind(request, kind).catch(failedCreate)
    results.set(kind, outcome)
    // A success shows only once the final list confirms it.
    if (outcome.status === 'failed') {
      setOutcome(hostId, kind, outcome)
    }
  }
  const listed = await listHostBots(hostId).catch(() => null)
  const named = singleKindDesignations(kinds, listed ?? [], designations)
  for (const [kind, outcome] of results) {
    if (outcome.status !== 'failed') {
      const confirmed = listed && findMobileBot(kind, listed, named[kind])
      setOutcome(hostId, kind, confirmed ? outcome : failed({ code: 'unverified' }))
    }
  }
  await refreshBotHost(hostId)
}

/** Starts a run, or returns the one already going. */
export function installMobileBots(request: MobileBotInstallRequest): Promise<void> {
  running ??= run(request).finally(() => {
    running = null
    publish({ runningHostId: null })
  })
  return running
}

/** Fixtures start each shot from an empty session. */
export function resetMobileBotInstall(): void {
  hostsLackingTemplate.clear()
  state = INITIAL_STATE
  listeners.forEach((listener) => listener())
}
