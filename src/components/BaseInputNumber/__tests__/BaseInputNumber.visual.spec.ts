/**
 * Visual regression BaseInputNumber: ключевые stories в светлой и тёмной теме.
 */

import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['variants', 'sizes', 'disabled', 'with-error', 'decimal-step'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseInputNumber · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `form-baseinputnumber--${story}`, { theme, height: 200 })
				await expectStoryScreenshot(page, `base-input-number-${story}-${theme}.png`)
			})
		}
	})
}
