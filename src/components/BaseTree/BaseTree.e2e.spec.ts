/**
 * E2E smoke-тест для BaseTree.
 * Проверяет ключевой пользовательский сценарий: раскрытие/сворачивание, выбор узлов.
 */

import { expect, test } from '@playwright/test'

test('дерево: раскрывает и сворачивает узел по клику', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-basetree--default')
	await page.setViewportSize({ width: 800, height: 500 })

	// Кликаем на первый заголовок с детьми
	const firstHeader = page.locator('.base-tree__header').first()
	await firstHeader.click()

	// Проверяем, что узел раскрылся
	const firstNode = page.locator('.base-tree__node').first()
	await expect(firstNode).toHaveClass(/--expanded/)

	// Кликаем повторно — узел сворачивается
	await firstHeader.click()
	await expect(firstNode).not.toHaveClass(/--expanded/)
})

test('дерево: отключённый узел не раскрывается', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-basetree--with-disabled')
	await page.setViewportSize({ width: 800, height: 400 })

	// Находим отключённый узел
	const disabledNode = page.locator('.base-tree__node--disabled')
	await expect(disabledNode).toBeVisible()

	// Клик по отключённому заголовку не раскрывает узел
	const disabledHeader = disabledNode.locator('.base-tree__header')
	await disabledHeader.click({ force: true })
	await expect(disabledNode).not.toHaveClass(/--expanded/)
})

test('дерево: выбирает узел в режиме single', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-basetree--selection-modes')
	await page.setViewportSize({ width: 1200, height: 500 })

	// Находим второй сайдбар (single mode)
	const singleTree = page.locator('.base-tree').nth(1)
	const leafHeader = singleTree.locator('.base-tree__header').last()
	await leafHeader.click()

	// Проверяем, что узел выделился
	const selectedNodes = singleTree.locator('.base-tree__node--selected')
	await expect(selectedNodes).toHaveCount(1)
})
