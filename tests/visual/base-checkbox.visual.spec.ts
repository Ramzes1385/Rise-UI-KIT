/**
 * Visual Regression тесты для BaseCheckbox.
 * Снимают baseline-скриншоты ключевых состояний через Storybook.
 */

import { expect, test } from '@playwright/test'

/** Базовый путь к stories BaseCheckbox в Storybook */
const STORY_PATH = '/iframe.html?id=ui-basecheckbox'

test.describe('BaseCheckbox visual regression', () => {
	test('Default: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--default`)
		await page.setViewportSize({ width: 800, height: 200 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-checkbox-default.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})

	test('Checked: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--checked`)
		await page.setViewportSize({ width: 800, height: 200 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-checkbox-checked.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})

	test('Disabled: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--disabled`)
		await page.setViewportSize({ width: 800, height: 200 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-checkbox-disabled.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})

	test('WithError: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--with-error`)
		await page.setViewportSize({ width: 800, height: 200 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-checkbox-error.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})

	test('InteractiveStates: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--interactive-states`)
		await page.setViewportSize({ width: 800, height: 400 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-checkbox-interactive-states.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})

	test('SizeScale: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--size-scale`)
		await page.setViewportSize({ width: 800, height: 400 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-checkbox-size-scale.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})

	test('DarkTheme: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--dark-theme`)
		await page.setViewportSize({ width: 800, height: 300 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-checkbox-dark.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})
})
