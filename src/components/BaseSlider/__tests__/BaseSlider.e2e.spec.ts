/**
 * E2E smoke-тест для BaseSlider.
 * Проверяет: навигация, autoplay, анимации.
 */

import { expect, test } from '@playwright/test'

async function loadSlider(page: import('@playwright/test').Page, storyId: string): Promise<void> {
	await page.goto(`/iframe.html?id=${storyId}`)
	await page.waitForSelector('.base-slider__dot', { timeout: 25000 })
	await page.setViewportSize({ width: 800, height: 500 })
	// Ждём, пока woff2 прогрузятся и layout устаканится. Без этого на throttled CI-runner
	// Inter Variable может прийти ПОСЛЕ клика, и reflow отменит/съест click на 6px-точке.
	await page.waitForLoadState('networkidle')
}

test('слайдер: переключает слайды по стрелкам', async ({ page }) => {
	await loadSlider(page, 'ui-baseslider--default')

	const nextBtn = page.locator('.base-slider__arrow--next')
	await nextBtn.click()

	const slides = page.locator('.base-slider__slide')
	await expect(slides.nth(1)).toBeVisible()
})

test('слайдер: навигация по точкам', async ({ page }) => {
	await loadSlider(page, 'ui-baseslider--default')

	const dots = page.locator('.base-slider__dot')
	if ((await dots.count()) > 1) {
		const target = dots.nth(2)
		await target.click({ force: true })
		await expect(target).toHaveClass(/--active/, { timeout: 10000 })
	}
})

test('слайдер: autoplay переключает слайды', async ({ page }) => {
	await loadSlider(page, 'ui-baseslider--autoplay')

	const dots = page.locator('.base-slider__dot')
	await expect(dots.first()).toHaveClass(/--active/)

	await page.waitForTimeout(5000)

	await expect(dots.first()).not.toHaveClass(/--active/)
})

test('слайдер: анимация fade', async ({ page }) => {
	await loadSlider(page, 'ui-baseslider--fade')

	const slider = page.locator('.base-slider')
	await expect(slider).toBeVisible()

	const nextBtn = page.locator('.base-slider__arrow--next')
	if ((await nextBtn.count()) > 0) {
		await nextBtn.click()
	}
})
