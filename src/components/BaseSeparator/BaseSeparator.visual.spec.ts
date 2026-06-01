/**
 * Visual regression тесты для BaseSeparator.
 * Stories with-slot и dark-theme содержат текст — sub-pixel метрики шрифта
 * отличаются между Windows (GDI ClearType) и Linux (FreeType) на 1-2px.
 * Чтобы тест был кроссплатформенным, берём фиксированный clip
 * #storybook-root с высотой, округлённой вверх до 10px — это поглощает
 * дрейф и даёт идентичные размеры скриншота на всех OS.
 */

import { expect, test } from '@playwright/test'

const COMPONENT = 'ui-baseseparator'
const STORIES = ['default', 'with-label', 'with-slot', 'dashed', 'dark-theme']

for (const story of STORIES) {
	test(`BaseSeparator — ${story}`, async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 200 })
		await page.goto(`/iframe.html?id=${COMPONENT}--${story}&viewMode=story`)
		await page.waitForLoadState('networkidle')
		await page.evaluate(() => document.fonts.ready)
		const root = page.locator('#storybook-root')
		const box = await root.boundingBox()
		if (!box) throw new Error('storybook-root not found')
		const clip = {
			x: 0,
			y: 0,
			width: Math.ceil(box.width / 10) * 10,
			height: Math.ceil(box.height / 10) * 10,
		}
		await expect(page).toHaveScreenshot(`base-separator--${story}.png`, {
			clip,
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})
}
