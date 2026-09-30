import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = [
	['default', 400],
	['variants', 260],
] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseMap · ${theme}`, () => {
		for (const [story, height] of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `media-basemap--${story}`, { theme, height })
				await expectStoryScreenshot(page, `base-map-${story}-${theme}.png`)
			})
		}
	})
}
