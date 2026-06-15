/**
 * Visual regression тесты для BaseRange.
 */

import { expect, test } from '@playwright/test'

const COMPONENT = 'ui-baserange'
const STORIES = ['default', 'disabled', 'dark-theme']

for (const story of STORIES) {
	test(`BaseRange — ${story}`, async ({ page }) => {
		await page.goto(`/iframe.html?id=${COMPONENT}--${story}&viewMode=story`)
		const root = page.locator('.base-range')
		await expect(root).toHaveScreenshot(`base-range--${story}.png`)
	})
}
