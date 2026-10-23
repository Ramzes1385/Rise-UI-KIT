import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['variants', 'sizes', 'disabled', 'with-icons', 'scrollable'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseTabs · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `navigation-basetabs--${story}`, { theme })
				await expectStoryScreenshot(page, `base-tabs-${story}-${theme}.png`)
			})
		}
	})
}
