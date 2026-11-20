import type * as GitExecFileModule from '../../git/command-runner/git-exec-file'
import type * as GhExecFileModule from '../../git/command-runner/hosted-cli/gh-exec-file'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { gitExecFileAsyncMock, ghExecFileAsyncMock, readLocalGitConfigSignatureMock } = vi.hoisted(
  () => ({
    gitExecFileAsyncMock: vi.fn(),
    ghExecFileAsyncMock: vi.fn(),
    readLocalGitConfigSignatureMock: vi.fn(async () => 'sig')
  })
)

vi.mock('../../git/command-runner/git-exec-file', async (importOriginal) => ({
  ...(await importOriginal<typeof GitExecFileModule>()),
  gitExecFileAsync: gitExecFileAsyncMock
}))

vi.mock('../../git/command-runner/hosted-cli/gh-exec-file', async (importOriginal) => ({
  ...(await importOriginal<typeof GhExecFileModule>()),
  ghExecFileAsync: ghExecFileAsyncMock
}))

vi.mock('./local-git-config-signature', () => ({
  readLocalGitConfigSignature: readLocalGitConfigSignatureMock
}))

import { _resetRemoteNameListingCache } from '../../git/remotes/remote-name-listing'
import { _resetOwnerRepoCache } from './github-repository-identity'
import { resolveGitHubApiRepositoryCandidates } from './github-api-repository'
import { _resetOriginGitHubApiRepositoryCache } from './github-api-repository-remote-probe'
import { resolvePRRepositoryCandidates } from './github-owner-repo-selection'
import { probeRepoUpstream } from '../client/fetch/repo-slug-upstream'

import { acquire, release } from '../execution/github-operation-slots'

afterEach(() => vi.useRealTimers())

const NON_FORK_PATH = '/tmp/plain-checkout'
const FORK_PATH = '/tmp/fork-checkout'

const REMOTE_URLS_BY_REPO: Record<string, Record<string, string>> = {
  [NON_FORK_PATH]: { origin: 'https://github.com/stablyai/orca.git' },
  [FORK_PATH]: {
    origin: 'https://github.com/hanwha-cheoldong/adehone.git',
    upstream: 'https://github.com/stablyai/orca.git'
  }
}

beforeEach(() => {
  _resetOwnerRepoCache()
  _resetOriginGitHubApiRepositoryCache()
  _resetRemoteNameListingCache()
  gitExecFileAsyncMock.mockReset()
  ghExecFileAsyncMock.mockReset()
  gitExecFileAsyncMock.mockImplementation(
    async (args: string[], options: { cwd?: string } = {}) => {
      const configured = REMOTE_URLS_BY_REPO[options.cwd ?? ''] ?? {}
      if (args[0] === 'remote' && args[1] !== 'get-url') {
        return { stdout: `${Object.keys(configured).join('\n')}\n` }
      }
      const remoteName = args[2]
      const url = configured[remoteName]
      if (!url) {
        const err = new Error(`fatal: No such remote '${remoteName}'`) as Error & { code?: number }
        err.code = 128
        throw err
      }
      return { stdout: url }
    }
  )
})

describe('optional parent evidence', () => {
  it('bounds global admission and leaves origin avatar evidence usable on failure', async () => {
    vi.useFakeTimers()
    for (let slot = 0; slot < 4; slot++) {
      await acquire()
    }
    try {
      const pending = probeRepoUpstream(NON_FORK_PATH)
      await vi.advanceTimersByTimeAsync(10_000)
      expect(await pending).toEqual({
        upstream: undefined,
        origin: { owner: 'stablyai', repo: 'orca', host: 'github.com' }
      })
      expect(ghExecFileAsyncMock).not.toHaveBeenCalled()
      let nextStarted = false
      const next = acquire().then(() => {
        nextStarted = true
        release()
      })
      await Promise.resolve()
      expect(nextStarted).toBe(false)
      release()
      await next
      for (let slot = 0; slot < 3; slot++) {
        release()
      }
    } catch (error) {
      for (let slot = 0; slot < 4; slot++) {
        release()
      }
      throw error
    }
  })

  it('prefers origin before upstream in PR repository candidates for forks', async () => {
    const expectedOriginApi = { owner: 'hanwha-cheoldong', repo: 'adehone', host: 'github.com' }
    const expectedUpstreamApi = { owner: 'stablyai', repo: 'orca', host: 'github.com' }
    const expectedOrigin = { owner: 'hanwha-cheoldong', repo: 'adehone' }
    const expectedUpstream = { owner: 'stablyai', repo: 'orca' }

    await expect(resolveGitHubApiRepositoryCandidates(FORK_PATH)).resolves.toEqual({
      candidates: [expectedOriginApi, expectedUpstreamApi],
      headRepo: expectedOriginApi
    })
    await expect(resolvePRRepositoryCandidates(FORK_PATH)).resolves.toEqual({
      candidates: [expectedOrigin, expectedUpstream],
      headRepo: expectedOrigin
    })
  })
})
