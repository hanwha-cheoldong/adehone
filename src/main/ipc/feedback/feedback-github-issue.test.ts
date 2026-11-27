import { beforeEach, describe, expect, it, vi } from 'vitest'

const { ghExecFileAsyncMock, runPreflightCheckMock, uploadGitHubImageMock } = vi.hoisted(() => ({
  ghExecFileAsyncMock: vi.fn(),
  runPreflightCheckMock: vi.fn(),
  uploadGitHubImageMock: vi.fn()
}))

vi.mock('../../git/command-runner/hosted-cli/gh-exec-file', () => ({
  ghExecFileAsync: ghExecFileAsyncMock
}))

vi.mock('../../preflight/agent-detection', () => ({
  runPreflightCheck: runPreflightCheckMock
}))

vi.mock('../../github/attachments/image-attachment-upload', () => ({
  uploadGitHubImage: uploadGitHubImageMock
}))

import { submitFeedbackToGitHubIssue } from './feedback-github-issue'
import { buildFeedbackNewIssueUrl } from '../../../shared/feedback/adehone-feedback-issue'
import {
  formatClientEnvironmentFooter,
  stripClientEnvironmentFooter
} from '../../../shared/feedback/client-environment-info'

describe('submitFeedbackToGitHubIssue', () => {
  beforeEach(() => {
    ghExecFileAsyncMock.mockReset()
    runPreflightCheckMock.mockReset()
    uploadGitHubImageMock.mockReset()
    runPreflightCheckMock.mockResolvedValue({
      gh: { installed: true, authenticated: true }
    })
  })

  it('creates an issue in hanwha-cheoldong/adehone with uploaded screenshots', async () => {
    uploadGitHubImageMock.mockResolvedValue({
      url: 'https://github.com/user-attachments/assets/abc-123'
    })
    ghExecFileAsyncMock.mockResolvedValue({
      stdout: JSON.stringify({
        number: 42,
        html_url: 'https://github.com/hanwha-cheoldong/adehone/issues/42'
      }),
      stderr: ''
    })

    const result = await submitFeedbackToGitHubIssue({
      feedback: 'Button is misaligned\nMore details\n\n---\nAdehone: 1.4.214\nOS: darwin (arm64)',
      images: [{ contentType: 'image/png', data: new Uint8Array([1, 2, 3]) }]
    })

    expect(result).toEqual({
      ok: true,
      issueNumber: 42,
      issueUrl: 'https://github.com/hanwha-cheoldong/adehone/issues/42',
      imagesUploaded: 1,
      imagesFailedCount: 0
    })

    const call = ghExecFileAsyncMock.mock.calls[0]
    expect(call?.[0]).toEqual([
      'api',
      '-X',
      'POST',
      'repos/hanwha-cheoldong/adehone/issues',
      '--input',
      '-'
    ])
    const stdin = typeof call?.[1]?.stdin === 'string' ? call[1].stdin : '{}'
    const payload: unknown = JSON.parse(stdin)
    expect(payload).toMatchObject({
      title: '[Feedback]: Button is misaligned'
    })
    expect(payload).toEqual(
      expect.objectContaining({
        body: expect.stringContaining(
          '![feedback-image-1.png](https://github.com/user-attachments/assets/abc-123)'
        )
      })
    )
  })

  it('continues creating the issue and reports failed screenshot count when upload fails', async () => {
    uploadGitHubImageMock.mockRejectedValue(new Error('upload failed'))
    ghExecFileAsyncMock.mockResolvedValue({
      stdout: JSON.stringify({
        number: 43,
        html_url: 'https://github.com/hanwha-cheoldong/adehone/issues/43'
      }),
      stderr: ''
    })

    const result = await submitFeedbackToGitHubIssue({
      feedback: 'Text only fallback',
      images: [{ contentType: 'image/png', data: new Uint8Array([1, 2, 3]) }]
    })

    expect(result).toEqual({
      ok: true,
      issueNumber: 43,
      issueUrl: 'https://github.com/hanwha-cheoldong/adehone/issues/43',
      imagesUploaded: 0,
      imagesFailedCount: 1
    })
  })

  it('returns gh-not-installed when gh CLI is missing', async () => {
    runPreflightCheckMock.mockResolvedValue({
      gh: { installed: false, authenticated: false }
    })

    const result = await submitFeedbackToGitHubIssue({
      feedback: 'Need gh install guide'
    })

    expect(result).toEqual({
      ok: false,
      error: 'GitHub CLI (gh) is not installed.',
      reason: 'gh-not-installed'
    })
    expect(ghExecFileAsyncMock).not.toHaveBeenCalled()
  })

  it('returns gh-not-authenticated when gh CLI is not signed in', async () => {
    runPreflightCheckMock.mockResolvedValue({
      gh: { installed: true, authenticated: false }
    })

    const result = await submitFeedbackToGitHubIssue({
      feedback: 'Need gh login'
    })

    expect(result).toEqual({
      ok: false,
      error: 'GitHub CLI (gh) is not authenticated.',
      reason: 'gh-not-authenticated'
    })
    expect(ghExecFileAsyncMock).not.toHaveBeenCalled()
  })
})

describe('Adehone feedback URL and environment footer', () => {
  it('builds a hanwha-cheoldong/adehone new-issue URL and formats Adehone environment footer', () => {
    const footer = formatClientEnvironmentFooter({
      appVersion: '1.4.214',
      platform: 'darwin',
      osRelease: '24.0.0',
      arch: 'arm64'
    })
    expect(footer).toBe('---\nAdehone: 0.1.0 (Orca 1.4.214)\nOS: darwin 24.0.0 (arm64)')
    expect(stripClientEnvironmentFooter(`Hello\n\n${footer}`)).toBe('Hello\n\n')
    expect(stripClientEnvironmentFooter('Hello\n\n---\nOrca: 1.4.214\nOS: darwin (arm64)')).toBe(
      'Hello\n\n'
    )

    const parsed = new URL(buildFeedbackNewIssueUrl(`Hello world\n\n${footer}`))
    expect(`${parsed.origin}${parsed.pathname}`).toBe(
      'https://github.com/hanwha-cheoldong/adehone/issues/new'
    )
    expect(parsed.searchParams.get('title')).toBe('[Feedback]: Hello world')
    expect(parsed.searchParams.get('body')).toContain('Adehone: 0.1.0 (Orca 1.4.214)')
  })
})
