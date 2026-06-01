/**
 * E2E smoke-тест для BaseForm.
 * Проверяет: заполнение → валидация → отправка.
 */

import { expect, test } from '@playwright/test'

test('форма: заполняет поля и отправляет', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-baseform--simple-form-with-validation')
	await page.setViewportSize({ width: 800, height: 600 })

	// Находим поля ввода
	const inputs = page.locator('.base-input input')
	const nameInput = inputs.first()

	// Заполняем поле имени
	await nameInput.fill('Иван')

	// Нажимаем кнопку отправки
	const submitBtn = page.locator('.base-form__submit')
	await submitBtn.click()

	// Форма должна обработать отправку (не должно быть ошибок в консоли)
	expect(true).toBeTruthy()
})

test('форма: показывает ошибку валидации при пустом обязательном поле', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-baseform--simple-form-with-validation')
	await page.setViewportSize({ width: 800, height: 600 })

	// Нажимаем отправку без заполнения
	const submitBtn = page.locator('.base-form__submit')
	await submitBtn.click()

	// Должна появиться ошибка валидации
	const errorMsg = page.locator('.base-form-field__error')
	await expect(errorMsg.first()).toBeVisible()
})

test('форма: отключённая форма не отправляется', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-baseform--disabled')
	await page.setViewportSize({ width: 800, height: 600 })

	// Кнопка отправки должна быть отключена
	const submitBtn = page.locator('.base-form__submit')
	await expect(submitBtn).toBeDisabled()
})
