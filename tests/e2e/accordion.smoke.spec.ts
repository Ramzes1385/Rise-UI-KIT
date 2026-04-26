/**
 * E2E smoke-тест для BaseAccordion.
 * Проверяет ключевой пользовательский сценарий: открытие/закрытие элементов.
 */

import { expect, test } from '@playwright/test'

test('аккордеон: открывает и закрывает элемент по клику', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-baseaccordion--default')
	await page.setViewportSize({ width: 800, height: 400 })

	// Кликаем на первый заголовок
	const firstHeader = page.locator('.base-accordion__header').first()
	await firstHeader.click()

	// Проверяем, что первый элемент открылся
	const firstItem = page.locator('.base-accordion__item').first()
	await expect(firstItem).toHaveClass(/--open/)

	// Кликаем повторно — элемент закрывается
	await firstHeader.click()
	await expect(firstItem).not.toHaveClass(/--open/)
})

test('аккордеон: отключённый элемент не открывается', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-baseaccordion--with-disabled-item')
	await page.setViewportSize({ width: 800, height: 400 })

	// Находим отключённый элемент
	const disabledItem = page.locator('.base-accordion__item--disabled')
	await expect(disabledItem).toBeVisible()

	// Клик по отключённому заголовку не открывает элемент
	const disabledHeader = disabledItem.locator('.base-accordion__header')
	await disabledHeader.click({ force: true })
	await expect(disabledItem).not.toHaveClass(/--open/)
})

test('аккордеон: режим multiple позволяет открыть несколько элементов', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-baseaccordion--multiple')
	await page.setViewportSize({ width: 800, height: 500 })

	const headers = page.locator('.base-accordion__header')

	// Открываем первые два элемента
	await headers.nth(0).click()
	await headers.nth(1).click()

	// Оба должны быть открыты
	const openItems = page.locator('.base-accordion__item--open')
	await expect(openItems).toHaveCount(2)
})
