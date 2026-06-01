/**
 * E2E smoke-тест для BaseAccordion.
 * Проверяет ключевой пользовательский сценарий: открытие/закрытие элементов.
 */

import { expect, test } from '@playwright/test'

test('аккордеон: открывает и закрывает элемент по клику', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-baseaccordion--default')
	await page.waitForSelector('.base-accordion', { timeout: 25000 })
	await page.setViewportSize({ width: 800, height: 400 })

	const firstItem = page.locator('.base-accordion__item').first()
	await expect(firstItem).toHaveClass(/--open/)

	const firstHeader = page.locator('.base-accordion__header').first()
	await firstHeader.click()
	await expect(firstItem).not.toHaveClass(/--open/)

	await firstHeader.click()
	await expect(firstItem).toHaveClass(/--open/)
})

test('аккордеон: отключённый элемент не открывается', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-baseaccordion--disabled')
	await page.waitForSelector('.base-accordion', { timeout: 25000 })
	await page.setViewportSize({ width: 800, height: 400 })

	const disabledItem = page.locator('.base-accordion__item--disabled')
	await expect(disabledItem).toBeVisible()

	const disabledHeader = disabledItem.locator('.base-accordion__header')
	await disabledHeader.click({ force: true })
	await expect(disabledItem).not.toHaveClass(/--open/)
})

test('аккордеон: режим multiple позволяет открыть несколько элементов', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-baseaccordion--multiple')
	await page.waitForSelector('.base-accordion', { timeout: 25000 })
	await page.setViewportSize({ width: 800, height: 500 })

	const headers = page.locator('.base-accordion__header')

	await expect(page.locator('.base-accordion__item--open')).toHaveCount(1)

	await headers.nth(1).click()
	await headers.nth(2).click()

	const openItems = page.locator('.base-accordion__item--open')
	await expect(openItems).toHaveCount(3)
})
