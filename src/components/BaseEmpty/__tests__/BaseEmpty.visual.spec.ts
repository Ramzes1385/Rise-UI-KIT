/**
 * Visual regression тесты для BaseEmpty.
 */

import { expect, test } from '@playwright/test'

const COMPONENT = 'ui-baseempty'
const STORIES = ['default', 'all-variants', 'with-slots', 'size-scale', 'dark-theme']

for (const story of STORIES) {
	test(`BaseEmpty - ${story}`, async ({ page }) => {
		await page.goto(`/iframe.html?id=${COMPONENT}--${story}&viewMode=story`)
		const root = page.locator('#storybook-root')
		await expect(root).toHaveScreenshot(`base-empty--${story}.png`)
	})
}
