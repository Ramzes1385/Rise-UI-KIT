/**
 * Visual regression BaseText: ключевые stories в светлой и тёмной теме.
 */

import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../__tests__/visual'

const STORIES = ['sizes', 'weights', 'custom-color', 'truncate', 'max-lines'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseText · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `element-basetext--${story}`, { theme, height: 240 })
				await expectStoryScreenshot(page, `base-text-${story}-${theme}.png`)
			})
		}
	})
}
