/**
 * Visual regression BaseLayout: ключевые stories в светлой и тёмной теме.
 */

import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['default', 'short-page'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseLayout · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `layout-baselayout--${story}`, { theme, height: 200 })
				await expectStoryScreenshot(page, `base-layout-${story}-${theme}.png`)
			})
		}
	})
}
