/**
 * Visual regression BaseMenu: ключевые stories в светлой и тёмной теме.
 */

import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../__tests__/visual'

const STORIES = ['variants', 'sizes', 'disabled', 'with-dividers', 'long-content'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseMenu · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `navigation-basemenu--${story}`, { theme })
				await expectStoryScreenshot(page, `base-menu-${story}-${theme}.png`)
			})
		}
	})
}
