import { useCallback, useEffect, useState } from 'react'
import { getComputerUsePermissionSetupState } from './setup-guide-progress-readiness'

export function useComputerUsePermissionReadiness(shouldReadComputerUsePermissions: boolean): {
  computerUsePermissionsReady: boolean
  computerUsePermissionStatusChecked: boolean
  computerUseUnavailable: boolean
} {
  const [computerUsePermissionsReady, setComputerUsePermissionsReady] = useState(false)
  const [computerUsePermissionStatusChecked, setComputerUsePermissionStatusChecked] =
    useState(false)
  const [computerUseUnavailable, setComputerUseUnavailable] = useState(false)
  const readComputerUsePermissions = useCallback(async (isStale: () => boolean): Promise<void> => {
    const status = await window.api.computerUsePermissions.getStatus().catch(() => null)
    if (isStale()) {
      return
    }
    const permissionState = getComputerUsePermissionSetupState(status)
    setComputerUsePermissionStatusChecked(true)
    setComputerUsePermissionsReady(permissionState.ready)
    setComputerUseUnavailable(permissionState.unavailable)
  }, [])

  useEffect(() => {
    if (!shouldReadComputerUsePermissions) {
      // Unavailable steps must clear stale permission state before readiness is derived.
      setComputerUsePermissionStatusChecked(false)
      setComputerUsePermissionsReady(false)
      setComputerUseUnavailable(false)
      return
    }
    let stale = false
    const refreshComputerUsePermissions = (): void => {
      void readComputerUsePermissions(() => stale)
    }
    refreshComputerUsePermissions()
    const handleFocus = (): void => {
      void refreshComputerUsePermissions()
    }
    const handleVisibilityChange = (): void => {
      if (document.visibilityState === 'visible') {
        void refreshComputerUsePermissions()
      }
    }
    // Users grant OS permissions elsewhere; refresh on return without remounting.
    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      stale = true
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [readComputerUsePermissions, shouldReadComputerUsePermissions])

  return {
    computerUsePermissionsReady,
    computerUsePermissionStatusChecked,
    computerUseUnavailable
  }
}
