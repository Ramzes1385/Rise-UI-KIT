/**
 * Visual Regression тесты для BaseInput.
 * Снимают baseline-скриншоты ключевых состояний через Storybook.
 */

import { expect, test } from '@playwright/test'

/** Базовый путь к stories BaseInput в Storybook */
const STORY_PATH = '/iframe.html?id=ui-baseinput'

test.describe('BaseInput visual regression', () => {
	test('Default: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--default`)
		await page.setViewportSize({ width: 800, height: 200 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-input-default.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})

	test('Variants: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--variants`)
		await page.setViewportSize({ width: 800, height: 400 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-input-variants.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})

	test('Sizes: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--size-scale`)
		await page.setViewportSize({ width: 800, height: 400 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-input-sizes.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})

	test('WithError: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--with-error`)
		await page.setViewportSize({ width: 800, height: 200 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-input-error.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})

	test('Disabled: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--disabled`)
		await page.setViewportSize({ width: 800, height: 200 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-input-disabled.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})

	test('SizeScale: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--size-scale`)
		await page.setViewportSize({ width: 800, height: 500 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-input-size-scale.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})

	test('DarkTheme: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--dark-theme`)
		await page.setViewportSize({ width: 800, height: 400 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-input-dark.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})
})
