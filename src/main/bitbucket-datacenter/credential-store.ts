import { existsSync, mkdirSync, readFileSync, unlinkSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import {
  CredentialDecryptionError,
  credentialFileHasContent,
  readStoredCredentialToken,
  writeCredentialFileAtomic,
  writeEncryptedCredential
} from '../credentials/integration-credential-file'
import { readCredentialFileProtection } from '../credentials/credential-file-protection'
import type { SecretAtRestProtection } from '../../shared/secret-at-rest-protection'
import { normalizeBitbucketDataCenterBaseUrl } from './auth-config'

// Plaintext display metadata lets status reads avoid keychain prompts.
export type BitbucketDataCenterStoredServerMetadata = {
  baseUrl: string
  account: string | null
  serverVersion: string | null
  updatedAt: string
}

export type BitbucketDataCenterStoredMetadata = {
  version: 1
  servers: BitbucketDataCenterStoredServerMetadata[]
}

export type BitbucketDataCenterStoredSecret = {
  servers: Record<string, { accessToken: string }>
}

export type BitbucketDataCenterCredentialSaveInput = {
  baseUrl: string
  account: string | null
  serverVersion: string | null
  accessToken: string
}

let cachedMetadata: BitbucketDataCenterStoredMetadata | null = null
let metadataLoadedFromDisk = false
let cachedSecret: BitbucketDataCenterStoredSecret | null = null
let credentialError: string | null = null

function getOrcaDir(): string {
  return join(homedir(), '.orca')
}

function getMetadataPath(): string {
  return join(getOrcaDir(), 'bitbucket-dc-credentials.json')
}

export function getSecretPath(): string {
  return join(getOrcaDir(), 'bitbucket-dc-credentials.enc')
}

function ensureOrcaDir(): void {
  const dir = getOrcaDir()
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
}

function asOptionalString(value: unknown): string | null {
  return typeof value === 'string' ? value : null
}

function readMetadataFromDisk(): BitbucketDataCenterStoredMetadata | null {
  const path = getMetadataPath()
  if (!existsSync(path)) {
    return null
  }
  try {
    const parsed: unknown = JSON.parse(readFileSync(path, 'utf-8'))
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      !('servers' in parsed) ||
      !Array.isArray(parsed.servers)
    ) {
      return null
    }
    const servers: BitbucketDataCenterStoredServerMetadata[] = []
    for (const entry of parsed.servers) {
      if (!entry || typeof entry !== 'object') {
        continue
      }
      const rawUrl = 'baseUrl' in entry ? asOptionalString(entry.baseUrl) : null
      const normalizedUrl = rawUrl ? normalizeBitbucketDataCenterBaseUrl(rawUrl) : null
      if (!normalizedUrl) {
        continue
      }
      servers.push({
        baseUrl: normalizedUrl,
        account: 'account' in entry ? asOptionalString(entry.account) : null,
        serverVersion: 'serverVersion' in entry ? asOptionalString(entry.serverVersion) : null,
        updatedAt: ('updatedAt' in entry ? asOptionalString(entry.updatedAt) : null) ?? ''
      })
    }
    return { version: 1, servers }
  } catch {
    return null
  }
}

export function getStoredBitbucketDataCenterMetadata(): BitbucketDataCenterStoredMetadata | null {
  if (!metadataLoadedFromDisk) {
    cachedMetadata = readMetadataFromDisk()
    metadataLoadedFromDisk = true
  }
  return cachedMetadata
}

export function hasStoredBitbucketDataCenterCredential(): boolean {
  const metadata = getStoredBitbucketDataCenterMetadata()
  return Boolean(
    metadata && metadata.servers.length > 0 && credentialFileHasContent(getSecretPath())
  )
}

export function getBitbucketDataCenterCredentialProtection(): SecretAtRestProtection | null {
  return readCredentialFileProtection(getSecretPath())
}

export function getStoredBitbucketDataCenterCredentialError(): string | null {
  return credentialError
}

