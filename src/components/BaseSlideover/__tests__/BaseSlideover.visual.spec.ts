/**
 * Visual regression BaseSlideover: ключевые stories в светлой и тёмной теме.
 * Витрины показывают панели внутри рамок (isContained), длинный текст — панель поверх страницы, поэтому снимается вся страница.
 */

import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['sides', 'widths', 'custom-color', 'long-content'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseSlideover · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `overlay-baseslideover--${story}`, { theme, height: 600 })
				await expectStoryScreenshot(page, `base-slideover-${story}-${theme}.png`, 'page')
			})
		}
	})
}
