/**
 * Visual regression тесты для BaseAlert.
 */

import { expect, test } from '@playwright/test'

const COMPONENT = 'ui-basealert'
const STORIES = ['default', 'all-types', 'variants', 'closable', 'with-slots', 'size-scale', 'dark-theme']

for (const story of STORIES) {
	test(`BaseAlert - ${story}`, async ({ page }) => {
		await page.goto(`/iframe.html?id=${COMPONENT}--${story}&viewMode=story`)
		const root = page.locator('#storybook-root')
		await expect(root).toHaveScreenshot(`base-alert--${story}.png`)
	})
}
