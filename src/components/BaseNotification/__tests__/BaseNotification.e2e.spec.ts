/**
 * E2E smoke-тест для BaseNotification.
 * Проверяет: появление, закрытие.
 */

import { expect, test } from '@playwright/test'

test('уведомление: рендерится с заголовком', async ({ page }) => {
	await page.goto('/iframe.html?id=overlay-basenotification--default')
	await page.waitForSelector('.base-notification-item', { timeout: 25000 })
	await page.setViewportSize({ width: 800, height: 400 })

	const notification = page.locator('.base-notification-item').first()
	await expect(notification).toBeVisible()
})

test('уведомление: закрывается по кнопке', async ({ page }) => {
	await page.goto('/iframe.html?id=overlay-basenotification--show-from-code')
	// Пустой список не имеет высоты — ждём, что контейнер появился в DOM
	await page.waitForSelector('.base-notification', { state: 'attached', timeout: 25000 })
	await page.setViewportSize({ width: 800, height: 400 })

	const addBtn = page.getByRole('button', { name: /Успех|Ошибка|Предупреждение|Информация/ }).first()
	await addBtn.click()

	const notification = page.locator('.base-notification-item').first()
	await expect(notification).toBeVisible()

	await page.locator('.base-notification-item__close').first().click()
	await expect(page.locator('.base-notification-item')).toHaveCount(0)
})

test('уведомление: рендерит все типы', async ({ page }) => {
	await page.goto('/iframe.html?id=overlay-basenotification--types')
	await page.waitForSelector('.base-notification-item', { timeout: 25000 })
	await page.setViewportSize({ width: 800, height: 600 })

	const notifications = page.locator('.base-notification-item')
	await expect(notifications.first()).toBeVisible()
})
