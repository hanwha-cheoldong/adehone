import { describe, expect, it } from 'vitest'
import {
  mapBitbucketDataCenterMergeable,
  mapBitbucketDataCenterPullRequest,
  mapBitbucketDataCenterPullRequestState,
  mapBitbucketDataCenterReviewDecision
} from './pull-request-mappers'

describe('pull-request-mappers (Bitbucket Data Center)', () => {
  it('maps DC pull request states', () => {
    expect(mapBitbucketDataCenterPullRequestState('OPEN')).toBe('open')
    expect(mapBitbucketDataCenterPullRequestState('MERGED')).toBe('merged')
    expect(mapBitbucketDataCenterPullRequestState('DECLINED')).toBe('closed')
  })

  it('maps merge status to PRMergeableState', () => {
    expect(mapBitbucketDataCenterMergeable({ canMerge: true, conflicted: false })).toBe('MERGEABLE')
    expect(mapBitbucketDataCenterMergeable({ canMerge: false, conflicted: true })).toBe(
      'CONFLICTING'
    )
    expect(mapBitbucketDataCenterMergeable({ canMerge: false, conflicted: false })).toBe(
      'CONFLICTING'
    )
    expect(mapBitbucketDataCenterMergeable(null)).toBe('UNKNOWN')
  })

  it('prioritizes NEEDS_WORK over APPROVED in reviewer decision', () => {
    expect(
      mapBitbucketDataCenterReviewDecision([{ status: 'APPROVED' }, { status: 'NEEDS_WORK' }])
    ).toBe('CHANGES_REQUESTED')
    expect(mapBitbucketDataCenterReviewDecision([{ status: 'APPROVED' }])).toBe('APPROVED')
    expect(mapBitbucketDataCenterReviewDecision([{ status: 'UNAPPROVED' }])).toBe('REVIEW_REQUIRED')
    expect(mapBitbucketDataCenterReviewDecision([])).toBeNull()
  })

  it('maps a full DC 8.19 pull request payload', () => {
    const pr = mapBitbucketDataCenterPullRequest(
      {
        id: 42,
        title: 'Add Bitbucket DC support',
        state: 'OPEN',
        updatedDate: 1700000000000,
        links: {
          self: [{ href: 'https://bitbucket.example.com/projects/PROJ/repos/app/pull-requests/42' }]
        },
        fromRef: {
          id: 'refs/heads/feat/dc',
          displayId: 'feat/dc',
          latestCommit: 'abc123def'
        },
        toRef: {
          id: 'refs/heads/main',
          displayId: 'main'
        },
        reviewers: [{ status: 'APPROVED', approved: true }]
      },
      'success',
      'MERGEABLE'
    )

    expect(pr).toEqual({
      number: 42,
      title: 'Add Bitbucket DC support',
      state: 'open',
      url: 'https://bitbucket.example.com/projects/PROJ/repos/app/pull-requests/42',
      status: 'success',
      updatedAt: '2023-11-14T22:13:20.000Z',
      mergeable: 'MERGEABLE',
      reviewDecision: 'APPROVED',
      headSha: 'abc123def',
      baseRefName: 'main'
    })
  })
})
