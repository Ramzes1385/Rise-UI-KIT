/**
 * Visual regression тесты для BasePopover.
 * Триггер содержит текст — sub-pixel метрики шрифта зависят от OS,
 * поэтому обязательны фиксированный viewport, ожидание загрузки шрифтов
 * и `scale: 'css'` для стабильного bounding box.
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
		await expect(root).toHaveScreenshot(`base-popover--${story}.png`, {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})
}
