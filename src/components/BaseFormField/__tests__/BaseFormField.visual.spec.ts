/**
 * Visual regression тесты для BaseFormField.
 */

import { expect, test } from '@playwright/test'

const COMPONENT = 'ui-baseformfield'
const STORIES = ['default', 'with-description', 'with-error', 'required', 'dark-theme']

	for (const story of STORIES) {
	test(`BaseFormField — ${story}`, async ({ page }) => {
		await page.goto(`/iframe.html?id=${COMPONENT}--${story}&viewMode=story`)
		await page.waitForLoadState('networkidle')
		const root = page.locator('.base-form-field')
		await expect(root).toHaveScreenshot(`base-form-field--${story}.png`, { timeout: 10_000 })
	})
}
