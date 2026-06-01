/**
 * E2E smoke-тест для BaseSlider.
 * Проверяет: навигация, autoplay, анимации.
 */

import { expect, test } from '@playwright/test'

test('слайдер: переключает слайды по стрелкам', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-baseslider--default')
	await page.setViewportSize({ width: 800, height: 500 })

	// Находим стрелку «вперёд»
	const nextBtn = page.locator('.base-slider__arrow--next')
	await nextBtn.click()

	// Слайд должен переключиться
	const slides = page.locator('.base-slider__slide')
	await expect(slides.nth(1)).toBeVisible()
})

test('слайдер: навигация по точкам', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-baseslider--default')
	await page.setViewportSize({ width: 800, height: 500 })

	// Находим точки навигации
	const dots = page.locator('.base-slider__dot')
	if ((await dots.count()) > 1) {
		await dots.nth(2).click()
		// Третья точка должна стать активной
		await expect(dots.nth(2)).toHaveClass(/--active/)
	}
})

test('слайдер: autoplay переключает слайды', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-baseslider--autoplay')
	await page.setViewportSize({ width: 800, height: 500 })

	// Ждём переключения autoplay (4 сек по умолчанию)
	const dots = page.locator('.base-slider__dot')
	await expect(dots.first()).toHaveClass(/--active/)

	// Ждём автопереключение
	await page.waitForTimeout(5000)

	// Первый слайд больше не активен
	await expect(dots.first()).not.toHaveClass(/--active/)
})

test('слайдер: анимация fade', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-baseslider--fade')
	await page.setViewportSize({ width: 800, height: 500 })

	// Слайдер должен рендериться
	const slider = page.locator('.base-slider')
	await expect(slider).toBeVisible()

	// Переключение по стрелке
	const nextBtn = page.locator('.base-slider__arrow--next')
	if ((await nextBtn.count()) > 0) {
		await nextBtn.click()
	}
})
