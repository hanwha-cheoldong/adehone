export const SKILL = `---
name: mobile-web-tdd-testing
description: TDD workflow for Mobile Web — Vitest + Testing Library, MSW, Playwright mobile and cross-browser E2E, visual regression, axe accessibility, and WebView bridge contract tests.
---

# Mobile Web TDD Testing

Use the project's existing framework, runner, and conventions first; the examples assume Vitest, React, and Playwright. In another framework, keep the method and use that framework's testing tools.

## 1. Red → Green → Refactor
1. Write one failing test that describes a behaviour (Arrange, Act, Assert).
2. Run it and confirm it fails for the expected reason.
3. Write the minimum code to pass, then refactor while green.
4. For a bug fix, the new test must fail without the fix.

Assert what the user sees or what crosses a boundary (network, native bridge). Mock only those boundaries, never the module under test.

## 2. Unit and Component Tests

\`\`\`ts
// vitest.config.ts (add the React plugin the project already uses)
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'], // keeps Playwright specs out of Vitest
    setupFiles: ['./src/test/setup.ts']
  }
})
\`\`\`

\`\`\`ts
// src/test/setup.ts
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { server } from './server'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  cleanup()
  server.resetHandlers()
})
afterAll(() => server.close())
\`\`\`

\`\`\`ts
// src/test/server.ts
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

export const server = setupServer(
  http.get('/api/products', () => HttpResponse.json([{ id: '1', name: 'Widget', stock: 5 }]))
)
\`\`\`

\`\`\`tsx
// src/features/cart/AddToCartButton.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { AddToCartButton } from './AddToCartButton'

it('reports the product when tapped', async () => {
  const user = userEvent.setup()
  const onAdd = vi.fn()
  render(<AddToCartButton productId="1" onAdd={onAdd} />)

  await user.click(screen.getByRole('button', { name: /add to cart/i }))

  expect(onAdd).toHaveBeenCalledWith('1')
})
\`\`\`

- Query by role, label, or text; use test ids only as a last resort.
- Prefer \`userEvent\` over \`fireEvent\`, and \`findBy*\` / \`waitFor\` over fixed delays.
- Cover loading, empty, error (override with \`server.use\`), and offline states.

## 3. WebView Bridge Contract Tests

Run the **real bridge client** against a fake native host at the \`window\` boundary. This pins the wire format in \`mobile-web-webview-bridge/references/bridge-protocol.md\`.

\`\`\`ts
// src/webview/bridge-client.test.ts
import { afterEach, expect, it, vi } from 'vitest'
import { createBridgeClient } from './bridge-client'

type FakeHost = {
  sent: string[]
  postMessage(message: string): void
  onmessage: ((event: { data: unknown }) => void) | null
}

function installFakeAndroidHost(): FakeHost {
  const host: FakeHost = {
    sent: [],
    postMessage(message) {
      this.sent.push(message)
    },
    onmessage: null
  }
  vi.stubGlobal('AppBridge', host)
  return host
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

it('sends the protocol envelope and settles only on the matching id', async () => {
  const host = installFakeAndroidHost()
  const result = createBridgeClient().call('getLocation', { accuracy: 'coarse', timeoutMs: 1000 })

  const request = JSON.parse(host.sent[0])
  expect(request).toEqual({
    id: expect.any(String),
    action: 'getLocation',
    payload: { accuracy: 'coarse', timeoutMs: 1000 }
  })

  host.onmessage?.({ data: JSON.stringify({ id: 'other', ok: true, data: {} }) })
  host.onmessage?.({ data: JSON.stringify({ id: request.id, ok: true, data: { lat: 1 } }) })

  await expect(result).resolves.toEqual({ id: request.id, ok: true, data: { lat: 1 } })
})

it('times out when the host never replies', async () => {
  installFakeAndroidHost()
  vi.useFakeTimers()
  const result = createBridgeClient({ timeoutMs: 50 }).call('getAppInfo')

  await vi.advanceTimersByTimeAsync(50)

  await expect(result).resolves.toMatchObject({ ok: false, error: { code: 'TIMEOUT' } })
})

it('reports BRIDGE_UNAVAILABLE in a standalone browser', async () => {
  const result = createBridgeClient().call('getAppInfo')

  await expect(result).resolves.toMatchObject({ ok: false, error: { code: 'BRIDGE_UNAVAILABLE' } })
})
\`\`\`

- Add cases for each action the app uses: payload shape, success schema, and the error codes the UI handles. Also cover events and a malformed reply.
- Test the iOS port too (\`window.webkit.messageHandlers.AppBridge\` and \`window.__appBridgeReceive\`).
- These tests cannot detect a native side that drifted. Real-host verification belongs to \`mobile-web-verification-loop\` Phase 6.

## 4. Playwright E2E, Cross-Browser, Visual, and Accessibility

\`\`\`ts
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  use: { trace: 'on-first-retry', screenshot: 'only-on-failure' },
  projects: [
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 14'] } },
    { name: 'chrome', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } }
  ]
})
\`\`\`

**Viewport matrix** (CSS px width): \`320\`, \`375\`, \`390\`, \`768\`, \`1024\`, \`1440\`, \`1920\`. Check every width for horizontal overflow. Capture screenshots at \`320\`, \`768\`, \`1024\`, and \`1440\`, in both themes if the app has them.

\`\`\`ts
// tests/e2e/home.spec.ts (needs @axe-core/playwright)
import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

for (const width of [320, 375, 390, 768, 1024, 1440, 1920]) {
  test('home has no horizontal overflow at ' + width, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 })
    await page.goto('/')
    await expect(page.getByRole('main')).toBeVisible()
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth
    )
    expect(overflow).toBeLessThanOrEqual(0)
  })
}

for (const width of [320, 768, 1024, 1440]) {
  test('home looks unchanged at ' + width, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 })
    await page.goto('/')
    await expect(page).toHaveScreenshot('home-' + width + '.png', { animations: 'disabled' })
  })
}

test('home passes automated accessibility checks', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('main')).toBeVisible()
  const report = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze()
  expect(report.violations).toEqual([])
})
\`\`\`

- Use \`tap()\` only in touch projects (\`mobile-chrome\`, \`mobile-safari\`); use \`click()\` in shared specs.
- Measure primary controls with \`boundingBox()\` against the project's \`44x44px\` target. WCAG 2.2 AA requires \`24x24\` (SC 2.5.8); \`44x44\` is the AAA level (SC 2.5.5).
- Also check keyboard navigation and \`reducedMotion: 'reduce'\`. Axe finds only part of accessibility problems.
- Wait on locators or responses, never fixed timeouts. Update screenshot baselines only after reviewing the diff.
- Device emulation is not a real iOS or Android WebView.

## 5. Coverage Gates
- At least **80%** coverage overall, unless the project sets a stricter gate. Do not lower an existing one.
- Unit/component, API integration (success and failure per endpoint used), and E2E for critical user journeys are all required.
- Every bridge action the app calls has a contract test.

Run the affected tests while iterating, then finish with \`mobile-web-verification-loop\`.
`
