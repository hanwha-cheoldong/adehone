export const ADEHONE_VERSION = '0.1'

/**
 * Formats the user-facing Adehone version alongside the underlying Orca version.
 * Internal comparisons and updater/daemon protocols continue using raw `app.getVersion()`.
 */
export function formatAdehoneDisplayVersion(orcaVersion: string): string {
  let trimmedOrcaVersion = orcaVersion.trim()
  if (trimmedOrcaVersion.startsWith(`${ADEHONE_VERSION}-`)) {
    trimmedOrcaVersion = trimmedOrcaVersion.slice(ADEHONE_VERSION.length + 1)
  }
  if (!trimmedOrcaVersion || trimmedOrcaVersion === ADEHONE_VERSION) {
    return ADEHONE_VERSION
  }
  return `${ADEHONE_VERSION} (Orca ${trimmedOrcaVersion})`
}
