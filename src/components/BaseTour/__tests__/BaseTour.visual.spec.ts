/**
 * Visual regression BaseTour: ключевые stories в светлой и тёмной теме.
 * Тур телепортируется в body, поэтому снимается вся страница. Карточка появляется после анимации подсветки
 * (задержка в JS, 450 мс) — снимок делается, когда она видна.
 */

import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['opened', 'last-step', 'progress-bar', 'placements'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseTour · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `overlay-basetour--${story}`, { theme })
				await page.locator('.base-tour__card').waitFor({ state: 'visible' })
				await expectStoryScreenshot(page, `base-tour-${story}-${theme}.png`, 'page')
			})
		}
	})
}
