import type { WorkspaceAttachment, WorkspaceLinkedItem } from '../../worktree/types'

/** The links a create request or a workspace's saved metadata can carry. */
export type BranchTicketSource = {
  linkedWorkItem?: WorkspaceLinkedItem | null
  linkedLinearIssue?: string | null
  linkedIssue?: number | null
  linkedGitLabIssue?: number | null
  linkedItems?: readonly WorkspaceAttachment[] | null
}

const TRACKER_KEY = /^[a-z][a-z0-9_]*-\d+$/i

function numberedTicket(number: number | null | undefined): string | undefined {
  return typeof number === 'number' && number > 0 ? `issue-${number}` : undefined
}

function trackerTicket(...keys: (string | null | undefined)[]): string | undefined {
  const key = keys.map((value) => value?.trim()).find((value) => value && TRACKER_KEY.test(value))
  return key?.toLowerCase().replace(/_/g, '-')
}

function itemTicket(item: WorkspaceLinkedItem | WorkspaceAttachment): string | undefined {
  if (item.type !== 'issue') {
    // A review number is not a ticket.
    return undefined
  }
  if (item.provider === 'linear' || item.provider === 'jira') {
    return trackerTicket(
      item.linearIdentifier,
      item.jiraIdentifier,
      'identifier' in item ? item.identifier : undefined
    )
  }
  return numberedTicket(item.number)
}

/** The lowercase ticket a new branch names first: `sta-335`, `proj-12` or `issue-98`. */
export function resolveBranchTicket(source: BranchTicketSource): string | undefined {
  return (
    (source.linkedWorkItem ? itemTicket(source.linkedWorkItem) : undefined) ??
    trackerTicket(source.linkedLinearIssue) ??
    numberedTicket(source.linkedIssue) ??
    numberedTicket(source.linkedGitLabIssue) ??
    source.linkedItems?.map(itemTicket).find(Boolean)
  )
}
