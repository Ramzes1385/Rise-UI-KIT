/**
 * Visual regression тесты для BaseStepper.
 */

import { expect, test } from '@playwright/test'

const COMPONENT = 'ui-basestepper'
const STORIES = ['default', 'vertical', 'disabled-step', 'dark-theme']

for (const story of STORIES) {
	test(`BaseStepper — ${story}`, async ({ page }) => {
		await page.goto(`/iframe.html?id=${COMPONENT}--${story}&viewMode=story`)
		const root = page.locator('#storybook-root')
		await expect(root).toHaveScreenshot(`base-stepper--${story}.png`)
	})
}
