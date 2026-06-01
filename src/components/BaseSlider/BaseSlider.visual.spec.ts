/**
 * Visual regression тесты для BaseSlider.
 */

import { expect, test } from '@playwright/test'

const COMPONENT = 'ui-baseslider'
const STORIES = ['default', 'fade', 'dark-theme']

for (const story of STORIES) {
	test(`BaseSlider — ${story}`, async ({ page }) => {
		await page.goto(`/iframe.html?id=${COMPONENT}--${story}&viewMode=story`)
		const root = page.locator('.base-slider')
		await expect(root).toHaveScreenshot(`base-slider--${story}.png`)
	})
}
