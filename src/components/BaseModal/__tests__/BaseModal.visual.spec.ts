/**
 * Visual regression тесты для BaseModal.
 */

import { expect, test } from '@playwright/test'

const COMPONENT = 'ui-basemodal'
const STORIES = ['default', 'dark-theme']

for (const story of STORIES) {
	test(`BaseModal — ${story}`, async ({ page }) => {
		await page.goto(`/iframe.html?id=${COMPONENT}--${story}&viewMode=story`)
		const root = page.locator('#storybook-root')
		await expect(root).toHaveScreenshot(`base-modal--${story}.png`)
	})
}
