/**
 * Visual regression тесты для BaseSearch.
 */

import { expect, test } from '@playwright/test'

const COMPONENT = 'basesearch'
const STORIES = ['default', 'with-icon', 'with-results', 'loading', 'dark-theme']

for (const story of STORIES) {
	test(`BaseSearch — ${story}`, async ({ page }) => {
		await page.goto(`/iframe.html?id=${COMPONENT}--${story}&viewMode=story`)
		const root = page.locator('.base-search')
		await expect(root).toHaveScreenshot(`base-search--${story}.png`)
	})
}
