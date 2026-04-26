/**
 * Visual regression тесты для BaseProgress.
 */

import { expect, test } from '@playwright/test'

const COMPONENT = 'baseprogress'
const STORIES = ['default', 'circle', 'striped', 'indeterminate', 'dark-theme']

for (const story of STORIES) {
	test(`BaseProgress — ${story}`, async ({ page }) => {
		await page.goto(`/iframe.html?id=${COMPONENT}--${story}&viewMode=story`)
		const root = page.locator('.base-progress')
		await expect(root).toHaveScreenshot(`base-progress--${story}.png`)
	})
}
