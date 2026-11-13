import { appendFileSync, readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { mergeLocBlock, renderLocBlock, sumChangedFiles } from './pr-test-loc-table.mjs'

export const PR_FILES_PAGE_LIMIT = 3000

export function nextLink(linkHeader) {
  if (linkHeader == null || linkHeader.length === 0) {
    return undefined
  }

  for (const part of linkHeader.split(',')) {
    const match = part.match(/<([^>]+)>\s*;\s*rel="next"/)
    if (match != null) {
      return match[1]
    }
  }

  return undefined
}

function githubHeaders(token) {
  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'User-Agent': 'orca-pr-test-loc',
    'X-GitHub-Api-Version': '2022-11-28'
  }
}

const RETRYABLE_STATUSES = new Set([500, 502, 503, 504])
const defaultSleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))

async function fetchWithRetry(url, options, { fetchImpl = fetch, sleepImpl = defaultSleep } = {}) {
  let response
  for (let attempt = 0; attempt < 3; attempt += 1) {
    response = await fetchImpl(url, options)
    if (response.ok || !RETRYABLE_STATUSES.has(response.status) || attempt === 2) {
      return response
    }
    await sleepImpl(1000 * 2 ** attempt)
  }
  return response
}

export async function listPullFiles({
  owner,
  repo,
  pullNumber,
  token,
  fetchImpl = fetch,
  sleepImpl = defaultSleep
}) {
  const files = []
  let url = `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}/files?per_page=100`

  while (url != null) {
    const response = await fetchWithRetry(
      url,
      { headers: githubHeaders(token) },
      { fetchImpl, sleepImpl }
    )
    if (!response.ok) {
      const error = new Error(
        `Failed to list PR #${pullNumber} files: ${response.status} ${response.statusText}`
      )
      error.status = response.status
      throw error
    }
    const page = await response.json()
    if (!Array.isArray(page)) {
      throw new Error(`Unexpected PR files payload for #${pullNumber}`)
    }
    files.push(...page)
    if (files.length >= PR_FILES_PAGE_LIMIT) {
      console.log(
        `PR #${pullNumber} file list hit GitHub's ${PR_FILES_PAGE_LIMIT}-file cap; totals may be short.`
      )
      return files.slice(0, PR_FILES_PAGE_LIMIT)
    }
    url = nextLink(response.headers.get('link'))
  }

  return files
}

function writeGithubOutput(totals) {
  const block = `${renderLocBlock(totals)}\n`
  const outputPath = process.env.GITHUB_OUTPUT
  if (outputPath != null) {
    appendFileSync(outputPath, `summary<<ORCA_PR_LOC_EOF\n${block}ORCA_PR_LOC_EOF\n`)
  }
  const summaryPath = process.env.GITHUB_STEP_SUMMARY
  if (summaryPath != null) {
    appendFileSync(summaryPath, `${block}\n`)
  }
}

export async function updatePullRequest({
  owner,
  repo,
  pullNumber,
  token,
  totals,
  fetchImpl = fetch,
  sleepImpl = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))
}) {
  const headers = githubHeaders(token)
  const url = `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}`
  const response = await fetchImpl(url, { headers })
  if (response.status === 403) {
    console.log('Skipping PR body update: token cannot write (likely a fork PR).')
    return 0
  }
  if (!response.ok) {
    throw new Error(`Failed to read PR #${pullNumber}: ${response.status} ${response.statusText}`)
  }

  const pull = await response.json()
  const nextBody = mergeLocBlock(pull.body, totals)
  if (nextBody === (pull.body ?? '')) {
    console.log(`PR #${pullNumber} LoC header already current.`)
    return 0
  }

  const updateRequest = {
    method: 'PATCH',
    headers: {
      ...headers,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ body: nextBody })
  }
  const update = await fetchWithRetry(url, updateRequest, { fetchImpl, sleepImpl })
  if (update.status === 403) {
    console.log('Skipping PR body update: token cannot write (likely a fork PR).')
    return 0
  }
  if (!update.ok) {
    throw new Error(`Failed to update PR #${pullNumber}: ${update.status} ${update.statusText}`)
  }

  console.log(`Updated LoC header on PR #${pullNumber}.`)
  return 0
}

function resolveRepository() {
  const repository = process.env.GITHUB_REPOSITORY
  if (repository == null || !repository.includes('/')) {
    return undefined
  }
  const slash = repository.indexOf('/')
  return { owner: repository.slice(0, slash), repo: repository.slice(slash + 1) }
}

function resolveToken() {
  return process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN
}

function printUsage() {
  console.error(
    `Usage: ${process.argv[1]} --from-pr <number> | --update-pr <number> [--files-json <file>] [--merge-body <file>]`
  )
}

async function main(argv) {
  let filesJsonPath
  let mergeBodyPath
  let fromPrNumber
  let updatePrNumber

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--files-json') {
      filesJsonPath = argv[i + 1]
      i += 1
      continue
    }
    if (arg === '--merge-body') {
      mergeBodyPath = argv[i + 1]
      i += 1
      continue
    }
    if (arg === '--from-pr') {
      fromPrNumber = argv[i + 1]
      i += 1
      continue
    }
    if (arg === '--update-pr') {
      updatePrNumber = argv[i + 1]
      i += 1
      continue
    }
    printUsage()
    return 2
  }

  const pullNumber = updatePrNumber ?? fromPrNumber
  if (
    (argv.includes('--files-json') && filesJsonPath == null) ||
    (argv.includes('--merge-body') && mergeBodyPath == null) ||
    (argv.includes('--from-pr') && fromPrNumber == null) ||
    (argv.includes('--update-pr') && updatePrNumber == null) ||
    (filesJsonPath == null && pullNumber == null)
  ) {
    printUsage()
    return 2
  }

  let files
  if (filesJsonPath != null) {
    files = JSON.parse(readFileSync(filesJsonPath, 'utf8'))
  } else {
    const repository = resolveRepository()
    const token = resolveToken()
    if (repository == null || token == null) {
      console.error('GITHUB_REPOSITORY and GITHUB_TOKEN are required to read a pull request.')
      return 2
    }
    try {
      files = await listPullFiles({
        ...repository,
        pullNumber: Number(pullNumber),
        token
      })
    } catch (error) {
      if (updatePrNumber != null && RETRYABLE_STATUSES.has(error?.status)) {
        console.warn(
          `Skipping PR #${pullNumber} LoC header update due to GitHub API ${error.status}: ${error.message}`
        )
        return 0
      }
      throw error
    }
  }

  const totals = sumChangedFiles(files)
  writeGithubOutput(totals)

  if (mergeBodyPath != null) {
    process.stdout.write(mergeLocBlock(readFileSync(mergeBodyPath, 'utf8'), totals))
    return 0
  }

  console.log(renderLocBlock(totals))

  if (updatePrNumber == null) {
    return 0
  }

  const repository = resolveRepository()
  const token = resolveToken()
  if (repository == null || token == null) {
    console.error('GITHUB_REPOSITORY and GITHUB_TOKEN are required with --update-pr.')
    return 2
  }

  return updatePullRequest({
    ...repository,
    pullNumber: Number(updatePrNumber),
    token,
    totals
  })
}

if (process.argv[1] != null && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2))
    .then((code) => {
      process.exitCode = code
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : error)
      process.exitCode = 1
    })
}
