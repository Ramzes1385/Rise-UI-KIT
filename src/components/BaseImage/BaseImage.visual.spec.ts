/**
 * Visual regression тесты для BaseImage.
 * BaseImage рендерит <img src="https://placehold.co/..."> — без networkidle скриншот
 * захватывается до загрузки удалённой картинки, и baseline остаётся 1248x20 пустым.
 */

import { expect, test } from '@playwright/test'

const COMPONENT = 'ui-baseimage'
const STORIES = ['default', 'fits', 'border-radii', 'dark-theme']

for (const story of STORIES) {
	test(`BaseImage — ${story}`, async ({ page }) => {
		await page.goto(`/iframe.html?id=${COMPONENT}--${story}&viewMode=story`)
		await page.waitForLoadState('networkidle')
		await page.evaluate(() => document.fonts.ready)
		const root = page.locator('#storybook-root')
		await expect(root).toHaveScreenshot(`base-image--${story}.png`)
	})
}
