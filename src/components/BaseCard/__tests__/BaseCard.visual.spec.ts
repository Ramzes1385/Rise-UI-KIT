/**
 * Visual regression тесты для BaseCard.
 */

import { expect, test } from '@playwright/test'

const COMPONENT = 'ui-basecard'
const STORIES = ['default', 'hoverable']

for (const story of STORIES) {
	test(`BaseCard — ${story}`, async ({ page }) => {
		await page.goto(`/iframe.html?id=${COMPONENT}--${story}&viewMode=story`)
		const root = page.locator('.base-card')
		await expect(root).toHaveScreenshot(`base-card--${story}.png`)
	})
}
