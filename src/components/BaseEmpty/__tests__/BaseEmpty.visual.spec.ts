/**
 * Visual regression BaseEmpty: ключевые stories в светлой и тёмной теме.
 */

import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['variants', 'sizes', 'custom-color', 'slots', 'in-card'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseEmpty · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `data-baseempty--${story}`, { theme, height: 480 })
				await expectStoryScreenshot(page, `base-empty-${story}-${theme}.png`)
			})
		}
	})
}
