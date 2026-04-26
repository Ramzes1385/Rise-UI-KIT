/**
 * Visual regression тесты для BaseStepper.
 */

import { expect, test } from '@playwright/test'

const COMPONENT = 'basestepper'
const STORIES = ['default', 'horizontal', 'vertical', 'with-description', 'with-disabled', 'dark-theme']

for (const story of STORIES) {
	test(`BaseStepper — ${story}`, async ({ page }) => {
		await page.goto(`/iframe.html?id=${COMPONENT}--${story}&viewMode=story`)
		const root = page.locator('.base-stepper')
		await expect(root).toHaveScreenshot(`base-stepper--${story}.png`)
	})
}
