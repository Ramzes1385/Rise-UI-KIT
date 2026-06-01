/**
 * Visual regression тесты для BaseSeparator.
 * Stories with-slot и dark-theme содержат текст — sub-pixel метрики шрифта
 * зависят от OS, поэтому обязательны фиксированный viewport, ожидание загрузки
 * шрифтов и `scale: 'css'` для стабильного bounding box #storybook-root.
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
		await expect(root).toHaveScreenshot(`base-separator--${story}.png`, {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})
}
