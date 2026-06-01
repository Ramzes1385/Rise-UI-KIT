/**
 * E2E smoke-тест для BaseDatePicker.
 * Проверяет ключевой сценарий: открытие панели, выбор даты, закрытие.
 */

import { expect, test } from '@playwright/test'

test('datepicker: открывает панель и выбирает дату', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-basedatepicker--default')
	await page.waitForSelector('.date-picker-field', { timeout: 25000 })
	await page.setViewportSize({ width: 800, height: 600 })

	const input = page.locator('.date-picker-field')
	await input.click()

	const panel = page.locator('.date-picker-panel')
	await expect(panel).toBeVisible()

	const dayCell = page.locator('.base-calendar__day:not(.base-calendar__day--disabled)').first()
	await dayCell.click()

	await expect(panel).not.toBeVisible()
})

test('datepicker: не открывает панель если isDisabled', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-basedatepicker--disabled')
	await page.waitForSelector('.date-picker-field', { timeout: 25000 })
	await page.setViewportSize({ width: 800, height: 400 })

	const input = page.locator('.date-picker-field')
	await input.click({ force: true })

	const panel = page.locator('.date-picker-panel')
	await expect(panel).not.toBeVisible()
})
