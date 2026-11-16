import { describe, expect, it } from 'vitest'
import { parseBitbucketDataCenterRepoRef } from './repository-ref'

const SERVERS = ['https://bitbucket.example.com', 'https://git.corp.internal/bitbucket'] as const

describe('parseBitbucketDataCenterRepoRef', () => {
  it('returns null when no Bitbucket Data Center server is configured', () => {
    expect(
      parseBitbucketDataCenterRepoRef('https://bitbucket.example.com/scm/PROJ/app.git', [])
    ).toBeNull()
  })

  it('ignores remotes whose host is not registered', () => {
    expect(
      parseBitbucketDataCenterRepoRef('https://gitea.example.com/scm/PROJ/app.git', SERVERS)
    ).toBeNull()
  })

  it('parses HTTP /scm clone URLs without a context path', () => {
    expect(
      parseBitbucketDataCenterRepoRef('https://bitbucket.example.com/scm/PROJ/my-repo.git', SERVERS)
    ).toEqual({
      host: 'bitbucket.example.com',
      projectKey: 'PROJ',
      repoSlug: 'my-repo',
      baseUrl: 'https://bitbucket.example.com',
      apiBaseUrl: 'https://bitbucket.example.com/rest/api/1.0'
    })
  })

  it('parses HTTP /scm clone URLs with a context path', () => {
    expect(
      parseBitbucketDataCenterRepoRef(
        'https://git.corp.internal/bitbucket/scm/CORE/service.git',
        SERVERS
      )
    ).toEqual({
      host: 'git.corp.internal',
      projectKey: 'CORE',
      repoSlug: 'service',
      baseUrl: 'https://git.corp.internal/bitbucket',
      apiBaseUrl: 'https://git.corp.internal/bitbucket/rest/api/1.0'
    })
  })

  it('parses personal user repository browse URLs', () => {
    expect(
      parseBitbucketDataCenterRepoRef(
        'https://bitbucket.example.com/users/alice/repos/scratch/browse',
        SERVERS
      )
    ).toEqual({
      host: 'bitbucket.example.com',
      projectKey: '~alice',
      repoSlug: 'scratch',
      baseUrl: 'https://bitbucket.example.com',
      apiBaseUrl: 'https://bitbucket.example.com/rest/api/1.0'
    })
  })

  it('parses ssh:// and scp-like SSH clone URLs for registered hosts', () => {
    expect(
      parseBitbucketDataCenterRepoRef('ssh://git@bitbucket.example.com:7999/PROJ/web.git', SERVERS)
    ).toEqual({
      host: 'bitbucket.example.com',
      projectKey: 'PROJ',
      repoSlug: 'web',
      baseUrl: 'https://bitbucket.example.com',
      apiBaseUrl: 'https://bitbucket.example.com/rest/api/1.0'
    })

    expect(
      parseBitbucketDataCenterRepoRef('git@git.corp.internal:CORE/service.git', SERVERS)
    ).toEqual({
      host: 'git.corp.internal',
      projectKey: 'CORE',
      repoSlug: 'service',
      baseUrl: 'https://git.corp.internal/bitbucket',
      apiBaseUrl: 'https://git.corp.internal/bitbucket/rest/api/1.0'
    })
  })
})
