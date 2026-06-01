/**
 * E2E smoke-тест для BaseSelect.
 * Проверяет: открытие/закрытие дропдауна, выбор опции.
 */

import { expect, test } from '@playwright/test'

test('селект: открывает дропдаун и выбирает опцию', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-baseselect--default')
	await page.setViewportSize({ width: 800, height: 600 })

	// Кликаем по триггеру селекта
	const trigger = page.locator('.base-select__trigger')
	await trigger.click()

	// Дропдаун открыт
	const dropdown = page.locator('.base-select__dropdown')
	await expect(dropdown).toBeVisible()

	// Выбираем первую опцию
	const option = dropdown.locator('.base-select__option').first()
	await option.click()

	// Дропдаун закрылся
	await expect(dropdown).not.toBeVisible()
})

test('селект: закрывается по Escape', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-baseselect--default')
	await page.setViewportSize({ width: 800, height: 600 })

	// Открываем дропдаун
	const trigger = page.locator('.base-select__trigger')
	await trigger.click()

	const dropdown = page.locator('.base-select__dropdown')
	await expect(dropdown).toBeVisible()

	// Нажимаем Escape
	await page.keyboard.press('Escape')

	// Дропдаун закрылся
	await expect(dropdown).not.toBeVisible()
})

test('селект: не открывается если disabled', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-baseselect--disabled')
	await page.setViewportSize({ width: 800, height: 400 })

	// Клик по отключённому селекту
	const trigger = page.locator('.base-select__trigger')
	await trigger.click({ force: true })

	// Дропдаун не появился
	const dropdown = page.locator('.base-select__dropdown')
	await expect(dropdown).not.toBeVisible()
})
