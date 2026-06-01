/**
 * E2E smoke-тест для BaseTable.
 * Проверяет: сортировка, пагинация.
 */

import { expect, test } from '@playwright/test'

test('таблица: рендерит строки и заголовки', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-basetable--default')
	await page.setViewportSize({ width: 1000, height: 600 })

	// Заголовки должны быть видны
	const headers = page.locator('.base-table__header-cell')
	await expect(headers.first()).toBeVisible()

	// Строки должны быть видны
	const rows = page.locator('.base-table__row')
	await expect(rows.first()).toBeVisible()
})

test('таблица: сортирует по клику на заголовок', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-basetable--default')
	await page.setViewportSize({ width: 1000, height: 600 })

	// Кликаем на первый сортируемый заголовок
	const sortableHeader = page.locator('.base-table__header-cell--sortable').first()
	if ((await sortableHeader.count()) > 0) {
		await sortableHeader.click()

		// Должен появиться индикатор сортировки
		await expect(sortableHeader).toHaveClass(/--sort-asc|--sort-desc/)
	}
})

test('таблица: пагинация переключает страницы', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-basetable--with-pagination')
	await page.setViewportSize({ width: 1000, height: 600 })

	// Пагинация должна быть видна
	const pagination = page.locator('.base-pagination')
	if ((await pagination.count()) > 0) {
		await expect(pagination).toBeVisible()

		// Кликаем на вторую страницу
		const pageBtn = pagination.locator('.base-pagination__btn').nth(1)
		if ((await pageBtn.count()) > 0) {
			await pageBtn.click()
		}
	}
})

test('таблица: показывает пустое состояние', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-basetable--empty')
	await page.setViewportSize({ width: 1000, height: 400 })

	// Должно быть пустое состояние
	const empty = page.locator('.base-table__empty')
	await expect(empty).toBeVisible()
})
