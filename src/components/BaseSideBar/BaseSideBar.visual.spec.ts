/**
 * Visual Regression тесты для BaseSideBar.
 * Снимают baseline-скриншоты ключевых состояний через Storybook.
 */

import { expect, test } from '@playwright/test'

/** Базовый путь к stories BaseSideBar в Storybook */
const STORY_PATH = '/iframe.html?id=ui-basesidebar'

test.describe('BaseSideBar visual regression', () => {
	test('Default: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--default`)
		await page.setViewportSize({ width: 800, height: 600 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-sidebar-default.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})

	test('Variants: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--variants`)
		await page.setViewportSize({ width: 1200, height: 500 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-sidebar-variants.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})

	test('Collapsed: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--collapsed`)
		await page.setViewportSize({ width: 400, height: 600 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-sidebar-collapsed.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})

	test('SizeScale: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--size-scale-variants`)
		await page.setViewportSize({ width: 1200, height: 500 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-sidebar-size-scale.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})

	test('DarkTheme: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--dark-theme`)
		await page.setViewportSize({ width: 800, height: 600 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-sidebar-dark.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})

	test('GhostVariant: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--ghost-variant`)
		await page.setViewportSize({ width: 800, height: 600 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-sidebar-ghost.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})

	test('ShadowVariant: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--shadow-variant`)
		await page.setViewportSize({ width: 800, height: 600 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-sidebar-shadow.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})

	test('SoftVariant: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--soft-variant`)
		await page.setViewportSize({ width: 800, height: 600 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-sidebar-soft.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})

	test('OutlineVariant: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--outline-variant`)
		await page.setViewportSize({ width: 800, height: 600 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-sidebar-outline.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})

	test('WithSlots: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--with-slots`)
		await page.setViewportSize({ width: 800, height: 600 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-sidebar-with-slots.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})

	test('NotCollapsible: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--not-collapsible`)
		await page.setViewportSize({ width: 800, height: 600 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-sidebar-not-collapsible.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})

	test('WithFooter: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--with-footer`)
		await page.setViewportSize({ width: 800, height: 600 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-sidebar-with-footer.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})

	test('NoTitle: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--no-title`)
		await page.setViewportSize({ width: 800, height: 600 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-sidebar-no-title.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})

	test('CollapsedVariants: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--collapsed-variants`)
		await page.setViewportSize({ width: 1200, height: 500 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-sidebar-collapsed-variants.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})

	test('DarkThemeCollapsed: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--dark-theme-collapsed`)
		await page.setViewportSize({ width: 400, height: 600 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-sidebar-dark-collapsed.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})

	test('WithBodyContent: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--with-body-content`)
		await page.setViewportSize({ width: 800, height: 600 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-sidebar-with-body.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})
})
