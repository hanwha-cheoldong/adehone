export const ADEHONE_VERSION = '0.1.0'

// Why: builds shipped before 3-part SemVer carry the 2-part `0.1` form.
const ADEHONE_VERSION_FORMS = [ADEHONE_VERSION, '0.1']

/**
 * Formats the user-facing Adehone version alongside the underlying Orca version.
 * Internal comparisons and updater/daemon protocols continue using raw `app.getVersion()`.
 */
export function formatAdehoneDisplayVersion(orcaVersion: string): string {
  let trimmedOrcaVersion = orcaVersion.trim()
  const buildPrefix = ADEHONE_VERSION_FORMS.map((form) => `${form}-`).find((prefix) =>
    trimmedOrcaVersion.startsWith(prefix)
  )
  if (buildPrefix) {
    trimmedOrcaVersion = trimmedOrcaVersion.slice(buildPrefix.length)
  }
  if (!trimmedOrcaVersion || ADEHONE_VERSION_FORMS.includes(trimmedOrcaVersion)) {
    return ADEHONE_VERSION
  }
  return `${ADEHONE_VERSION} (Orca ${trimmedOrcaVersion})`
}
