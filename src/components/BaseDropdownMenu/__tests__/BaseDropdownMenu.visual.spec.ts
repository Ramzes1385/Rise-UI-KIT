/**
 * Visual regression BaseDropdownMenu: ключевые stories в светлой и тёмной теме.
 */

import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../__tests__/visual'

const STORIES = ['variants', 'sizes'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseDropdownMenu · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `overlay-basedropdownmenu--${story}`, { theme, height: 280 })
				await expectStoryScreenshot(page, `base-dropdown-menu-${story}-${theme}.png`)
			})
		}
	})
}
