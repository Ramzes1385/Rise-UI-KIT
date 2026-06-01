/**
 * E2E smoke-тест для BaseSelect.
 * Проверяет: открытие/закрытие дропдауна, выбор опции.
 */

import { expect, test } from '@playwright/test'

test('селект: открывает дропдаун и выбирает опцию', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-baseselect--default')
	await page.waitForSelector('.base-select', { timeout: 25000 })
	await page.setViewportSize({ width: 800, height: 600 })

	const trigger = page.locator('.base-select__trigger')
	await trigger.click()

	const dropdown = page.locator('.base-select__dropdown-content')
	await expect(dropdown).toBeVisible()

	const option = dropdown.locator('.base-select__option').first()
	await option.click()

	await expect(dropdown).not.toBeVisible()
})

test('селект: закрывается по Escape', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-baseselect--default')
	await page.waitForSelector('.base-select', { timeout: 25000 })
	await page.setViewportSize({ width: 800, height: 600 })

	const trigger = page.locator('.base-select__trigger')
	await trigger.click()

	const dropdown = page.locator('.base-select__dropdown-content')
	await expect(dropdown).toBeVisible()

	await page.keyboard.press('Escape')

	await expect(dropdown).not.toBeVisible()
})

test('селект: не открывается если disabled', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-baseselect--disabled')
	await page.waitForSelector('.base-select', { timeout: 25000 })
	await page.setViewportSize({ width: 800, height: 400 })

	const trigger = page.locator('.base-select__trigger')
	await trigger.click({ force: true })

	const dropdown = page.locator('.base-select__dropdown-content')
	await expect(dropdown).not.toBeVisible()
})
