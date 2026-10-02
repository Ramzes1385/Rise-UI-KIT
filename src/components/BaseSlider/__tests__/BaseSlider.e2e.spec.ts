import { expect, test } from '@playwright/test'

const PLAYED_PHASES = ['played', 'completed', 'finished']

type StorybookWindow = { __STORYBOOK_PREVIEW__?: { currentRender?: { phase?: string } } }

async function loadSlider(page: import('@playwright/test').Page, storyId: string): Promise<void> {
	await page.goto(`/iframe.html?id=${storyId}`)
	await page.waitForSelector('.base-slider__dot', { timeout: 25000 })
	await page.setViewportSize({ width: 800, height: 500 })
	await page.waitForLoadState('networkidle')
}

test('слайдер: переключает слайды по стрелкам', async ({ page }) => {
	await loadSlider(page, 'data-baseslider--default')

	const nextBtn = page.locator('.base-slider__arrow--next')
	await nextBtn.click()

	const slides = page.locator('.base-slider__slide')
	await expect(slides.nth(1)).toBeVisible()
})

test('слайдер: навигация по точкам', async ({ page }) => {
	await loadSlider(page, 'data-baseslider--default')

	const dots = page.locator('.base-slider__dot')
	if ((await dots.count()) > 1) {
		const target = dots.nth(2)
		await target.click({ force: true })
		await expect(target).toHaveClass(/--active/, { timeout: 10000 })
	}
})

test('слайдер: autoplay переключает слайды', async ({ page }) => {
	await loadSlider(page, 'data-baseslider--autoplay')
	await page.waitForFunction(
		phases => phases.includes((window as StorybookWindow).__STORYBOOK_PREVIEW__?.currentRender?.phase ?? ''),
		PLAYED_PHASES,
		{ timeout: 25_000 },
	)

	const activeDot = (): Promise<number> =>
		page.locator('.base-slider__dot').evaluateAll(dots => dots.findIndex(dot => /--active/.test(dot.className)))
	const initialDot = await activeDot()
	expect(initialDot).toBeGreaterThanOrEqual(0)

	const start = page.getByRole('button', { name: 'Запустить автопрокрутку' })
	if (await start.isVisible()) await start.press('Enter')
	await expect(page.getByRole('button', { name: 'Остановить автопрокрутку' })).toBeVisible()

	await expect.poll(activeDot, { timeout: 10_000 }).not.toBe(initialDot)
})

test('слайдер: анимация fade', async ({ page }) => {
	await loadSlider(page, 'data-baseslider--fade')

	const slider = page.locator('.base-slider')
	await expect(slider).toBeVisible()

	const nextBtn = page.locator('.base-slider__arrow--next')
	if ((await nextBtn.count()) > 0) {
		await nextBtn.click()
	}
})
