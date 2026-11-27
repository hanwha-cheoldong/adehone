// Create from a built-in template: the bot is made from the owner's reviewed seed (SOUL.md), then gets the
// template's package from this host's own catalog: the skills the owner kept, schedules turned off, and
// a setup note offering its event automations and connectors in its first chat.
import type { Bot } from '../../shared/bot-types'
import { BOT_OWN_SKILLS_FOLDER } from '../../shared/bots/bot-package'
import { botTemplate, type BotTemplate } from '../../shared/bots/bot-templates'
import type { BotCreateParams } from '../../shared/rpc-contract/bots-params'
import type { BotController, BotOrigin } from './bot-controller'
import {
  applyBotPackage,
  type BotPackageApply,
  type BotPackageApplyDeps
} from './bot-package-apply'
import { ADEHONE_DEV_AUTOMATIONS_DOC, ADEHONE_DEV_MEMORY_SEED } from './bot-template-adehone-files'
import { ANDROID_DEV_AUTOMATIONS_DOC, ANDROID_DEV_MEMORY_SEED } from './bot-template-android-files'
import { IOS_DEV_AUTOMATIONS_DOC, IOS_DEV_MEMORY_SEED } from './bot-template-ios-files'
import {
  MOBILE_WEB_DEV_AUTOMATIONS_DOC,
  MOBILE_WEB_DEV_MEMORY_SEED
} from './bot-template-mobile-web-files'
import {
  PRODUCT_PLANNING_AUTOMATIONS_DOC,
  PRODUCT_PLANNING_MEMORY_SEED
} from './bot-template-product-planning-files'
import { botTemplateSkillFiles } from './bot-template-skill-text'

const TEMPLATE_EXTRA_FILES: Partial<Record<string, readonly { to: string; text: string }[]>> = {
  'adehone-dev': [
    { to: 'MEMORY.md', text: ADEHONE_DEV_MEMORY_SEED },
    { to: 'AUTOMATIONS.md', text: ADEHONE_DEV_AUTOMATIONS_DOC }
  ],
  'android-dev': [
    { to: 'MEMORY.md', text: ANDROID_DEV_MEMORY_SEED },
    { to: 'AUTOMATIONS.md', text: ANDROID_DEV_AUTOMATIONS_DOC }
  ],
  'ios-dev': [
    { to: 'MEMORY.md', text: IOS_DEV_MEMORY_SEED },
    { to: 'AUTOMATIONS.md', text: IOS_DEV_AUTOMATIONS_DOC }
  ],
  'mobile-web-dev': [
    { to: 'MEMORY.md', text: MOBILE_WEB_DEV_MEMORY_SEED },
    { to: 'AUTOMATIONS.md', text: MOBILE_WEB_DEV_AUTOMATIONS_DOC }
  ],
  'product-planning': [
    { to: 'MEMORY.md', text: PRODUCT_PLANNING_MEMORY_SEED },
    { to: 'AUTOMATIONS.md', text: PRODUCT_PLANNING_AUTOMATIONS_DOC }
  ]
}

export type BotTemplateCreateParams = BotCreateParams & {
  fromTemplate: NonNullable<BotCreateParams['fromTemplate']>
}

export type BotTemplateCreateDeps = BotPackageApplyDeps & {
  bots: Pick<BotController, 'create' | 'delete'>
}

export function templatePackage(
  template: BotTemplate,
  keptSkills: readonly string[]
): BotPackageApply {
  const kept = new Set(keptSkills)
  const extraFiles = TEMPLATE_EXTRA_FILES[template.id] ?? []
  return {
    files: [
      ...extraFiles,
      ...template.skills
        .filter((skill) => kept.has(skill))
        .flatMap((skill) =>
          botTemplateSkillFiles(skill).map((file) => ({
            to: `${BOT_OWN_SKILLS_FOLDER}/${skill}/${file.path}`,
            text: file.text
          }))
        )
    ],
    tools: [],
    schedules: template.schedules.map((schedule) => ({
      name: `${template.name}: ${schedule.what}`,
      prompt: schedule.prompt,
      rrule: schedule.rrule
    })),
    setup: {
      template: template.name,
      firstSteps: template.firstChat,
      connectors: [...template.connectors],
      toolsToSignIn: [],
      schedulesOff: template.schedules.map((schedule) => `${template.name}: ${schedule.what}`),
      eventsSuggested: template.events.map(({ name, source, event, prompt }) => ({
        name,
        source,
        event,
        prompt
      })),
      ...(template.needsSetup ? { sharerNote: template.needsSetup } : {})
    }
  }
}

/** How a template makes a bot: its create params and origin, then its package once the bot exists. A
 *  template this host doesn't have (a newer client's catalog) makes the bot from its seed alone. */
export function botTemplateCreation(
  deps: BotPackageApplyDeps,
  input: BotTemplateCreateParams
): { params: BotCreateParams; origin?: BotOrigin; finish: (bot: Bot) => Promise<Bot> } {
  const { fromTemplate, ...params } = input
  const template = botTemplate(fromTemplate.id)
  if (!template) {
    return { params, finish: async (bot) => bot }
  }
  const agent = params.agent ?? 'claude'
  return {
    params: { ...params, agent },
    origin: { templateId: template.id },
    finish: (bot) => applyBotPackage(deps, bot, templatePackage(template, fromTemplate.skills))
  }
}

export async function createBotFromTemplate(
  deps: BotTemplateCreateDeps,
  input: BotTemplateCreateParams
): Promise<Bot> {
  const made = botTemplateCreation(deps, input)
  return made.finish(await deps.bots.create(made.params, made.origin))
}
