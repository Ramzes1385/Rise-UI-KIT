import { expect, test } from '@playwright/test'

test('модалка: открывается и закрывается по кнопке', async ({ page }) => {
	await page.goto('/iframe.html?id=overlay-basemodal--default')
	await page.waitForSelector('.base-button', { timeout: 25000 })
	await page.setViewportSize({ width: 800, height: 600 })

	const openBtn = page.locator('button', { hasText: /открыть|open/i }).first()
	await openBtn.click()

	const modal = page.locator('.base-modal')
	await expect(modal).toBeVisible()

	const closeBtn = modal.locator('.base-modal__close')
	await closeBtn.click()

	await expect(modal).not.toBeVisible()
})

test('модалка: закрывается по Escape', async ({ page }) => {
	await page.goto('/iframe.html?id=overlay-basemodal--default')
	await page.waitForSelector('.base-button', { timeout: 25000 })
	await page.setViewportSize({ width: 800, height: 600 })

	const openBtn = page.locator('button', { hasText: /открыть|open/i }).first()
	await openBtn.click()

	const modal = page.locator('.base-modal')
	await expect(modal).toBeVisible()

	await page.keyboard.press('Escape')

	await expect(modal).not.toBeVisible()
})

test('модалка: закрывается по клику на оверлей', async ({ page }) => {
	await page.goto('/iframe.html?id=overlay-basemodal--default')
	await page.waitForSelector('.base-button', { timeout: 25000 })
	await page.setViewportSize({ width: 800, height: 600 })

	const openBtn = page.locator('button', { hasText: /открыть|open/i }).first()
	await openBtn.click()

	const modal = page.locator('.base-modal')
	await expect(modal).toBeVisible()

	const contentBox = await modal.locator('.base-modal__content').boundingBox()
	const offsetX = contentBox ? contentBox.x - 5 : 5
	const offsetY = contentBox ? contentBox.y + 5 : 5
	await page.mouse.click(offsetX, offsetY)

	await expect(modal).not.toBeVisible()
})

test('модалка: длинный контент прокручивается внутри окна, подвал остаётся на экране', async ({ page }) => {
	await page.setViewportSize({ width: 800, height: 600 })
	await page.goto('/iframe.html?id=overlay-basemodal--long-content')

	// Story открывает окно сразу (isOpen: true)
	const footerButton = page.locator('.base-modal__footer').getByRole('button', { name: 'Понятно' })
	await expect(footerButton).toBeInViewport({ timeout: 25000 })

	const isBodyScrollable = await page.locator('.base-modal__body').evaluate(body => body.scrollHeight > body.clientHeight)
	expect(isBodyScrollable).toBe(true)
})
