/**
 * Visual Regression тесты для BaseAccordion.
 * Снимают baseline-скриншоты ключевых состояний через Storybook.
 */

import { test, expect } from '@playwright/test'

/** Базовый путь к stories BaseAccordion в Storybook */
const STORY_PATH = '/iframe.html?id=ui-baseaccordion'

test.describe('BaseAccordion visual regression', () => {
	test('Default: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--default`)
		await page.setViewportSize({ width: 800, height: 400 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-accordion-default.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})

	test('Multiple: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--multiple`)
		await page.setViewportSize({ width: 800, height: 500 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-accordion-multiple.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})

	test('WithDisabledItem: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--disabled`)
		await page.setViewportSize({ width: 800, height: 400 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-accordion-disabled.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})

	test('DarkTheme: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--dark-theme`)
		await page.setViewportSize({ width: 800, height: 400 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-accordion-dark.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})
})
