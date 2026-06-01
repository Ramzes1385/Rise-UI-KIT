/**
 * Visual regression тесты для BaseSeparator.
 */

import { expect, test } from '@playwright/test'

const COMPONENT = 'ui-baseseparator'
const STORIES = ['default', 'with-label', 'with-slot', 'dashed', 'dark-theme']

for (const story of STORIES) {
	test(`BaseSeparator — ${story}`, async ({ page }) => {
		await page.goto(`/iframe.html?id=${COMPONENT}--${story}&viewMode=story`)
		const root = page.locator('#storybook-root')
		await expect(root).toHaveScreenshot(`base-separator--${story}.png`)
	})
}
