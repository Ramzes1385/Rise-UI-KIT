/**
 * Visual regression тесты для BaseSkeleton.
 */

import { expect, test } from '@playwright/test'

const COMPONENT = 'ui-baseskeleton'
const STORIES = ['default', 'text-sizes', 'shapes', 'no-animation', 'pulse', 'dark-theme']

for (const story of STORIES) {
	test(`BaseSkeleton — ${story}`, async ({ page }) => {
		await page.goto(`/iframe.html?id=${COMPONENT}--${story}&viewMode=story`)
		const root = page.locator('#storybook-root')
		await expect(root).toHaveScreenshot(`base-skeleton--${story}.png`)
	})
}