export function loadStoredBitbucketDataCenterSecret(options?: {
  force?: boolean
}): BitbucketDataCenterStoredSecret | null {
  if (cachedSecret && !options?.force) {
    return cachedSecret
  }
  const secretPath = getSecretPath()
  if (!credentialFileHasContent(secretPath)) {
    cachedSecret = null
    return null
  }
  try {
    const raw = readStoredCredentialToken('Bitbucket Data Center', readFileSync(secretPath))
    if (!raw) {
      cachedSecret = null
      return null
    }
    const parsed: unknown = JSON.parse(raw)
    const servers: Record<string, { accessToken: string }> = {}
    if (
      parsed &&
      typeof parsed === 'object' &&
      'servers' in parsed &&
      parsed.servers &&
      typeof parsed.servers === 'object'
    ) {
      for (const [key, value] of Object.entries(parsed.servers)) {
        const normalizedKey = normalizeBitbucketDataCenterBaseUrl(key)
        if (
          normalizedKey &&
          value &&
          typeof value === 'object' &&
          'accessToken' in value &&
          typeof value.accessToken === 'string' &&
          value.accessToken.trim().length > 0
        ) {
          servers[normalizedKey] = { accessToken: value.accessToken }
        }
      }
    }
    cachedSecret = { servers }
    credentialError = null
    return cachedSecret
  } catch (error) {
    if (error instanceof CredentialDecryptionError) {
      credentialError = error.message
      cachedSecret = null
      throw error
    }
    cachedSecret = null
    return null
  }
}

export function upsertBitbucketDataCenterCredential(
  input: BitbucketDataCenterCredentialSaveInput
): void {
  const normalizedUrl = normalizeBitbucketDataCenterBaseUrl(input.baseUrl)
  if (!normalizedUrl) {
    throw new Error('Invalid Bitbucket Data Center baseUrl')
  }
  ensureOrcaDir()

  let existingSecret: BitbucketDataCenterStoredSecret = { servers: {} }
  try {
    existingSecret = loadStoredBitbucketDataCenterSecret({ force: true }) ?? { servers: {} }
  } catch {
    // Allow overwriting an undecryptable secret store when the user reconnects.
    existingSecret = { servers: {} }
  }

  const nextSecret: BitbucketDataCenterStoredSecret = {
    servers: {
      ...existingSecret.servers,
      [normalizedUrl]: { accessToken: input.accessToken }
    }
  }
  writeEncryptedCredential('Bitbucket Data Center', getSecretPath(), JSON.stringify(nextSecret))

  const existingServers = getStoredBitbucketDataCenterMetadata()?.servers ?? []
  const nextEntry: BitbucketDataCenterStoredServerMetadata = {
    baseUrl: normalizedUrl,
    account: input.account,
    serverVersion: input.serverVersion,
    updatedAt: new Date().toISOString()
  }
  const nextServers = [
    ...existingServers.filter((server) => server.baseUrl !== normalizedUrl),
    nextEntry
  ]
  const metadata: BitbucketDataCenterStoredMetadata = {
    version: 1,
    servers: nextServers
  }
  writeCredentialFileAtomic(
    getMetadataPath(),
    Buffer.from(JSON.stringify(metadata, null, 2), 'utf-8')
  )

  cachedMetadata = metadata
  metadataLoadedFromDisk = true
  cachedSecret = nextSecret
  credentialError = null
}

export function removeBitbucketDataCenterCredential(baseUrl: string): void {
  const normalizedUrl = normalizeBitbucketDataCenterBaseUrl(baseUrl)
  if (!normalizedUrl) {
    return
  }

  const existingServers = getStoredBitbucketDataCenterMetadata()?.servers ?? []
  const nextServers = existingServers.filter((server) => server.baseUrl !== normalizedUrl)
  if (nextServers.length === 0) {
    clearStoredBitbucketDataCenterCredentials()
    return
  }

  let existingSecret: BitbucketDataCenterStoredSecret = { servers: {} }
  try {
    existingSecret = loadStoredBitbucketDataCenterSecret({ force: true }) ?? { servers: {} }
  } catch {
    existingSecret = { servers: {} }
  }
  const nextSecretServers = { ...existingSecret.servers }
  delete nextSecretServers[normalizedUrl]
  const nextSecret: BitbucketDataCenterStoredSecret = { servers: nextSecretServers }

  ensureOrcaDir()
  writeEncryptedCredential('Bitbucket Data Center', getSecretPath(), JSON.stringify(nextSecret))
  const metadata: BitbucketDataCenterStoredMetadata = {
    version: 1,
    servers: nextServers
  }
  writeCredentialFileAtomic(
    getMetadataPath(),
    Buffer.from(JSON.stringify(metadata, null, 2), 'utf-8')
  )

  cachedMetadata = metadata
  metadataLoadedFromDisk = true
  cachedSecret = nextSecret
  credentialError = null
}

export function clearStoredBitbucketDataCenterCredentials(): void {
  for (const path of [getMetadataPath(), getSecretPath()]) {
    if (existsSync(path)) {
      try {
        unlinkSync(path)
      } catch {}
    }
  }
  cachedMetadata = null
  metadataLoadedFromDisk = true
  cachedSecret = null
  credentialError = null
}

/** @internal - exposed for tests only */
export function _resetBitbucketDataCenterCredentialCache(): void {
  cachedMetadata = null
  metadataLoadedFromDisk = false
  cachedSecret = null
  credentialError = null
}
