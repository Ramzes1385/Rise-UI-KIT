import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['variants', 'sizes', 'custom-color', 'readonly', 'disabled', 'custom-icons'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseRating · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `form-baserating--${story}`, { theme })
				await expectStoryScreenshot(page, `base-rating-${story}-${theme}.png`)
			})
		}
	})
}
