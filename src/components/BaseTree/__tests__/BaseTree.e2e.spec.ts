import { expect, test } from '@playwright/test'

test('дерево: отключённый узел не раскрывается', async ({ page }) => {
	await page.goto('/iframe.html?id=data-basetree--disabled')
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
	await page.goto('/iframe.html?id=data-basetree--selection-modes')
	await page.waitForSelector('.base-tree', { timeout: 25000 })
	await page.setViewportSize({ width: 1200, height: 500 })

	const singleTree = page.locator('.base-tree').nth(1)
	const leafHeader = singleTree.locator('.base-tree__header').last()
	await leafHeader.click()

	const selectedNodes = singleTree.locator('.base-tree__node--selected')
	await expect(selectedNodes).toHaveCount(1)
})

// Stories без play (Variants) или узлы, которых play не касается: play выполняется при открытии story
test('дерево: в порядке Tab один узел — выбранный, по дереву ходят стрелки, Tab переходит к следующему дереву', async ({ page }) => {
	await page.goto('/iframe.html?id=data-basetree--variants')
	await page.waitForSelector('.base-tree', { timeout: 25000 })
	const [first, second] = [page.getByRole('tree').nth(0), page.getByRole('tree').nth(1)]

	await page.keyboard.press('Tab')
	await expect(first.getByRole('treeitem', { name: 'UserCard.vue' })).toBeFocused()
	await page.keyboard.press('ArrowUp')
	await expect(first.getByRole('treeitem', { name: 'AppHeader.vue' })).toBeFocused()
	await page.keyboard.press('Home')
	await expect(first.getByRole('treeitem', { name: 'src' })).toBeFocused()
	await page.keyboard.press('End')
	await expect(first.getByRole('treeitem', { name: 'README.md' })).toBeFocused()

	// Остальные узлы вне порядка Tab: Tab — к следующему дереву, Shift+Tab — обратно на последний узел
	await page.keyboard.press('Tab')
	await expect(second.getByRole('treeitem', { name: 'UserCard.vue' })).toBeFocused()
	await page.keyboard.press('Shift+Tab')
	await expect(first.getByRole('treeitem', { name: 'README.md' })).toBeFocused()
})

test('дерево: флажок в режиме multiple — клик по нему отмечает узел, в порядок Tab он не входит', async ({ page }) => {
	await page.goto('/iframe.html?id=data-basetree--selection-modes')
	await page.waitForSelector('.base-tree', { timeout: 25000 })
	await page.setViewportSize({ width: 1200, height: 600 })

	const multipleTree = page.locator('.base-tree').nth(2)
	const packageItem = multipleTree.getByRole('treeitem', { name: 'package.json' })
	await expect(packageItem).toHaveAttribute('aria-checked', 'false')

	// Настоящий клик мышью в точку флажка: флажок inert, клик получает строка узла
	const box = await packageItem.locator('.base-tree__checkbox').boundingBox()
	if (!box) throw new Error('Флажок узла package.json не отрисован')
	await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)

	await expect(packageItem).toHaveAttribute('aria-checked', 'true')
	await expect(packageItem).toBeFocused()
	await page.keyboard.press('Tab')
	await expect(multipleTree.locator(':focus')).toHaveCount(0)
})
