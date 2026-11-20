import { useEffect, useRef, type RefObject } from 'react'
import type { LinkedWorkItemSummary } from '@/lib/workspace/creation/new-workspace'
import type { GlobalSettings } from '../../../../../shared/settings/global-settings-types'
import {
  applyJiraIssueKeyCasing,
  isWorkspaceNameTruncated,
  slugifyForWorkspaceName
} from '../../../../../shared/workspace/naming/workspace-name'

type UseTruncatedWorkItemAiNameArgs = {
  linkedWorkItem: LinkedWorkItemSummary | null
  name: string
  setName: (name: string) => void
  lastAutoNameRef: RefObject<string>
  selectedRepoId: string | undefined
  selectedRepoConnectionId: string | null | undefined
  settings: GlobalSettings | null | undefined
}

/** Replace truncated synchronous issue-title slugs with an AI-generated branch name when available. */
export function useTruncatedWorkItemAiName({
  linkedWorkItem,
  name,
  setName,
  lastAutoNameRef,
  selectedRepoId,
  selectedRepoConnectionId,
  settings
}: UseTruncatedWorkItemAiNameArgs): void {
  const nameRef = useRef(name)
  nameRef.current = name
  const setNameRef = useRef(setName)
  setNameRef.current = setName

  const title = linkedWorkItem?.title ?? ''
  const identifier = linkedWorkItem?.linearIdentifier ?? linkedWorkItem?.jiraIdentifier
  const provider = linkedWorkItem?.provider
  const jiraIssueKeyCasing = settings?.jiraIssueKeyCasing

  useEffect(() => {
    if (!title || !isWorkspaceNameTruncated(title)) {
      return
    }
    const generateBranchName = window.api?.git?.generateBranchName
    if (typeof generateBranchName !== 'function') {
      return
    }
    if (!lastAutoNameRef.current || nameRef.current !== lastAutoNameRef.current) {
      return
    }

    let cancelled = false
    void generateBranchName({
      title,
      repoId: selectedRepoId,
      connectionId: selectedRepoConnectionId ?? undefined
    })
      .then((result) => {
        if (cancelled || !result?.success || !result.slug) {
          return
        }
        // Preserve manual edits made while AI generation was in flight.
        if (!lastAutoNameRef.current || nameRef.current !== lastAutoNameRef.current) {
          return
        }
        const keySlug = identifier ? slugifyForWorkspaceName(identifier) : ''
        const combined =
          keySlug && !result.slug.startsWith(`${keySlug}-`) && result.slug !== keySlug
            ? slugifyForWorkspaceName(`${keySlug}-${result.slug}`)
            : slugifyForWorkspaceName(result.slug)
        const nextName = applyJiraIssueKeyCasing(
          combined,
          provider === 'jira' || (!provider && !linkedWorkItem?.linearIdentifier)
            ? linkedWorkItem?.jiraIdentifier
            : undefined,
          jiraIssueKeyCasing
        )
        if (!nextName || nextName === nameRef.current) {
          return
        }
        lastAutoNameRef.current = nextName
        setNameRef.current(nextName)
      })
      .catch(() => {
        // Keep the synchronous fallback slug when AI generation is unconfigured or fails.
      })

    return () => {
      cancelled = true
    }
  }, [
    identifier,
    jiraIssueKeyCasing,
    lastAutoNameRef,
    linkedWorkItem?.jiraIdentifier,
    linkedWorkItem?.linearIdentifier,
    linkedWorkItem?.number,
    linkedWorkItem?.type,
    provider,
    selectedRepoConnectionId,
    selectedRepoId,
    title
  ])
}
