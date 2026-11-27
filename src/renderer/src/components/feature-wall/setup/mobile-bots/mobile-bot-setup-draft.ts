// What the owner has ticked and named in the step but not confirmed yet.
import {
  findMobileBot,
  MOBILE_BOT_KINDS,
  mobileBotTemplateKind,
  singleKindDesignations,
  type ListedMobileBot,
  type MobileBotDesignations,
  type MobileBotKind,
  type MobileBotSetup
} from '../../../../../../shared/bots/mobile-bot-setup'
import type { ExecutionHostId } from '../../../../../../shared/execution-host/execution-host'

export type MobileBotDraft = {
  hostId: ExecutionHostId
  kinds: readonly MobileBotKind[]
  designations: MobileBotDesignations
}

/** The step as saved for a host: nothing is ticked or named for the owner. */
export function savedMobileBotDraft(
  setup: MobileBotSetup | null,
  hostId: ExecutionHostId
): MobileBotDraft {
  const selection = setup?.selection
  return {
    hostId,
    kinds: selection?.hostId === hostId ? selection.kinds : [],
    designations: setup?.designated[hostId] ?? {}
  }
}

export function toggledMobileBotKind(
  draft: MobileBotDraft,
  kind: MobileBotKind,
  checked: boolean
): MobileBotDraft {
  return {
    ...draft,
    kinds: MOBILE_BOT_KINDS.filter((entry) =>
      entry === kind ? checked : draft.kinds.includes(entry)
    )
  }
}

/** Names `botId` for `kind` (or none). A bot covers one kind, so an unticked kind gives up its name for it. */
export function withChosenMobileBot(
  draft: MobileBotDraft,
  kind: MobileBotKind,
  botId: string | undefined
): MobileBotDraft {
  const designations: MobileBotDesignations = { ...draft.designations, [kind]: botId }
  for (const other of MOBILE_BOT_KINDS) {
    if (botId && other !== kind && designations[other] === botId) {
      delete designations[other]
    }
  }
  return { ...draft, designations }
}

/** Why a bot can't be named for a kind: the other kind it already covers, and how. */
export type MobileBotUnavailable = { reason: 'template' | 'chosen'; kind: MobileBotKind }

export function unavailableMobileBots(
  draft: MobileBotDraft,
  kind: MobileBotKind,
  bots: readonly ListedMobileBot[]
): ReadonlyMap<string, MobileBotUnavailable> {
  const unavailable = new Map<string, MobileBotUnavailable>()
  const named = singleKindDesignations(draft.kinds, bots, draft.designations)
  for (const other of MOBILE_BOT_KINDS) {
    const id = other === kind ? undefined : named[other]
    if (id) {
      unavailable.set(id, { reason: 'chosen', kind: other })
    }
  }
  for (const bot of bots) {
    const own = mobileBotTemplateKind(bot)
    if (own && own !== kind) {
      unavailable.set(bot.id, { reason: 'template', kind: own })
    }
  }
  return unavailable
}

/** What confirming does with `draft` against the host's listed bots: the names worth keeping, and the
 *  kinds that get a new bot. */
export function mobileBotDraftPlan(
  draft: MobileBotDraft,
  bots: readonly ListedMobileBot[]
): { designations: MobileBotDesignations; toCreate: MobileBotKind[] } {
  const named = singleKindDesignations(draft.kinds, bots, draft.designations)
  const designations: MobileBotDesignations = {}
  const toCreate: MobileBotKind[] = []
  for (const kind of draft.kinds) {
    const match = findMobileBot(kind, bots, named[kind])
    if (match?.source === 'designated') {
      designations[kind] = match.bot.id
    } else if (!match) {
      toCreate.push(kind)
    }
  }
  return { designations, toCreate }
}
