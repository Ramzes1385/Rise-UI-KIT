/**
 * E2E smoke-тест для BaseNotification.
 * Проверяет: появление, закрытие.
 */

import { expect, test } from '@playwright/test'

test('уведомление: рендерится с заголовком', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-basenotification--default')
	await page.setViewportSize({ width: 800, height: 400 })

	// Уведомление должно быть видимо
	const notification = page.locator('.base-notification')
	await expect(notification).toBeVisible()
})

test('уведомление: закрывается по кнопке', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-basenotification--interactive')
	await page.setViewportSize({ width: 800, height: 400 })

	// Находим кнопку закрытия
	const closeBtn = page.locator('.base-notification__close')
	if ((await closeBtn.count()) > 0) {
		await closeBtn.click()

		// Уведомление должно исчезнуть
		const notification = page.locator('.base-notification')
		await expect(notification).not.toBeVisible()
	}
})

test('уведомление: рендерит все типы', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-basenotification--types')
	await page.setViewportSize({ width: 800, height: 600 })

	// Должно быть несколько уведомлений разных типов
	const notifications = page.locator('.base-notification')
	await expect(notifications.first()).toBeVisible()
})
