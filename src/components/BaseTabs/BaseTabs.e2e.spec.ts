/**
 * E2E smoke-тест для BaseTabs.
 * Проверяет: переключение → disabled вкладка.
 */

import { expect, test } from '@playwright/test'

test('табы: переключают активную вкладку по клику', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-basetabs--underline')
	await page.setViewportSize({ width: 800, height: 400 })

	// Находим все табы
	const tabs = page.locator('.base-tabs__tab')
	const firstTab = tabs.first()
	const secondTab = tabs.nth(1)

	// Кликаем на второй таб
	await secondTab.click()

	// Второй таб должен стать активным
	await expect(secondTab).toHaveClass(/--active/)
	// Первый — неактивным
	await expect(firstTab).not.toHaveClass(/--active/)
})

test('табы: отключённая вкладка не переключается', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-basetabs--with-disabled')
	await page.setViewportSize({ width: 800, height: 400 })

	// Находим отключённый таб
	const disabledTab = page.locator('.base-tabs__tab--disabled')
	await expect(disabledTab).toBeVisible()

	// Клик по отключённому табу
	await disabledTab.click({ force: true })

	// Отключённый таб не должен стать активным
	await expect(disabledTab).not.toHaveClass(/--active/)
})

test('табы: вариант pills рендерится корректно', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-basetabs--pills')
	await page.setViewportSize({ width: 800, height: 400 })

	// Табы должны быть видны
	const tabs = page.locator('.base-tabs__tab')
	await expect(tabs.first()).toBeVisible()

	// Переключение работает
	await tabs.nth(1).click()
	await expect(tabs.nth(1)).toHaveClass(/--active/)
})

test('табы: перетаскивание мышью прокручивает список', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-basetabs--scroll-buttons')
	await page.setViewportSize({ width: 800, height: 400 })

	const list = page.locator('.base-tabs__list')
	await expect(list).toBeVisible()

	const startScroll = await list.evaluate(el => el.scrollLeft)

	const box = await list.boundingBox()
	if (!box) throw new Error('list bounding box недоступен')

	const startX = box.x + box.width * 0.8
	const endX = box.x + box.width * 0.2
	const y = box.y + box.height / 2

	await page.mouse.move(startX, y)
	await page.mouse.down()
	await page.mouse.move(endX, y, { steps: 10 })
	await page.mouse.up()

	const endScroll = await list.evaluate(el => el.scrollLeft)
	expect(endScroll).toBeGreaterThan(startScroll)
})

test('табы: перетаскивание не переключает активную вкладку', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-basetabs--scroll-buttons')
	await page.setViewportSize({ width: 800, height: 400 })

	const tabs = page.locator('.base-tabs__tab')
	const firstTab = tabs.first()
	await expect(firstTab).toHaveClass(/--active/)

	const box = await firstTab.boundingBox()
	if (!box) throw new Error('tab bounding box недоступен')

	const y = box.y + box.height / 2
	await page.mouse.move(box.x + box.width / 2, y)
	await page.mouse.down()
	await page.mouse.move(box.x - box.width, y, { steps: 10 })
	await page.mouse.up()

	// После drag активная вкладка не должна смениться
	await expect(firstTab).toHaveClass(/--active/)
})
