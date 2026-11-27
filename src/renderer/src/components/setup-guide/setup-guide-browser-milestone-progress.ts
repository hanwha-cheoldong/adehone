import { useEffect, useMemo } from 'react'
import { useAppStore } from '@/store/index'
import { FEATURE_WALL_SETUP_CORE_STEP_IDS } from '../../../../shared/feature-education/explore/feature-wall-setup-steps'
import type { FeatureWallSetupProgress } from '../feature-wall/setup/feature-wall-setup-progress'

export function useSetupGuideBrowserMilestoneProgress(
  rawProgress: FeatureWallSetupProgress,
  preBrowserSetupComplete: boolean
): FeatureWallSetupProgress {
  const setupGuideSidebarDismissed = useAppStore((s) => s.setupGuideSidebarDismissed)
  const browserMilestoneMigrated = useAppStore((s) => s.setupGuideBrowserMilestoneMigrated)
  const browserMilestoneLegacyComplete = useAppStore(
    (s) => s.setupGuideBrowserMilestoneLegacyComplete
  )
  const markBrowserMilestoneMigrated = useAppStore((s) => s.markSetupGuideBrowserMilestoneMigrated)
  const pendingLegacyComplete =
    !browserMilestoneMigrated && rawProgress.ready
      ? shouldMarkBrowserMilestoneLegacyComplete({
          preBrowserSetupComplete,
          setupGuideSidebarDismissed
        })
      : false
  const effectiveLegacyComplete = browserMilestoneLegacyComplete || pendingLegacyComplete

  useEffect(() => {
    if (browserMilestoneMigrated || !rawProgress.ready) {
      return
    }
    markBrowserMilestoneMigrated(pendingLegacyComplete)
  }, [
    browserMilestoneMigrated,
    markBrowserMilestoneMigrated,
    pendingLegacyComplete,
    rawProgress.ready
  ])

  return useMemo(
    () => getSetupGuideBrowserMilestoneAwareProgress(rawProgress, effectiveLegacyComplete),
    [effectiveLegacyComplete, rawProgress]
  )
}

export function shouldMarkBrowserMilestoneLegacyComplete(input: {
  preBrowserSetupComplete: boolean
  setupGuideSidebarDismissed: boolean
}): boolean {
  return input.setupGuideSidebarDismissed || input.preBrowserSetupComplete
}

export function getSetupGuideBrowserMilestoneAwareProgress(
  progress: FeatureWallSetupProgress,
  browserMilestoneLegacyComplete: boolean
): FeatureWallSetupProgress {
  if (!browserMilestoneLegacyComplete) {
    return progress
  }
  // Optional steps keep their real state: finishing the old checklist never made a mobile bot.
  const stepDone = { ...progress.stepDone }
  for (const stepId of FEATURE_WALL_SETUP_CORE_STEP_IDS) {
    stepDone[stepId] = true
  }
  // Preserve the checklist contract for profiles that completed or dismissed it before the browser milestone.
  return {
    ...progress,
    stepDone,
    coreDoneCount: FEATURE_WALL_SETUP_CORE_STEP_IDS.length,
    coreTotal: FEATURE_WALL_SETUP_CORE_STEP_IDS.length
  }
}
