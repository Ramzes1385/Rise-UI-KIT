import { expect, test } from '@playwright/test'

test('форма: заполняет поля и отправляет', async ({ page }) => {
	await page.goto('/iframe.html?id=form-baseform--validation')
	await page.waitForSelector('.base-form', { timeout: 25000 })
	await page.setViewportSize({ width: 800, height: 600 })

	await page.getByPlaceholder('Введите имя').fill('Иван')
	const submitBtn = page.locator('button[type="submit"]')
	await submitBtn.click()

	await expect(page.getByText('Введите email, например name@example.com')).toBeVisible()
	await expect(page.getByText('Введите имя', { exact: true })).toHaveCount(0)
	await expect(page.getByRole('status')).toHaveCount(0)

	await page.getByPlaceholder('name@example.com').fill('ivan@example.com')
	await submitBtn.click()

	await expect(page.getByRole('status')).toHaveText('Заявка отправлена')
	await expect(page.locator('.base-input__error-text')).toHaveCount(0)
	await expect(page.getByPlaceholder('Введите имя')).toHaveValue('Иван')
})

test('форма: показывает ошибку валидации при пустом обязательном поле', async ({ page }) => {
	await page.goto('/iframe.html?id=form-baseform--validation')
	await page.waitForSelector('.base-form', { timeout: 25000 })
	await page.setViewportSize({ width: 800, height: 600 })

	const submitBtn = page.locator('button[type="submit"]')
	await submitBtn.click()

	const errorMsg = page.locator('.base-input__error-text')
	await expect(errorMsg.first()).toBeVisible()
})

test('форма: отключённая форма не отправляется', async ({ page }) => {
	await page.goto('/iframe.html?id=form-baseform--disabled')
	await page.waitForSelector('.base-form', { timeout: 25000 })
	await page.setViewportSize({ width: 800, height: 600 })

	const submitBtn = page.locator('button[type="submit"]')
	await expect(submitBtn).toBeDisabled()
})
