/**
 * E2E smoke-тест для BaseDropdown.
 * Проверяет: открытие → выбор → клик вне.
 */

import { expect, test } from '@playwright/test'

test('дропдаун: открывается по клику на триггер', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-basedropdown--default')
	await page.waitForSelector('[data-testid="trigger"]', { timeout: 25000 })
	await page.setViewportSize({ width: 800, height: 600 })

	const trigger = page.getByTestId('trigger')
	await trigger.click()

	const panel = page.locator('.base-dropdown__panel')
	await expect(panel).toBeVisible()
})

test('дропдаун: закрывается при выборе опции', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-basedropdown--default')
	await page.waitForSelector('[data-testid="trigger"]', { timeout: 25000 })
	await page.setViewportSize({ width: 800, height: 600 })

	const trigger = page.getByTestId('trigger')
	await trigger.click()

	const panel = page.locator('.base-dropdown__panel')
	await expect(panel).toBeVisible()

	const item = panel.getByTestId('panel').locator('div').first()
	await item.click()

	await expect(panel).not.toBeVisible()
})

test('дропдаун: закрывается при клике вне', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-basedropdown--default')
	await page.waitForSelector('[data-testid="trigger"]', { timeout: 25000 })
	await page.setViewportSize({ width: 800, height: 600 })

	const trigger = page.getByTestId('trigger')
	await trigger.click()

	const panel = page.locator('.base-dropdown__panel')
	await expect(panel).toBeVisible()

	await page.mouse.click(10, 10)

	await expect(panel).not.toBeVisible()
})

test('дропдаун: закрывается по Escape', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-basedropdown--default')
	await page.waitForSelector('[data-testid="trigger"]', { timeout: 25000 })
	await page.setViewportSize({ width: 800, height: 600 })

	const trigger = page.getByTestId('trigger')
	await trigger.click()

	const panel = page.locator('.base-dropdown__panel')
	await expect(panel).toBeVisible()

	await page.keyboard.press('Escape')

	await expect(panel).not.toBeVisible()
})
