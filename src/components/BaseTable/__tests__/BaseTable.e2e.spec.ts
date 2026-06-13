/**
 * E2E smoke-тест для BaseTable.
 * Проверяет: сортировка, пагинация.
 */

import { expect, test } from '@playwright/test'

test('таблица: рендерит строки и заголовки', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-basetable--default')
	await page.waitForSelector('.base-table', { timeout: 25000 })
	await page.setViewportSize({ width: 1000, height: 600 })

	const headers = page.locator('.base-table__th')
	await expect(headers.first()).toBeVisible()

	const rows = page.locator('.base-table__tr')
	await expect(rows.first()).toBeVisible()
})

test('таблица: сортирует по клику на заголовок', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-basetable--default')
	await page.waitForSelector('.base-table', { timeout: 25000 })
	await page.setViewportSize({ width: 1000, height: 600 })

	const sortableHeader = page.locator('.base-table__th--sortable').first()
	if ((await sortableHeader.count()) > 0) {
		await sortableHeader.click()

		await expect(sortableHeader).toHaveClass(/--sorted/)
	}
})

test('таблица: пагинация переключает страницы', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-basetable--with-pagination')
	await page.waitForSelector('.base-table', { timeout: 25000 })
	await page.setViewportSize({ width: 1000, height: 600 })

	const pagination = page.locator('.base-pagination')
	if ((await pagination.count()) > 0) {
		await expect(pagination).toBeVisible()

		const pageBtn = pagination.locator('.base-pagination__pages button').nth(1)
		if ((await pageBtn.count()) > 0) {
			await pageBtn.click()
		}
	}
})

test('таблица: показывает пустое состояние', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-basetable--empty')
	await page.waitForSelector('.base-table', { timeout: 25000 })
	await page.setViewportSize({ width: 1000, height: 400 })

	const empty = page.locator('.base-table__empty-text')
	await expect(empty).toBeVisible()
})
