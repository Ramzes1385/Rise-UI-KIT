import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = [
	['empty', 160],
	['disabled', 220],
	['variants', 900],
	['sizes', 1200],
] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseFilterBuilder · ${theme}`, () => {
		for (const [story, height] of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `data-basefilterbuilder--${story}`, { theme, height })
				await expectStoryScreenshot(page, `base-filter-builder-${story}-${theme}.png`)
			})
		}
	})
}
