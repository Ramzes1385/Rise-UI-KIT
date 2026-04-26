/**
 * Visual regression тесты для BaseTable.
 */

import { expect, test } from '@playwright/test'

const COMPONENT = 'basetable'
const STORIES = ['default', 'bordered', 'striped', 'dark-theme']

for (const story of STORIES) {
	test(`BaseTable — ${story}`, async ({ page }) => {
		await page.goto(`/iframe.html?id=${COMPONENT}--${story}&viewMode=story`)
		const root = page.locator('.base-table')
		await expect(root).toHaveScreenshot(`base-table--${story}.png`)
	})
}
