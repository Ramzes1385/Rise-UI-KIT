import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['default', 'statuses', 'variants', 'sizes', 'with-details', 'actions', 'long-content'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseResult · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `data-baseresult--${story}`, { theme, height: 480 })
				await expectStoryScreenshot(page, `base-result-${story}-${theme}.png`)
			})
		}
	})
}
