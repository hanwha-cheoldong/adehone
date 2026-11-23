import { mkdir, readFile, unlink } from 'node:fs/promises'
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
import type { BitbucketDataCenterAuthMode } from '../../shared/bitbucket-datacenter-credentials'
import type { SecretAtRestProtection } from '../../shared/secure-storage/secret-at-rest-protection'
import { normalizeBitbucketDataCenterBaseUrl } from './auth-config'

// Plaintext display metadata lets status reads avoid keychain prompts.
export type BitbucketDataCenterStoredServerMetadata = {
  baseUrl: string
  authMode?: BitbucketDataCenterAuthMode
  account: string | null
  serverVersion: string | null
  updatedAt: string
}

export type BitbucketDataCenterStoredMetadata = {
  version: 1
  servers: BitbucketDataCenterStoredServerMetadata[]
}

export type BitbucketDataCenterStoredSecretEntry =
  | {
      authMode?: 'token'
      accessToken: string
    }
  | {
      authMode: 'basic'
      username: string
      password: string
    }

export type BitbucketDataCenterStoredSecret = {
  servers: Record<string, BitbucketDataCenterStoredSecretEntry>
}

export type BitbucketDataCenterCredentialSaveInput =
  | {
      baseUrl: string
      authMode?: 'token'
      account: string | null
      serverVersion: string | null
      accessToken: string
    }
  | {
      baseUrl: string
      authMode: 'basic'
      account: string | null
      serverVersion: string | null
      username: string
      password: string
    }

let cachedMetadata: BitbucketDataCenterStoredMetadata | null = null
let metadataLoadedFromDisk = false
let secretFilePresent = false
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

async function ensureOrcaDir(): Promise<void> {
  await mkdir(getOrcaDir(), { recursive: true })
}

function asOptionalString(value: unknown): string | null {
  return typeof value === 'string' ? value : null
}

