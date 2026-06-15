/**
 * Visual regression тесты для BaseNotification.
 */

import { expect, test } from '@playwright/test'

const COMPONENT = 'ui-basenotification'
const STORIES = ['default']

for (const story of STORIES) {
	test(`BaseNotification — ${story}`, async ({ page }) => {
		await page.goto(`/iframe.html?id=${COMPONENT}--${story}&viewMode=story`)
		const root = page.locator('.base-notification')
		await expect(root).toHaveScreenshot(`base-notification--${story}.png`)
	})
}
