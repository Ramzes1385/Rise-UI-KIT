/**
 * Visual regression тесты для BaseTour.
 */

import { expect, test } from '@playwright/test'

const COMPONENT = 'ui-basetour'
const STORIES = ['minimal', 'dark-theme']

for (const story of STORIES) {
	test(`BaseTour — ${story}`, async ({ page }) => {
		await page.goto(`/iframe.html?id=${COMPONENT}--${story}&viewMode=story`)
		const card = page.locator('.base-tour__card')
		await card.waitFor({ state: 'visible' })
		await expect(card).toHaveScreenshot(`base-tour--${story}.png`)
	})
}
