// Seeded as references/bridge-client.ts; avoid backticks so it stays a plain template literal.
export const MOBILE_WEB_BRIDGE_CLIENT = `// Reference web client for references/bridge-protocol.md. Adapt it, but keep the wire format.
// Create one instance per document: it owns the native-to-web receivers.

export type BridgeError = { code: string; message: string }
export type BridgeResult =
  | { id: string; ok: true; data: unknown }
  | { id: string; ok: false; error: BridgeError }
export type BridgeCallOptions = { timeoutMs?: number; signal?: AbortSignal }

type NativePort = { postMessage(message: string): void }
type BridgeWindow = Window & {
  AppBridge?: NativePort & { onmessage?: ((event: { data: unknown }) => void) | null }
  webkit?: { messageHandlers?: { AppBridge?: NativePort } }
  __appBridgeReceive?: (message: unknown) => void
}

const USER_PACED_ACTIONS = new Set([
  'authenticateBiometric',
  'socialLogin',
  'openCamera',
  'pickMedia',
  'share',
  'getLocation'
])

function failure(id: string, code: string, message: string): BridgeResult {
  return { id, ok: false, error: { code, message } }
}

function parseMessage(raw: unknown): Record<string, unknown> | null {
  try {
    const value: unknown = typeof raw === 'string' ? JSON.parse(raw) : raw
    return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null
  } catch {
    return null
  }
}

export function createBridgeClient(defaults: { timeoutMs?: number } = {}) {
  const host = window as BridgeWindow
  const pending = new Map<string, (result: BridgeResult) => void>()
  const listeners = new Map<string, Set<(data: unknown) => void>>()
  const documentTag = Math.random().toString(36).slice(2, 8)
  let sequence = 0

  function receive(raw: unknown): void {
    const message = parseMessage(raw)
    if (!message) {
      return
    }
    if (typeof message.event === 'string') {
      listeners.get(message.event)?.forEach((listener) => listener(message.data))
      return
    }
    const { id, ok } = message
    if (typeof id !== 'string' || typeof ok !== 'boolean') {
      return
    }
    if (ok) {
      pending.get(id)?.({ id, ok, data: message.data })
      return
    }
    const error = message.error as Partial<BridgeError> | undefined
    pending.get(id)?.(
      failure(id, String(error?.code ?? 'INTERNAL_ERROR'), String(error?.message ?? ''))
    )
  }

  host.__appBridgeReceive = receive
  if (host.AppBridge) {
    host.AppBridge.onmessage = (event) => receive(event.data)
  }

  function call(
    action: string,
    payload: object = {},
    options: BridgeCallOptions = {}
  ): Promise<BridgeResult> {
    sequence += 1
    const id = documentTag + '-' + sequence
    const port = host.webkit?.messageHandlers?.AppBridge ?? host.AppBridge
    if (typeof port?.postMessage !== 'function') {
      return Promise.resolve(failure(id, 'BRIDGE_UNAVAILABLE', 'No native host'))
    }
    if (options.signal?.aborted) {
      return Promise.resolve(failure(id, 'ABORTED', 'Cancelled before sending'))
    }
    const timeoutMs =
      options.timeoutMs ??
      (USER_PACED_ACTIONS.has(action) ? 300_000 : (defaults.timeoutMs ?? 10_000))

    return new Promise((resolve) => {
      const onAbort = (): void => settle(failure(id, 'ABORTED', 'Cancelled by caller'))
      const timer = setTimeout(() => settle(failure(id, 'TIMEOUT', action)), timeoutMs)
      function settle(result: BridgeResult): void {
        if (!pending.delete(id)) {
          return
        }
        clearTimeout(timer)
        options.signal?.removeEventListener('abort', onAbort)
        resolve(result)
      }
      pending.set(id, settle)
      options.signal?.addEventListener('abort', onAbort)
      try {
        port.postMessage(JSON.stringify({ id, action, payload }))
      } catch {
        settle(failure(id, 'INTERNAL_ERROR', 'postMessage failed'))
      }
    })
  }

  function on(event: string, listener: (data: unknown) => void): () => void {
    const set = listeners.get(event) ?? new Set()
    set.add(listener)
    listeners.set(event, set)
    return () => {
      set.delete(listener)
    }
  }

  // Safe on pagehide: the client keeps working if the page returns from the back-forward cache.
  function cancelPending(): void {
    Array.from(pending).forEach(([id, settle]) =>
      settle(failure(id, 'ABORTED', 'Page is going away'))
    )
  }

  function dispose(): void {
    cancelPending()
    listeners.clear()
    delete host.__appBridgeReceive
    if (host.AppBridge) {
      host.AppBridge.onmessage = null
    }
  }

  return { call, on, cancelPending, dispose }
}
`
