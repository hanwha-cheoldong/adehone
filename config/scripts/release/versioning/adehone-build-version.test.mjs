import { describe, expect, it } from 'vitest'
import {
  createDailyBuildVersion,
  formatDailyReleaseName,
  nextDailyBuildNumber
} from './daily-build-version.mjs'
import { createHourlyBuildVersion, formatHourlyReleaseName } from './hourly-build-version.mjs'
import { createAdhocBuildVersion, formatAdhocReleaseName } from './adhoc-build-version.mjs'
import { resolveDevChannelBaseVersion } from './dev-channel-base-version.mjs'
import { DESKTOP_STABLE_TAG, DESKTOP_RC_TAG } from './release-tag-patterns.mjs'
import { parseDesktopStableTag } from './latest-stable-release.mjs'
import {
  formatAdehoneDisplayVersion,
  ADEHONE_VERSION
} from '../../../../src/shared/app-display-version.ts'

describe('adehone build version patterns', () => {
  const fixedDate = new Date(Date.UTC(2026, 10, 16, 5, 30)) // 2026-11-16 05:30 UTC

  it('formats daily build version with adehone version prefix', () => {
    const version = createDailyBuildVersion('1.4.214', fixedDate, '0.1')
    expect(version).toBe('0.1-1.4.214-daily.202611160530')
    const releaseName = formatDailyReleaseName(version, 4, '51d3496dc2fa', fixedDate)
    expect(releaseName).toBe('0.1-1.4.214 • 04 • Nov 15, 9:30PM • 51d3496')
  })

  it('preserves daily build numbering across old and new release title formats', () => {
    const releaseNames = [
      '1.4.214 • 02 • Nov 13, 2:34AM • abc1234',
      '1.4.214 • 03 • Nov 13, 11:45PM • def5678'
    ]
    expect(nextDailyBuildNumber('0.1-1.4.214', releaseNames)).toBe(4)
    expect(
      nextDailyBuildNumber('0.1-1.4.214', ['0.1-1.4.214 • 05 • Nov 14, 11:45PM • def5678'])
    ).toBe(6)
  })

  it('formats hourly build version with adehone version prefix', () => {
    const version = createHourlyBuildVersion('1.4.214', fixedDate, '0.1')
    expect(version).toBe('0.1-1.4.214-hourly.202611160530')
    const releaseName = formatHourlyReleaseName(version, 1, '51d3496dc2fa', fixedDate)
    expect(releaseName).toBe('0.1-1.4.214 • 01 • Nov 15, 9:30PM • 51d3496')
  })

  it('formats adhoc build version with adehone version prefix', () => {
    const version = createAdhocBuildVersion('1.4.214', fixedDate, '0.1')
    expect(version).toBe('0.1-1.4.214-adhoc.20261116053000')
    const releaseName = formatAdhocReleaseName(version, 'feature-test', '51d3496dc2fa', fixedDate)
    expect(releaseName).toBe('0.1-1.4.214 • feature-test • Nov 15, 9:30PM • 51d3496')
  })

  it('resolves dev channel base version handling both prefixed and unprefixed tags', () => {
    const published = ['v1.4.213', 'v1.4.214-daily.202611132345', 'v0.1-1.4.214-daily.202611140000']
    expect(resolveDevChannelBaseVersion('1.4.214', published)).toBe('1.4.214')
  })

  it('validates desktop stable and RC tag patterns with adehone prefix', () => {
    expect(DESKTOP_STABLE_TAG.test('v0.1-1.4.214')).toBe(true)
    expect(DESKTOP_STABLE_TAG.test('v1.4.214')).toBe(true)
    expect(DESKTOP_RC_TAG.test('v0.1-1.4.214-rc.1')).toBe(true)
    expect(DESKTOP_RC_TAG.test('v1.4.214-rc.1')).toBe(true)
  })

  it('parses desktop stable tag with adehone prefix', () => {
    const parsed = parseDesktopStableTag('v0.1-1.4.214')
    expect(parsed).toEqual({
      tag: 'v0.1-1.4.214',
      adehonePrefix: '0.1',
      major: 1,
      minor: 4,
      patch: 214
    })
  })

  it('formats display version cleanly without redundant adehone prefix in orca portion', () => {
    expect(ADEHONE_VERSION).toBe('0.1')
    expect(formatAdehoneDisplayVersion('0.1-1.4.214-daily.202611160530')).toBe(
      '0.1 (Orca 1.4.214-daily.202611160530)'
    )
    expect(formatAdehoneDisplayVersion('1.4.214')).toBe('0.1 (Orca 1.4.214)')
  })
})
