/**
 * Visual regression тесты для BaseSwitch.
 * Скриншоты всех состояний через Playwright + Storybook.
 */

import { expect, test } from '@playwright/test'

const COMPONENT = 'ui-baseswitch'
const STORIES = [
	'default',
	'checked',
	'disabled',
	'disabled-checked',
	'hover-state',
	'focus-state',
	'interactive-states',
	'dark-theme',
]

for (const story of STORIES) {
	test(`BaseSwitch — ${story}`, async ({ page }) => {
		await page.goto(`/iframe.html?id=${COMPONENT}--${story}&viewMode=story`)
		const root = page.locator('#storybook-root')
		await expect(root).toHaveScreenshot(`base-switch--${story}.png`)
	})
}
