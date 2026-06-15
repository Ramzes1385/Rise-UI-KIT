/**
 * Visual regression тесты для BaseText.
 */

import { expect, test } from '@playwright/test'

const COMPONENT = 'ui-basetext'
const STORIES = ['default', 'size-scale', 'weights', 'custom-colors', 'nowrap', 'dark-theme']

for (const story of STORIES) {
	test(`BaseText — ${story}`, async ({ page }) => {
		await page.goto(`/iframe.html?id=${COMPONENT}--${story}&viewMode=story`)
		const root = page.locator('#storybook-root')
		await expect(root).toHaveScreenshot(`base-text--${story}.png`)
	})
}
