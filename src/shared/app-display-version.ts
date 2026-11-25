export const ADEHONE_VERSION = '0.1'

/**
 * Formats the user-facing Adehone version alongside the underlying Orca version.
 * Internal comparisons and updater/daemon protocols continue using raw `app.getVersion()`.
 */
export function formatAdehoneDisplayVersion(orcaVersion: string): string {
  let trimmedOrcaVersion = orcaVersion.trim()
  const semverPrefix = `${ADEHONE_VERSION}.0-`
  if (trimmedOrcaVersion.startsWith(semverPrefix)) {
    trimmedOrcaVersion = trimmedOrcaVersion.slice(semverPrefix.length)
  } else if (trimmedOrcaVersion.startsWith(`${ADEHONE_VERSION}-`)) {
    trimmedOrcaVersion = trimmedOrcaVersion.slice(ADEHONE_VERSION.length + 1)
  }
  if (
    !trimmedOrcaVersion ||
    trimmedOrcaVersion === ADEHONE_VERSION ||
    trimmedOrcaVersion === `${ADEHONE_VERSION}.0`
  ) {
    return ADEHONE_VERSION
  }
  return `${ADEHONE_VERSION} (Orca ${trimmedOrcaVersion})`
}
