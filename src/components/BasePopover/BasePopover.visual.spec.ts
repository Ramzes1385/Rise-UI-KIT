/**
 * Visual regression тесты для BasePopover.
 * Триггер содержит текст — sub-pixel метрики шрифта отличаются между
 * Windows (GDI ClearType) и Linux (FreeType) на 1-2px, из-за чего
 * bounding box локатора даёт разные размеры скриншота. Чтобы тест был
 * кроссплатформенным, берём фиксированный clip с размерами, округлёнными
 * вверх до 10px — это поглощает дрейф и даёт идентичные размеры на всех OS.
 */

import { expect, test } from '@playwright/test'

const COMPONENT = 'ui-basepopover'
const STORIES = ['default', 'dark-theme']

for (const story of STORIES) {
	test(`BasePopover — ${story}`, async ({ page }) => {
		await page.setViewportSize({ width: 800, height: 400 })
		await page.goto(`/iframe.html?id=${COMPONENT}--${story}&viewMode=story`)
		await page.waitForLoadState('networkidle')
		await page.evaluate(() => document.fonts.ready)
		const root = page.locator('.base-popover__trigger')
		const box = await root.boundingBox()
		if (!box) throw new Error('BasePopover trigger not found')
		const PAD = 20
		const clip = {
			x: Math.max(0, Math.round(box.x - PAD)),
			y: Math.max(0, Math.round(box.y - PAD)),
			width: Math.ceil((box.width + PAD * 2) / 10) * 10,
			height: Math.ceil((box.height + PAD * 2) / 10) * 10,
		}
		await expect(page).toHaveScreenshot(`base-popover--${story}.png`, {
			clip,
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})
}
