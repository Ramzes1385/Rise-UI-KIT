/**
 * Visual regression тесты для BaseTour.
 * Карточка тура содержит текст — sub-pixel метрики шрифта зависят от OS,
 * поэтому обязательны фиксированный viewport, ожидание загрузки шрифтов
 * и `scale: 'css'` для стабильного bounding box.
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
		await expect(card).toHaveScreenshot(`base-tour--${story}.png`, {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})
}
