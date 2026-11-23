const WINDOWS_RESERVED_NAME = /^(con|prn|aux|nul|com\d|lpt\d)$/

function toFolderSlug(value: string): string {
  return (
    value
      .normalize('NFKD')
      .toLowerCase()
      // Why: NFKD leaves an accent as a combining mark; drop it so it doesn't split the word.
      .replace(/(\p{M}+)|[^a-z0-9]+/gu, (_run, marks) => (marks ? '' : '-'))
      .replace(/^-+|-+$/g, '')
      .slice(0, 40)
      .replace(/-+$/, '')
  )
}

/** A folder name every supported filesystem accepts. */
export function botFolderName(botName: string, fallbackName?: string): string {
  const slug = toFolderSlug(botName)
  if (!slug || /^\d+$/.test(slug)) {
    const fallbackSlug = fallbackName ? toFolderSlug(fallbackName) : ''
    if (fallbackSlug) {
      const combined = slug
        ? `${fallbackSlug.slice(0, 40 - slug.length - 1).replace(/-+$/, '')}-${slug}`
        : fallbackSlug
      return WINDOWS_RESERVED_NAME.test(combined) ? `${combined}-bot` : combined
    }
    if (!slug) {
      return 'bot'
    }
  }
  return WINDOWS_RESERVED_NAME.test(slug) ? `${slug}-bot` : slug
}
