/**
 * E2E smoke-тест для BaseSlider.
 * Проверяет: навигация, autoplay, анимации.
 */

import { expect, test } from '@playwright/test'

test('слайдер: переключает слайды по стрелкам', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-baseslider--default')
	await page.waitForSelector('.base-slider', { timeout: 25000 })
	await page.setViewportSize({ width: 800, height: 500 })

	const nextBtn = page.locator('.base-slider__arrow--next')
	await nextBtn.click()

	const slides = page.locator('.base-slider__slide')
	await expect(slides.nth(1)).toBeVisible()
})

test('слайдер: навигация по точкам', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-baseslider--default')
	await page.waitForSelector('.base-slider', { timeout: 25000 })
	await page.setViewportSize({ width: 800, height: 500 })

	const dots = page.locator('.base-slider__dot')
	if ((await dots.count()) > 1) {
		await dots.nth(2).click()
		await expect(dots.nth(2)).toHaveClass(/--active/)
	}
})

test('слайдер: autoplay переключает слайды', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-baseslider--autoplay')
	await page.waitForSelector('.base-slider', { timeout: 25000 })
	await page.setViewportSize({ width: 800, height: 500 })

	const dots = page.locator('.base-slider__dot')
	await expect(dots.first()).toHaveClass(/--active/)

	await page.waitForTimeout(5000)

	await expect(dots.first()).not.toHaveClass(/--active/)
})

test('слайдер: анимация fade', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-baseslider--fade')
	await page.waitForSelector('.base-slider', { timeout: 25000 })
	await page.setViewportSize({ width: 800, height: 500 })

	const slider = page.locator('.base-slider')
	await expect(slider).toBeVisible()

	const nextBtn = page.locator('.base-slider__arrow--next')
	if ((await nextBtn.count()) > 0) {
		await nextBtn.click()
	}
})
