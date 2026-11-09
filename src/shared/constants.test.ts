import { describe, expect, it } from 'vitest'
import { getDefaultSettings, getDefaultWorkspaceDir } from './constants'

describe('getDefaultWorkspaceDir', () => {
  it('POSIX 홈 디렉터리에 대해 기본 adehone 워크스페이스 디렉터리를 반환한다', () => {
    // given
    const homeDir = '/Users/developer'

    // when
    const result = getDefaultWorkspaceDir(homeDir)

    // then
    expect(result).toBe('/Users/developer/adehone/workspaces')
    expect(result).not.toContain('orca')
  })

  it('Windows 홈 디렉터리에 대해 역슬래시 구분자로 기본 adehone 워크스페이스 디렉터리를 반환한다', () => {
    // given
    const homeDir = 'C:\\Users\\developer'

    // when
    const result = getDefaultWorkspaceDir(homeDir)

    // then
    expect(result).toBe('C:\\Users\\developer\\adehone\\workspaces')
    expect(result).not.toContain('orca')
  })

  it('후행 슬래시가 있는 POSIX 경로의 후행 슬래시를 제거하고 디렉터리를 구성한다', () => {
    // given
    const homeDir = '/home/user///'

    // when
    const result = getDefaultWorkspaceDir(homeDir)

    // then
    expect(result).toBe('/home/user/adehone/workspaces')
    expect(result).not.toBe('/home/user///adehone/workspaces')
  })

  it('후행 역슬래시가 있는 Windows 경로의 후행 역슬래시를 제거하고 디렉터리를 구성한다', () => {
    // given
    const homeDir = 'C:\\Users\\user\\\\\\'

    // when
    const result = getDefaultWorkspaceDir(homeDir)

    // then
    expect(result).toBe('C:\\Users\\user\\adehone\\workspaces')
    expect(result).not.toBe('C:\\Users\\user\\\\\\adehone\\workspaces')
  })

  it('기존의 orca 경로가 아닌 adehone 경로를 기본값으로 갖는지 검증한다 (실패/부정 케이스)', () => {
    // given
    const homeDir = '/home/test'

    // when
    const result = getDefaultWorkspaceDir(homeDir)

    // then
    expect(result).not.toBe('/home/test/orca/workspaces')
    expect(result.includes('orca')).toBe(false)
  })

  it('빈 문자열이 홈 디렉터리로 전달되었을 때의 경계 케이스를 처리한다', () => {
    // given
    const homeDir = ''

    // when
    const result = getDefaultWorkspaceDir(homeDir)

    // then
    expect(result).toBe('/adehone/workspaces')
    expect(result).not.toBe('/orca/workspaces')
  })

  it('루트 슬래시만 전달되었을 때 후행 슬래시 제거 후 루트 기반으로 경로를 생성한다', () => {
    // given
    const homeDir = '/'

    // when
    const result = getDefaultWorkspaceDir(homeDir)

    // then
    expect(result).toBe('/adehone/workspaces')
    expect(result).not.toBe('//adehone/workspaces')
  })

  it('getDefaultSettings의 workspaceDir 속성에 adehone 기본 경로가 반영된다', () => {
    // given
    const homeDir = '/Users/testuser'

    // when
    const settings = getDefaultSettings(homeDir)

    // then
    expect(settings.workspaceDir).toBe('/Users/testuser/adehone/workspaces')
    expect(settings.workspaceDir).not.toBe('/Users/testuser/orca/workspaces')
  })
})
