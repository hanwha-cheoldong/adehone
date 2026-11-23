export type CheckRunRecency = {
  name?: string | null
  id?: number | null
  startedAt?: string | null
  completedAt?: string | null
}

function parseTimestampMs(value: string | null | undefined): number | null {
  if (!value) {
    return null
  }
  const ms = Date.parse(value)
  return Number.isFinite(ms) ? ms : null
}

function isNewerCheckRun(candidate: CheckRunRecency, current: CheckRunRecency): boolean {
  if (
    typeof candidate.id === 'number' &&
    typeof current.id === 'number' &&
    candidate.id !== current.id
  ) {
    return candidate.id > current.id
  }
  const candidateTime =
    parseTimestampMs(candidate.startedAt) ?? parseTimestampMs(candidate.completedAt)
  const currentTime = parseTimestampMs(current.startedAt) ?? parseTimestampMs(current.completedAt)
  if (candidateTime !== null && currentTime !== null && candidateTime !== currentTime) {
    return candidateTime > currentTime
  }
  return true
}

/** Keeps only the latest check run per non-empty check name so superseded runs do not linger as failures. */
export function dedupeLatestCheckRuns<T>(
  items: readonly T[],
  getMeta: (item: T) => CheckRunRecency | null
): T[] {
  const result: T[] = []
  const metaByIndex: (CheckRunRecency | null)[] = []
  const indexByName = new Map<string, number>()

  for (const item of items) {
    const meta = getMeta(item)
    const name = meta?.name?.trim()
    if (!meta || !name) {
      result.push(item)
      metaByIndex.push(meta)
      continue
    }
    const existingIndex = indexByName.get(name)
    if (existingIndex === undefined) {
      indexByName.set(name, result.length)
      result.push(item)
      metaByIndex.push(meta)
      continue
    }
    if (isNewerCheckRun(meta, metaByIndex[existingIndex]!)) {
      result[existingIndex] = item
      metaByIndex[existingIndex] = meta
    }
  }
  return result
}
