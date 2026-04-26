/**
 * Visual regression тесты для BaseImageZoom.
 */

import { expect, test } from '@playwright/test'

const COMPONENT = 'baseimagezoom'
const STORIES = ['default', 'zoomed', 'dark-theme']

for (const story of STORIES) {
	test(`BaseImageZoom — ${story}`, async ({ page }) => {
		await page.goto(`/iframe.html?id=${COMPONENT}--${story}&viewMode=story`)
		const root = page.locator('.base-image-zoom')
		await expect(root).toHaveScreenshot(`base-image-zoom--${story}.png`)
	})
}
