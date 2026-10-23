import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = [
	['with-error', 200],
	['disabled', 180],
	['variants', 640],
] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseMention · ${theme}`, () => {
		for (const [story, height] of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `form-basemention--${story}`, { theme, height })
				await expectStoryScreenshot(page, `base-mention-${story}-${theme}.png`)
			})
		}
	})
}
