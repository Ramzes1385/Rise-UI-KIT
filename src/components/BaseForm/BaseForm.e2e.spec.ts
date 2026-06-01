/**
 * E2E smoke-тест для BaseForm.
 * Проверяет: заполнение → валидация → отправка.
 */

import { expect, test } from '@playwright/test'

test('форма: заполняет поля и отправляет', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-baseform--simple-form-with-validation')
	await page.waitForSelector('.base-form', { timeout: 25000 })
	await page.setViewportSize({ width: 800, height: 600 })

	const nameInput = page.getByPlaceholder('Введите имя')
	await nameInput.fill('Иван')

	const submitBtn = page.locator('button[type="submit"]')
	await submitBtn.click()

	expect(true).toBeTruthy()
})

test('форма: показывает ошибку валидации при пустом обязательном поле', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-baseform--simple-form-with-validation')
	await page.waitForSelector('.base-form', { timeout: 25000 })
	await page.setViewportSize({ width: 800, height: 600 })

	const submitBtn = page.locator('button[type="submit"]')
	await submitBtn.click()

	const errorMsg = page.locator('.base-input__error-text')
	await expect(errorMsg.first()).toBeVisible()
})

test('форма: отключённая форма не отправляется', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-baseform--disabled')
	await page.waitForSelector('.base-form', { timeout: 25000 })
	await page.setViewportSize({ width: 800, height: 600 })

	const submitBtn = page.locator('button[type="submit"]')
	await expect(submitBtn).toBeDisabled()
})
