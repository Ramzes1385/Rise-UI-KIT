/**
 * Visual Regression тесты для BaseSelect.
 * Снимают baseline-скриншоты ключевых состояний через Storybook.
 */

import { expect, test } from '@playwright/test'

/** Базовый путь к stories BaseSelect в Storybook */
const STORY_PATH = '/iframe.html?id=ui-baseselect'

test.describe('BaseSelect visual regression', () => {
	test('Default: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--default`)
		await page.setViewportSize({ width: 800, height: 200 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-select-default.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})

	test('Variants: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--variants`)
		await page.setViewportSize({ width: 800, height: 400 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-select-variants.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})

	test('WithError: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--with-error`)
		await page.setViewportSize({ width: 800, height: 200 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-select-error.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})

	test('Disabled: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--disabled`)
		await page.setViewportSize({ width: 800, height: 200 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-select-disabled.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})

	test('DarkTheme: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--dark-theme`)
		await page.setViewportSize({ width: 800, height: 200 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-select-dark.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})
})
