/**
 * Visual regression BaseSplitter: ключевые stories в светлой и тёмной теме.
 */

import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['default', 'vertical', 'variants', 'disabled'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseSplitter · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `layout-basesplitter--${story}`, { theme, height: 200 })
				await expectStoryScreenshot(page, `base-splitter-${story}-${theme}.png`)
			})
		}
	})
}
