/**
 * Visual regression тесты для BaseTooltip.
 * Текст тултипа даёт sub-pixel метрики шрифта, отличающиеся между
 * Windows (GDI ClearType) и Linux (FreeType) на 1-2px, из-за чего
 * bounding box локатора даёт разные размеры скриншота. Чтобы тест был
 * кроссплатформенным, берём фиксированный clip с размерами, округлёнными
 * вверх до 10px — это поглощает дрейф и даёт идентичные размеры на всех OS.
 */

import { expect, test } from '@playwright/test'

const COMPONENT = 'ui-basetooltip'
const STORIES = ['default', 'always-visible']

for (const story of STORIES) {
	test(`BaseTooltip — ${story}`, async ({ page }) => {
		await page.setViewportSize({ width: 800, height: 400 })
		await page.goto(`/iframe.html?id=${COMPONENT}--${story}&viewMode=story`)
		await page.waitForLoadState('networkidle')
		await page.evaluate(() => document.fonts.ready)
		const root = page.locator('.base-tooltip-wrapper')
		const box = await root.boundingBox()
		if (!box) throw new Error('BaseTooltip wrapper not found')
		const PAD = 20
		const clip = {
			x: Math.max(0, Math.round(box.x - PAD)),
			y: Math.max(0, Math.round(box.y - PAD)),
			width: Math.floor((box.width + PAD * 2) / 20) * 20,
			height: Math.floor((box.height + PAD * 2) / 20) * 20,
		}
		await expect(page).toHaveScreenshot(`base-tooltip--${story}.png`, {
			clip,
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})
}
