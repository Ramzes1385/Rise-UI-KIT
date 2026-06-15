/**
 * Visual Regression тесты для BaseCalendar.
 * Снимают baseline-скриншоты ключевых состояний через Storybook.
 */

import { expect, test } from '@playwright/test'

/** Базовый путь к stories BaseCalendar в Storybook */
const STORY_PATH = '/iframe.html?id=ui-basecalendar'

test.describe('BaseCalendar visual regression', () => {
	test('Default: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--default`)
		await page.setViewportSize({ width: 800, height: 600 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-calendar-default.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})

	test('RangeSelection: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--range-selection`)
		await page.setViewportSize({ width: 800, height: 600 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-calendar-range.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})

	test('MultipleSelection: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--multiple-selection`)
		await page.setViewportSize({ width: 800, height: 600 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-calendar-multiple.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})

	test('DarkTheme: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--dark-theme`)
		await page.setViewportSize({ width: 800, height: 600 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-calendar-dark.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})
})
