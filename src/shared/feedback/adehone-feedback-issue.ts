import { stripClientEnvironmentFooter } from './client-environment-info'

export const ADEHONE_GITHUB_OWNER = 'hanwha-cheoldong'
export const ADEHONE_GITHUB_REPO = 'adehone'
export const ADEHONE_GITHUB_ISSUES_URL = `https://github.com/${ADEHONE_GITHUB_OWNER}/${ADEHONE_GITHUB_REPO}/issues/`
export const ADEHONE_GITHUB_NEW_ISSUE_URL = `${ADEHONE_GITHUB_ISSUES_URL}new`

const MAX_FEEDBACK_ISSUE_TITLE_LENGTH = 80
const MAX_GITHUB_NEW_ISSUE_URL_LENGTH = 7500

/** Derive a concise GitHub issue title from the first non-empty line of user feedback. */
export function buildFeedbackIssueTitle(feedback: string): string {
  const userText = stripClientEnvironmentFooter(feedback)
  const firstLine = userText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.length > 0)
  if (!firstLine) {
    return '[Feedback]'
  }
  const prefix = firstLine.startsWith('[') ? '' : '[Feedback]: '
  const maxSummaryLength = MAX_FEEDBACK_ISSUE_TITLE_LENGTH - prefix.length
  const summary =
    firstLine.length > maxSummaryLength
      ? `${firstLine.slice(0, Math.max(0, maxSummaryLength - 3)).trimEnd()}...`
      : firstLine
  return `${prefix}${summary}`
}

/** Build a prefilled GitHub new-issue URL while staying under browser/OS URL length caps. */
export function buildFeedbackNewIssueUrl(feedback: string): string {
  const title = buildFeedbackIssueTitle(feedback)
  const buildUrl = (body: string): string => {
    const url = new URL(ADEHONE_GITHUB_NEW_ISSUE_URL)
    url.searchParams.set('title', title)
    url.searchParams.set('body', body)
    return url.toString()
  }
  const trimmedBody = feedback.trim()
  const fullUrl = buildUrl(trimmedBody)
  if (fullUrl.length <= MAX_GITHUB_NEW_ISSUE_URL_LENGTH) {
    return fullUrl
  }
  let low = 0
  let high = trimmedBody.length
  while (low < high) {
    const mid = Math.ceil((low + high) / 2)
    if (buildUrl(`${trimmedBody.slice(0, mid)}\n\n...`).length <= MAX_GITHUB_NEW_ISSUE_URL_LENGTH) {
      low = mid
    } else {
      high = mid - 1
    }
  }
  return buildUrl(low > 0 ? `${trimmedBody.slice(0, low)}\n\n...` : '')
}
