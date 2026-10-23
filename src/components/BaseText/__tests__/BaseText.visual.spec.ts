import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

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
