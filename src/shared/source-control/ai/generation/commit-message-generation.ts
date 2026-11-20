import { cleanGeneratedCommitMessage } from './commit-message-agent-output'
import { truncateDiffForPrompt } from './commit-message-prompt'
import type { TuiAgent } from '../../../agent-launch/catalog/tui-agent'

export type CommitMessageDraftAgent = TuiAgent | 'custom'

export type CommitMessageDraftContext = {
  branch: string | null
  stagedSummary: string
  stagedPatch: string
  /** Workspace-linked GitHub issue number. Omitted entirely when none resolves. */
  linkedIssue?: number | null
}

export type GeneratedCommitMessage = {
  subject: string
  body: string
  message: string
}

function limitSection(value: string, maxChars: number): string {
  if (value.length <= maxChars) {
    return value
  }
  const omitted = value.length - maxChars
  return `${value.slice(0, maxChars)}\n\n[truncated: ${omitted} characters omitted]`
}

export const COMMIT_MESSAGE_ALLOWED_TYPES = [
  '- feat: new feature',
  '- fix: bug fix',
  '- docs: documentation changes (README, API docs, comments, etc.)',
  '- style: formatting or style changes without logic changes',
  '- refactor: code refactoring without adding features or fixing bugs',
  '- test: adding or refactoring tests',
  '- chore: build tasks, package manager config, or maintenance',
  '- perf: performance improvements',
  '- ci: CI configuration files and scripts',
  '- build: changes affecting the build system or external dependencies'
].join('\n')

export function buildCommitMessagePrompt(
  context: CommitMessageDraftContext,
  customPrompt: string,
  diffBudget?: number
): string {
  // Oversized patches are omitted; use the file summary and tell the agent why.
  const patch = context.stagedPatch.trim()
    ? truncateDiffForPrompt(context.stagedPatch, diffBudget)
    : '(diff omitted — too large to read; infer the change from the staged file list above)'
  const linkedIssueLine =
    context.linkedIssue != null ? [`Linked issue: #${context.linkedIssue}`] : []

  const base = [
    'You are generating a single git commit message following the Conventional Commits specification.',
    'Return only the commit message text. Do not include a preamble, quotes, or code fences.',
    '',
    'Format:',
    '<type>[optional (scope)][optional !]: <description>',
    '',
    '[optional body]',
    '',
    '[optional footer(s)]',
    '',
    'Allowed types:',
    COMMIT_MESSAGE_ALLOWED_TYPES,
    '',
    'Rules:',
    '- Header: must use `<type>: <description>` (or `<type>(scope): <description>`). Add `!` before `:` for breaking changes.',
    '- Header length: concise — <= 50 chars in English, or 25-30 chars in Korean; no trailing period.',
    '- Header style: imperative mood in English, or concise noun-ending style (개조식/명사형 종결) in Korean.',
    '- Optional body: blank line after header, then short wrapped bullet points or prose explaining WHY and before/after differences.',
    '- Optional footer: blank line before footer; include issue references (e.g., `Refs: #123`, `Fixes: #456`) when applicable or `BREAKING CHANGE: <details>` for breaking changes.',
    '- Capture the primary logical change using only the staged changes below as context.',
    '- Do not include "Co-authored-by" trailers.',
    '',
    `Branch: ${context.branch ?? '(detached)'}`,
    ...linkedIssueLine,
    '',
    'Staged files:',
    limitSection(context.stagedSummary, 6_000),
    '',
    'Staged patch:',
    '```diff',
    patch,
    '```'
  ].join('\n')

  const trimmedPrompt = customPrompt.trim()
  if (!trimmedPrompt) {
    return base
  }
  return [base, '', 'Additional user prompt:', limitSection(trimmedPrompt, 4_000)].join('\n')
}

export function splitGeneratedCommitMessage(message: string): GeneratedCommitMessage {
  const normalized = cleanGeneratedCommitMessage(message)
  const firstNewline = normalized.indexOf('\n')
  const subjectLine = firstNewline === -1 ? normalized : normalized.slice(0, firstNewline)
  const subject = subjectLine.trim().replace(/[.]+$/g, '').trimEnd()
  const body = firstNewline === -1 ? '' : normalized.slice(firstNewline + 1).trim()
  const safeSubject = subject.length > 0 ? subject : 'Update project files'
  return {
    subject: safeSubject,
    body,
    message: body.length > 0 ? `${safeSubject}\n\n${body}` : safeSubject
  }
}
