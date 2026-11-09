// @vitest-environment happy-dom
import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { GeneralSupportSection } from './GeneralSupportSection'

afterEach(() => {
  cleanup()
})

describe('GeneralSupportSection', () => {
  it('hasPrecedingSections가 true일 때 화면에 아무것도 렌더링하지 않는다', () => {
    // given
    const hasPrecedingSections = true

    // when
    const { container } = render(
      <GeneralSupportSection hasPrecedingSections={hasPrecedingSections} />
    )

    // then
    expect(container.firstChild).toBeNull()
    expect(container.innerHTML).toBe('')
  })

  it('hasPrecedingSections가 false일 때도 화면에 아무것도 렌더링하지 않는다', () => {
    // given
    const hasPrecedingSections = false

    // when
    const { container } = render(
      <GeneralSupportSection hasPrecedingSections={hasPrecedingSections} />
    )

    // then
    expect(container.firstChild).toBeNull()
    expect(container.innerHTML).toBe('')
  })

  it('Support Orca 및 깃허브 스타 관련 요소가 DOM에 존재하지 않는다 (실패/부정 케이스)', () => {
    // given
    const hasPrecedingSections = true

    // when
    const { container } = render(
      <GeneralSupportSection hasPrecedingSections={hasPrecedingSections} />
    )

    // then
    expect(container.querySelector('section')).toBeNull()
    expect(container.textContent).not.toContain('Support Orca')
    expect(container.textContent).not.toContain('Star Orca on GitHub')
    expect(container.firstChild).toBeNull()
  })

  it('컨테이너 내부에 버튼이나 인터랙티브 요소가 렌더링되지 않는다 (실패/부정 케이스)', () => {
    // given
    const hasPrecedingSections = false

    // when
    const { container } = render(
      <GeneralSupportSection hasPrecedingSections={hasPrecedingSections} />
    )

    // then
    expect(container.querySelector('button')).toBeNull()
    expect(container.querySelectorAll('*').length).toBe(0)
  })
})
