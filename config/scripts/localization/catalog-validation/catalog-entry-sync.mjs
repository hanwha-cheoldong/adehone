import fs from 'node:fs/promises'

export function getCatalogEntry(catalog, key) {
  return key.split('.').reduce((cursor, part) => cursor?.[part], catalog)
}

export function setCatalogEntry(catalog, key, value) {
  const parts = key.split('.')
  let cursor = catalog
  for (const part of parts.slice(0, -1)) {
    if (typeof cursor[part] !== 'object' || cursor[part] === null || Array.isArray(cursor[part])) {
      cursor[part] = {}
    }
    cursor = cursor[part]
  }
  cursor[parts.at(-1)] = value
}

export function flattenCatalogEntries(value, prefix = '', entries = new Map()) {
  if (typeof value === 'string') {
    entries.set(prefix, value)
    return entries
  }
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return entries
  }
  for (const [key, child] of Object.entries(value)) {
    flattenCatalogEntries(child, prefix ? `${prefix}.${key}` : key, entries)
  }
  return entries
}

export function applyMissingCatalogEntries(catalog, entries) {
  let changed = 0

  for (const [key, value] of entries) {
    if (getCatalogEntry(catalog, key) !== undefined) {
      continue
    }
    setCatalogEntry(catalog, key, value)
    changed += 1
  }

  return changed
}

export async function syncKoreanCatalogFromEnglish(
  enCatalog,
  localeCatalog,
  localeCatalogPath,
  fileName
) {
  if (fileName !== 'ko.json') {
    return
  }
  const added = applyMissingCatalogEntries(localeCatalog, flattenCatalogEntries(enCatalog))
  if (added > 0) {
    await fs.writeFile(localeCatalogPath, `${JSON.stringify(localeCatalog, null, 2)}\n`, 'utf8')
    console.log(`Added ${added} missing localization key(s) to ko.json.`)
  }
}
