import { appendFile, readFile } from 'node:fs/promises'
import * as path from 'node:path'
import { getSafeRelativePath } from '../../worktrees/content-paths/worktree-symlink-detection'

export function formatGitignorePattern(relativePath: string, isDirectory: boolean): string {
  const validated = getSafeRelativePath(relativePath)
  if (!validated.safe || /[\r\n]/.test(validated.rel)) {
    throw new Error(`Refusing to add unsafe path to .gitignore: ${relativePath}`)
  }
  return isDirectory ? `/${validated.rel}/` : `/${validated.rel}`
}

export async function appendPathToGitignore(
  worktreePath: string,
  relativePath: string,
  isDirectory: boolean
): Promise<boolean> {
  const line = formatGitignorePattern(relativePath, isDirectory)
  const unanchoredLine = line.slice(1)
  const gitignorePath = path.join(worktreePath, '.gitignore')
  let existingContent = ''
  try {
    existingContent = await readFile(gitignorePath, 'utf-8')
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error
    }
  }
  const alreadyListed = existingContent
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .some((entry) => entry === line || entry === unanchoredLine)
  if (alreadyListed) {
    return false
  }
  const eol = existingContent.includes('\r\n') ? '\r\n' : '\n'
  const needsLeadingNewline = existingContent.length > 0 && !existingContent.endsWith('\n')
  await appendFile(gitignorePath, `${needsLeadingNewline ? eol : ''}${line}${eol}`, 'utf-8')
  return true
}
