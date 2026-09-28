/**
 * Visual regression BaseSideBar: ключевые stories в светлой и тёмной теме.
 */

import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['default', 'variants', 'collapsed', 'loading', 'with-slots', 'long-content'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseSideBar · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `navigation-basesidebar--${story}`, { theme, width: 1100, height: 600 })
				await expectStoryScreenshot(page, `base-side-bar-${story}-${theme}.png`)
			})
		}
	})
}
