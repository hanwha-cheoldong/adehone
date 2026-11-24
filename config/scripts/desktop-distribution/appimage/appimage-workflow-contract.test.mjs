import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const WORKFLOWS_DIR = resolve('.github/workflows')

describe('Linux AppImage workflow rebranding contract', () => {
  it('never references legacy orca-linux AppImage paths in GitHub workflows', () => {
    const workflowFiles = readdirSync(WORKFLOWS_DIR).filter(
      (name) => name.endsWith('.yml') || name.endsWith('.yaml')
    )
    for (const file of workflowFiles) {
      const content = readFileSync(resolve(WORKFLOWS_DIR, file), 'utf8')
      expect(content, `${file} must use adehone-linux AppImage paths`).not.toMatch(
        /orca-linux(?:-arm64)?\.AppImage/
      )
    }
  })

  it('passes dist/adehone-linux.AppImage to package verification scripts in pr.yml', () => {
    const prWorkflow = readFileSync(resolve(WORKFLOWS_DIR, 'pr.yml'), 'utf8')
    expect(prWorkflow).toContain('--appimage dist/adehone-linux.AppImage --all-entrypoints')
    expect(prWorkflow).toContain('--appimage dist/adehone-linux.AppImage')
  })
})
