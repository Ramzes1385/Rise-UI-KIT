/**
 * Visual regression BaseTimePicker: ключевые stories в светлой и тёмной теме.
 */

import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['variants', 'disabled', 'with-error'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseTimePicker · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `form-basetimepicker--${story}`, { theme, height: 200 })
				await expectStoryScreenshot(page, `base-time-picker-${story}-${theme}.png`)
			})
		}
	})
}
