/**
 * Visual regression тесты для BaseTabs.
 */

import { expect, test } from '@playwright/test'

const COMPONENT = 'basetabs'
const STORIES = ['underline', 'pills', 'rounded', 'arc', 'full-width', 'with-disabled', 'dark-theme']

for (const story of STORIES) {
	test(`BaseTabs — ${story}`, async ({ page }) => {
		await page.goto(`/iframe.html?id=${COMPONENT}--${story}&viewMode=story`)
		const root = page.locator('.base-tabs')
		await expect(root).toHaveScreenshot(`base-tabs--${story}.png`)
	})
}
