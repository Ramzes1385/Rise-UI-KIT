/**
 * Visual regression тесты для BasePin.
 * Скриншоты всех состояний через Playwright + Storybook.
 */

import { expect, test } from '@playwright/test'

const COMPONENT = 'ui-basepin'
const STORIES = [
	'default',
	'with-error',
	'disabled',
]

for (const story of STORIES) {
	test(`BasePin — ${story}`, async ({ page }) => {
		await page.goto(`/iframe.html?id=${COMPONENT}--${story}&viewMode=story`)
		const root = page.locator('.base-pin')
		await expect(root).toHaveScreenshot(`base-pin--${story}.png`)
	})
}
