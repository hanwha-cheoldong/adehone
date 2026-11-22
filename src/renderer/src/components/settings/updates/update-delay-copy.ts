import { translate } from '@/i18n/i18n'
import type { Translate } from '@/i18n/use-translate'
import { uiDateTimeFormat } from '@/i18n/ui-intl-formatters'
import { translateSearchKeyword } from '../search/settings-search-keywords'

// Intl formatter caches key on option identity, so this must be a module constant.
const UPDATE_DELAY_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  weekday: 'short',
  month: 'short',
  day: 'numeric'
}

export function getUpdateDelayTitle(t: Translate = translate): string {
  return t('settings.updateDelay.1b4d825e0e', 'Update delay')
}

export function getUpdateDelayDescription(t: Translate = translate): string {
  return t(
    'settings.updateDelay.description',
    'Wait this many days after a release is published before Orca offers it.'
  )
}

export function getUpdateDelaySearchKeywords(t: Translate = translate): string[] {
  return [
    ...translateSearchKeyword(
      'auto.components.settings.general.search.f89a94773c',
      'update',
      undefined,
      t
    ),
    ...translateSearchKeyword('settings.updateDelay.keywordDelay', 'delay', undefined, t),
    ...translateSearchKeyword('settings.updateDelay.keywordCooldown', 'cooldown', undefined, t),
    ...translateSearchKeyword('settings.updateDelay.keywordSecurity', 'security', undefined, t),
    'defer',
    'wait',
    'stable',
    'supply chain'
  ]
}

export function formatUpdateDelayDate(timestamp: number, intlLocale?: string): string {
  return uiDateTimeFormat(UPDATE_DELAY_DATE_FORMAT, intlLocale).format(timestamp)
}
