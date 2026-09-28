/**
 * Visual regression BaseDatePicker: ключевые stories в светлой и тёмной теме.
 * Панель телепортируется в body, поэтому снимается вся страница. Время браузера зафиксировано на STORY_TODAY.
 */

import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['default', 'variants', 'with-error', 'range-selection', 'with-time'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseDatePicker · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `form-basedatepicker--${story}`, { theme, height: 560 })
				await expectStoryScreenshot(page, `base-date-picker-${story}-${theme}.png`, 'page')
			})
		}
	})
}
