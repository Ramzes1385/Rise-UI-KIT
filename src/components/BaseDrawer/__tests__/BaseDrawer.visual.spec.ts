/**
 * Visual regression BaseDrawer: ключевые stories в светлой и тёмной теме.
 */

import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['default'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseDrawer · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `overlay-basedrawer--${story}`, { theme, height: 200 })
				await expectStoryScreenshot(page, `base-drawer-${story}-${theme}.png`)
			})
		}
	})
}
