/**
 * Visual regression тесты для BaseFileUpload.
 * Скриншоты всех состояний через Playwright + Storybook.
 */

import { expect, test } from '@playwright/test'

const COMPONENT = 'basefileupload'
const STORIES = [
	'default',
	'multiple',
	'images-only',
	'disabled',
	'without-label',
	'with-max-size',
	'documents-only',
	'hover-state',
	'active-state',
	'focus-state',
	'interactive-states',
	'dark-theme',
]

for (const story of STORIES) {
	test(`BaseFileUpload — ${story}`, async ({ page }) => {
		await page.goto(`/iframe.html?id=${COMPONENT}--${story}&viewMode=story`)
		const root = page.locator('.base-file-upload')
		await expect(root).toHaveScreenshot(`base-file-upload--${story}.png`)
	})
}
