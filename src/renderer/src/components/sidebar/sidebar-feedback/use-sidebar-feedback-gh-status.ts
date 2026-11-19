import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import type { GitHubViewer } from '../../../../../shared/github/pull-requests/pull-request-types'
import type { FeedbackGhCliStatus } from './SidebarFeedbackGitHubStatus'

/** Probe authenticated viewer and gh CLI install/auth status when the feedback dialog opens. */
export function useSidebarFeedbackGhStatus(params: {
  open: boolean
  mountedRef: RefObject<boolean>
}): {
  viewer: GitHubViewer | null
  ghStatus: FeedbackGhCliStatus
  isRecheckingGh: boolean
  setViewer: (viewer: GitHubViewer | null) => void
  setGhStatus: (status: FeedbackGhCliStatus) => void
  refreshGhStatus: (force: boolean) => Promise<void>
} {
  const { open, mountedRef } = params
  const [viewer, setViewer] = useState<GitHubViewer | null>(null)
  const [ghStatus, setGhStatus] = useState<FeedbackGhCliStatus>('checking')
  const [isRecheckingGh, setIsRecheckingGh] = useState(false)
  const ghProbeIdRef = useRef(0)

  const refreshGhStatus = useCallback(
    async (force: boolean): Promise<void> => {
      const probeId = ++ghProbeIdRef.current
      if (force) {
        setIsRecheckingGh(true)
      } else {
        setGhStatus('checking')
      }
      try {
        const [nextViewer, preflight] = await Promise.all([
          window.api.gh.viewer().catch(() => null),
          window.api.preflight?.check
            ? window.api.preflight.check(force ? { force: true } : undefined).catch(() => null)
            : Promise.resolve(null)
        ])
        if (!mountedRef.current || ghProbeIdRef.current !== probeId) {
          return
        }
        if (nextViewer) {
          setViewer(nextViewer)
          setGhStatus('connected')
          return
        }
        setViewer(null)
        if (!preflight) {
          setGhStatus('unavailable')
        } else if (!preflight.gh.installed) {
          setGhStatus('not-installed')
        } else if (!preflight.gh.authenticated) {
          setGhStatus('not-authenticated')
        } else {
          setGhStatus('unavailable')
        }
      } finally {
        if (mountedRef.current && ghProbeIdRef.current === probeId) {
          setIsRecheckingGh(false)
        }
      }
    },
    [mountedRef]
  )

  useEffect(() => {
    if (!open) {
      ghProbeIdRef.current += 1
      return
    }
    void refreshGhStatus(false)
  }, [open, refreshGhStatus])

  return {
    viewer,
    ghStatus,
    isRecheckingGh,
    setViewer,
    setGhStatus,
    refreshGhStatus
  }
}
