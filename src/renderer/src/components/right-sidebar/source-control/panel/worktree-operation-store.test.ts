import { describe, expect, it } from 'vitest'
import {
  clearIdleCreatePrIntentNotice,
  clearLandedBranchSwitchError,
  getWorktreeOperationStore,
  setCreatePrIntentNotice
} from './worktree-operation-store'
import { createCreatePrIntentRunToken } from '../review/create-pr-intent-flow'

describe('worktree-operation-store PR intent notice cleanup', () => {
  it('clears an idle PR intent notice when another action or branch switch occurs', () => {
    const store = getWorktreeOperationStore('wt-idle', 'local', 'inst-1')
    setCreatePrIntentNotice(store, {
      tone: 'destructive',
      message: 'Create PR failed: choose a feature branch before creating a PR.'
    })

    clearIdleCreatePrIntentNotice(store)
    expect(store.getState().createPrIntentNotice).toBeNull()

    setCreatePrIntentNotice(store, {
      tone: 'destructive',
      message: 'Create PR failed: choose a feature branch before creating a PR.'
    })
    clearLandedBranchSwitchError(store)
    expect(store.getState().createPrIntentNotice).toBeNull()
  })

  it('keeps an active PR intent notice while a Create PR run is in flight', () => {
    const store = getWorktreeOperationStore('wt-active', 'local', 'inst-2')
    const token = createCreatePrIntentRunToken({
      repoId: 'repo-1',
      worktreeId: 'wt-active',
      worktreePath: '/tmp/wt-active',
      branch: 'feat/test',
      provider: 'github',
      baseRef: 'main',
      pinnedCopy: null
    })
    store.setState({ createPrIntentRun: token })
    setCreatePrIntentNotice(store, {
      tone: 'muted',
      message: 'Committing changes...'
    })

    clearIdleCreatePrIntentNotice(store)
    expect(store.getState().createPrIntentNotice?.message).toBe('Committing changes...')
  })
})
