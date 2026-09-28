/**
 * Visual regression BaseInfiniteScroll: ключевые stories в светлой и тёмной теме.
 */

import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['manual', 'with-error'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseInfiniteScroll · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `data-baseinfinitescroll--${story}`, { theme, height: 200 })
				await expectStoryScreenshot(page, `base-infinite-scroll-${story}-${theme}.png`)
			})
		}
	})
}
