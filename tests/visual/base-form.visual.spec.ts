/**
 * Visual regression тесты для BaseForm.
 */

import { expect, test } from '@playwright/test'

const COMPONENT = 'baseform'
const STORIES = ['default', 'loading', 'disabled', 'dark-theme']

for (const story of STORIES) {
	test(`BaseForm — ${story}`, async ({ page }) => {
		await page.goto(`/iframe.html?id=${COMPONENT}--${story}&viewMode=story`)
		const root = page.locator('.base-form')
		await expect(root).toHaveScreenshot(`base-form--${story}.png`)
	})
}
