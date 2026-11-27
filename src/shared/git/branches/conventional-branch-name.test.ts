import { describe, expect, it } from 'vitest'
import { resolveBranchTicket } from './branch-ticket'
import {
  formatConventionalBranch,
  readBranchWorkType,
  resolveBranchParts,
  type ConventionalBranchInput
} from './conventional-branch-name'

const compose = (input: ConventionalBranchInput) =>
  formatConventionalBranch(resolveBranchParts(input))

describe('conventional branch names', () => {
  it.each([
    // [name, expected]; feature and bugfix shorten, and release needs its slash.
    ['feature/Add Login', 'feat/add-login'],
    ['bugfix-header', 'fix/header'],
    ['Fix: header bug', 'fix/header-bug'],
    ['hotfix payment', 'hotfix/payment'],
    ['chore/update bot template', 'chore/update-bot-template'],
    ['release/v1.2.0', 'release/v1.2.0'],
    ['release-notes-page', 'feat/release-notes-page'],
    ['fix', 'feat/fix'],
    ['  Fix__Header..v1.-2 ', 'fix/header.v1-2'],
    ['--.Upper CASE_name.--', 'feat/upper-case-name'],
    ['a/b//c', 'feat/a-b-c'],
    ['build.lock', 'feat/build-lock'],
    ['café Résumé', 'feat/cafe-resume'],
    ['로그인 오류 수정', 'feat/로그인-오류-수정'],
    ['fix/안드봇_하네스..ECC  기반', 'fix/안드봇-하네스.ecc-기반'],
    ['-로그인--', 'feat/로그인'],
    ['修复 login 오류', 'feat/login-오류'],
    ['ㅋㅋ ㈀ test', 'feat/ㅋㅋ-test']
  ])('composes %j as %j', (name, expected) => {
    expect(compose({ name })).toBe(expected)
  })

  it('composes decomposed Hangul like its composed form', () => {
    expect(compose({ name: '한글 브랜치'.normalize('NFD') })).toBe('feat/한글-브랜치')
  })

  it('lets a chosen type replace the one written in the name', () => {
    expect(compose({ name: 'fix-login', type: 'chore' })).toBe('chore/login')
  })

  it.each([
    ['confluence integration', 'issue-98', 'feat/issue-98-confluence-integration'],
    ['Issue 98 Confluence Integration', 'issue-98', 'feat/issue-98-confluence-integration'],
    ['Fix Issue 98', 'issue-98', 'fix/issue-98'],
    ['issue-980 follow up', 'issue-98', 'feat/issue-98-issue-980-follow-up'],
    ['issue-98번 로그인', 'issue-98', 'feat/issue-98번-로그인'],
    ['버그issue-98', 'issue-98', 'feat/버그issue-98'],
    ['PROJ-12 로그인', 'PROJ-12', 'feat/proj-12-로그인'],
    ['修复登录', 'sta-335', 'feat/sta-335']
  ])('puts the ticket of %j first once', (name, ticket, expected) => {
    expect(compose({ name, ticket })).toBe(expected)
  })

  it('never reads a collision suffix as a type marker', () => {
    const parts = resolveBranchParts({ name: 'feature' })
    expect(formatConventionalBranch({ ...parts, description: `${parts.description}-2` })).toBe(
      'feat/feature-2'
    )
  })

  it('reports nothing to describe instead of inventing a name', () => {
    expect(compose({ name: '修复登录' })).toBeNull()
  })

  it('reads the type of a branch with or without a prefix', () => {
    expect(readBranchWorkType('team/sub/fix/nautilus')).toBe('fix')
    expect(readBranchWorkType('team/nautilus')).toBeUndefined()
  })
})

describe('resolveBranchTicket', () => {
  const item = { title: 't', url: 'https://example.test/1' }

  it('prefers the linked issue item and never names a review number', () => {
    expect(
      resolveBranchTicket({
        linkedWorkItem: {
          ...item,
          provider: 'jira',
          type: 'issue',
          number: 0,
          jiraIdentifier: 'PROJ-12'
        },
        linkedIssue: 98
      })
    ).toBe('proj-12')
    expect(
      resolveBranchTicket({
        linkedWorkItem: { ...item, provider: 'github', type: 'pr', number: 41 }
      })
    ).toBeUndefined()
  })

  it.each([
    [{ linkedLinearIssue: 'STA-335' }, 'sta-335'],
    [{ linkedIssue: 98 }, 'issue-98'],
    [{ linkedGitLabIssue: 7 }, 'issue-7'],
    [{ linkedItems: [{ provider: 'jira', type: 'issue', number: 0, identifier: 'AB-3' }] }, 'ab-3']
  ] as const)('reads %o', (source, expected) => {
    expect(resolveBranchTicket(source)).toBe(expected)
  })
})