async function readMetadataFromDisk(): Promise<BitbucketDataCenterStoredMetadata | null> {
  const path = getMetadataPath()
  try {
    const parsed: unknown = JSON.parse(await readFile(path, 'utf-8'))
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
      const authMode =
        'authMode' in entry && entry.authMode === 'basic' ? ('basic' as const) : ('token' as const)
      servers.push({
        baseUrl: normalizedUrl,
        authMode,
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

export async function getStoredBitbucketDataCenterMetadata(): Promise<BitbucketDataCenterStoredMetadata | null> {
  if (!metadataLoadedFromDisk) {
    cachedMetadata = await readMetadataFromDisk()
    secretFilePresent = await credentialFileHasContent(getSecretPath())
    metadataLoadedFromDisk = true
  }
  return cachedMetadata
}

export function getCachedStoredBitbucketDataCenterMetadata(): BitbucketDataCenterStoredMetadata | null {
  return cachedMetadata
}

export function hasStoredBitbucketDataCenterCredential(): boolean {
  return Boolean(cachedMetadata && cachedMetadata.servers.length > 0 && secretFilePresent)
}

export async function getBitbucketDataCenterCredentialProtection(): Promise<SecretAtRestProtection | null> {
  return readCredentialFileProtection(getSecretPath())
}

export function getStoredBitbucketDataCenterCredentialError(): string | null {
  return credentialError
}

function parseSecretEntry(value: unknown): BitbucketDataCenterStoredSecretEntry | null {
  if (!value || typeof value !== 'object') {
    return null
  }
  const record = value as Record<string, unknown>
  if (
    record.authMode === 'basic' &&
    typeof record.username === 'string' &&
    record.username.trim().length > 0 &&
    typeof record.password === 'string' &&
    record.password.length > 0
  ) {
    return { authMode: 'basic', username: record.username, password: record.password }
  }
  if (typeof record.accessToken === 'string' && record.accessToken.trim().length > 0) {
    return { authMode: 'token', accessToken: record.accessToken }
  }
  return null
}

export async function loadStoredBitbucketDataCenterSecret(options?: {
  force?: boolean
}): Promise<BitbucketDataCenterStoredSecret | null> {
  if (cachedSecret && !options?.force) {
    return cachedSecret
  }
  const secretPath = getSecretPath()
  secretFilePresent = await credentialFileHasContent(secretPath)
  if (!secretFilePresent) {
    cachedSecret = null
    return null
  }
  try {
    const raw = readStoredCredentialToken('Bitbucket Data Center', await readFile(secretPath))
    if (!raw) {
      cachedSecret = null
      return null
    }
    const parsed: unknown = JSON.parse(raw)
    const servers: Record<string, BitbucketDataCenterStoredSecretEntry> = {}
    if (
      parsed &&
      typeof parsed === 'object' &&
      'servers' in parsed &&
      parsed.servers &&
      typeof parsed.servers === 'object'
    ) {
      for (const [key, value] of Object.entries(parsed.servers)) {
        const normalizedKey = normalizeBitbucketDataCenterBaseUrl(key)
        const entry = normalizedKey ? parseSecretEntry(value) : null
        if (normalizedKey && entry) {
          servers[normalizedKey] = entry
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

async function persistCredentials(
  nextSecret: BitbucketDataCenterStoredSecret,
  nextServers: BitbucketDataCenterStoredServerMetadata[]
): Promise<void> {
  await writeEncryptedCredential(
    'Bitbucket Data Center',
    getSecretPath(),
    JSON.stringify(nextSecret)
  )
  const metadata: BitbucketDataCenterStoredMetadata = { version: 1, servers: nextServers }
  await writeCredentialFileAtomic(
    getMetadataPath(),
    Buffer.from(JSON.stringify(metadata, null, 2), 'utf-8')
  )
  cachedMetadata = metadata
  metadataLoadedFromDisk = true
  secretFilePresent = true
  cachedSecret = nextSecret
  credentialError = null
}

async function readExistingSecretOrEmpty(): Promise<BitbucketDataCenterStoredSecret> {
  try {
    return (await loadStoredBitbucketDataCenterSecret({ force: true })) ?? { servers: {} }
  } catch {
    return { servers: {} }
  }
}

export async function upsertBitbucketDataCenterCredential(
  input: BitbucketDataCenterCredentialSaveInput
): Promise<void> {
  const normalizedUrl = normalizeBitbucketDataCenterBaseUrl(input.baseUrl)
  if (!normalizedUrl) {
    throw new Error('Invalid Bitbucket Data Center baseUrl')
  }
  await ensureOrcaDir()
  const existingSecret = await readExistingSecretOrEmpty()
  const secretEntry: BitbucketDataCenterStoredSecretEntry =
    input.authMode === 'basic'
      ? { authMode: 'basic', username: input.username, password: input.password }
      : { authMode: 'token', accessToken: input.accessToken }
  const existingServers = (await getStoredBitbucketDataCenterMetadata())?.servers ?? []
  const nextEntry: BitbucketDataCenterStoredServerMetadata = {
    baseUrl: normalizedUrl,
    authMode: input.authMode === 'basic' ? 'basic' : 'token',
    account: input.account,
    serverVersion: input.serverVersion,
    updatedAt: new Date().toISOString()
  }
  await persistCredentials(
    { servers: { ...existingSecret.servers, [normalizedUrl]: secretEntry } },
    [...existingServers.filter((server) => server.baseUrl !== normalizedUrl), nextEntry]
  )
}

export async function removeBitbucketDataCenterCredential(baseUrl: string): Promise<void> {
  const normalizedUrl = normalizeBitbucketDataCenterBaseUrl(baseUrl)
  if (!normalizedUrl) {
    return
  }
  const existingServers = (await getStoredBitbucketDataCenterMetadata())?.servers ?? []
  const nextServers = existingServers.filter((server) => server.baseUrl !== normalizedUrl)
  if (nextServers.length === 0) {
    await clearStoredBitbucketDataCenterCredentials()
    return
  }
  const existingSecret = await readExistingSecretOrEmpty()
  const nextSecretServers = { ...existingSecret.servers }
  delete nextSecretServers[normalizedUrl]
  await ensureOrcaDir()
  await persistCredentials({ servers: nextSecretServers }, nextServers)
}

export async function clearStoredBitbucketDataCenterCredentials(): Promise<void> {
  for (const path of [getMetadataPath(), getSecretPath()]) {
    try {
      await unlink(path)
    } catch {}
  }
  cachedMetadata = null
  metadataLoadedFromDisk = true
  secretFilePresent = false
  cachedSecret = null
  credentialError = null
}

/** @internal - exposed for tests only */
export function _resetBitbucketDataCenterCredentialCache(): void {
  cachedMetadata = null
  metadataLoadedFromDisk = false
  secretFilePresent = false
  cachedSecret = null
  credentialError = null
}
