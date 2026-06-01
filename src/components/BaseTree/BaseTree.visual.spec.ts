/**
 * Visual Regression тесты для BaseTree.
 * Снимают baseline-скриншоты ключевых состояний через Storybook.
 */

import { expect, test } from '@playwright/test'

/** Базовый путь к stories BaseTree в Storybook */
const STORY_PATH = '/iframe.html?id=ui-basetree'

test.describe('BaseTree visual regression', () => {
	test('Default: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--default`)
		await page.setViewportSize({ width: 800, height: 500 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-tree-default.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})

	test('Variants: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--variants`)
		await page.setViewportSize({ width: 1200, height: 500 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-tree-variants.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})

	test('SelectionModes: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--selection-modes`)
		await page.setViewportSize({ width: 1200, height: 500 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-tree-selection-modes.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})

	test('WithDisabled: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--with-disabled`)
		await page.setViewportSize({ width: 800, height: 400 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-tree-disabled.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})

	test('DefaultExpandAll: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--default-expand-all`)
		await page.setViewportSize({ width: 800, height: 500 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-tree-expand-all.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})

	test('SizeScale: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--size-scale`)
		await page.setViewportSize({ width: 1200, height: 500 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-tree-size-scale.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})

	test('DarkTheme: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--dark-theme`)
		await page.setViewportSize({ width: 800, height: 500 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-tree-dark.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})
})
