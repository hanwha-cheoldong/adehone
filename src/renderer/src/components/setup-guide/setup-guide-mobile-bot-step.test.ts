import { describe, expect, it } from 'vitest'
import { getDefaultSettings } from '../../../../shared/orca-profiles/constants'
import { isMobileBotSetupDone, parseMobileBotSetup } from '../../../../shared/bots/mobile-bot-setup'
import { getFeatureWallSetupProgress } from '../feature-wall/setup/feature-wall-setup-progress'
import { getSetupGuideBrowserMilestoneAwareProgress } from './setup-guide-browser-milestone-progress'

describe('the optional mobile bot setup step', () => {
  it('is never completed by the saved legacy checklist completion', () => {
    const fresh = getFeatureWallSetupProgress({
      settings: getDefaultSettings('/home/owner'),
      featureInteractions: {},
      hasConnectedTaskSource: false,
      browserUseSkillInstalled: false,
      computerUseSkillInstalled: false,
      computerUsePermissionsReady: false,
      orchestrationSkillInstalled: false,
      gitRepoCount: 0,
      worktreesByRepo: {},
      hasSetupScript: false,
      mobileBotSetupDone: false
    })

    const legacy = getSetupGuideBrowserMilestoneAwareProgress(fresh, true)

    expect(legacy.stepDone['mobile-dev-bots']).toBe(false)
    expect([legacy.coreDoneCount, legacy.coreTotal]).toEqual([8, 8])
  })

  it('needs every picked kind, counting only a named bot still listed on that host', () => {
    const setup = parseMobileBotSetup({
      selection: { hostId: 'local', kinds: ['android-dev', 'ios-dev'] },
      designated: { local: { 'ios-dev': 'mine' }, 'runtime:other': { 'android-dev': 'mine' } }
    })
    const android = { id: 'made', templateId: 'android-dev' }
    const done = (bots: { id: string; templateId?: string }[]): boolean =>
      isMobileBotSetupDone(setup, () => bots)

    expect(done([android, { id: 'mine' }])).toBe(true)
    // The named bot was deleted.
    expect(done([android])).toBe(false)
    // Another host's naming never covers a kind here.
    expect(done([{ id: 'mine' }])).toBe(false)
    // With no saved pick, only a bot made from a mobile template counts.
    expect(isMobileBotSetupDone(null, () => [{ id: 'mine' }])).toBe(false)
    expect(isMobileBotSetupDone(null, () => [android])).toBe(true)
  })

  it('never lets one bot cover two kinds, even when saved values name it twice', () => {
    const twice = parseMobileBotSetup({
      selection: { hostId: 'local', kinds: ['android-dev', 'ios-dev'] },
      designated: { local: { 'android-dev': 'mine', 'ios-dev': 'mine' } }
    })
    expect(isMobileBotSetupDone(twice, () => [{ id: 'mine' }])).toBe(false)

    const templateBotNamedElsewhere = parseMobileBotSetup({
      selection: { hostId: 'local', kinds: ['android-dev', 'ios-dev'] },
      designated: { local: { 'ios-dev': 'made' } }
    })
    expect(
      isMobileBotSetupDone(templateBotNamedElsewhere, () => [
        { id: 'made', templateId: 'android-dev' }
      ])
    ).toBe(false)
  })
})
