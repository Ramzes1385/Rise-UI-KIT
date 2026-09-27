/**
 * Visual regression BaseInplace: ключевые stories в светлой и тёмной теме.
 */

import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../__tests__/visual'

const STORIES = ['variants', 'in-heading', 'empty', 'disabled'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseInplace · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `form-baseinplace--${story}`, { theme, height: 200 })
				await expectStoryScreenshot(page, `base-inplace-${story}-${theme}.png`)
			})
		}
	})
}
