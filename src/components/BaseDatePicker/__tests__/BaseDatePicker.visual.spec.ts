/**
 * Visual Regression тесты для BaseDatePicker.
 * Снимают baseline-скриншоты ключевых состояний через Storybook.
 */

import { expect, test } from '@playwright/test'

/** Базовый путь к stories BaseDatePicker в Storybook */
const STORY_PATH = '/iframe.html?id=ui-basedatepicker'

test.describe('BaseDatePicker visual regression', () => {
	test('Default: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--default`)
		await page.setViewportSize({ width: 800, height: 200 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-datepicker-default.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})

	test('WithTime: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--with-time`)
		await page.setViewportSize({ width: 800, height: 200 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-datepicker-with-time.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})

	test('RangeSelection: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--range-selection`)
		await page.setViewportSize({ width: 800, height: 200 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-datepicker-range.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})
})
