/**
 * Visual regression тесты для BaseSlideover.
 */

import { expect, test } from '@playwright/test'

const COMPONENT = 'ui-baseslideover'
const STORIES = ['default', 'left-side', 'full-width', 'with-footer']

for (const story of STORIES) {
	test(`BaseSlideover — ${story}`, async ({ page }) => {
		await page.goto(`/iframe.html?id=${COMPONENT}--${story}&viewMode=story`)
		// BaseSlideover использует teleport — рендерится в body, #storybook-root пуст.
		// Снимаем скриншот всей страницы.
		await expect(page).toHaveScreenshot(`base-slideover--${story}.png`, {
			fullPage: true,
		})
	})
}
