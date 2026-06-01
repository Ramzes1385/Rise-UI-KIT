/**
 * Visual Regression тесты для BaseLoader.
 * Снимают baseline-скриншоты ключевых состояний через Storybook.
 */

import { expect, test } from '@playwright/test'

/** Базовый путь к stories BaseLoader в Storybook */
const STORY_PATH = '/iframe.html?id=ui-baseloader'

test.describe('BaseLoader visual regression', () => {
	test('Default: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--default`)
		await page.setViewportSize({ width: 800, height: 200 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-loader-default.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})

	test('Variants: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--variants`)
		await page.setViewportSize({ width: 800, height: 400 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-loader-variants.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})

	test('DarkTheme: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--dark-theme`)
		await page.setViewportSize({ width: 800, height: 200 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-loader-dark.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})
})
