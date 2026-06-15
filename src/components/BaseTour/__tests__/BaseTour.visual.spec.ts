/**
 * Visual regression тесты для BaseTour.
 * Карточка тура содержит текст — sub-pixel метрики шрифта отличаются
 * между Windows (GDI ClearType) и Linux (FreeType) на 1-2px, из-за чего
 * bounding box локатора даёт разные размеры скриншота. Чтобы тест был
 * кроссплатформенным, берём фиксированный clip с размерами, округлёнными
 * вверх до 10px — это поглощает дрейф и даёт идентичные размеры на всех OS.
 */

import { expect, test } from '@playwright/test'

const COMPONENT = 'ui-basetour'
const STORIES = ['minimal', 'dark-theme']

for (const story of STORIES) {
	test(`BaseTour — ${story}`, async ({ page }) => {
		await page.setViewportSize({ width: 800, height: 600 })
		await page.goto(`/iframe.html?id=${COMPONENT}--${story}&viewMode=story`)
		await page.waitForLoadState('networkidle')
		await page.evaluate(() => document.fonts.ready)
		const card = page.locator('.base-tour__card')
		await card.waitFor({ state: 'visible' })
		const box = await card.boundingBox()
		if (!box) throw new Error('BaseTour card not found')
		const PAD = 20
		const clip = {
			x: Math.max(0, Math.round(box.x - PAD)),
			y: Math.max(0, Math.round(box.y - PAD)),
			width: Math.floor((box.width + PAD * 2) / 20) * 20,
			height: Math.floor((box.height + PAD * 2) / 20) * 20,
		}
		await expect(page).toHaveScreenshot(`base-tour--${story}.png`, {
			clip,
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})
}
