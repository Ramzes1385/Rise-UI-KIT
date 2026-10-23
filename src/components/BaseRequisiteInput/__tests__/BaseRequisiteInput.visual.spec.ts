import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = [
	['company', 340],
	['with-error', 160],
	['disabled', 140],
	['variants', 300],
	['sizes', 620],
] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BaseRequisiteInput · ${theme}`, () => {
		for (const [story, height] of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `form-baserequisiteinput--${story}`, { theme, height })
				await expectStoryScreenshot(page, `base-requisite-input-${story}-${theme}.png`)
			})
		}
	})
}
