/**
 * Visual regression BaseVirtualList: ключевые stories в светлой и тёмной теме.
 */

import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['default', 'variable-height'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseVirtualList · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `data-basevirtuallist--${story}`, { theme, height: 200 })
				await expectStoryScreenshot(page, `base-virtual-list-${story}-${theme}.png`)
			})
		}
	})
}
