declare const ORCA_BUILD_COMMIT: string

export const ADEHONE_VERSION = '0.1'

const SHORT_COMMIT_LENGTH = 7

function resolveShortBuildCommit(buildCommit?: string): string {
  const raw = buildCommit ?? (typeof ORCA_BUILD_COMMIT === 'string' ? ORCA_BUILD_COMMIT : '')
  return raw.trim().slice(0, SHORT_COMMIT_LENGTH)
}

/**
 * Formats the user-facing Adehone version alongside the underlying Orca version and git commit.
 * Internal comparisons and updater/daemon protocols continue using raw `app.getVersion()`.
 */
export function formatAdehoneDisplayVersion(orcaVersion: string, buildCommit?: string): string {
  const trimmedOrcaVersion = orcaVersion.trim()
  if (!trimmedOrcaVersion) {
    return ADEHONE_VERSION
  }
  const shortCommit = resolveShortBuildCommit(buildCommit)
  if (!shortCommit) {
    return `${ADEHONE_VERSION} (Orca ${trimmedOrcaVersion})`
  }
  return `${ADEHONE_VERSION} (Orca ${trimmedOrcaVersion}, commit ${shortCommit})`
}
