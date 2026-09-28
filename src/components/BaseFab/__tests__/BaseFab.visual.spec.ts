/**
 * Visual regression BaseFab: ключевые stories в светлой и тёмной теме.
 */

import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['variants', 'extended', 'sizes', 'disabled'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseFab · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `element-basefab--${story}`, { theme, height: 200 })
				await expectStoryScreenshot(page, `base-fab-${story}-${theme}.png`)
			})
		}
	})
}
