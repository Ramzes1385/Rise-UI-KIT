/**
 * Visual regression тесты для BaseImage.
 */

import { expect, test } from '@playwright/test'

const COMPONENT = 'ui-baseimage'
const STORIES = ['default', 'fits', 'border-radii', 'dark-theme']

for (const story of STORIES) {
	test(`BaseImage — ${story}`, async ({ page }) => {
		await page.goto(`/iframe.html?id=${COMPONENT}--${story}&viewMode=story`)
		const root = page.locator('#storybook-root')
		await expect(root).toHaveScreenshot(`base-image--${story}.png`)
	})
}
