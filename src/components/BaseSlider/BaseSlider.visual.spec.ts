/**
 * Visual regression тесты для BaseSlider.
 * BaseSlider рендерит BaseImage-слайды с удалёнными src — без networkidle
 * скриншот ловит пустой viewport вместо загруженных картинок.
 */

import { expect, test } from '@playwright/test'

const COMPONENT = 'ui-baseslider'
const STORIES = ['default', 'fade', 'dark-theme']

for (const story of STORIES) {
	test(`BaseSlider — ${story}`, async ({ page }) => {
		await page.goto(`/iframe.html?id=${COMPONENT}--${story}&viewMode=story`)
		await page.waitForLoadState('networkidle')
		await page.evaluate(() => document.fonts.ready)
		const root = page.locator('.base-slider')
		await expect(root).toHaveScreenshot(`base-slider--${story}.png`)
	})
}
