/**
 * Visual regression тесты для BaseRating.
 */

import { expect, test } from '@playwright/test'

const COMPONENT = 'ui-baserating'
const STORIES = [
	'default',
	'variants',
	'size-scale',
	'readonly',
	'custom-icons',
	'fractional-readonly',
	'half-step',
	'smooth-hover',
	'dark-theme',
]

for (const story of STORIES) {
	test(`BaseRating — ${story}`, async ({ page }) => {
		await page.goto(`/iframe.html?id=${COMPONENT}--${story}&viewMode=story`)
		const root = page.locator('#storybook-root')
		await expect(root).toHaveScreenshot(`base-rating--${story}.png`)
	})
}
