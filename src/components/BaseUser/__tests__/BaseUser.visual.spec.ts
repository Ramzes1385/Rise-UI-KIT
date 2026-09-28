/**
 * Visual regression BaseUser: ключевые stories в светлой и тёмной теме.
 */

import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['default', 'sizes', 'vertical', 'long-content'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseUser · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `element-baseuser--${story}`, { theme, height: 200 })
				await expectStoryScreenshot(page, `base-user-${story}-${theme}.png`)
			})
		}
	})
}
