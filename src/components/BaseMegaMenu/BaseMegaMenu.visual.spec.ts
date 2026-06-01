/**
 * Visual regression тесты для BaseMegaMenu.
 */

import { expect, test } from '@playwright/test'

const COMPONENT = 'ui-basemegamenu'
const STORIES = ['default', 'deep-nesting', 'dark-theme']

for (const story of STORIES) {
	test(`BaseMegaMenu — ${story}`, async ({ page }) => {
		await page.goto(`/iframe.html?id=${COMPONENT}--${story}&viewMode=story`)
		const root = page.locator('.base-mega-menu')
		await expect(root).toHaveScreenshot(`base-mega-menu--${story}.png`)
	})
}
