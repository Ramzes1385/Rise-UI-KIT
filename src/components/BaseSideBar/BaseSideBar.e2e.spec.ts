/**
 * E2E smoke-тест для BaseSideBar.
 * Проверяет ключевые пользовательские сценарии: сворачивание/разворачивание,
 * несворачиваемый сайдбар, v-model, варианты отображения.
 */

import { expect, test } from '@playwright/test'

test('сайдбар: сворачивает и разворачивает по клику на кнопку', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-basesidebar--default')
	await page.waitForSelector('.base-sidebar', { timeout: 25000 })
	await page.setViewportSize({ width: 800, height: 600 })

	const sidebar = page.locator('.base-sidebar')
	const toggle = sidebar.locator('.base-sidebar__toggle')

	await toggle.click()
	await expect(sidebar).toHaveClass(/--collapsed/)

	await toggle.click()
	await expect(sidebar).not.toHaveClass(/--collapsed/)
})

test('сайдбар: несворачиваемый сайдбар не имеет кнопки', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-basesidebar--not-collapsible')
	await page.waitForSelector('.base-sidebar', { timeout: 25000 })
	await page.setViewportSize({ width: 800, height: 600 })

	const toggle = page.locator('.base-sidebar__toggle')
	await expect(toggle).not.toBeVisible()
})

test('сайдбар: v-model управляет состоянием', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-basesidebar--controlled-v-model')
	await page.waitForSelector('.base-sidebar', { timeout: 25000 })
	await page.setViewportSize({ width: 800, height: 600 })

	const checkbox = page.locator('input[type="checkbox"]')
	const sidebar = page.locator('.base-sidebar')

	await checkbox.check()
	await expect(sidebar).toHaveClass(/--collapsed/)

	await checkbox.uncheck()
	await expect(sidebar).not.toHaveClass(/--collapsed/)
})

test('сайдбар: свёрнутый сайдбар показывает collapsedContent', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-basesidebar--collapsed')
	await page.waitForSelector('.base-sidebar', { timeout: 25000 })
	await page.setViewportSize({ width: 400, height: 600 })

	const sidebar = page.locator('.base-sidebar')
	await expect(sidebar).toHaveClass(/--collapsed/)

	const collapsed = page.locator('.base-sidebar__collapsed')
	await expect(collapsed).toBeVisible()
})

test('сайдбар: вариант ghost не имеет границ', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-basesidebar--ghost-variant')
	await page.waitForSelector('.base-sidebar', { timeout: 25000 })
	await page.setViewportSize({ width: 800, height: 600 })

	const sidebar = page.locator('.base-sidebar')
	await expect(sidebar).toHaveClass(/--ghost/)
})

test('сайдбар: вариант shadow имеет тень', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-basesidebar--shadow-variant')
	await page.waitForSelector('.base-sidebar', { timeout: 25000 })
	await page.setViewportSize({ width: 800, height: 600 })

	const sidebar = page.locator('.base-sidebar')
	await expect(sidebar).toHaveClass(/--shadow/)
})

test('сайдбар: сайдбар без заголовка', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-basesidebar--no-title')
	await page.waitForSelector('.base-sidebar', { timeout: 25000 })
	await page.setViewportSize({ width: 800, height: 600 })

	const sidebar = page.locator('.base-sidebar')
	const toggle = sidebar.locator('.base-sidebar__toggle')
	await expect(toggle).toBeVisible()
})
