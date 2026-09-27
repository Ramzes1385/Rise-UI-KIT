/**
 * Visual regression BaseInputTags: ключевые stories в светлой и тёмной теме.
 */

import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../__tests__/visual'

const STORIES = ['variants', 'disabled', 'with-error', 'long-content'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseInputTags · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `form-baseinputtags--${story}`, { theme, height: 200 })
				await expectStoryScreenshot(page, `base-input-tags-${story}-${theme}.png`)
			})
		}
	})
}
