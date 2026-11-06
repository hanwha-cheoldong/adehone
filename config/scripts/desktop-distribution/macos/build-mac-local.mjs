import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export function findLocalSigningIdentity() {
  if (process.env.CSC_NAME) {
    return process.env.CSC_NAME
  }
  try {
    const output = execFileSync('security', ['find-identity', '-v', '-p', 'codesigning'], {
      encoding: 'utf8'
    })
    const releaseMatch =
      output.match(/"([^"]*Developer ID Application:[^"]+)"/) ??
      output.match(/"([^"]*Apple Distribution:[^"]+)"/)
    if (releaseMatch?.[1]) {
      return releaseMatch[1]
    }
    const devMatch = output.match(/"([^"]*Apple Development:[^"]+)"/)
    if (devMatch?.[1]) {
      return devMatch[1]
    }
  } catch (error) {
    if (error instanceof TypeError) {
      console.warn('[build:mac] TypeError querying signing identity:', error.message)
    } else if (error instanceof RangeError) {
      console.warn('[build:mac] RangeError querying signing identity:', error.message)
    } else if (error instanceof Error) {
      console.warn('[build:mac] Error querying signing identity:', error.message)
    } else {
      console.warn('[build:mac] Unknown exception querying signing identity')
    }
  }
  return null
}

export function createLocalBuildVersion(baseVersion, timestamp, commit) {
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(baseVersion)) {
    throw new Error(`Package version is not valid semver: ${baseVersion}`)
  }
  if (!Number.isSafeInteger(timestamp) || timestamp <= 0) {
    throw new Error('Local build timestamp is invalid.')
  }
  const sanitizedCommit = commit.replace(/[^0-9A-Za-z-]/g, '').slice(0, 12)
  if (!sanitizedCommit) {
    throw new Error('Git commit identity is empty.')
  }
  const suffix = `local.${timestamp}.${sanitizedCommit}`
  return baseVersion.includes('-') ? `${baseVersion}.${suffix}` : `${baseVersion}-${suffix}`
}

export function getLocalBuildIdentity() {
  const packageJson = JSON.parse(readFileSync(resolve('package.json'), 'utf8'))
  const commit = execFileSync('git', ['rev-parse', '--short=12', 'HEAD'], {
    encoding: 'utf8'
  }).trim()
  return {
    commit,
    version: createLocalBuildVersion(packageJson.version, Date.now(), commit)
  }
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename)) {
  const identity = getLocalBuildIdentity()
  console.log(`[build:mac] local update version ${identity.version}`)
  const extraArgs = process.argv.slice(2)
  const archArgs = 0 < extraArgs.length ? extraArgs : ['dmg', 'zip', `--${process.arch}`]
  execFileSync(
    'win32' === process.platform ? 'pnpm.cmd' : 'pnpm',
    [
      'exec',
      'electron-builder',
      '--config',
      'config/electron-builder.config.cjs',
      '--mac',
      ...archArgs
    ],
    {
      env: {
        ...process.env,
        CSC_IDENTITY_AUTO_DISCOVERY: process.env.CSC_IDENTITY_AUTO_DISCOVERY ?? 'false',
        ORCA_BUILD_COMMIT: identity.commit,
        ORCA_LOCAL_BUILD_VERSION: identity.version
      },
      stdio: 'inherit'
    }
  )

  if ('darwin' === process.platform) {
    const signingIdentity = findLocalSigningIdentity()
    if (signingIdentity) {
      const distDir = resolve('dist')
      if (existsSync(distDir)) {
        const dmgFiles = readdirSync(distDir).filter((file) => {
          return file.endsWith('.dmg')
        })
        for (const dmg of dmgFiles) {
          const dmgPath = resolve(distDir, dmg)
          console.log(`[build:mac] sealing dmg signature: ${dmg} with ${signingIdentity}`)
          execFileSync(
            'codesign',
            ['--force', '--sign', signingIdentity, '--timestamp=none', dmgPath],
            { stdio: 'inherit' }
          )
        }
      }
    }
  }
}
