/**
 * Visual regression тесты для BaseProgress.
 */

import { expect, test } from '@playwright/test'

const COMPONENT = 'ui-baseprogress'
const STORIES = ['default', 'circle', 'indeterminate', 'dark-theme']

for (const story of STORIES) {
	test(`BaseProgress — ${story}`, async ({ page }) => {
		await page.goto(`/iframe.html?id=${COMPONENT}--${story}&viewMode=story`)
		const root = page.locator('#storybook-root')
		await expect(root).toHaveScreenshot(`base-progress--${story}.png`)
	})
}
