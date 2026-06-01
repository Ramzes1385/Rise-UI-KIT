/**
 * E2E smoke-тест для BaseDatePicker.
 * Проверяет ключевой сценарий: открытие панели, выбор даты, закрытие.
 */

import { expect, test } from '@playwright/test'

test('datepicker: открывает панель и выбирает дату', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-basedatepicker--default')
	await page.setViewportSize({ width: 800, height: 600 })

	// Кликаем по инпуту для открытия панели
	const input = page.locator('.base-date-picker__input')
	await input.click()

	// Панель должна появиться
	const panel = page.locator('.date-picker-panel')
	await expect(panel).toBeVisible()

	// Кликаем по доступной дате в календаре
	const dayCell = page.locator('.base-calendar__day:not(.base-calendar__day--disabled)').first()
	await dayCell.click()

	// Панель должна закрыться после выбора
	await expect(panel).not.toBeVisible()
})

test('datepicker: не открывает панель если isDisabled', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-basedatepicker--disabled')
	await page.setViewportSize({ width: 800, height: 400 })

	// Клик по отключённому инпуту
	const input = page.locator('.base-date-picker__input')
	await input.click({ force: true })

	// Панель не должна появиться
	const panel = page.locator('.date-picker-panel')
	await expect(panel).not.toBeVisible()
})
