/**
 * Visual regression BaseForm: ключевые stories в светлой и тёмной теме.
 */

import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../__tests__/visual'

const STORIES = ['variants', 'loading', 'disabled'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseForm · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `form-baseform--${story}`, { theme, height: 480 })
				await expectStoryScreenshot(page, `base-form-${story}-${theme}.png`)
			})
		}
	})
}
