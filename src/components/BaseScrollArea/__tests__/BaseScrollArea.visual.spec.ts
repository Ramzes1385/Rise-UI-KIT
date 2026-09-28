/**
 * Visual regression BaseScrollArea: ключевые stories в светлой и тёмной теме.
 */

import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['default', 'horizontal'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseScrollArea · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `layout-basescrollarea--${story}`, { theme, height: 200 })
				await expectStoryScreenshot(page, `base-scroll-area-${story}-${theme}.png`)
			})
		}
	})
}
