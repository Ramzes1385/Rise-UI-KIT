/**
 * Visual regression BaseNotification: ключевые stories в светлой и тёмной теме.
 * Снимается вся страница: в Positions контейнер закреплён у края экрана (без isContained).
 * Анимации при снимке отключены — полоса прогресса досчитана до конца и не видна.
 */

import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../__tests__/visual'

const STORIES = ['types', 'variants', 'custom-color', 'long-content', 'positions'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseNotification · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `overlay-basenotification--${story}`, { theme, height: 500 })
				await page.locator('.base-notification-item').first().waitFor({ state: 'visible' })
				await expectStoryScreenshot(page, `base-notification-${story}-${theme}.png`, 'page')
			})
		}
	})
}
