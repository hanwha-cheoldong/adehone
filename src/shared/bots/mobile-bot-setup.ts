// The onboarding checklist's mobile dev bots: what the owner picked, which existing bots they named for a
// kind, and whether a host's bot list satisfies that pick.
import * as z from 'zod'
import {
  LOCAL_EXECUTION_HOST_ID,
  parseRoutableExecutionHostId,
  type ExecutionHostId
} from '../execution-host/execution-host'
import { lazyZodSchema } from '../schema/lazy-zod-schema'

/** Built-in template ids; a bot of a kind is one whose `templateId` is that id. */
export const MOBILE_BOT_KINDS = ['android-dev', 'ios-dev', 'mobile-web-dev'] as const
export type MobileBotKind = (typeof MOBILE_BOT_KINDS)[number]

const MAX_ID_LENGTH = 256

const HostId = lazyZodSchema(() =>
  z.custom<ExecutionHostId>(
    (value) =>
      typeof value === 'string' &&
      value.length <= MAX_ID_LENGTH &&
      parseRoutableExecutionHostId(value) !== null
  )
)

const BotId = lazyZodSchema(() => z.string().min(1).max(MAX_ID_LENGTH))

/** Existing bots the owner named, by kind. Only ever set by an explicit pick. */
const DesignatedBotsSchema = lazyZodSchema(() =>
  z.object({
    'android-dev': BotId.optional(),
    'ios-dev': BotId.optional(),
    'mobile-web-dev': BotId.optional()
  })
)
export type MobileBotDesignations = z.infer<typeof DesignatedBotsSchema>

export const MobileBotSetupSchema = lazyZodSchema(() =>
  z.object({
    /** The kinds last confirmed, and the computer they were confirmed for. */
    selection: z
      .object({
        hostId: HostId,
        kinds: z.array(z.enum(MOBILE_BOT_KINDS)).min(1).max(MOBILE_BOT_KINDS.length)
      })
      .nullable(),
    /** By host id: a bot id names a bot only on its own host. */
    designated: z.record(z.string().max(MAX_ID_LENGTH), DesignatedBotsSchema)
  })
)
export type MobileBotSetup = z.infer<typeof MobileBotSetupSchema>

export function parseMobileBotSetup(value: unknown): MobileBotSetup | undefined {
  const parsed = MobileBotSetupSchema.safeParse(value)
  return parsed.success ? parsed.data : undefined
}

export type ListedMobileBot = { readonly id: string; readonly templateId?: string }

/** True for a bot this session must not count: one a failed create could not remove. */
export type IsUnusableBot = (hostId: ExecutionHostId, botId: string) => boolean

const everyBotUsable: IsUnusableBot = () => false

export type MobileBotMatch<B> = { source: 'template' | 'designated'; bot: B }

/** The kind a bot's own template makes it cover; null for any other bot. */
export function mobileBotTemplateKind(bot: ListedMobileBot): MobileBotKind | null {
  return MOBILE_BOT_KINDS.find((kind) => kind === bot.templateId) ?? null
}

/** The bot that covers `kind`: one made from its template, else the one the owner named. A bot made from
 *  another mobile template already covers that kind, so naming it here counts for nothing. */
export function findMobileBot<B extends ListedMobileBot>(
  kind: MobileBotKind,
  bots: readonly B[],
  designatedId: string | undefined
): MobileBotMatch<B> | null {
  const made = bots.find((bot) => bot.templateId === kind)
  if (made) {
    return { source: 'template', bot: made }
  }
  const named = designatedId ? bots.find((bot) => bot.id === designatedId) : undefined
  return named && mobileBotTemplateKind(named) === null
    ? { source: 'designated', bot: named }
    : null
}

/** One bot covers one kind: of the names for `kinds`, a bot keeps only the first in kind order. A kind
 *  its template already covers needs no name, so it holds none back from the others. */
export function singleKindDesignations(
  kinds: readonly MobileBotKind[],
  bots: readonly ListedMobileBot[],
  designations: MobileBotDesignations | undefined
): MobileBotDesignations {
  const claimed = new Set<string>()
  const kept: MobileBotDesignations = {}
  for (const kind of MOBILE_BOT_KINDS) {
    const id = designations?.[kind]
    if (!id || !kinds.includes(kind) || bots.some((bot) => bot.templateId === kind)) {
      continue
    }
    if (!claimed.has(id)) {
      claimed.add(id)
      kept[kind] = id
    }
  }
  return kept
}

/** With a saved pick, every picked kind is covered on its host. With none, this computer has at least
 *  one bot made from a mobile template. */
export function isMobileBotSetupDone(
  setup: MobileBotSetup | null | undefined,
  hostBots: (hostId: ExecutionHostId) => readonly ListedMobileBot[],
  isUnusable: IsUnusableBot = everyBotUsable
): boolean {
  const hostId = setup?.selection?.hostId ?? LOCAL_EXECUTION_HOST_ID
  const bots = hostBots(hostId).filter((bot) => !isUnusable(hostId, bot.id))
  const selection = setup?.selection
  if (!selection) {
    return MOBILE_BOT_KINDS.some((kind) => findMobileBot(kind, bots, undefined) !== null)
  }
  const named = singleKindDesignations(selection.kinds, bots, setup.designated[hostId])
  return selection.kinds.every((kind) => findMobileBot(kind, bots, named[kind]) !== null)
}

/** The setup after the owner confirms `kinds` on a host. `designations` replaces that host's; one for a
 *  kind left unpicked is dropped. Other hosts keep theirs. */
export function withMobileBotSelection(
  previous: MobileBotSetup | null | undefined,
  hostId: ExecutionHostId,
  kinds: readonly MobileBotKind[],
  designations: MobileBotDesignations
): MobileBotSetup {
  const named = singleKindDesignations(kinds, [], designations)
  const { [hostId]: _replaced, ...others } = previous?.designated ?? {}
  return {
    selection: kinds.length > 0 ? { hostId, kinds: [...kinds] } : null,
    designated: Object.keys(named).length > 0 ? { ...others, [hostId]: named } : others
  }
}

/** The setup without one named bot; the pick stays, so its kind reads as not covered. */
export function withoutMobileBotDesignation(
  setup: MobileBotSetup,
  hostId: ExecutionHostId,
  kind: MobileBotKind
): MobileBotSetup {
  const { [kind]: _released, ...named } = setup.designated[hostId] ?? {}
  const { [hostId]: _replaced, ...others } = setup.designated
  return {
    selection: setup.selection,
    designated: Object.keys(named).length > 0 ? { ...others, [hostId]: named } : others
  }
}
