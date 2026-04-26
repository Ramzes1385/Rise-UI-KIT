/**
 * Visual regression тесты для BaseDropdown.
 */

import { expect, test } from '@playwright/test'

const COMPONENT = 'basedropdown'
const STORIES = ['default', 'bottom-end', 'top-start', 'match-width', 'dark-theme']

for (const story of STORIES) {
	test(`BaseDropdown — ${story}`, async ({ page }) => {
		await page.goto(`/iframe.html?id=${COMPONENT}--${story}&viewMode=story`)
		const root = page.locator('.base-dropdown')
		await expect(root).toHaveScreenshot(`base-dropdown--${story}.png`)
	})
}
