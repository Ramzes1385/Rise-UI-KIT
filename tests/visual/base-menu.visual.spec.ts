/**
 * Visual regression тесты для BaseMenu.
 */

import { expect, test } from '@playwright/test'

const COMPONENT = 'basemenu'
const STORIES = ['default', 'with-icons', 'with-disabled', 'dark-theme']

for (const story of STORIES) {
	test(`BaseMenu — ${story}`, async ({ page }) => {
		await page.goto(`/iframe.html?id=${COMPONENT}--${story}&viewMode=story`)
		await page.setViewportSize({ width: 800, height: 400 })
		const root = page.locator('.base-menu')
		await expect(root).toHaveScreenshot(`base-menu--${story}.png`, {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})
}
