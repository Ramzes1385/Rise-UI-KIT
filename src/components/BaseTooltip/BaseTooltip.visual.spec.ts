/**
 * Visual regression тесты для BaseTooltip.
 * Текст тултипа даёт sub-pixel метрики шрифта, зависящие от OS,
 * поэтому обязательны фиксированный viewport, ожидание загрузки шрифтов
 * и `scale: 'css'` для стабильного bounding box.
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
		await expect(root).toHaveScreenshot(`base-tooltip--${story}.png`, {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})
}
