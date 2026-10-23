import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = ['default', 'split', 'variants'] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseTextDiff · ${theme}`, () => {
		for (const story of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `data-basetextdiff--${story}`, { theme, height: 200 })
				await expectStoryScreenshot(page, `base-text-diff-${story}-${theme}.png`)
			})
		}
	})
}
