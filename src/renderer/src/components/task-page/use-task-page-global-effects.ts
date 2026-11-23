import type { TaskPageJiraSummaryGenerationModel } from './jira/creation/use-task-page-jira-summary-generation'
import { useEffect } from 'react'
import { addAppKeyListener, removeAppKeyListener } from '@/lib/keyboard/app-keyboard-router'
import { getShortcutPlatform } from '@/lib/keyboard/shortcut-platform'
import { hasVisibleOverlay } from '@/lib/overlay-interaction/visible-overlay'
import { isEditableTarget } from '@/lib/text-input/focus/editable-target'
import { isImeOwnedKeyboardEvent } from '@/lib/text-input/ime/ime-composition-keyboard-event'
import { useAppStore } from '@/store'
import { keybindingMatchesAction } from '../../../../shared/keybindings/matching'

function isTextEntryTarget(target: HTMLElement): boolean {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    target.isContentEditable
  )
}

export function useTaskPageGlobalEffects(model: TaskPageJiraSummaryGenerationModel) {
  const {
    closeTaskPage,
    closeTaskDetailPage,
    taskSource,
    activeModal,
    linearStatusContextKey,
    preflightStatusChecked,
    preflightStatusContextKey,
    checkLinearConnection,
    refreshPreflightStatus,
    expectedPreflightContextKey,
    jiraStatusContextKey,
    checkJiraConnection,
    providerRuntimeContextKey,
    preflightStatusCurrent,
    linearStatusReady,
    jiraStatusReady,
    githubListPending,
    tasksRefreshing,
    tasksFiltering,
    dialogWorkItem,
    newIssueOpen,
    selectedLinearIssue,
    selectedJiraIssue,
    newLinearIssueOpen,
    newJiraIssueOpen
  } = model
  const githubTasksBusy = githubListPending || tasksRefreshing || tasksFiltering
  const taskDetailOpen = Boolean(dialogWorkItem || selectedJiraIssue || selectedLinearIssue)
  const creationModalOpen = Boolean(newIssueOpen || newLinearIssueOpen || newJiraIssueOpen)
  // GitHub and Linear details replace the list in-page; the Jira detail is a Sheet that owns Esc.
  const detailPageOpen =
    (taskSource === 'github' && Boolean(dialogWorkItem)) ||
    (taskSource === 'linear' && Boolean(selectedLinearIssue))
  useEffect(() => {
    // Why: when a modal is open, let it own Esc dismissal.
    if (selectedJiraIssue || creationModalOpen || activeModal !== 'none') {
      return
    }
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') {
        return
      }
      const target = event.target
      if (!(target instanceof HTMLElement)) {
        return
      }

      if (detailPageOpen) {
        // Why: fields (reply, description, mentions) and overlays on the detail own Esc; the
        // router runs first in capture, so blurring here would also trigger their cancel.
        if (event.defaultPrevented || isTextEntryTarget(target) || hasVisibleOverlay()) {
          return
        }
        event.preventDefault()
        closeTaskDetailPage()
        return
      }

      // Why: open menus/popovers/selects own Esc; capture-phase leave would steal it from Radix.
      if (hasVisibleOverlay()) {
        return
      }

      // Esc first blurs input; leave the page only when focus is outside one.
      if (isTextEntryTarget(target)) {
        event.preventDefault()
        target.blur()
        return
      }
      event.preventDefault()
      closeTaskPage()
    }
    addAppKeyListener('keydown', onKeyDown)
    return () => removeAppKeyListener('keydown', onKeyDown)
  }, [
    activeModal,
    closeTaskDetailPage,
    closeTaskPage,
    creationModalOpen,
    detailPageOpen,
    selectedJiraIssue
  ])
  useEffect(() => {
    if (!taskDetailOpen || creationModalOpen || activeModal !== 'none') {
      return
    }
    const shortcutPlatform = getShortcutPlatform()
    let handledMouseBack = false

    const onMouseDown = (event: MouseEvent): void => {
      if (event.button !== 3) {
        return
      }
      handledMouseBack = false
      event.preventDefault()
    }

    const onMouseBackRelease = (event: MouseEvent): void => {
      // Why: button 3 is the mouse "Back" side button; capture avoids inner stopPropagation swallowing it.
      if (event.button !== 3) {
        return
      }
      event.preventDefault()
      event.stopPropagation()
      if (handledMouseBack) {
        return
      }
      handledMouseBack = true
      closeTaskDetailPage()
    }

    // Why: macOS mouse utilities (e.g. Logi Options+) remap side-buttons to browser.back chords, and some platforms emit BrowserBack.
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.defaultPrevented || isImeOwnedKeyboardEvent(event) || hasVisibleOverlay()) {
        return
      }
      const isBrowserBackKey = event.key === 'BrowserBack'
      const isBackChord = keybindingMatchesAction(
        'browser.back',
        event,
        shortcutPlatform,
        useAppStore.getState().keybindings
      )
      if (!isBrowserBackKey && !isBackChord) {
        return
      }
      if (!isBrowserBackKey && isEditableTarget(event.target)) {
        return
      }
      event.preventDefault()
      event.stopPropagation()
      if (!event.repeat) {
        closeTaskDetailPage()
      }
    }

    window.addEventListener('mousedown', onMouseDown, true)
    window.addEventListener('mouseup', onMouseBackRelease, true)
    window.addEventListener('auxclick', onMouseBackRelease, true)
    addAppKeyListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('mousedown', onMouseDown, true)
      window.removeEventListener('mouseup', onMouseBackRelease, true)
      window.removeEventListener('auxclick', onMouseBackRelease, true)
      removeAppKeyListener('keydown', onKeyDown)
    }
  }, [activeModal, closeTaskDetailPage, creationModalOpen, taskDetailOpen])
  useEffect(() => {
    if (!preflightStatusCurrent || !preflightStatusChecked) {
      void refreshPreflightStatus()
    }
    if (!linearStatusReady) {
      void checkLinearConnection()
    }
    if (!jiraStatusReady) {
      void checkJiraConnection()
    }
  }, [
    checkJiraConnection,
    checkLinearConnection,
    expectedPreflightContextKey,
    jiraStatusContextKey,
    jiraStatusReady,
    linearStatusContextKey,
    linearStatusReady,
    providerRuntimeContextKey,
    preflightStatusContextKey,
    preflightStatusChecked,
    preflightStatusCurrent,
    refreshPreflightStatus
  ])

  const nextModel = model as typeof model & {
    githubTasksBusy: typeof githubTasksBusy
  }
  nextModel.githubTasksBusy = githubTasksBusy
  return nextModel
}
export type TaskPageGlobalEffectsModel = ReturnType<typeof useTaskPageGlobalEffects>
