import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['fallback-2-d'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseImageMap3D · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `media-baseimagemap3d--${story}`, { theme, height: 520 })
				await expectStoryScreenshot(page, `base-image-map-3d-${story}-${theme}.png`)
			})
		}
	})
}
