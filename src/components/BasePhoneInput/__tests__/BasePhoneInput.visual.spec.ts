import { test } from '@playwright/test'
import { expectStoryScreenshot, openStory, VISUAL_THEMES } from '../../../../build/tests/visual'

const STORIES = [
	['with-error', 160],
	['disabled', 140],
	['variants', 360],
	['sizes', 620],
] as const

for (const theme of VISUAL_THEMES) {
	test.describe(`BasePhoneInput · ${theme}`, () => {
		for (const [story, height] of STORIES) {
			test(story, async ({ page }) => {
				await openStory(page, `form-basephoneinput--${story}`, { theme, height })
				await expectStoryScreenshot(page, `base-phone-input-${story}-${theme}.png`)
			})
		}
	})
}
