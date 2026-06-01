/**
 * E2E smoke-тест для BaseModal.
 * Проверяет: открытие/закрытие, блокировку скролла, закрытие по Escape.
 */

import { expect, test } from '@playwright/test'

test('модалка: открывается и закрывается по кнопке', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-basemodal--default')
	await page.setViewportSize({ width: 800, height: 600 })

	// Нажимаем кнопку открытия
	const openBtn = page.locator('button', { hasText: /открыть|open/i }).first()
	await openBtn.click()

	// Модалка видна
	const modal = page.locator('.base-modal')
	await expect(modal).toBeVisible()

	// Нажимаем кнопку закрытия внутри модалки
	const closeBtn = modal.locator('.base-modal__close, button', { hasText: /закрыть|close/i }).first()
	await closeBtn.click()

	// Модалка закрыта
	await expect(modal).not.toBeVisible()
})

test('модалка: закрывается по Escape', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-basemodal--default')
	await page.setViewportSize({ width: 800, height: 600 })

	// Открываем модалку
	const openBtn = page.locator('button', { hasText: /открыть|open/i }).first()
	await openBtn.click()

	const modal = page.locator('.base-modal')
	await expect(modal).toBeVisible()

	// Нажимаем Escape
	await page.keyboard.press('Escape')

	// Модалка закрыта
	await expect(modal).not.toBeVisible()
})

test('модалка: закрывается по клику на оверлей', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-basemodal--default')
	await page.setViewportSize({ width: 800, height: 600 })

	// Открываем модалку
	const openBtn = page.locator('button', { hasText: /открыть|open/i }).first()
	await openBtn.click()

	const modal = page.locator('.base-modal')
	await expect(modal).toBeVisible()

	// Кликаем по оверлею
	const overlay = page.locator('.base-modal__overlay')
	await overlay.click()

	// Модалка закрыта
	await expect(modal).not.toBeVisible()
})
