import { createRemoteRefProbeCache } from '../git/remotes/remote-ref-probe-cache'
import { listConfiguredBitbucketDataCenterBaseUrls } from './credential-connection'

export type BitbucketDataCenterRepoRef = {
  host: string
  projectKey: string
  repoSlug: string
  baseUrl: string
  apiBaseUrl: string
}

type LocalGitExecOptions = {
  wslDistro?: string
}

const repoRefProbeCache = createRemoteRefProbeCache((remoteUrl) =>
  parseBitbucketDataCenterRepoRef(remoteUrl, listConfiguredBitbucketDataCenterBaseUrls())
)

/** @internal - exposed for tests only */
export function _resetBitbucketDataCenterRepoRefCache(): void {
  repoRefProbeCache.clear()
}

/** @internal - exposed for tests only */
export function _getBitbucketDataCenterRepoRefCacheSize(): number {
  return repoRefProbeCache.size()
}

function decodeSegment(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function parseScmOrBrowsePath(
  pathname: string
): { projectKey: string; repoSlug: string; contextPath: string } | null {
  const withoutTrailing = pathname.replace(/\/+$/, '')
  const parts = withoutTrailing.split('/').filter(Boolean)

  // /scm/{projectKey}/{repoSlug}.git
  const scmIdx = parts.findIndex((part) => part.toLowerCase() === 'scm')
  if (scmIdx !== -1 && parts.length >= scmIdx + 3) {
    const projectKey = decodeSegment(parts[scmIdx + 1])
    const repoSlug = decodeSegment(parts[scmIdx + 2].replace(/\.git$/i, ''))
    if (projectKey && repoSlug) {
      const contextParts = parts.slice(0, scmIdx)
      return {
        projectKey,
        repoSlug,
        contextPath: contextParts.length > 0 ? `/${contextParts.join('/')}` : ''
      }
    }
  }

  // /projects/{projectKey}/repos/{repoSlug}/...
  const projectsIdx = parts.findIndex((part) => part.toLowerCase() === 'projects')
  if (
    projectsIdx !== -1 &&
    parts.length >= projectsIdx + 4 &&
    parts[projectsIdx + 2].toLowerCase() === 'repos'
  ) {
    const projectKey = decodeSegment(parts[projectsIdx + 1])
    const repoSlug = decodeSegment(parts[projectsIdx + 3].replace(/\.git$/i, ''))
    if (projectKey && repoSlug) {
      const contextParts = parts.slice(0, projectsIdx)
      return {
        projectKey,
        repoSlug,
        contextPath: contextParts.length > 0 ? `/${contextParts.join('/')}` : ''
      }
    }
  }

  // /users/{username}/repos/{repoSlug}/...
  const usersIdx = parts.findIndex((part) => part.toLowerCase() === 'users')
  if (
    usersIdx !== -1 &&
    parts.length >= usersIdx + 4 &&
    parts[usersIdx + 2].toLowerCase() === 'repos'
  ) {
    const username = decodeSegment(parts[usersIdx + 1])
    const repoSlug = decodeSegment(parts[usersIdx + 3].replace(/\.git$/i, ''))
    if (username && repoSlug) {
      const contextParts = parts.slice(0, usersIdx)
      return {
        projectKey: username.startsWith('~') ? username : `~${username}`,
        repoSlug,
        contextPath: contextParts.length > 0 ? `/${contextParts.join('/')}` : ''
      }
    }
  }

  return null
}

function parseSshPath(pathname: string): { projectKey: string; repoSlug: string } | null {
  const withoutSuffix = pathname.replace(/\/+$/, '').replace(/\.git$/i, '')
  const parts = withoutSuffix
    .split('/')
    .map((part) => part.trim())
    .filter(Boolean)
  if (parts.length >= 3 && parts[0].toLowerCase() === 'scm') {
    const projectKey = decodeSegment(parts[1])
    const repoSlug = decodeSegment(parts[2])
    return projectKey && repoSlug ? { projectKey, repoSlug } : null
  }
  if (parts.length === 2) {
    const projectKey = decodeSegment(parts[0])
    const repoSlug = decodeSegment(parts[1])
    return projectKey && repoSlug ? { projectKey, repoSlug } : null
  }
  return null
}

function matchConfiguredBaseUrl(
  configuredBaseUrls: readonly string[],
  hostname: string,
  origin?: string,
  contextPath?: string
): string | null {
  const lowerHost = hostname.toLowerCase()
  const candidates: { baseUrl: string; host: string; pathname: string }[] = []
  for (const raw of configuredBaseUrls) {
    try {
      const parsed = new URL(raw)
      if (parsed.hostname.toLowerCase() === lowerHost) {
        candidates.push({
          baseUrl: raw.replace(/\/+$/, ''),
          host: parsed.hostname.toLowerCase(),
          pathname: parsed.pathname.replace(/\/+$/, '')
        })
      }
    } catch {
      continue
    }
  }
  if (candidates.length === 0) {
    return null
  }
  if (origin !== undefined && contextPath !== undefined) {
    const expected = `${origin}${contextPath}`.replace(/\/+$/, '')
    const exact = candidates.find((c) => c.baseUrl.toLowerCase() === expected.toLowerCase())
    if (exact) {
      return exact.baseUrl
    }
    const sameContext = candidates.find(
      (c) => c.pathname.toLowerCase() === contextPath.toLowerCase()
    )
    if (sameContext) {
      return sameContext.baseUrl
    }
  }
  return candidates[0].baseUrl
}

export function parseBitbucketDataCenterRepoRef(
  remoteUrl: string,
  configuredBaseUrls: readonly string[]
): BitbucketDataCenterRepoRef | null {
  if (configuredBaseUrls.length === 0) {
    return null
  }
  const trimmed = remoteUrl.trim()

  // SCP-like SSH: git@bitbucket.corp.com:PROJ/repo.git (never match scheme:// URLs)
  const scpLike = !/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)
    ? trimmed.match(/^(?:[^@]+@)?([^:/\s]+):([^\s]+?)(?:\.git)?$/i)
    : null
  if (scpLike) {
    const host = scpLike[1].toLowerCase()
    const baseUrl = matchConfiguredBaseUrl(configuredBaseUrls, host)
    if (!baseUrl) {
      return null
    }
    const parsed = parseSshPath(scpLike[2])
    if (!parsed) {
      return null
    }
    return {
      host,
      projectKey: parsed.projectKey,
      repoSlug: parsed.repoSlug,
      baseUrl,
      apiBaseUrl: `${baseUrl}/rest/api/1.0`
    }
  }

  let url: URL
  try {
    url = new URL(trimmed)
  } catch {
    return null
  }

  const host = url.hostname.toLowerCase()
  if (url.protocol === 'ssh:') {
    const baseUrl = matchConfiguredBaseUrl(configuredBaseUrls, host)
    if (!baseUrl) {
      return null
    }
    const parsed = parseSshPath(url.pathname)
    if (!parsed) {
      return null
    }
    return {
      host,
      projectKey: parsed.projectKey,
      repoSlug: parsed.repoSlug,
      baseUrl,
      apiBaseUrl: `${baseUrl}/rest/api/1.0`
    }
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return null
  }

  const parsed = parseScmOrBrowsePath(url.pathname)
  if (!parsed) {
    return null
  }
  const baseUrl = matchConfiguredBaseUrl(configuredBaseUrls, host, url.origin, parsed.contextPath)
  if (!baseUrl) {
    return null
  }
  return {
    host,
    projectKey: parsed.projectKey,
    repoSlug: parsed.repoSlug,
    baseUrl,
    apiBaseUrl: `${baseUrl}/rest/api/1.0`
  }
}

export async function getBitbucketDataCenterRepoRefForRemote(
  repoPath: string,
  remoteName: string,
  connectionId?: string | null,
  localGitOptions: LocalGitExecOptions = {}
): Promise<BitbucketDataCenterRepoRef | null> {
  return repoRefProbeCache.get(repoPath, remoteName, connectionId, localGitOptions)
}

export async function getBitbucketDataCenterRepoRef(
  repoPath: string,
  connectionId?: string | null,
  localGitOptions: LocalGitExecOptions = {}
): Promise<BitbucketDataCenterRepoRef | null> {
  return getBitbucketDataCenterRepoRefForRemote(repoPath, 'origin', connectionId, localGitOptions)
}
