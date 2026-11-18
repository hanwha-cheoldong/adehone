import { useEffect, useRef, useState } from 'react'

const MINIMUM_LOADING_HOLD_MS = 1000

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
  const [holdState, setHoldState] = useState<{ key: string; expired: boolean } | null>(null)
  const heldCopyRef = useRef<{ key: string; title: string; description: string } | null>(null)

  if (!holdKey && holdState !== null) {
    setHoldState(null)
  } else if (holdKey && isLoading && holdState?.key !== holdKey) {
    setHoldState({ key: holdKey, expired: false })
  }

  if (holdKey && isLoading) {
    heldCopyRef.current = { key: holdKey, title, description }
  } else if (!holdKey) {
    heldCopyRef.current = null
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
  const heldCopy = heldCopyRef.current?.key === holdKey ? heldCopyRef.current : null
  const useHeldCopy = isHolding && !isLoading && heldCopy !== null
  return {
    isHolding,
    title: useHeldCopy ? heldCopy.title : title,
    description: useHeldCopy ? heldCopy.description : description
  }
}
