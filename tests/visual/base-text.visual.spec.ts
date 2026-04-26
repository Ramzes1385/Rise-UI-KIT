/**
 * Visual regression тесты для BaseText.
 */

import { expect, test } from '@playwright/test'

const COMPONENT = 'basetext'
const STORIES = ['default', 'sizes', 'weights', 'colors', 'nowrap', 'dark-theme']

for (const story of STORIES) {
	test(`BaseText — ${story}`, async ({ page }) => {
		await page.goto(`/iframe.html?id=${COMPONENT}--${story}&viewMode=story`)
		const root = page.locator('.base-text')
		await expect(root).toHaveScreenshot(`base-text--${story}.png`)
	})
}
