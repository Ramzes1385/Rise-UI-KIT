/**
 * Visual regression BaseSegmented: ключевые stories в светлой и тёмной теме.
 */

import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../__tests__/visual'

const STORIES = ['variants', 'sizes', 'block-with-icons', 'disabled', 'with-error'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseSegmented · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `form-basesegmented--${story}`, { theme, height: 200 })
				await expectStoryScreenshot(page, `base-segmented-${story}-${theme}.png`)
			})
		}
	})
}
