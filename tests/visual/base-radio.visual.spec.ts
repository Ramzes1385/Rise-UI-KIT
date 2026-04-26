/**
 * Visual regression тесты для BaseRadio.
 * Скриншоты всех состояний через Playwright + Storybook.
 */

import { expect, test } from '@playwright/test'

const COMPONENT = 'baseradio'
const STORIES = [
	'default',
	'vertical',
	'with-error',
	'with-disabled-option',
	'hover-state',
	'focus-state',
	'interactive-states',
	'dark-theme',
]

for (const story of STORIES) {
	test(`BaseRadio — ${story}`, async ({ page }) => {
		await page.goto(`/iframe.html?id=${COMPONENT}--${story}&viewMode=story`)
		const root = page.locator('.base-radio-group')
		await expect(root).toHaveScreenshot(`base-radio--${story}.png`)
	})
}
