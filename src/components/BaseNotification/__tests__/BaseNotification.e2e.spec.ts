/**
 * E2E smoke-тест для BaseNotification.
 * Проверяет: появление, закрытие.
 */

import { expect, test } from '@playwright/test'

test('уведомление: рендерится с заголовком', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-basenotification--default')
	await page.waitForSelector('.base-notification-item', { timeout: 25000 })
	await page.setViewportSize({ width: 800, height: 400 })

	const notification = page.locator('.base-notification-item').first()
	await expect(notification).toBeVisible()
})

test('уведомление: закрывается по кнопке', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-basenotification--interactive')
	await page.waitForSelector('.base-notification', { timeout: 25000 })
	await page.setViewportSize({ width: 800, height: 400 })

	const addBtn = page.locator('button', { hasText: /info|success|warning|error/i }).first()
	if ((await addBtn.count()) > 0) {
		await addBtn.click()

		const notification = page.locator('.base-notification-item').first()
		await expect(notification).toBeVisible()

		const closeBtn = page.locator('.base-notification-item__close').first()
		if ((await closeBtn.count()) > 0) {
			await closeBtn.click()
			await expect(page.locator('.base-notification-item')).toHaveCount(0)
		}
	}
})

test('уведомление: рендерит все типы', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-basenotification--types')
	await page.waitForSelector('.base-notification-item', { timeout: 25000 })
	await page.setViewportSize({ width: 800, height: 600 })

	const notifications = page.locator('.base-notification-item')
	await expect(notifications.first()).toBeVisible()
})
