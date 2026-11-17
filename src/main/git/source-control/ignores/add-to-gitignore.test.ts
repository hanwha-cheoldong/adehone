import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { appendPathToGitignore, formatGitignorePattern } from './add-to-gitignore'

describe('formatGitignorePattern', () => {
  it('formats root-anchored file and directory rules differently', () => {
    expect(formatGitignorePattern('debug.log', false)).toBe('/debug.log')
    expect(formatGitignorePattern('src/generated/types.ts', false)).toBe('/src/generated/types.ts')
    expect(formatGitignorePattern('dist', true)).toBe('/dist/')
    expect(formatGitignorePattern('src/generated/', true)).toBe('/src/generated/')
  })

  it('rejects parent traversal and newlines', () => {
    expect(() => formatGitignorePattern('../secret.txt', false)).toThrow()
    expect(() => formatGitignorePattern('foo\nbar', false)).toThrow()
  })
})

describe('appendPathToGitignore', () => {
  let dir = ''

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'adehone-gitignore-'))
  })

  afterEach(async () => {
    if (dir) {
      await rm(dir, { recursive: true, force: true })
    }
  })

  it('creates .gitignore and avoids duplicate entries', async () => {
    expect(await appendPathToGitignore(dir, 'build', true)).toBe(true)
    expect(await appendPathToGitignore(dir, 'build', true)).toBe(false)
    expect(await appendPathToGitignore(dir, 'notes.txt', false)).toBe(true)
    expect(await appendPathToGitignore(dir, 'notes.txt', false)).toBe(false)

    const content = await readFile(join(dir, '.gitignore'), 'utf-8')
    expect(content).toBe('/build/\n/notes.txt\n')
  })

  it('adds a leading newline when existing .gitignore lacks one', async () => {
    await writeFile(join(dir, '.gitignore'), '*.log', 'utf-8')
    expect(await appendPathToGitignore(dir, 'tmp', true)).toBe(true)
    const content = await readFile(join(dir, '.gitignore'), 'utf-8')
    expect(content).toBe('*.log\n/tmp/\n')
  })
})
