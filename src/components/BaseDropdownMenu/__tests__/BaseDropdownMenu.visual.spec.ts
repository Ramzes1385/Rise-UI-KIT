import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

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
