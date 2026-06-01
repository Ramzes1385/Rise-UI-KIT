/**
 * Visual Regression тесты для BaseChat.
 * Снимают baseline-скриншоты ключевых состояний через Storybook.
 */

import { expect, test } from '@playwright/test'

/** Базовый путь к stories BaseChat в Storybook */
const STORY_PATH = '/iframe.html?id=ui-basechat'

test.describe('BaseChat visual regression', () => {
	test('Default: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--default`)
		await page.setViewportSize({ width: 800, height: 700 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-chat--default.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})

	test('DarkTheme: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--dark-theme`)
		await page.setViewportSize({ width: 800, height: 700 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-chat--dark-theme.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})

	test('Support: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--support`)
		await page.setViewportSize({ width: 800, height: 700 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-chat--support.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})
})
