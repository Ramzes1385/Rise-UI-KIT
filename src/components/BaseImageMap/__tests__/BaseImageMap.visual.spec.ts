import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['variants', 'sizes', 'areas', 'with-error', 'empty'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseImageMap · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `media-baseimagemap--${story}`, { theme })
				await expectStoryScreenshot(page, `base-image-map-${story}-${theme}.png`)
			})
		}
	})
}
