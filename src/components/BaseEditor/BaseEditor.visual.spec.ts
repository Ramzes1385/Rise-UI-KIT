/**
 * Visual regression тесты для BaseEditor.
 */

import { expect, test } from '@playwright/test'

const COMPONENT = 'ui-baseeditor'
const STORIES = ['default', 'readonly', 'dark-theme']

for (const story of STORIES) {
	test(`BaseEditor — ${story}`, async ({ page }) => {
		await page.goto(`/iframe.html?id=${COMPONENT}--${story}&viewMode=story`)
		const root = page.locator('.base-editor')
		await expect(root).toHaveScreenshot(`base-editor--${story}.png`)
	})
}
