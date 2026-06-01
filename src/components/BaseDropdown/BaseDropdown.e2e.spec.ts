/**
 * E2E smoke-тест для BaseDropdown.
 * Проверяет: открытие → выбор → клик вне.
 */

import { expect, test } from '@playwright/test'

test('дропдаун: открывается по клику на триггер', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-basedropdown--default')
	await page.setViewportSize({ width: 800, height: 600 })

	// Кликаем по триггеру
	const trigger = page.locator('.base-dropdown__trigger')
	await trigger.click()

	// Панель должна быть видна
	const panel = page.locator('.base-dropdown__panel')
	await expect(panel).toBeVisible()
})

test('дропдаун: выбирает опцию и закрывается', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-basedropdown--interactive')
	await page.setViewportSize({ width: 800, height: 600 })

	// Открываем дропдаун
	const trigger = page.locator('.base-dropdown__trigger')
	await trigger.click()

	// Выбираем первый пункт
	const item = page.locator('.base-dropdown__item').first()
	await item.click()

	// Панель должна закрыться
	const panel = page.locator('.base-dropdown__panel')
	await expect(panel).not.toBeVisible()
})

test('дропдаун: закрывается при клике вне', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-basedropdown--default')
	await page.setViewportSize({ width: 800, height: 600 })

	// Открываем дропдаун
	const trigger = page.locator('.base-dropdown__trigger')
	await trigger.click()

	const panel = page.locator('.base-dropdown__panel')
	await expect(panel).toBeVisible()

	// Кликаем вне дропдауна
	await page.mouse.click(10, 10)

	// Панель должна закрыться
	await expect(panel).not.toBeVisible()
})

test('дропдаун: закрывается по Escape', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-basedropdown--default')
	await page.setViewportSize({ width: 800, height: 600 })

	// Открываем дропдаун
	const trigger = page.locator('.base-dropdown__trigger')
	await trigger.click()

	const panel = page.locator('.base-dropdown__panel')
	await expect(panel).toBeVisible()

	// Нажимаем Escape
	await page.keyboard.press('Escape')

	// Панель должна закрыться
	await expect(panel).not.toBeVisible()
})
