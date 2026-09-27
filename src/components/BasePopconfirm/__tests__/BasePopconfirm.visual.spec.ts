/**
 * Visual regression BasePopconfirm: ключевые stories в светлой и тёмной теме.
 */

import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../__tests__/visual'

const STORIES = ['variants', 'sizes'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BasePopconfirm · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `overlay-basepopconfirm--${story}`, { theme, height: 320 })
				await expectStoryScreenshot(page, `base-popconfirm-${story}-${theme}.png`)
			})
		}
	})
}
