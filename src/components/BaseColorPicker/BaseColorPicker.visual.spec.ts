/**
 * Visual Regression тесты для BaseColorPicker.
 * Снимают baseline-скриншоты swatch и состояний через Storybook.
 */

import { expect, test } from '@playwright/test'

/** Базовый путь к stories BaseColorPicker в Storybook */
const STORY_PATH = '/iframe.html?id=ui-basecolorpicker'

test.describe('BaseColorPicker visual regression', () => {
	test('Default: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--default`)
		await page.setViewportSize({ width: 400, height: 200 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-color-picker-default.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})

	test('Disabled: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--disabled`)
		await page.setViewportSize({ width: 400, height: 200 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-color-picker-disabled.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})

	test('DarkTheme: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--dark-theme`)
		await page.setViewportSize({ width: 400, height: 200 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-color-picker-dark.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})
})
