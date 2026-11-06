import { DEFAULT_APP_FONT_FAMILY } from '../../../../../../shared/constants'

export const RECOMMENDED_APP_FONTS = [
  DEFAULT_APP_FONT_FAMILY,
  'Pretendard Variable',
  'Geist',
  'Inter',
  'SF Pro Text',
  'Segoe UI',
  'system-ui'
] as const

export function mergeFontSuggestions(
  systemFonts: readonly string[],
  previousFonts: readonly string[]
): string[] {
  // Keep every installed font searchable even if rendering is capped later.
  return Array.from(new Set([...RECOMMENDED_APP_FONTS, ...systemFonts, ...previousFonts]))
}

export function getFallbackTerminalFonts(): string[] {
  const nav =
    typeof navigator !== 'undefined'
      ? (navigator as Navigator & { userAgentData?: { platform?: string } })
      : null
  const platform = nav ? (nav.userAgentData?.platform ?? nav.platform ?? '') : ''
  const normalizedPlatform = platform.toLowerCase()

  if (normalizedPlatform.includes('mac')) {
    return ['SF Mono', 'Menlo', 'Monaco', 'JetBrains Mono', 'Fira Code']
  }

  if (normalizedPlatform.includes('win')) {
    return ['Cascadia Mono', 'Consolas', 'Lucida Console', 'JetBrains Mono', 'Fira Code']
  }

  return [
    'JetBrains Mono',
    'Fira Code',
    'DejaVu Sans Mono',
    'Liberation Mono',
    'Ubuntu Mono',
    'Noto Sans Mono'
  ]
}
