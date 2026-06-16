/**
 * E2E smoke-тест для BaseTree.
 * Проверяет ключевой пользовательский сценарий: раскрытие/сворачивание, выбор узлов.
 */

import { expect, test } from '@playwright/test'

test('дерево: отключённый узел не раскрывается', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-basetree--with-disabled')
	await page.waitForSelector('.base-tree', { timeout: 25000 })
	await page.setViewportSize({ width: 800, height: 400 })

	const nodes = page.locator('.base-tree__node')
	await expect(nodes.first()).toBeVisible()

	const rootArrow = nodes.first().locator('.base-tree__arrow')
	await rootArrow.click({ force: true })

	const disabledNode = page.locator('.base-tree__node--disabled')
	await expect(disabledNode).toBeVisible()

	const disabledArrow = disabledNode.locator('.base-tree__arrow')
	await disabledArrow.click({ force: true })
	await expect(disabledNode).not.toHaveClass(/--expanded/)
})

test('дерево: выбирает узел в режиме single', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-basetree--selection-modes')
	await page.waitForSelector('.base-tree', { timeout: 25000 })
	await page.setViewportSize({ width: 1200, height: 500 })

	const singleTree = page.locator('.base-tree').nth(1)
	const leafHeader = singleTree.locator('.base-tree__header').last()
	await leafHeader.click()

	const selectedNodes = singleTree.locator('.base-tree__node--selected')
	await expect(selectedNodes).toHaveCount(1)
})
