import { describe, expect, it } from 'vitest'
import { buildAppFontFamily } from './app-font-family'
import { DEFAULT_APP_FONT_FAMILY } from '../../../shared/constants'

describe('buildAppFontFamily', () => {
  it('기본 폰트가 지정되지 않았을 때(undefined/null) 기본 폰트인 Pretendard를 1순위로 포함하여 반환한다', () => {
    // given: 폰트 설정값이 없는 경우 (undefined 및 null)
    const fontUndefined = undefined
    const fontNull = null

    // when: buildAppFontFamily 함수를 호출했을 때
    const resultUndefined = buildAppFontFamily(fontUndefined)
    const resultNull = buildAppFontFamily(fontNull)

    // then: 기본 폰트인 Pretendard가 1순위로 오고 fallback 폰트들이 순서대로 포함되어야 한다
    expect(resultUndefined.startsWith(`"${DEFAULT_APP_FONT_FAMILY}"`)).toBe(true)
    expect(resultUndefined).toContain('"Pretendard Variable"')
    expect(resultUndefined).toContain('"Geist"')
    expect(resultUndefined).toContain('-apple-system')
    expect(resultUndefined).toContain('sans-serif')

    expect(resultNull.startsWith(`"${DEFAULT_APP_FONT_FAMILY}"`)).toBe(true)
    expect(resultNull).toBe(resultUndefined)
  })

  it('사용자가 다른 폰트(예: Inter, D2Coding)를 지정하면 해당 폰트가 1순위로 적용되고 Pretendard가 fallback으로 유지된다', () => {
    // given: 사용자가 커스텀 폰트 'Inter'를 설정한 경우
    const customFont = 'Inter'

    // when: buildAppFontFamily 함수를 호출했을 때
    const result = buildAppFontFamily(customFont)

    // then: 커스텀 폰트가 1순위이고, Pretendard와 Geist가 fallback으로 뒤따라야 한다
    expect(result.startsWith('"Inter"')).toBe(true)
    expect(result).toContain('"Pretendard"')
    expect(result).toContain('"Pretendard Variable"')
    expect(result).toContain('"Geist"')
    expect(result).toContain('sans-serif')
  })

  it('공백이 포함된 폰트 이름은 안전하게 큰따옴표로 감싸진다', () => {
    // given: 띄어쓰기가 포함된 폰트 이름
    const spacedFont = 'SF Pro Text'

    // when: buildAppFontFamily 함수를 호출했을 때
    const result = buildAppFontFamily(spacedFont)

    // then: 쌍따옴표로 이스케이프되어 첫 번째 폰트로 위치해야 한다
    expect(result.startsWith('"SF Pro Text"')).toBe(true)
  })

  it('CSS 키워드(system-ui, sans-serif 등) 및 벤더 접두사(-apple-system)는 따옴표 없이 그대로 유지된다', () => {
    // given: CSS 예약어 폰트
    const keywordFont = 'system-ui'
    const prefixFont = '-apple-system'

    // when: buildAppFontFamily 함수를 호출했을 때
    const resultKeyword = buildAppFontFamily(keywordFont)
    const resultPrefix = buildAppFontFamily(prefixFont)

    // then: 따옴표 없이 raw string으로 시작해야 한다
    expect(resultKeyword.startsWith('system-ui')).toBe(true)
    expect(resultPrefix.startsWith('-apple-system')).toBe(true)
  })

  // 실패 및 비정상/경계 케이스 테스트들
  it('실패/경계 케이스: 빈 문자열이 입력된 경우 기본 폰트로 안전하게 폴백한다', () => {
    // given: 빈 문자열
    const emptyFont = ''

    // when: buildAppFontFamily 함수를 호출했을 때
    const result = buildAppFontFamily(emptyFont)

    // then: 기본 폰트로 복구되어야 한다
    expect(result.startsWith(`"${DEFAULT_APP_FONT_FAMILY}"`)).toBe(true)
  })

  it('실패/경계 케이스: 공백만으로 채워진 문자열이 입력된 경우 기본 폰트로 안전하게 폴백한다', () => {
    // given: 공백 문자열
    const whitespaceFont = '     '

    // when: buildAppFontFamily 함수를 호출했을 때
    const result = buildAppFontFamily(whitespaceFont)

    // then: 기본 폰트로 복구되어야 한다
    expect(result.startsWith(`"${DEFAULT_APP_FONT_FAMILY}"`)).toBe(true)
  })

  it('실패/경계 케이스: 앞뒤 공백이 포함된 폰트 이름은 트림되어 파싱된다', () => {
    // given: 앞뒤 공백이 있는 폰트 이름
    const untrimmedFont = '   Pretendard   '

    // when: buildAppFontFamily 함수를 호출했을 때
    const result = buildAppFontFamily(untrimmedFont)

    // then: 공백이 제거된 형태로 첫 번째 위치에 오고 중복되지 않아야 한다
    expect(result.startsWith('"Pretendard"')).toBe(true)
    const matches = result.match(/"Pretendard"/g)
    expect(matches?.length).toBe(1)
  })

  it('실패/경계 케이스: 대소문자가 다른 기본 폰트 이름이 입력되어도 중복 없이 처리된다', () => {
    // given: 소문자로 입력된 기본 폰트명
    const lowercaseFont = 'pretendard'

    // when: buildAppFontFamily 함수를 호출했을 때
    const result = buildAppFontFamily(lowercaseFont)

    // then: 소문자 입력이 1순위에 들어가고, fallback 목록의 대소문자 중복은 제거되어야 한다
    expect(result.startsWith('"pretendard"')).toBe(true)
    const lowerMatches = result.toLowerCase().match(/"pretendard"/g)
    expect(lowerMatches?.length).toBe(1)
  })

  it('실패/경계 케이스: fallback에 이미 존재하는 Geist 폰트를 지정해도 중복되지 않는다', () => {
    // given: fallback 목록에 속해 있는 'Geist'
    const geistFont = 'Geist'

    // when: buildAppFontFamily 함수를 호출했을 때
    const result = buildAppFontFamily(geistFont)

    // then: Geist가 1순위가 되고 중복 등록되지 않아야 한다
    expect(result.startsWith('"Geist"')).toBe(true)
    const matches = result.match(/"Geist"/g)
    expect(matches?.length).toBe(1)
  })
})
