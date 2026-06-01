/**
 * Visual regression тесты для BaseTooltip.
 */

import { expect, test } from '@playwright/test'

const COMPONENT = 'ui-basetooltip'
const STORIES = ['default', 'always-visible']

for (const story of STORIES) {
	test(`BaseTooltip — ${story}`, async ({ page }) => {
		await page.goto(`/iframe.html?id=${COMPONENT}--${story}&viewMode=story`)
		const root = page.locator('.base-tooltip-wrapper')
		await expect(root).toHaveScreenshot(`base-tooltip--${story}.png`)
	})
}
