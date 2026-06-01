/**
 * Visual Regression тесты для BaseChip.
 * Снимают baseline-скриншоты ключевых состояний через Storybook.
 */

import { expect, test } from '@playwright/test'

/** Базовый путь к stories BaseChip в Storybook */
const STORY_PATH = '/iframe.html?id=ui-basechip'

test.describe('BaseChip visual regression', () => {
	test('Default: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--default`)
		await page.setViewportSize({ width: 800, height: 200 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-chip-default.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})

	test('Variants: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--variants`)
		await page.setViewportSize({ width: 800, height: 200 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-chip-variants.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})

	test('DarkTheme: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--dark-theme`)
		await page.setViewportSize({ width: 800, height: 200 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-chip-dark.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})
})
