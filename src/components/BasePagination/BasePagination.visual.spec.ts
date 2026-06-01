/**
 * Visual regression тесты для BasePagination.
 */

import { expect, test } from '@playwright/test'

const COMPONENT = 'ui-basepagination'
const STORIES = ['default', 'many-pages', 'dark-theme']

for (const story of STORIES) {
	test(`BasePagination — ${story}`, async ({ page }) => {
		await page.goto(`/iframe.html?id=${COMPONENT}--${story}&viewMode=story`)
		const root = page.locator('.base-pagination')
		await expect(root).toHaveScreenshot(`base-pagination--${story}.png`)
	})
}
