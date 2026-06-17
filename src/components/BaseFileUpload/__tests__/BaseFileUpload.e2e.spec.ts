/**
 * E2E smoke-тест для BaseFileUpload.
 * Проверяет: рендер, отключённое состояние.
 */

import { expect, test } from '@playwright/test'

test('загрузка файлов: рендерит зону загрузки', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-basefileupload--default')
	await page.waitForSelector('.base-file-upload', { timeout: 25000 })
	await page.setViewportSize({ width: 800, height: 400 })

	const upload = page.locator('.base-file-upload')
	await expect(upload).toBeVisible()
})

test('загрузка файлов: отключённая зона не принимает файлы', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-basefileupload--disabled')
	await page.waitForSelector('.base-file-upload', { timeout: 25000 })
	await page.setViewportSize({ width: 800, height: 400 })

	const upload = page.locator('.base-file-upload')
	await expect(upload).toHaveClass(/--disabled/)
})

test('загрузка файлов: множественная загрузка', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-basefileupload--multiple')
	await page.waitForSelector('.base-file-upload', { timeout: 25000 })
	await page.setViewportSize({ width: 800, height: 400 })

	const upload = page.locator('.base-file-upload')
	await expect(upload).toBeVisible()
})

test('загрузка файлов: только изображения', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-basefileupload--images-only')
	await page.waitForSelector('.base-file-upload', { timeout: 25000 })
	await page.setViewportSize({ width: 800, height: 400 })

	const upload = page.locator('.base-file-upload')
	await expect(upload).toBeVisible()
})
