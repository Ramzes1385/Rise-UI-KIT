/**
 * Visual regression тесты для BaseAnimation.
 */

import { expect, test } from '@playwright/test'

const COMPONENT = 'ui-baseanimation'
const STORIES = ['default', 'modes', 'size-scale', 'dark-theme']

for (const story of STORIES) {
	test(`BaseAnimation — ${story}`, async ({ page }) => {
		await page.goto(`/iframe.html?id=${COMPONENT}--${story}&viewMode=story`)
		const root = page.locator('#storybook-root')
		await expect(root).toHaveScreenshot(`base-animation--${story}.png`)
	})
}
