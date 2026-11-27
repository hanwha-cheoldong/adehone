// Conventional Branch 1.1.0 `<type>/<description>`, plus one project exception: Hangul in descriptions.
export const BRANCH_WORK_TYPES = ['feat', 'fix', 'hotfix', 'release', 'chore'] as const
export type BranchWorkType = (typeof BRANCH_WORK_TYPES)[number]
export const DEFAULT_BRANCH_WORK_TYPE: BranchWorkType = 'feat'

const TYPE_BY_ALIAS: ReadonlyMap<string, BranchWorkType> = new Map<string, BranchWorkType>([
  ...BRANCH_WORK_TYPES.map((type) => [type, type] as const),
  ['feature', 'feat'],
  ['bugfix', 'fix']
])

// `release` is read only as `release/…`: names such as `release-notes-page` are descriptions.
const LEADING_WORD_TYPE = /^\s*(feat|feature|fix|bugfix|hotfix|chore)[\s_:-]+(?=[^\s_:-])/i

export function parseBranchWorkType(value: string): BranchWorkType | undefined {
  return TYPE_BY_ALIAS.get(value.trim().toLowerCase())
}

// Keeps a-z, 0-9, Hangul letters, `-` and `.`.
const DISALLOWED_DESCRIPTION_CHARS = /(?!\p{L})\p{Script=Hangul}|[^a-z0-9.\p{Script=Hangul}-]/gu

function foldAccentsOutsideHangul(value: string): string {
  // NFC first so macOS-decomposed Hangul stays composed; NFKD on Hangul would split it again.
  return value
    .normalize('NFC')
    .replace(/\P{Script=Hangul}+/gu, (run) => run.normalize('NFKD').replace(/\p{M}/gu, ''))
}

/** One description with no slash; empty when no allowed character remains. */
export function normalizeBranchDescription(value: string): string {
  return foldAccentsOutsideHangul(value)
    .toLowerCase()
    .replace(/\p{M}/gu, '')
    .replace(DISALLOWED_DESCRIPTION_CHARS, '-')
    .replace(/[.-]{2,}/g, (run) => (run.includes('-') ? '-' : '.'))
    .replace(/^[.-]+|[.-]+$/g, '')
    .replace(/\.lock$/, '-lock')
}

/** The type written in front of a name, even when nothing allowed follows it. */
export function splitBranchWorkType(name: string): {
  type?: BranchWorkType
  description: string
} {
  const segments = name.split('/').filter((segment) => segment.trim())
  const slashType =
    segments.length > 1 ? TYPE_BY_ALIAS.get(normalizeBranchDescription(segments[0])) : undefined
  const marker = slashType ? null : LEADING_WORD_TYPE.exec(name)
  const rest = slashType
    ? segments.slice(1)
    : marker
      ? name.slice(marker[0].length).split('/')
      : segments
  return {
    type: slashType ?? (marker ? TYPE_BY_ALIAS.get(marker[1].toLowerCase()) : undefined),
    description: rest.map(normalizeBranchDescription).filter(Boolean).join('-')
  }
}

function includesTicket(description: string, ticket: string): boolean {
  // Only ASCII letters/digits extend a ticket, so `issue-98번` still counts and `issue-980` does not.
  let from = description.indexOf(ticket)
  while (from !== -1) {
    const before = description.charAt(from - 1)
    const after = description.charAt(from + ticket.length)
    if (!/[a-z0-9]/.test(before) && !/[a-z0-9]/.test(after)) {
      return true
    }
    from = description.indexOf(ticket, from + 1)
  }
  return false
}

export function prependBranchTicket(description: string, ticket: string | undefined): string {
  const normalized = ticket ? normalizeBranchDescription(ticket) : ''
  if (!normalized || includesTicket(description, normalized)) {
    return description
  }
  return description ? `${normalized}-${description}` : normalized
}

export type ConventionalBranchInput = {
  name: string
  /** An explicit choice; it wins over a type written in the name. */
  type?: BranchWorkType
  ticket?: string
}

/** A name read once. Collision suffixes extend `description`, so they are never read as a type marker. */
export type ConventionalBranchParts = {
  type: BranchWorkType
  description: string
  ticket?: string
}

const FALLBACK_SUFFIX_ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789'
const FALLBACK_SUFFIX_LENGTH = 6

/** `workspace-<6 random a-z0-9>`: a final name for a typed one that leaves nothing to describe. */
export function createFallbackBranchDescription(): string {
  const suffix = Array.from({ length: FALLBACK_SUFFIX_LENGTH }, () =>
    FALLBACK_SUFFIX_ALPHABET.charAt(Math.floor(Math.random() * FALLBACK_SUFFIX_ALPHABET.length))
  )
  return `workspace-${suffix.join('')}`
}

/** `fallbackDescription` is used only when neither the name nor a ticket leaves a description. */
export function resolveBranchParts(
  input: ConventionalBranchInput,
  fallbackDescription?: () => string
): ConventionalBranchParts {
  const parsed = splitBranchWorkType(input.name)
  const type = input.type ?? parsed.type ?? DEFAULT_BRANCH_WORK_TYPE
  const described = parsed.description || prependBranchTicket('', input.ticket)
  return {
    type,
    description: described ? parsed.description : (fallbackDescription?.() ?? ''),
    ...(input.ticket ? { ticket: input.ticket } : {})
  }
}

/** `<type>/<description>`, or null when no description or ticket remains. */
export function formatConventionalBranch(parts: ConventionalBranchParts): string | null {
  const description = prependBranchTicket(
    normalizeBranchDescription(parts.description),
    parts.ticket
  )
  return description ? `${parts.type}/${description}` : null
}

/** The type segment of a `[prefix/]<type>/<description>` branch. */
export function readBranchWorkType(branchName: string): BranchWorkType | undefined {
  const typeSegment = branchName.split('/').at(-2)
  return typeSegment ? TYPE_BY_ALIAS.get(typeSegment) : undefined
}

/**
 * A rename describes the work and keeps the type the branch was created with; null when the new
 * name describes nothing.
 */
export function resolveRenamedBranchParts(
  currentBranch: string,
  newName: string,
  ticket: string | undefined
): ConventionalBranchParts | null {
  const type = readBranchWorkType(currentBranch) ?? DEFAULT_BRANCH_WORK_TYPE
  return splitBranchWorkType(newName).description
    ? resolveBranchParts({ name: newName, type, ticket })
    : null
}

/** A branch leaf without the ticket this module put in front of it. */
export function stripBranchTicket(leaf: string, ticket: string | undefined): string {
  const normalized = ticket ? normalizeBranchDescription(ticket) : ''
  return normalized && leaf.toLowerCase().startsWith(`${normalized}-`)
    ? leaf.slice(normalized.length + 1)
    : leaf
}
