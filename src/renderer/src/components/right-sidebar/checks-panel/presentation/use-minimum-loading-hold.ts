import { useEffect, useState } from 'react'

const MINIMUM_LOADING_HOLD_MS = 1000

type HoldState = {
  key: string
  expired: boolean
  title: string
  description: string
}

/** Hold an active loading state for at least 1s per context so brief checks do not flash. */
export function useMinimumLoadingHold(args: {
  holdKey: string
  isLoading: boolean
  title: string
  description: string
}): {
  isHolding: boolean
  title: string
  description: string
} {
  const { holdKey, isLoading, title, description } = args
  const [holdState, setHoldState] = useState<HoldState | null>(null)

  if (!holdKey && holdState !== null) {
    setHoldState(null)
  } else if (holdKey && isLoading) {
    if (holdState?.key !== holdKey) {
      setHoldState({ key: holdKey, expired: false, title, description })
    } else if (holdState.title !== title || holdState.description !== description) {
      setHoldState({ ...holdState, title, description })
    }
  }

  const activeKey = holdState?.key ?? null
  const activeExpired = holdState?.expired ?? true

  useEffect(() => {
    if (!activeKey || activeExpired) {
      return undefined
    }
    const timer = window.setTimeout(() => {
      setHoldState((current) =>
        current && current.key === activeKey ? { ...current, expired: true } : current
      )
    }, MINIMUM_LOADING_HOLD_MS)
    return () => window.clearTimeout(timer)
  }, [activeKey, activeExpired])

  const isHolding = Boolean(holdKey) && holdState?.key === holdKey && !holdState.expired
  const useHeldCopy = isHolding && !isLoading
  return {
    isHolding,
    title: useHeldCopy ? holdState.title : title,
    description: useHeldCopy ? holdState.description : description
  }
}
