import fs from 'node:fs'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const capturedTemplates: Electron.MenuItemConstructorOptions[][] = []

vi.mock('electron', () => ({
  app: {
    name: 'Adehone',
    getLocale: () => 'ko-KR'
  },
  BrowserWindow: {
    getFocusedWindow: () => null
  },
  Menu: {
    buildFromTemplate: vi.fn((template: Electron.MenuItemConstructorOptions[]) => {
      capturedTemplates.push(template)
      return { template }
    }),
    setApplicationMenu: vi.fn(),
    sendActionToFirstResponder: vi.fn()
  },
  MenuItem: class {
    constructor(public options: unknown) {}
  }
}))

import { setMainUiLanguage } from '../i18n/main-i18n'
import { registerAppMenu } from './register-app-menu'

const LOCALES_DIR = path.resolve(__dirname, '../../renderer/src/i18n/locales')

function registerTestAppMenu(): Electron.MenuItemConstructorOptions[] {
  capturedTemplates.length = 0
  registerAppMenu({
    appMenuLabel: 'Adehone',
    onOpenSettings: vi.fn(),
    onOpenWorktreePalette: vi.fn(),
    onOpenSetupGuide: vi.fn(),
    onOpenFeatureTour: vi.fn(),
    onOpenCrashReport: vi.fn(),
    onCheckForUpdates: vi.fn(),
    onZoomIn: vi.fn(),
    onZoomOut: vi.fn(),
    onZoomReset: vi.fn(),
    onToggleLeftSidebar: vi.fn(),
    onToggleRightSidebar: vi.fn(),
    onToggleAppearance: vi.fn(),
    getAppearanceState: () => ({
      showTasksButton: true,
      showAutomationsButton: true,
      showMobileButton: true,
      showTitlebarAppName: true,
      statusBarVisible: true
    })
  })
  return capturedTemplates.at(-1) ?? []
}

describe('registerAppMenu Adehone branding', () => {
  const originalPlatform = process.platform

  beforeEach(() => {
    Object.defineProperty(process, 'platform', { value: 'darwin', configurable: true })
  })

  afterEach(async () => {
    Object.defineProperty(process, 'platform', { value: originalPlatform, configurable: true })
    await setMainUiLanguage('en')
  })

  it('uses Adehone (not Orca) for Korean macOS pull-down menu about and hide items', async () => {
    await setMainUiLanguage('ko')
    const template = registerTestAppMenu()
    const macAppMenu = template[0]
    const submenu = Array.isArray(macAppMenu?.submenu) ? macAppMenu.submenu : []

    const aboutItem = submenu.find((item) => item.role === 'about')
    const hideItem = submenu.find((item) => item.role === 'hide')
    const quitItem = submenu.find((item) => item.role === 'quit')

    expect(aboutItem?.label).toBe('Adehone 정보')
    expect(hideItem?.label).toBe('Adehone 숨기기')
    expect(quitItem?.label).toBe('Adehone 종료')
  })

  it('uses Adehone (not Orca) for non-macOS Help about fallback', async () => {
    Object.defineProperty(process, 'platform', { value: 'linux', configurable: true })
    await setMainUiLanguage('en')
    const template = registerTestAppMenu()
    const helpMenu = template.at(-1)
    const submenu = Array.isArray(helpMenu?.submenu) ? helpMenu.submenu : []
    const aboutItem = submenu.find((item) => item.role === 'about')

    expect(aboutItem?.label).toBe('About Adehone')
  })

  it('keeps menu.about and menu.hide branded as Adehone across all locale catalogs', () => {
    for (const file of fs.readdirSync(LOCALES_DIR).sort()) {
      if (!file.endsWith('.json')) {
        continue
      }
      const raw: unknown = JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, file), 'utf8'))
      const menu =
        typeof raw === 'object' && raw !== null && 'menu' in raw && typeof raw.menu === 'object'
          ? raw.menu
          : null
      if (menu && 'about' in menu && typeof menu.about === 'string') {
        expect(menu.about, `${file} menu.about`).toContain('Adehone')
        expect(menu.about, `${file} menu.about`).not.toMatch(/orca/i)
      }
      if (menu && 'hide' in menu && typeof menu.hide === 'string') {
        expect(menu.hide, `${file} menu.hide`).toContain('Adehone')
        expect(menu.hide, `${file} menu.hide`).not.toMatch(/orca/i)
      }
    }
  })
})
