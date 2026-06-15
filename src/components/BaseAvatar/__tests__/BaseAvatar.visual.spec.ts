/**
 * Visual regression тесты для BaseAvatar.
 */

import { expect, test } from '@playwright/test'

const COMPONENT = 'ui-baseavatar'
const STORIES = ['default', 'with-image', 'size-scale', 'dark-theme']

for (const story of STORIES) {
	test(`BaseAvatar — ${story}`, async ({ page }) => {
		await page.goto(`/iframe.html?id=${COMPONENT}--${story}&viewMode=story`)
		const root = page.locator('#storybook-root')
		await expect(root).toHaveScreenshot(`base-avatar--${story}.png`)
	})
}
