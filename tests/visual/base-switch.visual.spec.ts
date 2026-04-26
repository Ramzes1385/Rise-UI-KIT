/**
 * Visual regression тесты для BaseSwitch.
 * Скриншоты всех состояний через Playwright + Storybook.
 */

import { expect, test } from '@playwright/test'

const COMPONENT = 'baseswitch'
const STORIES = [
	'default',
	'checked',
	'disabled',
	'disabled-checked',
	'without-label',
	'group',
	'hover-state',
	'active-state',
	'focus-state',
	'interactive-states',
	'dark-theme',
]

for (const story of STORIES) {
	test(`BaseSwitch — ${story}`, async ({ page }) => {
		await page.goto(`/iframe.html?id=${COMPONENT}--${story}&viewMode=story`)
		const root = page.locator('.base-switch')
		await expect(root).toHaveScreenshot(`base-switch--${story}.png`)
	})
}
