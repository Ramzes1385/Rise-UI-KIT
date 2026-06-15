/**
 * Visual regression тесты для BaseBadge.
 */

import { expect, test } from '@playwright/test'

const COMPONENT = 'ui-basebadge'
const STORIES = ['default', 'dark-theme']

for (const story of STORIES) {
	test(`BaseBadge — ${story}`, async ({ page }) => {
		await page.goto(`/iframe.html?id=${COMPONENT}--${story}&viewMode=story`)
		const root = page.locator('#storybook-root')
		await expect(root).toHaveScreenshot(`base-badge--${story}.png`)
	})
}
