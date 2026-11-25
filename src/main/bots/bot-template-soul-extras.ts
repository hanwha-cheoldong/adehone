import { proposalSoul, type ProposalSoulExtras } from '../../shared/bots/bot-proposal'
import type { BotCreateParams } from '../../shared/rpc-contract/bots-params'
import { ANDROID_DEV_DO_RULES, ANDROID_DEV_DONT_RULES } from './bot-template-android-files'
import { IOS_DEV_DO_RULES, IOS_DEV_DONT_RULES } from './bot-template-ios-files'
import { MOBILE_WEB_DEV_DO_RULES, MOBILE_WEB_DEV_DONT_RULES } from './bot-template-mobile-web-files'

const TEMPLATE_SOUL_EXTRAS: Partial<Record<string, ProposalSoulExtras>> = {
  'android-dev': { how: ANDROID_DEV_DO_RULES, never: ANDROID_DEV_DONT_RULES },
  'ios-dev': { how: IOS_DEV_DO_RULES, never: IOS_DEV_DONT_RULES },
  'mobile-web-dev': { how: MOBILE_WEB_DEV_DO_RULES, never: MOBILE_WEB_DEV_DONT_RULES }
}

export function templateProposalSoul(
  name: string,
  seed: BotCreateParams['seed'],
  templateId?: string
): string | undefined {
  if (!seed) {
    return undefined
  }
  return proposalSoul(name, seed, templateId ? TEMPLATE_SOUL_EXTRAS[templateId] : undefined)
}
