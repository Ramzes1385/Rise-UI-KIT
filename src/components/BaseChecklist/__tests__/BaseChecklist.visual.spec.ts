import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = [
	['complete', 420],
	['disabled', 420],
	['variants', 900],
	['sizes', 1100],
] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseChecklist · ${theme}`, () => {
		for (const [story, height] of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `data-basechecklist--${story}`, { theme, height })
				await expectStoryScreenshot(page, `base-checklist-${story}-${theme}.png`)
			})
		}
	})
}
