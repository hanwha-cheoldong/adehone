import { translateSearchKeyword } from '../search/settings-search-keywords'
import { GENERAL_SETTING_ANCHORS } from '../general/general-setting-anchors'
import type { GlobalSettings } from '../../../../../shared/settings/global-settings-types'
import { translate } from '@/i18n/i18n'
import { useTranslate, type Translate } from '@/i18n/use-translate'
import { SearchableSetting } from '../section-layout/SearchableSetting'
import { SettingsSwitchRow } from '../form-controls/SettingsFormControls'

export function getAutoSaveSearchEntry(t: Translate = translate) {
  return {
    title: t('settings.general.autoSave.title', 'Auto save'),
    description: t('settings.general.autoSave.description', 'Save edits after a short pause.'),
    keywords: [
      ...translateSearchKeyword(
        'settings.general.search.keywords.auto_save',
        'auto save',
        undefined,
        t
      ),
      ...translateSearchKeyword(
        'auto.components.settings.general.search.86f54575c7',
        'autosave',
        undefined,
        t
      ),
      ...translateSearchKeyword(
        'auto.components.settings.general.search.4469b6fa4e',
        'save',
        undefined,
        t
      ),
      t('auto.components.settings.GeneralEditorSettingsSection.a37865966c', 'Auto save files')
    ]
  }
}

export function GeneralAutoSaveSetting({
  settings,
  updateSettings
}: {
  settings: GlobalSettings
  updateSettings: (updates: Partial<GlobalSettings>) => void
}): React.JSX.Element {
  const t = useTranslate()
  const entry = getAutoSaveSearchEntry(t)
  return (
    <SearchableSetting id={GENERAL_SETTING_ANCHORS.autoSave} {...entry}>
      <SettingsSwitchRow
        label={entry.title}
        description={entry.description}
        checked={settings.editorAutoSave}
        onChange={() => updateSettings({ editorAutoSave: !settings.editorAutoSave })}
      />
    </SearchableSetting>
  )
}
